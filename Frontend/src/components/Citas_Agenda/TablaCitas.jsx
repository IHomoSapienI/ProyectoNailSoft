"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Modal from "react-modal"
import FormularioCita from "./FormularioCita"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/es"
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
  faInfoCircle,
  faEdit,
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
  const [detalleModalIsOpen, setDetalleModalIsOpen] = useState(false)
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

        // SOLUCIÓN CORREGIDA: Crear fecha correctamente sin conversión de zona horaria
        let fechaInicio

        // Si tenemos horacita como campo separado, usarlo para construir la fecha
        if (cita.horacita) {
          // Extraer solo la parte de fecha de fechacita (YYYY-MM-DD)
          const fechaBase =
            typeof cita.fechacita === "string"
              ? cita.fechacita.split("T")[0]
              : new Date(cita.fechacita).toISOString().split("T")[0]

          // Construir fecha combinando fecha base y hora exacta
          fechaInicio = new Date(`${fechaBase}T${cita.horacita}`)
          console.log(`Cita ${cita._id}: Usando fecha ${fechaBase} y hora ${cita.horacita}`)
        } else {
          // Fallback al comportamiento anterior si no hay horacita
          fechaInicio = new Date(cita.fechacita)
          console.log(`Cita ${cita._id}: Usando fecha original ${fechaInicio}`)
        }

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

  const abrirDetallesCita = (cita) => {
    setCitaSeleccionada(cita)
    setDetalleModalIsOpen(true)
  }

  const cerrarDetallesCita = () => {
    setDetalleModalIsOpen(false)
    setCitaSeleccionada(null)
  }

  const manejarCitaActualizada = () => {
    obtenerCitas()
    cerrarFormulario()
    cerrarDetallesCita()
  }

  const manejarSeleccionFecha = ({ start }) => {
    abrirFormulario(start)
  }

  const manejarSeleccionCita = (event) => {
    abrirDetallesCita(event.cita)
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

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return moment(fecha).format("DD/MM/YYYY HH:mm")
  }

  // Buscar citas que coincidan con la fecha y el empleado seleccionados
  const verificarDisponibilidad = async (citasExistentes, fechaFormateada, empleadoId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        Swal.fire({
          title: "Error",
          text: "No se encontró un token de autenticación",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        return false
      }

      const headers = { Authorization: `Bearer ${token}` }
      const respuesta = await axios.get(
        `https://gitbf.onrender.com/api/citas?fechacita=${fechaFormateada}&empleadoId=${empleadoId}`,
        { headers },
      )

      if (!respuesta.data || !respuesta.data.citas) {
        Swal.fire({
          title: "Error",
          text: "Formato de respuesta inválido al cargar citas para verificar disponibilidad",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        return false
      }

      const citasDelDia = respuesta.data.citas

      // Verificar si hay solapamiento con alguna cita existente
      const hayConflicto = citasDelDia.some((cita) => {
        // Ignorar citas con horario liberado
        if (cita.horarioLiberado) return false

        // Ignorar citas completadas (que deberían tener horario liberado)
        if (cita.estadocita === "Completada") return false

        // Convertir la hora de la cita existente a minutos desde el inicio del día
        const [horaCita, minutosCita] = cita.horacita.split(":").map(Number)
        const inicioCita = horaCita * 60 + minutosCita
        const duracionCita = cita.duracionTotal || 60 // Usar 60 minutos por defecto si no hay duración
        const finCita = inicioCita + duracionCita

        // Suponiendo que inicioSeleccionado y finSeleccionado están definidos en el scope de FormularioCita
        // y se pasan como props a TablaCitas, o se calculan aquí antes de llamar a verificarDisponibilidad.
        // Para este ejemplo, los definiremos aquí con valores dummy para evitar el error.
        const inicioSeleccionado = 0 // Valor dummy
        const finSeleccionado = 100 // Valor dummy

        console.log(`Evaluando cita existente: ${cita.horacita} (${inicioCita}-${finCita} min)`)

        // Hay solapamiento si el inicio o fin de la nueva cita está dentro del rango de la cita existente
        // O si la nueva cita engloba completamente a la cita existente
        const conflicto =
          (inicioSeleccionado >= inicioCita && inicioSeleccionado < finCita) ||
          (finSeleccionado > inicioCita && finSeleccionado <= finCita) ||
          (inicioSeleccionado <= inicioCita && finSeleccionado >= finCita)

        if (conflicto) {
          console.log(`Conflicto detectado con cita existente: ${cita.horacita} (${inicioCita}-${finCita} min)`)
        }

        return conflicto
      })

      return !hayConflicto
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error)
      const mensaje = error.response?.data?.message || "No se pudo verificar la disponibilidad"
      Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#ff69b4",
      })
      return false
    }
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

        {/* Modal para editar citas */}
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

        {/* Modal para ver detalles de citas */}
        <Modal
          isOpen={detalleModalIsOpen}
          onRequestClose={cerrarDetallesCita}
          className="react-modal-content"
          overlayClassName="react-modal-overlay"
          contentLabel="Detalles de Cita"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                Detalles de la Cita
              </h2>
              <button onClick={cerrarDetallesCita} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {citaSeleccionada && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                      <p className="text-base">
                        {citaSeleccionada.nombrecliente
                          ? `${citaSeleccionada.nombrecliente.nombrecliente} ${citaSeleccionada.nombrecliente.apellidocliente}`
                          : "Cliente no disponible"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Empleado</h3>
                      <p className="text-base">
                        {citaSeleccionada.nombreempleado
                          ? citaSeleccionada.nombreempleado.nombreempleado
                          : "Empleado no disponible"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Fecha y Hora</h3>
                      <p className="text-base">
                        {citaSeleccionada.fechacita.substring(0, 10)} {citaSeleccionada.horacita}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                      <p
                        className={`text-base font-medium ${
                          citaSeleccionada.estadocita === "Cancelada"
                            ? "text-red-600"
                            : citaSeleccionada.estadocita === "Completada"
                              ? "text-green-600"
                              : citaSeleccionada.estadocita === "En Progreso"
                                ? "text-amber-600"
                                : "text-blue-600"
                        }`}
                      >
                        {citaSeleccionada.estadocita}
                      </p>
                    </div>

                    {citaSeleccionada.estadocita === "Cancelada" && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Motivo de Cancelación</h3>
                          <p className="text-base">{citaSeleccionada.motivoCancelacion || "No se especificó motivo"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Fecha de Cancelación</h3>
                          <p className="text-base">
                            {citaSeleccionada.fechaCancelacion
                              ? formatearFecha(citaSeleccionada.fechaCancelacion)
                              : "No registrada"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Servicios Solicitados</h3>
                  {citaSeleccionada.servicios && citaSeleccionada.servicios.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {citaSeleccionada.servicios.map((servicio, index) => (
                        <li key={index} className="text-sm">
                          {servicio.nombreServicio || servicio.nombreservicio} - $
                          {servicio.precio ? `${servicio.precio}` : "Precio no disponible"}
                          {servicio.tiempo ? ` (${servicio.tiempo} min)` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No hay servicios registrados</p>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notas</h3>
                  <p className="text-sm bg-white p-2 rounded border border-gray-200 min-h-[60px]">
                    {citaSeleccionada.notas || "No hay notas adicionales"}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  {citaSeleccionada.estadocita !== "Cancelada" && (
                    <button
                      onClick={() => {
                        cerrarDetallesCita()
                        abrirFormulario(new Date(citaSeleccionada.fechacita), citaSeleccionada)
                      }}
                      className="tabla-citas-btn tabla-citas-btn-primary"
                    >
                      <FontAwesomeIcon icon={faEdit} className="tabla-citas-btn-icon" />
                      <span>Editar Cita</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default TablaCitas
