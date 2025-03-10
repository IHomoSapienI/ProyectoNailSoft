import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import FormularioCita from './FormularioCita';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './TablaCitas.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faCalendarCheck, faSpinner, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Configurar moment en español
import 'moment/locale/es'; 
moment.locale('es');

const localizer = momentLocalizer(moment);

// Asegurarse de que Modal esté configurado correctamente
Modal.setAppElement('#root');

const TablaCitas = () => {
    const [citas, setCitas] = useState([]);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroEmpleado, setFiltroEmpleado] = useState('');
    const [empleados, setEmpleados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [vista, setVista] = useState('month');
    
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        // Si hay una cita seleccionada en el state de la ubicación, abrirla
        if (location.state?.citaSeleccionada) {
            setCitaSeleccionada(location.state.citaSeleccionada);
            setFormModalIsOpen(true);
        }
        
        // Si hay una fecha seleccionada en el state de la ubicación, usarla
        if (location.state?.fechaSeleccionada) {
            setFechaSeleccionada(location.state.fechaSeleccionada);
        }
        
        obtenerCitas();
        obtenerEmpleados();
    }, [location.state]);

    const obtenerEmpleados = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const respuesta = await axios.get('https://gitbf.onrender.com/api/empleados', { headers });
            setEmpleados(respuesta.data);
        } catch (error) {
            console.error('Error al obtener empleados:', error);
        }
    };

    const obtenerCitas = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const respuesta = await axios.get('https://gitbf.onrender.com/api/citas', { headers });
            
            // Aplicar filtros si existen
            let citasFiltradas = respuesta.data.citas;
            
            if (filtroEstado) {
                citasFiltradas = citasFiltradas.filter(cita => cita.estadocita === filtroEstado);
            }
            
            if (filtroEmpleado) {
                citasFiltradas = citasFiltradas.filter(
                    cita => cita.nombreempleado && cita.nombreempleado._id === filtroEmpleado
                );
            }
            
            if (busqueda) {
                const busquedaLower = busqueda.toLowerCase();
                citasFiltradas = citasFiltradas.filter(cita => 
                    (cita.nombrecliente?.nombrecliente?.toLowerCase().includes(busquedaLower)) ||
                    (cita.nombrecliente?.apellidocliente?.toLowerCase().includes(busquedaLower)) ||
                    (cita.nombreempleado?.nombreempleado?.toLowerCase().includes(busquedaLower))
                );
            }
            
            const citasFormateadas = citasFiltradas.map(cita => {
                // Verificamos que cita.nombreempleado y cita.nombrecliente existan
                const nombreEmpleado = cita.nombreempleado ? cita.nombreempleado.nombreempleado : 'Empleado no disponible';
                const nombreCliente = cita.nombrecliente ? cita.nombrecliente.nombrecliente : 'Cliente no disponible';
                
                // Calcular la duración basada en los servicios
                const duracionTotal = cita.servicios ? 
                    cita.servicios.reduce((total, servicio) => total + (servicio.tiempo || 0), 0) : 60;
                
                const fechaInicio = new Date(cita.fechacita);
                const fechaFin = new Date(fechaInicio.getTime() + duracionTotal * 60000);
                
                // Determinar el color según el estado
                let colorEvento = '#3174ad'; // Azul por defecto (Pendiente)
                if (cita.estadocita === 'Completada') colorEvento = '#5cb85c'; // Verde
                if (cita.estadocita === 'Cancelada') colorEvento = '#d9534f'; // Rojo
                if (cita.estadocita === 'En Progreso') colorEvento = '#f0ad4e'; // Amarillo
                
                return {
                    id: cita._id,
                    title: `${nombreCliente} - ${nombreEmpleado}`,
                    start: fechaInicio,
                    end: fechaFin,
                    estado: cita.estadocita,
                    cita: cita,
                    backgroundColor: colorEvento
                };
            });
            
            setCitas(citasFormateadas);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener las citas:', error);
            Swal.fire('Error', 'No se pudieron cargar las citas', 'error');
            setIsLoading(false);
        }
    };

    const abrirFormulario = (fecha, cita = null) => {
        setFechaSeleccionada(fecha);
        setCitaSeleccionada(cita);
        setFormModalIsOpen(true);
    };

    const cerrarFormulario = () => {
        setFormModalIsOpen(false);
        setCitaSeleccionada(null);
        
        // Limpiar el state de la ubicación
        if (location.state) {
            navigate(location.pathname, { replace: true });
        }
    };

    const manejarCitaActualizada = () => {
        obtenerCitas();
        cerrarFormulario();
    };

    const manejarSeleccionFecha = ({ start }) => {
        abrirFormulario(start);
    };

    const manejarSeleccionCita = (event) => {
        abrirFormulario(event.start, event.cita);
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const CustomToolbar = ({ label, onNavigate, onView }) => {
        return (
            <div className="rbc-toolbar">
                <span className="rbc-btn-group">
                    <button type="button" onClick={() => onNavigate('TODAY')}>Hoy</button>
                    <button type="button" onClick={() => onNavigate('PREV')}>Anterior</button>
                    <button type="button" onClick={() => onNavigate('NEXT')}>Siguiente</button>
                </span>
                <span className="rbc-toolbar-label">{label}</span>
                <span className="rbc-btn-group">
                    <button 
                        type="button" 
                        className={vista === 'month' ? 'rbc-active' : ''} 
                        onClick={() => { setVista('month'); onView('month'); }}
                    >
                        Mes
                    </button>
                    <button 
                        type="button" 
                        className={vista === 'week' ? 'rbc-active' : ''} 
                        onClick={() => { setVista('week'); onView('week'); }}
                    >
                        Semana
                    </button>
                    <button 
                        type="button" 
                        className={vista === 'day' ? 'rbc-active' : ''} 
                        onClick={() => { setVista('day'); onView('day'); }}
                    >
                        Día
                    </button>
                    <button 
                        type="button" 
                        className={vista === 'agenda' ? 'rbc-active' : ''} 
                        onClick={() => { setVista('agenda'); onView('agenda'); }}
                    >
                        Agenda
                    </button>
                </span>
            </div>
        );
    };

    const aplicarFiltros = () => {
        obtenerCitas();
    };

    const limpiarFiltros = () => {
        setFiltroEstado('');
        setFiltroEmpleado('');
        setBusqueda('');
        setTimeout(() => {
            obtenerCitas();
        }, 100);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-semibold mb-4 md:mb-0">Calendario de Citas</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <button
                        onClick={() => abrirFormulario(new Date())}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                        Nueva Cita
                    </button>
                    <button
                        onClick={() => navigate('/citas-en-progreso')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                        Citas en Progreso
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por cliente o empleado"
                                className="w-full p-2 pl-10 border rounded-md"
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="En Progreso">En Progreso</option>
                            <option value="Completada">Completada</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                        <select
                            value={filtroEmpleado}
                            onChange={(e) => setFiltroEmpleado(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Todos los empleados</option>
                            {empleados.map(empleado => (
                                <option key={empleado._id} value={empleado._id}>
                                    {empleado.nombreempleado}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={aplicarFiltros}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                            <FontAwesomeIcon icon={faFilter} className="mr-2" />
                            Filtrar
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-[#3174ad] mr-2"></div>
                            <span>Pendiente</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-[#f0ad4e] mr-2"></div>
                            <span>En Progreso</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-[#5cb85c] mr-2"></div>
                            <span>Completada</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-[#d9534f] mr-2"></div>
                            <span>Cancelada</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-4">
                    <Calendar
                        localizer={localizer}
                        events={citas}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        selectable
                        onSelectEvent={manejarSeleccionCita}
                        onSelectSlot={manejarSeleccionFecha}
                        eventPropGetter={eventStyleGetter}
                        defaultView={vista}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultDate={fechaSeleccionada || new Date()}
                        components={{
                            toolbar: CustomToolbar
                        }}
                        messages={{
                            next: "Sig",
                            previous: "Ant",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            day: "Día",
                            agenda: "Agenda",
                            date: "Fecha",
                            time: "Hora",
                            event: "Evento",
                            noEventsInRange: "No hay citas en este rango de fechas"
                        }}
                    />
                </div>
            )}

            <Modal
                isOpen={formModalIsOpen}
                onRequestClose={cerrarFormulario}
                className="react-modal-content"
                overlayClassName="react-modal-overlay"
                contentLabel="Formulario de Cita"
            >
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">{citaSeleccionada ? 'Editar Cita' : 'Nueva Cita'}</h2>
                    <FormularioCita
                        cita={citaSeleccionada}
                        fechaSeleccionada={fechaSeleccionada}
                        onCitaActualizada={manejarCitaActualizada}
                        onClose={cerrarFormulario}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default TablaCitas;
