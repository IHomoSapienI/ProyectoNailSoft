import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import FormularioCita from './FormularioCita';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './TablaCitas.css'; // Importa el archivo CSS
import { useNavigate, useLocation } from 'react-router-dom'; // Importar useNavigate
import Button from '@mui/material/Button'; // Importar botón de Material-UI

// Configurar moment en español
import 'moment/locale/es'; 
moment.locale('es');

const localizer = momentLocalizer(moment);

const TablaCitas = () => {
    const [citas, setCitas] = useState([]);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null); // Nuevo estado para el servicio seleccionado
    const navigate = useNavigate(); // Usar el hook useNavigate
    const location = useLocation();
    
    useEffect(() => {
        obtenerCitas();
    }, []);

    const obtenerCitas = async () => {
        try {
            const respuesta = await axios.get('https://gitbf.onrender.com/api/citas');
            const citasFormateadas = respuesta.data.citas.map(cita => {
                // Verificamos que cita.nombreempleado y cita.nombrecliente existan
                const nombreEmpleado = cita.nombreempleado ? cita.nombreempleado.nombreempleado : 'Empleado no disponible';
                const nombreCliente = cita.nombrecliente ? cita.nombrecliente.nombrecliente : 'Cliente no disponible';
                
                return {
                    id: cita._id,
                    title: `${nombreEmpleado} - ${nombreCliente}`,
                    start: new Date(cita.fechacita),
                    end: new Date(cita.fechacita),
                    estado: cita.estadocita,
                    cita: cita,
                    total: cita.total
                };
            });
            setCitas(citasFormateadas);
        } catch (error) {
            console.error('Error al obtener las citas:', error);
        }
    };

    const abrirFormulario = (fecha, servicio) => {
        setFechaSeleccionada(fecha);
        setServicioSeleccionado(servicio); // Establecer el servicio seleccionado
        setFormModalIsOpen(true);
    };

    const cerrarFormulario = () => {
        setFormModalIsOpen(false);
        setCitaSeleccionada(null);
        setServicioSeleccionado(null); // Reiniciar el servicio seleccionado al cerrar el modal
    };

    const manejarCitaActualizada = () => {
        obtenerCitas();
        cerrarFormulario();
    };

    const manejarEliminarCita = async (idCita) => {
        try {
            await axios.delete(`https://gitbf.onrender.com/api/citas/${idCita}`);
            obtenerCitas();
        } catch (error) {
            console.error('Error al eliminar la cita:', error);
        }
    };

    const manejarSeleccionFecha = ({ start }) => {
        abrirFormulario(start, null); // Aquí puedes pasar el servicio que desees si lo tienes
    };

    const manejarSeleccionCita = (event) => {
        setCitaSeleccionada(event.cita);
        abrirFormulario(event.start, null); // Puedes incluir el servicio asociado aquí
    };

    return (
        <div className="tabla-citas-container">
            <h1 className="tabla-citas-title">Calendario de Citas</h1>
            <div className="tabla-citas-calendar">
                <Calendar
                    localizer={localizer}
                    events={citas}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    selectable
                    onSelectSlot={manejarSeleccionFecha}
                    onSelectEvent={manejarSeleccionCita}
                    eventPropGetter={(event) => ({
                        className: event.estado === 'Asistida' ? 'rbc-event-green' : 'rbc-event-blue'
                    })}
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
                        event: "Evento"
                    }}
                />
            </div>

            <Modal
                isOpen={formModalIsOpen}
                onRequestClose={cerrarFormulario}
                className="react-modal-content"
                overlayClassName="react-modal-overlay"
            >
                <FormularioCita
                    cita={citaSeleccionada}
                    fechaSeleccionada={fechaSeleccionada}
                    servicioSeleccionado={servicioSeleccionado} // Pasar el servicio al formulario
                    onCitaActualizada={manejarCitaActualizada}
                    onClose={cerrarFormulario}
                />
            </Modal>
        </div>
    );
};

export default TablaCitas;
