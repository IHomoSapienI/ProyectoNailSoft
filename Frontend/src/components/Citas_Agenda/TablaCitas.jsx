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
  faCalendar,
  faInfoCircle,
  faEdit,
  faSync,
  faClock,
  faUser,
  faDollarSign,
  faMapMarkerAlt,
  faExclamationTriangle,
  faBug,
  faTag,
  faPercent,
} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"

// Configurar moment en español
moment.locale("es")
const localizer = momentLocalizer(moment)

// Asegurarse de que Modal esté configurado correctamente
Modal.setAppElement("#root")

const TablaCitas = () => {
  const [citas, setCitas] = useState([])
  const [citasOriginales, setCitasOriginales] = useState([])
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [formModalIsOpen, setFormModalIsOpen] = useState(false)
  const [detalleModalIsOpen, setDetalleModalIsOpen] = useState(false)
  const [citasDiaModalIsOpen, setCitasDiaModalIsOpen] = useState(false)
  const [debugModalIsOpen, setDebugModalIsOpen] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [citasDelDia, setCitasDelDia] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroEmpleado, setFiltroEmpleado] = useState("")
  const [empleados, setEmpleados] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [vista, setVista] = useState("month")
  const [filtrando, setFiltrando] = useState(false)
  const [debugData, setDebugData] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  // Función mejorada para calcular precios con descuentos
  const calcularPreciosConDescuento = (cita) => {
    console.log("🔍 Calculando precios para cita:", cita._id, {
      servicios: cita.servicios,
      montototal: cita.montototal,
      descuentoGeneral: cita.descuentoGeneral,
    })

    const servicios = cita.servicios || []
    let subtotal = 0
    let descuentoTotal = 0
    let total = 0

    // Calcular precios de servicios
    servicios.forEach((servicio, index) => {
      console.log(`Servicio ${index + 1}:`, {
        nombre: servicio.nombreServicio || servicio.nombreservicio,
        precio: servicio.precio,
        descuento: servicio.descuento,
        tieneDescuento: servicio.tieneDescuento,
        precioConDescuento: servicio.precioConDescuento,
        precioOriginal: servicio.precioOriginal,
      })

      const precioBase = Number.parseFloat(servicio.precio) || 0
      subtotal += precioBase

      // Detectar descuentos en diferentes formatos
      let precioFinal = precioBase
      let descuentoServicio = 0

      // Caso 1: Servicio con precio con descuento ya calculado
      if (servicio.precioConDescuento !== undefined && servicio.precioConDescuento !== null) {
        precioFinal = Number.parseFloat(servicio.precioConDescuento)
        descuentoServicio = precioBase - precioFinal
        console.log(`  -> Precio con descuento detectado: ${precioFinal}, descuento: ${descuentoServicio}`)
      }
      // Caso 2: Servicio con porcentaje de descuento
      else if (servicio.descuento && Number.parseFloat(servicio.descuento) > 0) {
        const porcentajeDescuento = Number.parseFloat(servicio.descuento)
        descuentoServicio = (precioBase * porcentajeDescuento) / 100
        precioFinal = precioBase - descuentoServicio
        console.log(
          `  -> Descuento por porcentaje: ${porcentajeDescuento}%, descuento: ${descuentoServicio}, precio final: ${precioFinal}`,
        )
      }
      // Caso 3: Campo tieneDescuento activado
      else if (servicio.tieneDescuento === true || servicio.tieneDescuento === "true") {
        // Si tiene descuento pero no especifica cuánto, intentar calcular basado en otros campos
        if (servicio.precioOriginal && Number.parseFloat(servicio.precioOriginal) > precioBase) {
          // El precio actual es el precio con descuento
          const precioOriginal = Number.parseFloat(servicio.precioOriginal)
          descuentoServicio = precioOriginal - precioBase
          precioFinal = precioBase
          subtotal = subtotal - precioBase + precioOriginal // Ajustar subtotal
          console.log(`  -> Descuento detectado por precioOriginal: descuento: ${descuentoServicio}`)
        }
      }

      total += precioFinal
      descuentoTotal += descuentoServicio
    })

    // Aplicar descuento general si existe
    if (cita.descuentoGeneral && Number.parseFloat(cita.descuentoGeneral) > 0) {
      const porcentajeDescuentoGeneral = Number.parseFloat(cita.descuentoGeneral)
      const descuentoGeneralMonto = (total * porcentajeDescuentoGeneral) / 100
      descuentoTotal += descuentoGeneralMonto
      total -= descuentoGeneralMonto
      console.log(`  -> Descuento general aplicado: ${porcentajeDescuentoGeneral}%, monto: ${descuentoGeneralMonto}`)
    }

    // Si no se detectaron descuentos pero hay diferencia entre montototal y suma de precios
    if (descuentoTotal === 0 && cita.montototal && Number.parseFloat(cita.montototal) < subtotal) {
      const diferenciaDetectada = subtotal - Number.parseFloat(cita.montototal)
      if (diferenciaDetectada > 0.01) {
        // Evitar diferencias por redondeo
        descuentoTotal = diferenciaDetectada
        total = Number.parseFloat(cita.montototal)
        console.log(`  -> Descuento detectado por diferencia en montototal: ${diferenciaDetectada}`)
      }
    }

    const resultado = {
      subtotal: subtotal,
      descuentoTotal: descuentoTotal,
      total: total > 0 ? total : Number.parseFloat(cita.montototal) || 0,
      porcentajeDescuento: subtotal > 0 ? (descuentoTotal / subtotal) * 100 : 0,
      tieneDescuentos: descuentoTotal > 0.01, // Considerar descuentos mayores a 1 centavo
    }

    console.log("💰 Resultado final del cálculo:", resultado)
    return resultado
  }

  // Función para obtener el nombre del cliente de forma robusta
  const obtenerNombreCliente = (cita) => {
    console.log("🔍 Analizando estructura del cliente:", {
      citaId: cita._id,
      nombrecliente: cita.nombrecliente,
      cliente: cita.cliente,
      clienteId: cita.clienteId,
      estructuraCompleta: cita,
    })

    // Verificar diferentes estructuras posibles
    if (cita.nombrecliente) {
      // Estructura 1: { nombrecliente: "Juan", apellidocliente: "Pérez" }
      if (cita.nombrecliente.nombrecliente) {
        const nombre = cita.nombrecliente.nombrecliente
        const apellido = cita.nombrecliente.apellidocliente

        // Si el apellido existe y no es undefined/null, concatenar
        if (apellido && apellido !== "undefined" && apellido !== "null") {
          return `${nombre} ${apellido}`
        }
        // Si solo hay nombre, devolver solo el nombre
        return nombre
      }

      // Estructura 2: { nombre: "Juan", apellido: "Pérez" }
      if (cita.nombrecliente.nombre) {
        const nombre = cita.nombrecliente.nombre
        const apellido = cita.nombrecliente.apellido

        if (apellido && apellido !== "undefined" && apellido !== "null") {
          return `${nombre} ${apellido}`
        }
        return nombre
      }

      // Estructura 3: { name: "Juan Pérez" }
      if (cita.nombrecliente.name) {
        return cita.nombrecliente.name
      }

      // Estructura 4: String directo
      if (typeof cita.nombrecliente === "string") {
        return cita.nombrecliente
      }

      // Estructura 7: firstName + lastName
      if (cita.nombrecliente.firstName) {
        const firstName = cita.nombrecliente.firstName
        const lastName = cita.nombrecliente.lastName

        if (lastName && lastName !== "undefined" && lastName !== "null") {
          return `${firstName} ${lastName}`
        }
        return firstName
      }

      // Estructura 8: first_name + last_name
      if (cita.nombrecliente.first_name) {
        const firstName = cita.nombrecliente.first_name
        const lastName = cita.nombrecliente.last_name

        if (lastName && lastName !== "undefined" && lastName !== "null") {
          return `${firstName} ${lastName}`
        }
        return firstName
      }
    }

    // Verificar si hay un campo cliente alternativo
    if (cita.cliente) {
      if (typeof cita.cliente === "string") {
        return cita.cliente
      }
      if (cita.cliente.nombre) {
        const nombre = cita.cliente.nombre
        const apellido = cita.cliente.apellido

        if (apellido && apellido !== "undefined" && apellido !== "null") {
          return `${nombre} ${apellido}`
        }
        return nombre
      }
      if (cita.cliente.nombrecliente) {
        return cita.cliente.nombrecliente
      }
      if (cita.cliente.name) {
        return cita.cliente.name
      }
    }

    // Verificar campo clienteId si está poblado
    if (cita.clienteId && typeof cita.clienteId === "object") {
      if (cita.clienteId.nombre) {
        const nombre = cita.clienteId.nombre
        const apellido = cita.clienteId.apellido

        if (apellido && apellido !== "undefined" && apellido !== "null") {
          return `${nombre} ${apellido}`
        }
        return nombre
      }
      if (cita.clienteId.nombrecliente) {
        return cita.clienteId.nombrecliente
      }
      if (cita.clienteId.name) {
        return cita.clienteId.name
      }
    }

    // Verificar otros campos posibles
    if (cita.customer) {
      if (typeof cita.customer === "string") {
        return cita.customer
      }
      if (cita.customer.name) {
        return cita.customer.name
      }
    }

    console.warn("❌ No se pudo obtener el nombre del cliente para la cita:", cita._id)
    return "Cliente no disponible"
  }

  // Función para obtener el nombre del empleado de forma robusta
  const obtenerNombreEmpleado = (cita) => {
    console.log("🔍 Analizando estructura del empleado:", {
      citaId: cita._id,
      nombreempleado: cita.nombreempleado,
      empleado: cita.empleado,
      empleadoId: cita.empleadoId,
    })

    if (cita.nombreempleado) {
      // Estructura 1: { nombreempleado: "María" }
      if (cita.nombreempleado.nombreempleado) {
        return cita.nombreempleado.nombreempleado
      }

      // Estructura 2: { nombre: "María" }
      if (cita.nombreempleado.nombre) {
        const nombre = cita.nombreempleado.nombre
        const apellido = cita.nombreempleado.apellido

        if (apellido && apellido !== "undefined" && apellido !== "null") {
          return `${nombre} ${apellido}`
        }
        return nombre
      }

      // Estructura 3: { name: "María" }
      if (cita.nombreempleado.name) {
        return cita.nombreempleado.name
      }

      // Estructura 4: String directo
      if (typeof cita.nombreempleado === "string") {
        return cita.nombreempleado
      }

      // Estructura 5: firstName + lastName
      if (cita.nombreempleado.firstName) {
        const firstName = cita.nombreempleado.firstName
        const lastName = cita.nombreempleado.lastName

        if (lastName && lastName !== "undefined" && lastName !== "null") {
          return `${firstName} ${lastName}`
        }
        return firstName
      }
    }

    // Verificar campo empleado alternativo
    if (cita.empleado) {
      if (typeof cita.empleado === "string") {
        return cita.empleado
      }
      if (cita.empleado.nombre) {
        const nombre = cita.empleado.nombre
        const apellido = cita.empleado.apellido

        if (apellido && apellido !== "undefined" && apellido !== "null") {
          return `${nombre} ${apellido}`
        }
        return nombre
      }
      if (cita.empleado.nombreempleado) {
        return cita.empleado.nombreempleado
      }
      if (cita.empleado.name) {
        return cita.empleado.name
      }
    }

    // Verificar campo empleadoId si está poblado
    if (cita.empleadoId && typeof cita.empleadoId === "object") {
      if (cita.empleadoId.nombre) {
        const nombre = cita.empleadoId.nombre
        const apellido = cita.empleadoId.apellido

        if (apellido && apellido !== "undefined" && apellido !== "null") {
          return `${nombre} ${apellido}`
        }
        return nombre
      }
      if (cita.empleadoId.nombreempleado) {
        return cita.empleadoId.nombreempleado
      }
      if (cita.empleadoId.name) {
        return cita.empleadoId.name
      }
    }

    // Verificar otros campos posibles
    if (cita.employee) {
      if (typeof cita.employee === "string") {
        return cita.employee
      }
      if (cita.employee.name) {
        return cita.employee.name
      }
    }

    console.warn("❌ No se pudo obtener el nombre del empleado para la cita:", cita._id)
    return "Empleado no disponible"
  }

  useEffect(() => {
    if (location.state?.citaSeleccionada) {
      setCitaSeleccionada(location.state.citaSeleccionada)
      setFormModalIsOpen(true)
    }

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
      console.log("📋 Empleados obtenidos:", respuesta.data)
      setEmpleados(respuesta.data)
    } catch (error) {
      console.error("❌ Error al obtener empleados:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los empleados",
        icon: "error",
        confirmButtonColor: "#ff69b4",
      })
    }
  }

  const obtenerCitas = async () => {
    setIsLoading(true)
    setFiltrando(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const respuesta = await axios.get("https://gitbf.onrender.com/api/citas", { headers })

      console.log("📅 Respuesta completa de la API:", respuesta.data)
      console.log("📅 Primeras 3 citas para análisis:", respuesta.data.citas?.slice(0, 3))

      let citasFiltradas = respuesta.data.citas

      // Guardar citas originales para el modal de día
      setCitasOriginales(citasFiltradas)

      // Analizar estructura de datos
      if (citasFiltradas && citasFiltradas.length > 0) {
        const primerasCitas = citasFiltradas.slice(0, 5)
        console.log("🔍 Análisis detallado de las primeras 5 citas:")
        primerasCitas.forEach((cita, index) => {
          console.log(`Cita ${index + 1}:`, {
            id: cita._id,
            cliente: obtenerNombreCliente(cita),
            empleado: obtenerNombreEmpleado(cita),
            estructuraCliente: cita.nombrecliente,
            estructuraEmpleado: cita.nombreempleado,
            servicios: cita.servicios,
            montototal: cita.montototal,
            todosLosCampos: Object.keys(cita),
          })
        })

        // Guardar datos para debug
        setDebugData({
          totalCitas: citasFiltradas.length,
          primerasCitas: primerasCitas,
          camposDisponibles: Object.keys(citasFiltradas[0] || {}),
          estructuraCompleta: citasFiltradas[0],
        })
      }

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
        citasFiltradas = citasFiltradas.filter((cita) => {
          const nombreCliente = obtenerNombreCliente(cita).toLowerCase()
          const nombreEmpleado = obtenerNombreEmpleado(cita).toLowerCase()
          return nombreCliente.includes(busquedaLower) || nombreEmpleado.includes(busquedaLower)
        })
      }

      // Crear eventos solo para marcar días con citas (sin mostrar contenido)
      const citasFormateadas = citasFiltradas.map((cita) => {
        let fechaInicio

        if (cita.horacita) {
          const fechaBase =
            typeof cita.fechacita === "string"
              ? cita.fechacita.split("T")[0]
              : new Date(cita.fechacita).toISOString().split("T")[0]

          fechaInicio = new Date(`${fechaBase}T${cita.horacita}`)
        } else {
          fechaInicio = new Date(cita.fechacita)
        }

        return {
          id: cita._id,
          title: "", // Título vacío para no mostrar contenido
          start: fechaInicio,
          end: fechaInicio,
          allDay: true, // Evento de todo el día para marcar el día
          cita: cita,
        }
      })

      setCitas(citasFormateadas)
      setIsLoading(false)
      setFiltrando(false)
    } catch (error) {
      console.error("❌ Error al obtener las citas:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las citas",
        icon: "error",
        confirmButtonColor: "#ff69b4",
      })
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

  const abrirCitasDelDia = (fecha) => {
    const fechaStr = moment(fecha).format("YYYY-MM-DD")

    // Filtrar citas del día seleccionado
    const citasDelDiaSeleccionado = citasOriginales.filter((cita) => {
      const fechaCita = moment(cita.fechacita).format("YYYY-MM-DD")
      return fechaCita === fechaStr
    })

    setCitasDelDia(citasDelDiaSeleccionado)
    setFechaSeleccionada(fecha)
    setCitasDiaModalIsOpen(true)
  }

  const cerrarCitasDelDia = () => {
    setCitasDiaModalIsOpen(false)
    setCitasDelDia([])
    setFechaSeleccionada(null)
  }

  const abrirDebugModal = () => {
    setDebugModalIsOpen(true)
  }

  const cerrarDebugModal = () => {
    setDebugModalIsOpen(false)
  }

  const manejarCitaActualizada = () => {
    obtenerCitas()
    cerrarFormulario()
    cerrarDetallesCita()
  }

  const manejarSeleccionFecha = ({ start }) => {
    abrirCitasDelDia(start)
  }

  const manejarSeleccionCita = (event) => {
    abrirDetallesCita(event.cita)
  }

  // Componente personalizado para mostrar días con indicadores
  const CustomDateCellWrapper = ({ children, value }) => {
    const fechaStr = moment(value).format("YYYY-MM-DD")
    const citasEnEstaFecha = citasOriginales.filter((cita) => {
      const fechaCita = moment(cita.fechacita).format("YYYY-MM-DD")
      return fechaCita === fechaStr
    })

    const tieneCitas = citasEnEstaFecha.length > 0

    return (
      <div className={`custom-date-cell ${tieneCitas ? "has-appointments" : ""}`}>
        {children}
        {tieneCitas && (
          <div className="appointment-indicator">
            <span className="appointment-count">{citasEnEstaFecha.length}</span>
          </div>
        )}
      </div>
    )
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

  const formatearFecha = (fecha) => {
    return moment(fecha).format("DD/MM/YYYY HH:mm")
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Completada":
        return "bg-green-100 text-green-800 border-green-200"
      case "Cancelada":
        return "bg-red-100 text-red-800 border-red-200"
      case "En Progreso":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Confirmada":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
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
            <button onClick={obtenerCitas} className="tabla-citas-btn tabla-citas-btn-secondary">
              <FontAwesomeIcon icon={faSync} className="tabla-citas-btn-icon" />
              <span>Actualizar</span>
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

          <div className="tabla-citas-info-box">
            <FontAwesomeIcon icon={faInfoCircle} className="tabla-citas-info-icon" />
            <span>Haz clic en cualquier día para ver las citas programadas</span>
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
                events={[]} // No mostramos eventos en el calendario
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                selectable
                onSelectSlot={manejarSeleccionFecha}
                defaultView="month"
                views={["month"]}
                defaultDate={fechaSeleccionada || new Date()}
                components={{
                  toolbar: CustomToolbar,
                  dateCellWrapper: CustomDateCellWrapper,
                }}
                messages={{
                  next: "Sig",
                  previous: "Ant",
                  today: "Hoy",
                  month: "Mes",
                  date: "Fecha",
                  noEventsInRange: "No hay citas en este rango de fechas",
                }}
              />
            </div>
          </div>
        )}

        {/* Modal de Debug */}
        <Modal
          isOpen={debugModalIsOpen}
          onRequestClose={cerrarDebugModal}
          className="react-modal-content-large"
          overlayClassName="react-modal-overlay"
          contentLabel="Información de Debug"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <FontAwesomeIcon icon={faBug} className="mr-3 text-blue-600" />
                Información de Debug
              </h2>
              <button onClick={cerrarDebugModal} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {debugData && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">Resumen de Datos</h3>
                  <p>
                    <strong>Total de citas:</strong> {debugData.totalCitas}
                  </p>
                  <p>
                    <strong>Campos disponibles:</strong> {debugData.camposDisponibles.join(", ")}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">Estructura de la Primera Cita</h3>
                  <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                    {JSON.stringify(debugData.estructuraCompleta, null, 2)}
                  </pre>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">Análisis de Primeras 5 Citas</h3>
                  {debugData.primerasCitas.map((cita, index) => (
                    <div key={cita._id} className="mb-3 p-2 bg-white rounded border">
                      <p>
                        <strong>Cita {index + 1}:</strong>
                      </p>
                      <p>
                        <strong>Cliente detectado:</strong> {obtenerNombreCliente(cita)}
                      </p>
                      <p>
                        <strong>Empleado detectado:</strong> {obtenerNombreEmpleado(cita)}
                      </p>
                      <p>
                        <strong>Estructura cliente:</strong> {JSON.stringify(cita.nombrecliente)}
                      </p>
                      <p>
                        <strong>Estructura empleado:</strong> {JSON.stringify(cita.nombreempleado)}
                      </p>
                      <p>
                        <strong>Servicios:</strong> {JSON.stringify(cita.servicios)}
                      </p>
                      <p>
                        <strong>Monto total:</strong> {cita.montototal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Modal para citas del día */}
        <Modal
          isOpen={citasDiaModalIsOpen}
          onRequestClose={cerrarCitasDelDia}
          className="react-modal-content-large"
          overlayClassName="react-modal-overlay"
          contentLabel="Citas del Día"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-pink-600" />
                Citas del {fechaSeleccionada && moment(fechaSeleccionada).format("DD [de] MMMM [de] YYYY")}
              </h2>
              <button onClick={cerrarCitasDelDia} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {citasDelDia.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No hay citas programadas para este día</p>
                <button
                  onClick={() => {
                    cerrarCitasDelDia()
                    abrirFormulario(fechaSeleccionada)
                  }}
                  className="tabla-citas-btn tabla-citas-btn-primary mt-4"
                >
                  <FontAwesomeIcon icon={faCalendarPlus} className="tabla-citas-btn-icon" />
                  <span>Crear Nueva Cita</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {citasDelDia
                  .sort((a, b) => (a.horacita || "").localeCompare(b.horacita || ""))
                  .map((cita, index) => {
                    const nombreCliente = obtenerNombreCliente(cita)
                    const nombreEmpleado = obtenerNombreEmpleado(cita)
                    const tieneProblemasCliente = nombreCliente === "Cliente no disponible"
                    const tieneProblemasEmpleado = nombreEmpleado === "Empleado no disponible"

                    // Calcular precios con descuentos
                    const precios = calcularPreciosConDescuento(cita)

                    return (
                      <div
                        key={cita._id}
                        className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                          tieneProblemasCliente || tieneProblemasEmpleado
                            ? "border-orange-200 bg-orange-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => {
                          cerrarCitasDelDia()
                          abrirDetallesCita(cita)
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FontAwesomeIcon icon={faClock} className="text-pink-600" />
                              <span className="font-semibold text-lg">{cita.horacita || "Sin hora"}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(cita.estadocita)}`}
                              >
                                {cita.estadocita}
                              </span>
                              {(tieneProblemasCliente || tieneProblemasEmpleado) && (
                                <FontAwesomeIcon
                                  icon={faExclamationTriangle}
                                  className="text-orange-500"
                                  title="Datos incompletos"
                                />
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                                  <span className={`font-medium ${tieneProblemasCliente ? "text-orange-600" : ""}`}>
                                    {nombreCliente}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
                                  <span className={`text-gray-600 ${tieneProblemasEmpleado ? "text-orange-600" : ""}`}>
                                    {nombreEmpleado}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FontAwesomeIcon icon={faDollarSign} className="text-green-600" />
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Precio original:</span>
                                      <span
                                        className={
                                          precios.tieneDescuentos ? "text-gray-400 line-through" : "text-gray-700"
                                        }
                                      >
                                        ${precios.subtotal.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Precio final:</span>
                                      <span className="font-bold text-green-600">
                                        ${(precios.total || cita.montototal || 0).toFixed(2)}
                                      </span>
                                    </div>
                                    {precios.tieneDescuentos && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <FontAwesomeIcon icon={faTag} className="text-green-500 text-xs" />
                                        <span className="text-xs text-green-600">
                                          Ahorro: ${precios.descuentoTotal.toFixed(2)} (
                                          {precios.porcentajeDescuento.toFixed(1)}%)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="text-sm text-gray-600">
                                  {cita.servicios && cita.servicios.length > 0
                                    ? cita.servicios.map((s) => s.nombreServicio || s.nombreservicio).join(", ")
                                    : "Sin servicios"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              cerrarCitasDelDia()
                              abrirFormulario(new Date(cita.fechacita), cita)
                            }}
                            className="ml-4 p-2 text-gray-400 hover:text-pink-600 transition-colors"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                {citasDelDia.length} cita{citasDelDia.length !== 1 ? "s" : ""} programada
                {citasDelDia.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => {
                  cerrarCitasDelDia()
                  abrirFormulario(fechaSeleccionada)
                }}
                className="tabla-citas-btn tabla-citas-btn-primary"
              >
                <FontAwesomeIcon icon={faCalendarPlus} className="tabla-citas-btn-icon" />
                <span>Nueva Cita</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal para editar citas */}
        <Modal
          isOpen={formModalIsOpen}
          onRequestClose={cerrarFormulario}
          className="react-modal-content"
          overlayClassName="react-modal-overlay"
          contentLabel="Formulario de Cita"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{citaSeleccionada ? "Editar Cita" : "Nueva Cita"}</h2>
              <button onClick={cerrarFormulario} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
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
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-3 text-blue-600" />
                Detalles de la Cita
              </h2>
              <button onClick={cerrarDetallesCita} className="text-gray-500 hover:text-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {citaSeleccionada && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cliente</h3>
                      <p className="text-lg font-medium text-gray-900 mt-1">{obtenerNombreCliente(citaSeleccionada)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Empleado</h3>
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {obtenerNombreEmpleado(citaSeleccionada)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Fecha y Hora</h3>
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {citaSeleccionada.fechacita.substring(0, 10)} a las {citaSeleccionada.horacita}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Estado</h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                          citaSeleccionada.estadocita === "Cancelada"
                            ? "bg-red-100 text-red-800"
                            : citaSeleccionada.estadocita === "Completada"
                              ? "bg-green-100 text-green-800"
                              : citaSeleccionada.estadocita === "En Progreso"
                                ? "bg-yellow-100 text-yellow-800"
                                : citaSeleccionada.estadocita === "Confirmada"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {citaSeleccionada.estadocita}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Monto Total</h3>
                      <div className="mt-1">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Precio original:</span>
                            <span
                              className={
                                calcularPreciosConDescuento(citaSeleccionada).tieneDescuentos
                                  ? "text-gray-400 line-through"
                                  : "text-gray-700"
                              }
                            >
                              ${calcularPreciosConDescuento(citaSeleccionada).subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Precio final:</span>
                            <span className="text-lg font-bold text-green-600">
                              $
                              {(
                                calcularPreciosConDescuento(citaSeleccionada).total ||
                                citaSeleccionada.montototal ||
                                0
                              ).toFixed(2)}
                            </span>
                          </div>
                          {calcularPreciosConDescuento(citaSeleccionada).tieneDescuentos && (
                            <div className="flex items-center gap-1 mt-1">
                              <FontAwesomeIcon icon={faTag} className="text-green-500 text-xs" />
                              <span className="text-xs text-green-600">
                                Ahorro: ${calcularPreciosConDescuento(citaSeleccionada).descuentoTotal.toFixed(2)} ($
                                {calcularPreciosConDescuento(citaSeleccionada).porcentajeDescuento.toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Duración</h3>
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {citaSeleccionada.duracionTotal || 60} minutos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Servicios Solicitados
                  </h3>
                  {citaSeleccionada.servicios && citaSeleccionada.servicios.length > 0 ? (
                    <div className="space-y-2">
                      {citaSeleccionada.servicios.map((servicio, index) => {
                        const precioBase = servicio.precio || 0
                        const tieneDescuentoServicio =
                          servicio.tieneDescuento || (servicio.descuento && servicio.descuento > 0)
                        let precioFinal = precioBase
                        let precioOriginal = precioBase

                        if (servicio.tieneDescuento && servicio.precioConDescuento !== undefined) {
                          precioFinal = servicio.precioConDescuento
                          precioOriginal = servicio.precioOriginal || precioBase
                        } else if (servicio.descuento && servicio.descuento > 0) {
                          precioFinal = precioBase - (precioBase * servicio.descuento) / 100
                        }

                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {servicio.nombreServicio || servicio.nombreservicio}
                              </p>
                              <p className="text-sm text-gray-500">{servicio.tiempo} minutos</p>
                            </div>
                            <div className="text-right">
                              {tieneDescuentoServicio ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-sm text-gray-400 line-through">
                                    ${precioOriginal.toFixed(2)}
                                  </span>
                                  <span className="font-bold text-green-600">${precioFinal.toFixed(2)}</span>
                                  {servicio.descuento && (
                                    <div className="flex items-center gap-1">
                                      <FontAwesomeIcon icon={faPercent} className="text-green-500 text-xs" />
                                      <span className="text-xs text-green-600">{servicio.descuento}% OFF</span>
                                    </div>
                                  )}
                                  {servicio.porcentajeDescuento && (
                                    <div className="flex items-center gap-1">
                                      <FontAwesomeIcon icon={faPercent} className="text-green-500 text-xs" />
                                      <span className="text-xs text-green-600">
                                        {servicio.porcentajeDescuento}% OFF
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="font-bold text-green-600">${precioBase.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay servicios registrados</p>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
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
