"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Modal from "react-modal"
import FormularioCita from "./FormularioCita"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "./TablaCitas.css"
import { useNavigate, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCalendarPlus,
  faCalendarCheck,
  faSpinner,
  faFilter,
  faSearch,
  faTimes,
  faCalendarAlt,
  faChevronLeft,
  faChevronRight,
  faCalendarDay,
  faCalendarWeek,
  faCalendar,
  faListAlt,
} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"

// Configurar moment en español
import "moment/locale/es"
moment.locale("es")

const localizer = momentLocalizer(moment)

// Asegurarse de que Modal esté configurado correctamente
Modal.setAppElement("#root")

const TablaCitas = () => {
  const [citas, setCitas] = useState([])
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [formModalIsOpen, setFormModalIsOpen] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroEmpleado, setFiltroEmpleado] = useState("")
  const [empleados, setEmpleados] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [vista, setVista] = useState("month")
  const [filtrando, setFiltrando] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Si hay una cita seleccionada en el state de la ubicación, abrirla
    if (location.state?.citaSeleccionada) {
      setCitaSeleccionada(location.state.citaSeleccionada)
      setFormModalIsOpen(true)
    }

    // Si hay una fecha seleccionada en el state de la ubicación, usarla
    if (location.state?.fechaSeleccionada) {
      setFechaSeleccionada(location.state.fechaSeleccionada)
    }

    obtenerCitas()
    obtenerEmpleados()
  }, [location.state])

  const obtenerEmpleados = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const respuesta = await axios.get("https://gitbf.onrender.com/api/empleados", { headers })
      setEmpleados(respuesta.data)
    } catch (error) {
      console.error("Error al obtener empleados:", error)
    }
  }

  const obtenerCitas = async () => {
    setIsLoading(true)
    setFiltrando(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const respuesta = await axios.get("https://gitbf.onrender.com/api/citas", { headers })

      // Aplicar filtros si existen
      let citasFiltradas = respuesta.data.citas

      if (filtroEstado) {
        citasFiltradas = citasFiltradas.filter((cita) => cita.estadocita === filtroEstado)
      }

      if (filtroEmpleado) {
        citasFiltradas = citasFiltradas.filter(
          (cita) => cita.nombreempleado && cita.nombreempleado._id === filtroEmpleado,
        )
      }

      if (busqueda) {
        const busquedaLower = busqueda.toLowerCase()
        citasFiltradas = citasFiltradas.filter(
          (cita) =>
            cita.nombrecliente?.nombrecliente?.toLowerCase().includes(busquedaLower) ||
            cita.nombrecliente?.apellidocliente?.toLowerCase().includes(busquedaLower) ||
            cita.nombreempleado?.nombreempleado?.toLowerCase().includes(busquedaLower),
        )
      }

      const citasFormateadas = citasFiltradas.map((cita) => {
        // Verificamos que cita.nombreempleado y cita.nombrecliente existan
        const nombreEmpleado = cita.nombreempleado ? cita.nombreempleado.nombreempleado : "Empleado no disponible"
        const nombreCliente = cita.nombrecliente ? cita.nombrecliente.nombrecliente : "Cliente no disponible"

        // Calcular la duración basada en los servicios
        const duracionTotal = cita.servicios
          ? cita.servicios.reduce((total, servicio) => total + (servicio.tiempo || 0), 0)
          : 60

        const fechaInicio = new Date(cita.fechacita)
        const fechaFin = new Date(fechaInicio.getTime() + duracionTotal * 60000)

        // Determinar el color según el estado
        let colorEvento = "#3b82f6" // Azul (Pendiente)
        let borderColor = "#2563eb"
        let textColor = "white"

        switch (cita.estadocita) {
          case "Completada":
            colorEvento = "#10b981" // Verde
            borderColor = "#059669"
            break
          case "Cancelada":
            colorEvento = "#ef4444" // Rojo
            borderColor = "#dc2626"
            break
          case "En Progreso":
            colorEvento = "#f59e0b" // Amarillo
            textColor = "#333"
            borderColor = "#d97706"
            break
          default:
            break
        }

        return {
          id: cita._id,
          title: `${nombreCliente} - ${nombreEmpleado}`,
          start: fechaInicio,
          end: fechaFin,
          estado: cita.estadocita,
          cita: cita,
          backgroundColor: colorEvento,
          borderColor: borderColor,
          textColor: textColor,
        }
      })

      setCitas(citasFormateadas)
      setIsLoading(false)
      setFiltrando(false)
    } catch (error) {
      console.error("Error al obtener las citas:", error)
      Swal.fire("Error", "No se pudieron cargar las citas", "error")
      setIsLoading(false)
      setFiltrando(false)
    }
  }

  const abrirFormulario = (fecha, cita = null) => {
    setFechaSeleccionada(fecha)
    setCitaSeleccionada(cita)
    setFormModalIsOpen(true)
  }

  const cerrarFormulario = () => {
    setFormModalIsOpen(false)
    setCitaSeleccionada(null)

    // Limpiar el state de la ubicación
    if (location.state) {
      navigate(location.pathname, { replace: true })
    }
  }

  const manejarCitaActualizada = () => {
    obtenerCitas()
    cerrarFormulario()
  }

  const manejarSeleccionFecha = ({ start }) => {
    abrirFormulario(start)
  }

  const manejarSeleccionCita = (event) => {
    abrirFormulario(event.start, event.cita)
  }

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "8px",
        opacity: 0.9,
        color: event.textColor,
        display: "block",
        fontWeight: "500",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden",
        transition: "all 0.2s ease",
      },
      className: "tabla-citas-event",
    }
  }

  const CustomToolbar = ({ label, onNavigate, onView }) => {
    return (
      <div className="tabla-citas-toolbar">
        <div className="tabla-citas-toolbar-section">
          <button type="button" onClick={() => onNavigate("TODAY")} className="tabla-citas-toolbar-btn">
            <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
            <span>Hoy</span>
          </button>
          <div className="tabla-citas-toolbar-nav">
            <button type="button" onClick={() => onNavigate("PREV")} className="tabla-citas-toolbar-btn">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="tabla-citas-toolbar-label">{label}</span>
            <button type="button" onClick={() => onNavigate("NEXT")} className="tabla-citas-toolbar-btn">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        <div className="tabla-citas-toolbar-views">
          <button
            type="button"
            className={`tabla-citas-toolbar-btn ${vista === "month" ? "tabla-citas-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("month")
              onView("month")
            }}
          >
            <FontAwesomeIcon icon={faCalendar} className="mr-2" />
            <span>Mes</span>
          </button>
          <button
            type="button"
            className={`tabla-citas-toolbar-btn ${vista === "week" ? "tabla-citas-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("week")
              onView("week")
            }}
          >
            <FontAwesomeIcon icon={faCalendarWeek} className="mr-2" />
            <span>Semana</span>
          </button>
          <button
            type="button"
            className={`tabla-citas-toolbar-btn ${vista === "day" ? "tabla-citas-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("day")
              onView("day")
            }}
          >
            <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
            <span>Día</span>
          </button>
          <button
            type="button"
            className={`tabla-citas-toolbar-btn ${vista === "agenda" ? "tabla-citas-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("agenda")
              onView("agenda")
            }}
          >
            <FontAwesomeIcon icon={faListAlt} className="mr-2" />
            <span>Agenda</span>
          </button>
        </div>
      </div>
    )
  }

  const aplicarFiltros = () => {
    obtenerCitas()
  }

  const limpiarFiltros = () => {
    setFiltroEstado("")
    setFiltroEmpleado("")
    setBusqueda("")
    setTimeout(() => {
      obtenerCitas()
    }, 100)
  }

  return (
    <div className="tabla-citas-container">
      <div className="tabla-citas-content">
        <div className="tabla-citas-header">
          <div className="tabla-citas-title-section">
            <FontAwesomeIcon icon={faCalendarAlt} className="tabla-citas-title-icon" />
            <h1 className="tabla-citas-title">Calendario de Citas</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-end mb-4">
            <button onClick={() => abrirFormulario(new Date())} className="tabla-citas-btn tabla-citas-btn-primary">
              <FontAwesomeIcon icon={faCalendarPlus} className="tabla-citas-btn-icon" />
              <span>Nueva Cita</span>
            </button>
            <button onClick={() => navigate("/citas-en-progreso")} className="tabla-citas-btn tabla-citas-btn-success">
              <FontAwesomeIcon icon={faCalendarCheck} className="tabla-citas-btn-icon" />
              <span>Citas en Progreso</span>
            </button>
          </div>

          <div className="tabla-citas-filters">
            <div className="tabla-citas-filter-group tabla-citas-search-container">
              <label className="tabla-citas-filter-label">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por cliente o empleado"
                  className="tabla-citas-input tabla-citas-search-input"
                />
                <FontAwesomeIcon icon={faSearch} className="tabla-citas-search-icon" />
              </div>
            </div>
            <div className="tabla-citas-filter-group">
              <label className="tabla-citas-filter-label">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="tabla-citas-select"
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="tabla-citas-filter-group">
              <label className="tabla-citas-filter-label">Empleado</label>
              <select
                value={filtroEmpleado}
                onChange={(e) => setFiltroEmpleado(e.target.value)}
                className="tabla-citas-select"
              >
                <option value="">Todos los empleados</option>
                {empleados.map((empleado) => (
                  <option key={empleado._id} value={empleado._id}>
                    {empleado.nombreempleado}
                  </option>
                ))}
              </select>
            </div>
            <div className="tabla-citas-filter-actions">
              <button onClick={aplicarFiltros} className="tabla-citas-btn tabla-citas-btn-primary" disabled={filtrando}>
                <FontAwesomeIcon
                  icon={filtrando ? faSpinner : faFilter}
                  className="tabla-citas-btn-icon"
                  spin={filtrando}
                />
                <span>{filtrando ? "Filtrando..." : "Filtrar"}</span>
              </button>
              <button
                onClick={limpiarFiltros}
                className="tabla-citas-btn tabla-citas-btn-secondary"
                disabled={filtrando}
              >
                <FontAwesomeIcon icon={faTimes} className="tabla-citas-btn-icon" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <div className="tabla-citas-legend">
            <div className="tabla-citas-legend-item">
              <div className="tabla-citas-legend-color" style={{ backgroundColor: "#3b82f6" }}></div>
              <span className="tabla-citas-legend-text">Pendiente</span>
            </div>
            <div className="tabla-citas-legend-item">
              <div className="tabla-citas-legend-color" style={{ backgroundColor: "#f59e0b" }}></div>
              <span className="tabla-citas-legend-text">En Progreso</span>
            </div>
            <div className="tabla-citas-legend-item">
              <div className="tabla-citas-legend-color" style={{ backgroundColor: "#10b981" }}></div>
              <span className="tabla-citas-legend-text">Completada</span>
            </div>
            <div className="tabla-citas-legend-item">
              <div className="tabla-citas-legend-color" style={{ backgroundColor: "#ef4444" }}></div>
              <span className="tabla-citas-legend-text">Cancelada</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="tabla-citas-loading">
            <div className="tabla-citas-loading-spinner">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            </div>
            <p className="tabla-citas-loading-text">Cargando citas...</p>
          </div>
        ) : (
          <div className="tabla-citas-calendar-wrapper">
            <div className="tabla-citas-calendar">
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
                views={["month", "week", "day", "agenda"]}
                defaultDate={fechaSeleccionada || new Date()}
                components={{
                  toolbar: CustomToolbar,
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
                  noEventsInRange: "No hay citas en este rango de fechas",
                }}
              />
            </div>
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
            <h2 className="text-xl font-semibold mb-4">{citaSeleccionada ? "Editar Cita" : "Nueva Cita"}</h2>
            <FormularioCita
              cita={citaSeleccionada}
              fechaSeleccionada={fechaSeleccionada}
              onCitaActualizada={manejarCitaActualizada}
              onClose={cerrarFormulario}
            />
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default TablaCitas

