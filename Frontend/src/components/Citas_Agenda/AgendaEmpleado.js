import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCalendarCheck, faUserClock } from '@fortawesome/free-solid-svg-icons';

moment.locale('es');
const localizer = momentLocalizer(moment);

const AgendaEmpleado = () => {
  const [citas, setCitas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vista, setVista] = useState('week');
  const navigate = useNavigate();

  useEffect(() => {
    cargarEmpleados();
    cargarCitas();
  }, [empleadoSeleccionado]);

  const cargarEmpleados = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const respuesta = await axios.get('https://gitbf.onrender.com/api/empleados', { headers });
      setEmpleados(respuesta.data);
      
      // Si no hay empleado seleccionado y hay empleados disponibles, seleccionar el primero
      if (!empleadoSeleccionado && respuesta.data.length > 0) {
        setEmpleadoSeleccionado(respuesta.data[0]._id);
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      Swal.fire('Error', 'No se pudieron cargar los empleados', 'error');
    }
  };

  const cargarCitas = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const respuesta = await axios.get('https://gitbf.onrender.com/api/citas', { headers });
      
      let citasFiltradas = respuesta.data.citas;
      
      // Filtrar por empleado si hay uno seleccionado
      if (empleadoSeleccionado) {
        citasFiltradas = citasFiltradas.filter(
          cita => cita.nombreempleado && cita.nombreempleado._id === empleadoSeleccionado
        );
      }
      
      const citasFormateadas = citasFiltradas.map(cita => {
        const fechaInicio = new Date(cita.fechacita);
        
        // Calcular fecha fin basada en la duración de los servicios
        const duracionTotal = cita.servicios ? 
          cita.servicios.reduce((total, servicio) => total + (servicio.tiempo || 0), 0) : 60;
        
        const fechaFin = new Date(fechaInicio.getTime() + duracionTotal * 60000);
        
        // Determinar el color según el estado
        let colorEvento = '#3174ad'; // Azul por defecto
        if (cita.estadocita === 'Completada') colorEvento = '#5cb85c'; // Verde
        if (cita.estadocita === 'Cancelada') colorEvento = '#d9534f'; // Rojo
        if (cita.estadocita === 'En Progreso') colorEvento = '#f0ad4e'; // Amarillo
        
        return {
          id: cita._id,
          title: `${cita.nombrecliente?.nombrecliente || 'Cliente'} - ${cita.servicios?.map(s => s.nombreServicio).join(', ') || 'Servicio'}`,
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
      console.error('Error al cargar citas:', error);
      Swal.fire('Error', 'No se pudieron cargar las citas', 'error');
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    Swal.fire({
      title: 'Detalles de la Cita',
      html: `
        <div class="text-left">
          <p><strong>Cliente:</strong> ${event.cita.nombrecliente?.nombrecliente || 'No disponible'}</p>
          <p><strong>Empleado:</strong> ${event.cita.nombreempleado?.nombreempleado || 'No disponible'}</p>
          <p><strong>Fecha:</strong> ${moment(event.start).format('LLLL')}</p>
          <p><strong>Estado:</strong> ${event.estado}</p>
          <p><strong>Servicios:</strong> ${event.cita.servicios?.map(s => s.nombreServicio).join(', ') || 'No disponible'}</p>
          <p><strong>Monto Total:</strong> $${event.cita.montototal?.toFixed(2) || '0.00'}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Editar Cita',
      cancelButtonText: 'Cerrar',
      showDenyButton: event.estado === 'Confirmada' || event.estado === 'En Progreso',
      denyButtonText: 'Iniciar Venta'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/citas', { state: { citaSeleccionada: event.cita } });
      } else if (result.isDenied) {
        // Verificar si ya existe una venta para esta cita
        verificarVentaExistente(event.cita._id);
      }
    });
  };

  const verificarVentaExistente = async (citaId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const respuesta = await axios.get('https://gitbf.onrender.com/api/ventaservicios', { headers });
      
      const ventaExistente = respuesta.data.ventaservicios.find(venta => venta.cita?._id === citaId);
      
      if (ventaExistente) {
        navigate(`/gestion-venta/${ventaExistente._id}`);
      } else {
        navigate(`/gestion-venta/new/${citaId}`);
      }
    } catch (error) {
      console.error('Error al verificar venta existente:', error);
      Swal.fire('Error', 'No se pudo verificar si existe una venta para esta cita', 'error');
    }
  };

  const handleSelectSlot = ({ start }) => {
    // Verificar disponibilidad del empleado antes de crear la cita
    verificarDisponibilidad(start, empleadoSeleccionado).then(disponible => {
      if (disponible) {
        navigate('/citas', { 
          state: { 
            fechaSeleccionada: start,
            empleadoPreseleccionado: empleadoSeleccionado
          } 
        });
      } else {
        Swal.fire('No disponible', 'El empleado ya tiene una cita programada en este horario', 'warning');
      }
    });
  };

  const verificarDisponibilidad = async (fecha, empleadoId) => {
    // Esta función verificaría si el empleado está disponible en la fecha seleccionada
    // Aquí simplemente verificamos si ya hay una cita para ese empleado en esa hora
    const horaInicio = moment(fecha).startOf('hour');
    const horaFin = moment(fecha).add(1, 'hour');
    
    const citasEnHorario = citas.filter(cita => {
      const citaInicio = moment(cita.start);
      const citaFin = moment(cita.end);
      
      return (
        cita.cita.nombreempleado?._id === empleadoId &&
        ((citaInicio >= horaInicio && citaInicio < horaFin) ||
         (citaFin > horaInicio && citaFin <= horaFin) ||
         (citaInicio <= horaInicio && citaFin >= horaFin))
      );
    });
    
    return citasEnHorario.length === 0;
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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">Agenda de Empleados</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={empleadoSeleccionado}
            onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">Todos los empleados</option>
            {empleados.map(empleado => (
              <option key={empleado._id} value={empleado._id}>
                {empleado.nombreempleado}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('/citas-en-progreso')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
            Citas en Progreso
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
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
          <Calendar
            localizer={localizer}
            events={citas}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            defaultView="week"
            views={['month', 'week', 'day', 'agenda']}
            defaultDate={fechaSeleccionada}
            onNavigate={date => setFechaSeleccionada(date)}
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
    </div>
  );
};

export default AgendaEmpleado;
