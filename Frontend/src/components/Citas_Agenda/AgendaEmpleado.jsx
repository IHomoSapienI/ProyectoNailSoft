"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/es"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faSpinner,
  faCalendarCheck,
  faSync,
  faFilter,
  faCalendarPlus,
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
import "./AgendaEmpleado.css"

moment.locale("es")
const localizer = momentLocalizer(moment)

const AgendaEmpleado = () => {
  const [citas, setCitas] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [vista, setVista] = useState("week")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [filtrando, setFiltrando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    cargarEmpleados()
  }, [])

  useEffect(() => {
    cargarCitas()
  }, [empleadoSeleccionado, filtroEstado])

  const cargarEmpleados = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        Swal.fire({
          title: "Error",
          text: "No se encontró un token de autenticación",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        return
      }

      const headers = { Authorization: `Bearer ${token}` }
      const respuesta = await axios.get("https://gitbf.onrender.com/api/empleados", { headers })

      if (!respuesta.data || !Array.isArray(respuesta.data)) {
        Swal.fire({
          title: "Error",
          text: "Formato de respuesta inválido al cargar empleados",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        return
      }

      setEmpleados(respuesta.data)
    } catch (error) {
      console.error("Error al cargar empleados:", error)
      const mensaje = error.response?.data?.message || "No se pudieron cargar los empleados"
      Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#ff69b4",
      })
    }
  }

  const cargarCitas = async () => {
    setIsLoading(true)
    setFiltrando(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        Swal.fire({
          title: "Error",
          text: "No se encontró un token de autenticación",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        setIsLoading(false)
        setFiltrando(false)
        return
      }

      const headers = { Authorization: `Bearer ${token}` }
      const respuesta = await axios.get("https://gitbf.onrender.com/api/citas", { headers })

      if (!respuesta.data || !respuesta.data.citas) {
        Swal.fire({
          title: "Error",
          text: "Formato de respuesta inválido al cargar citas",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        setIsLoading(false)
        setFiltrando(false)
        return
      }

      let citasFiltradas = respuesta.data.citas

      // Filtrar por empleado si hay uno seleccionado y no es la opción "Todos los empleados"
      if (empleadoSeleccionado && empleadoSeleccionado !== "") {
        citasFiltradas = citasFiltradas.filter(
          (cita) => cita.nombreempleado && cita.nombreempleado._id === empleadoSeleccionado,
        )
      }

      // Filtrar por estado si hay uno seleccionado
      if (filtroEstado) {
        citasFiltradas = citasFiltradas.filter((cita) => cita.estadocita === filtroEstado)
      }

      // Filtrar por búsqueda si hay texto
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

        // Calcular fecha fin basada en la duración de los servicios
        const duracionTotal =
          cita.duracionTotal ||
          (cita.servicios ? cita.servicios.reduce((total, servicio) => total + (servicio.tiempo || 0), 0) : 60)

        const fechaFin = new Date(fechaInicio.getTime() + duracionTotal * 60000)

        // Determinar el color según el estado
        let colorEvento = "#ff69b4" // Rosa por defecto (Pendiente/Confirmada)
        let textColor = "white"
        let borderColor = "#da70d6"

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
          case "Pendiente":
            colorEvento = "#3b82f6" // Rosa
            borderColor = "#2563eb"
            break

          default:
            break
        }

        // Formatear título con información relevante
        const clienteNombre = cita.nombrecliente?.nombrecliente || "Cliente"
        const serviciosNombres = cita.servicios?.map((s) => s.nombreServicio).join(", ") || "Servicio"

        return {
          id: cita._id,
          title: `${clienteNombre} - ${serviciosNombres}`,
          start: fechaInicio,
          end: fechaFin,
          estado: cita.estadocita,
          cita: cita,
          backgroundColor: colorEvento,
          textColor: textColor,
          borderColor: borderColor,
        }
      })

      setCitas(citasFormateadas)
      setIsLoading(false)
      setFiltrando(false)
    } catch (error) {
      console.error("Error al cargar citas:", error)
      const mensaje = error.response?.data?.message || "No se pudieron cargar las citas"
      Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#ff69b4",
      })
      setIsLoading(false)
      setFiltrando(false)
    }
  }

  const handleSelectEvent = (event) => {
    // Crear un formato más compacto para los servicios
    const serviciosHTML = event.cita.servicios
      ? event.cita.servicios
          .map(
            (servicio) =>
              `<div class="swal-service-item">
                <span>${servicio.nombreServicio || "Sin nombre"}</span>
                <span>${servicio.precio || 0} (${servicio.tiempo || 0} min)</span>
              </div>`,
          )
          .join("")
      : "<div class='swal-service-item'>No hay servicios registrados</div>"

    // Crear un HTML más compacto y con mejor formato
    const detallesHTML = `
      <div class="swal-appointment-details">
        <div class="swal-appointment-header">
          <h3>${
            typeof event.cita.nombrecliente === "object"
              ? `${event.cita.nombrecliente?.nombrecliente || ""} ${event.cita.nombrecliente?.apellidocliente || ""}`
              : event.cita.nombrecliente || "Cliente"
          }</h3>
          <span class="swal-appointment-status ${event.estado.toLowerCase()}">${event.estado}</span>
        </div>
        
        <div class="swal-appointment-info">
          <div class="swal-info-row">
            <strong>Empleado:</strong>
            <span>${
              typeof event.cita.nombreempleado === "object"
                ? event.cita.nombreempleado?.nombreempleado || ""
                : event.cita.nombreempleado || ""
            }</span>
          </div>
          
          <div class="swal-info-row">
            <strong>Fecha:</strong>
            <span>${moment(event.start).format("LL")}</span>
          </div>
          
          <div class="swal-info-row">
            <strong>Hora:</strong>
            <span>${event.cita.horacita || moment(event.start).format("LT")} - ${moment(event.end).format("LT")}</span>
          </div>
          
          <div class="swal-info-row">
            <strong>Duración:</strong>
            <span>${event.cita.duracionTotal || 60} min</span>
          </div>
          
          <div class="swal-info-row">
            <strong>Monto:</strong>
            <span>${event.cita.montototal?.toFixed(2) || "0.00"}</span>
          </div>
        </div>
        
        <div class="swal-appointment-services">
          <h4>Servicios</h4>
          <div class="swal-services-list">
            ${serviciosHTML}
          </div>
        </div>
      </div>
    `

    // Estilos personalizados para el modal
    const customStyles = `
      <style>
        .swal-appointment-details {
          text-align: left;
          max-width: 100%;
        }
        .swal-appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 10px;
        }
        .swal-appointment-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.2rem;
        }
        .swal-appointment-status {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          color: white;
        }
        .swal-appointment-status.pendiente {
          background-color: #3b82f6;
        }
        .swal-appointment-status.en.progreso {
          background-color: #f59e0b;
          color: #333;
        }
        .swal-appointment-status.completada {
          background-color: #10b981;
        }
        .swal-appointment-status.cancelada {
          background-color: #ef4444;
        }
        .swal-appointment-info {
          margin-bottom: 15px;
        }
        .swal-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        .swal-info-row strong {
          color: #555;
        }
        .swal-appointment-services h4 {
          margin: 0 0 10px 0;
          color: #555;
          font-size: 1rem;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 5px;
        }
        .swal-services-list {
          max-height: 150px;
          overflow-y: auto;
        }
        .swal-service-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 0.9rem;
          border-bottom: 1px dashed #f0f0f0;
        }
        .swal-service-item:last-child {
          border-bottom: none;
        }
      </style>
    `

    Swal.fire({
      title: "Detalles de la Cita",
      html: customStyles + detallesHTML,
      showCancelButton: true,
      confirmButtonText: "Editar Cita",
      cancelButtonText: "Cerrar",
      showDenyButton: event.estado === "Confirmada" || event.estado === "En Progreso",
      denyButtonText: "Iniciar Venta",
      confirmButtonColor: "#ff69b4",
      denyButtonColor: "#10b981",
      cancelButtonColor: "#6B7280",
      width: "32em",
      customClass: {
        container: "agenda-swal-container",
        popup: "agenda-swal-popup",
        header: "agenda-swal-header",
        title: "agenda-swal-title",
        closeButton: "agenda-swal-close",
        content: "agenda-swal-content",
        actions: "agenda-swal-actions",
        confirmButton: "agenda-swal-confirm",
        cancelButton: "agenda-swal-cancel",
        denyButton: "agenda-swal-deny",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/citas", { state: { citaSeleccionada: event.cita } })
      } else if (result.isDenied) {
        // Verificar si ya existe una venta para esta cita
        verificarVentaExistente(event.cita._id)
      }
    })
  }

  const verificarVentaExistente = async (citaId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        Swal.fire({
          title: "Error",
          text: "No se encontró un token de autenticación",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        return
      }

      // Mostrar indicador de carga
      Swal.fire({
        title: "Verificando...",
        text: "Comprobando si existe una venta para esta cita",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const headers = { Authorization: `Bearer ${token}` }
      const respuesta = await axios.get("https://gitbf.onrender.com/api/ventaservicios", { headers })

      if (!respuesta.data || !respuesta.data.ventaservicios) {
        Swal.close()
        Swal.fire({
          title: "Error",
          text: "Formato de respuesta inválido al verificar ventas",
          icon: "error",
          confirmButtonColor: "#ff69b4",
        })
        return
      }

      const ventaExistente = respuesta.data.ventaservicios.find((venta) => venta.cita?._id === citaId)

      Swal.close()

      if (ventaExistente) {
        navigate(`/gestion-venta/${ventaExistente._id}`)
      } else {
        navigate(`/gestion-venta/new/${citaId}`)
      }
    } catch (error) {
      Swal.close()
      console.error("Error al verificar venta existente:", error)
      const mensaje = error.response?.data?.message || "No se pudo verificar si existe una venta para esta cita"
      Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#ff69b4",
      })
    }
  }

  const handleSelectSlot = ({ start }) => {
    // Si no hay empleado seleccionado, mostrar mensaje
    if (!empleadoSeleccionado) {
      Swal.fire({
        title: "Selecciona un empleado",
        text: "Debes seleccionar un empleado antes de crear una cita",
        icon: "info",
        confirmButtonColor: "#ff69b4",
      })
      return
    }

    // Verificar si la fecha seleccionada es anterior a hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(start)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      Swal.fire({
        title: "Fecha no válida",
        text: "No puedes crear citas en fechas pasadas",
        icon: "warning",
        confirmButtonColor: "#ff69b4",
      })
      return
    }

    // Navegar a la página de creación de citas con la fecha y empleado seleccionados
    navigate("/citas", {
      state: {
        fechaSeleccionada: start,
        empleadoId: empleadoSeleccionado,
      },
    })
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
    }
  }

  const CustomToolbar = ({ label, onNavigate, onView }) => {
    return (
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-section">
          <button
            type="button"
            onClick={() => onNavigate("TODAY")}
            className="calendar-toolbar-btn calendar-toolbar-btn-today"
          >
            <FontAwesomeIcon icon={faCalendarDay} className="calendar-toolbar-icon" />
            <span>Hoy</span>
          </button>
          <div className="calendar-toolbar-nav">
            <button
              type="button"
              onClick={() => onNavigate("PREV")}
              className="calendar-toolbar-btn calendar-toolbar-btn-nav"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="calendar-toolbar-label">{label}</span>
            <button
              type="button"
              onClick={() => onNavigate("NEXT")}
              className="calendar-toolbar-btn calendar-toolbar-btn-nav"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        <div className="calendar-toolbar-views">
          <button
            type="button"
            className={`calendar-toolbar-btn ${vista === "month" ? "calendar-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("month")
              onView("month")
            }}
          >
            <FontAwesomeIcon icon={faCalendar} className="calendar-toolbar-icon" />
            <span>Mes</span>
          </button>
          <button
            type="button"
            className={`calendar-toolbar-btn ${vista === "week" ? "calendar-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("week")
              onView("week")
            }}
          >
            <FontAwesomeIcon icon={faCalendarWeek} className="calendar-toolbar-icon" />
            <span>Semana</span>
          </button>
          <button
            type="button"
            className={`calendar-toolbar-btn ${vista === "day" ? "calendar-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("day")
              onView("day")
            }}
          >
            <FontAwesomeIcon icon={faCalendarDay} className="calendar-toolbar-icon" />
            <span>Día</span>
          </button>
          <button
            type="button"
            className={`calendar-toolbar-btn ${vista === "agenda" ? "calendar-toolbar-btn-active" : ""}`}
            onClick={() => {
              setVista("agenda")
              onView("agenda")
            }}
          >
            <FontAwesomeIcon icon={faListAlt} className="calendar-toolbar-icon" />
            <span>Agenda</span>
          </button>
        </div>
      </div>
    )
  }

  const aplicarFiltros = () => {
    cargarCitas()
  }

  const limpiarFiltros = () => {
    setFiltroEstado("")
    setBusqueda("")
    setTimeout(() => {
      cargarCitas()
    }, 100)
  }

  const verificarDisponibilidad = async (
    fechaSeleccionada,
    empleadoSeleccionado,
    inicioSeleccionado,
    finSeleccionado,
  ) => {
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
        `https://gitbf.onrender.com/api/citas?fechacita=${fechaSeleccionada}&empleadoId=${empleadoSeleccionado}`,
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
    <div className="agenda-container">
      <div className="agenda-content">
        <div className="agenda-header">
          <div className="agenda-title-section">
            <FontAwesomeIcon icon={faCalendarAlt} className="agenda-title-icon" />
            <h1 className="agenda-title">Agenda de Empleados</h1>
          </div>

          <div className="agenda-filters">
            <div className="agenda-filter-group">
              <label className="agenda-filter-label">Empleado</label>
              <select
                value={empleadoSeleccionado}
                onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                className="agenda-select"
              >
                <option value="">Todos los empleados</option>
                {empleados.map((empleado) => (
                  <option key={empleado._id} value={empleado._id}>
                    {empleado.nombreempleado}
                  </option>
                ))}
              </select>
            </div>

            <div className="agenda-filter-group">
              <label className="agenda-filter-label">Estado</label>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="agenda-select">
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div className="agenda-filter-group agenda-search-container">
              <label className="agenda-filter-label">Buscar</label>
              <div className="agenda-search">
                <FontAwesomeIcon icon={faSearch} className="agenda-search-icon" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="agenda-search-input"
                />
              </div>
            </div>

            <div className="agenda-filter-actions">
              <button onClick={aplicarFiltros} className="agenda-btn agenda-btn-primary" disabled={filtrando}>
                <FontAwesomeIcon icon={filtrando ? faSpinner : faFilter} className="agenda-btn-icon" spin={filtrando} />
                <span>{filtrando ? "Filtrando..." : "Filtrar"}</span>
              </button>

              <button onClick={limpiarFiltros} className="agenda-btn agenda-btn-secondary" disabled={filtrando}>
                <FontAwesomeIcon icon={faTimes} className="agenda-btn-icon" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <div className="agenda-actions">
            <button onClick={() => cargarCitas()} className="agenda-btn agenda-btn-secondary">
              <FontAwesomeIcon icon={faSync} className="agenda-btn-icon" />
              <span>Actualizar</span>
            </button>

            <button onClick={() => navigate("/citas")} className="agenda-btn agenda-btn-primary">
              <FontAwesomeIcon icon={faCalendarPlus} className="agenda-btn-icon" />
              <span>Nueva Cita</span>
            </button>

            <button onClick={() => navigate("/citas-en-progreso")} className="agenda-btn agenda-btn-success">
              <FontAwesomeIcon icon={faCalendarCheck} className="agenda-btn-icon" />
              <span>Citas en Progreso</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="agenda-loading">
            <div className="agenda-loading-spinner">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            </div>
            <p className="agenda-loading-text">Cargando agenda...</p>
          </div>
        ) : (
          <div className="agenda-calendar-wrapper">
            <div className="agenda-legend">
              <div className="agenda-legend-item">
                <div className="agenda-legend-color" style={{ backgroundColor: "#3b82f6" }}></div>
                <span className="agenda-legend-text">Pendiente</span>
              </div>

              <div className="agenda-legend-item">
                <div className="agenda-legend-color" style={{ backgroundColor: "#f59e0b" }}></div>
                <span className="agenda-legend-text">En Progreso</span>
              </div>
              <div className="agenda-legend-item">
                <div className="agenda-legend-color" style={{ backgroundColor: "#10b981" }}></div>
                <span className="agenda-legend-text">Completada</span>
              </div>
              <div className="agenda-legend-item">
                <div className="agenda-legend-color" style={{ backgroundColor: "#ef4444" }}></div>
                <span className="agenda-legend-text">Cancelada</span>
              </div>
            </div>

            <div className="agenda-calendar">
              <Calendar
                localizer={localizer}
                events={citas}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 650 }}
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventStyleGetter}
                defaultView="week"
                views={["month", "week", "day", "agenda"]}
                defaultDate={fechaSeleccionada}
                onNavigate={(date) => setFechaSeleccionada(date)}
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
      </div>
    </div>
  )
}

export default AgendaEmpleado
