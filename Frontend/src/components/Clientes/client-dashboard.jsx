"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "moment/locale/es"
import Swal from "sweetalert2"
import "./client-dashboard.css"

// Importar íconos
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCalendarAlt,
  faShoppingBag,
  faUser,
  faFileInvoice,
  faExclamationTriangle,
  faSync,
  faClock,
  faChartBar,
  faEye,
  faCreditCard,
  faScissors,
  faHeart,
  faBookmark,
  faMapMarkerAlt,
  faStar,
  faGift,
  faCog,
  faMagicWandSparkles,
} from "@fortawesome/free-solid-svg-icons"

// Configurar moment en español
moment.locale("es")
const localizer = momentLocalizer(moment)

// Claves para almacenamiento local
const STORAGE_KEYS = {
  CITAS: "client_dashboard_citas",
  VENTAS: "client_dashboard_ventas",
  USER_DATA: "client_dashboard_user",
  LAST_FETCH: "client_dashboard_last_fetch",
}

// Componente de tarjeta de estadísticas
const StatCard = ({ title, value, description, icon, color, trend }) => (
  <div className={`stat-card ${color}`}>
    <div className="flex items-center p-4">
      <div className="stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="ml-4">
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            <FontAwesomeIcon
              icon={trend.isPositive ? "arrow-up" : "arrow-down"}
              className={trend.isPositive ? "text-green-500" : "text-red-500"}
            />
            <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>{trend.value}</span>
            <span className="text-gray-500">{trend.text}</span>
          </div>
        )}
      </div>
    </div>
  </div>
)

// Componente de gráfico de barras simplificado
const BarChart = ({ data }) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const maxValue = Math.max(...data, 1)

  return (
    <div className="chart-container">
      <div className="flex h-64">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center justify-end flex-1">
            <div
              className="w-full bg-pink-500 rounded-t-sm mx-1"
              style={{ height: `${(value / maxValue) * 100}%`, minHeight: "4px" }}
            ></div>
            <div className="text-xs mt-2 text-gray-600">{months[index]}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <div>$0</div>
        <div>${Math.round(maxValue).toLocaleString()}</div>
      </div>
    </div>
  )
}

// Componente de próxima cita
const UpcomingAppointment = ({ appointment }) => {
  if (!appointment) {
    return (
      <div className="card bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-1">Próxima Cita</h3>
        <p className="text-sm text-gray-500 mb-4">No tienes citas programadas</p>
        <div className="flex justify-center py-6">
          <FontAwesomeIcon icon={faClock} className="text-gray-300 text-5xl" />
        </div>
        <button className="btn-primary w-full">Agendar una cita</button>
      </div>
    )
  }

  const fecha = moment(appointment.start).format("DD MMM, YYYY")
  const hora = moment(appointment.start).format("HH:mm")
  const empleado = appointment.cita?.nombreempleado?.nombreempleado || appointment.title || "Sin asignar"
  const servicios = appointment.cita?.servicios || []

  return (
    <div className="card bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-1">Próxima Cita</h3>
      <p className="text-sm text-gray-500 mb-4">
        {fecha} a las {hora}
      </p>
      <div className="flex items-center space-x-4 rounded-md border p-4 mb-4">
        <FontAwesomeIcon icon={faClock} className="text-pink-500" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">
            {servicios.length > 0 ? servicios.map((s) => s.nombreServicio).join(", ") : "Servicio no especificado"}
          </p>
          <div className="flex items-center pt-2">
            <FontAwesomeIcon icon={faUser} className="mr-1 text-gray-400 text-xs" />
            <span className="text-xs text-gray-500">{empleado}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-gray-400 text-xs" />
            <span className="text-xs text-gray-500">Salón Principal</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button className="btn-outline">Cancelar</button>
        <button className="btn-primary">Modificar</button>
      </div>
    </div>
  )
}

// Componente de puntos de fidelidad
const LoyaltyPoints = ({ points }) => {
  // Calcular el nivel y progreso
  const levels = [
    { name: "Bronce", min: 0, max: 100, color: "bg-amber-700" },
    { name: "Plata", min: 100, max: 300, color: "bg-slate-400" },
    { name: "Oro", min: 300, max: 600, color: "bg-amber-400" },
    { name: "Platino", min: 600, max: 1000, color: "bg-emerald-400" },
    { name: "Diamante", min: 1000, max: Number.POSITIVE_INFINITY, color: "bg-blue-400" },
  ]

  const currentLevel = levels.find((level) => points >= level.min && points < level.max) || levels[0]
  const nextLevel = levels[levels.indexOf(currentLevel) + 1]

  // Calcular el progreso hacia el siguiente nivel
  const progress = nextLevel
    ? Math.round(((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100

  return (
    <div className="card bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold">Puntos de Fidelidad</h3>
        <div className="rounded-full bg-pink-100 p-1">
          <FontAwesomeIcon icon={faStar} className="text-pink-600" />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">Nivel {currentLevel.name}</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{points} puntos</span>
        {nextLevel && (
          <span className="text-xs text-gray-500">
            {nextLevel.min} para {nextLevel.name}
          </span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className={`h-2.5 rounded-full ${currentLevel.color}`} style={{ width: `${progress}%` }}></div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center">
            <FontAwesomeIcon icon={faGift} className="mr-2 text-pink-500" />
            Descuento en tu próxima visita
          </span>
          <span className="font-medium">{Math.min(points / 10, 25)}%</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center">
            <FontAwesomeIcon icon={faStar} className="mr-2 text-pink-500" />
            Servicios exclusivos
          </span>
          <span className="font-medium">{currentLevel.name === "Bronce" ? "No" : "Sí"}</span>
        </div>
      </div>

      <button className="btn-outline w-full text-xs">Ver beneficios completos</button>
    </div>
  )
}

// Componente de citas recientes
const RecentAppointments = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-gray-500">No hay citas recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {appointments.map((appointment) => {
        const empleado = appointment.cita?.nombreempleado?.nombreempleado || appointment.title || "Sin asignar"
        const fecha = moment(appointment.start).format("DD MMM, YYYY")
        const hora = moment(appointment.start).format("HH:mm")
        const servicios = appointment.cita?.servicios || []

        // Determinar el color del badge según el estado
        let badgeClass = "status-badge status-badge-pending"
        if (appointment.estado === "Confirmada") badgeClass = "status-badge status-badge-confirmed"
        if (appointment.estado === "En Progreso") badgeClass = "status-badge status-badge-in-progress"
        if (appointment.estado === "Cancelada") badgeClass = "status-badge status-badge-cancelled"
        if (appointment.estado === "Completada") badgeClass = "status-badge status-badge-completed"

        // Obtener las iniciales del empleado para el avatar
        const iniciales = empleado
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)

        return (
          <div key={appointment.id} className="flex items-center">
            <div className="avatar-circle mr-4 flex items-center justify-center bg-pink-100 text-pink-600">
              {iniciales}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{empleado}</p>
                <span className={badgeClass}>{appointment.estado}</span>
              </div>
              <p className="text-sm text-gray-500">
                {fecha} a las {hora}
              </p>
              {servicios.length > 0 && (
                <p className="text-xs text-gray-500">{servicios.map((s) => s.nombreServicio).join(", ")}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Componente principal del Dashboard
const ClientDashboard = () => {
  const [userData, setUserData] = useState(null)
  const [citas, setCitas] = useState([])
  const [ventas, setVentas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [debugMode, setDebugMode] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(null)
  const navigate = useNavigate()

  // Cargar datos desde localStorage al inicio
  useEffect(() => {
    const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
    const storedCitas = localStorage.getItem(STORAGE_KEYS.CITAS)
    const storedVentas = localStorage.getItem(STORAGE_KEYS.VENTAS)
    const storedLastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH)

    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData))
      } catch (e) {
        console.error("Error al cargar datos de usuario desde localStorage:", e)
      }
    }

    if (storedCitas) {
      try {
        const parsedCitas = JSON.parse(storedCitas)
        // Convertir las fechas de string a objetos Date
        const formattedCitas = parsedCitas.map((cita) => ({
          ...cita,
          start: new Date(cita.start),
          end: new Date(cita.end),
        }))
        setCitas(formattedCitas)
      } catch (e) {
        console.error("Error al cargar citas desde localStorage:", e)
      }
    }

    if (storedVentas) {
      try {
        setVentas(JSON.parse(storedVentas))
      } catch (e) {
        console.error("Error al cargar ventas desde localStorage:", e)
      }
    }

    if (storedLastFetch) {
      setLastFetchTime(new Date(storedLastFetch))
    }
  }, [])

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    }

    if (citas.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(citas))
    }

    if (ventas.length > 0) {
      localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas))
    }

    if (lastFetchTime) {
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, lastFetchTime.toISOString())
    }
  }, [userData, citas, ventas, lastFetchTime])

  // Función para comparar IDs
  const areIdsSimilar = (id1, id2) => {
    if (!id1 || !id2) return false

    // Convertir a string si no lo son
    const str1 = String(id1)
    const str2 = String(id2)

    // Si son exactamente iguales
    if (str1 === str2) return true

    // Si los primeros 20 caracteres son iguales (para manejar posibles variaciones en el formato)
    const minLength = Math.min(str1.length, str2.length, 20)
    return str1.substring(0, minLength) === str2.substring(0, minLength)
  }

  // Funciones para comparar emails y nombres
  const areEmailsSimilar = (email1, email2) => {
    if (!email1 || !email2) return false
    return String(email1).toLowerCase() === String(email2).toLowerCase()
  }

  const areNamesSimilar = (name1, name2) => {
    if (!name1 || !name2) return false

    // Normalizar nombres: convertir a minúsculas y eliminar espacios
    const normalizedName1 = String(name1).toLowerCase().trim()
    const normalizedName2 = String(name2).toLowerCase().trim()

    // Verificar si son exactamente iguales después de normalizar
    if (normalizedName1 === normalizedName2) return true

    // Verificar si uno contiene al otro
    return normalizedName1.includes(normalizedName2) || normalizedName2.includes(normalizedName1)
  }

  // Función para obtener datos
  const fetchData = async (forceRefresh = false) => {
    // Si tenemos datos en caché y no se fuerza la actualización, usamos los datos en caché
    const now = new Date()
    const cacheExpired = !lastFetchTime || now.getTime() - lastFetchTime.getTime() > 5 * 60 * 1000 // 5 minutos

    if (!forceRefresh && !cacheExpired && citas.length > 0 && ventas.length > 0) {
      console.log("Usando datos en caché. Última actualización:", lastFetchTime)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        Swal.fire("Error", "Debes iniciar sesión para ver esta página", "error")
        navigate("/login")
        return
      }

      const headers = { Authorization: `Bearer ${token}` }
      const userId = localStorage.getItem("userId")
      const userName = localStorage.getItem("userName")
      const userEmail = localStorage.getItem("userEmail")

      if (!userId) {
        Swal.fire("Error", "No se pudo identificar al usuario", "error")
        navigate("/login")
        return
      }

      // 1. Obtener datos del usuario o usar los que ya tenemos en localStorage
      try {
        if (!userData) {
          const usuarioResponse = await axios.get(`https://gitbf.onrender.com/api/usuarios/${userId}`, { headers })

          // Extraer los datos del usuario de la estructura anidada
          const rawUserData = usuarioResponse.data

          // Determinar la estructura correcta de los datos
          let extractedUserData = rawUserData

          // Si los datos vienen en formato {usuario: {...}, infoAdicional: {...}}
          if (rawUserData.usuario) {
            extractedUserData = rawUserData.usuario
          }

          setUserData(extractedUserData)
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error)

        // Si hay un error pero tenemos datos básicos en localStorage, creamos un objeto de usuario básico
        if (userName && userEmail) {
          console.log("Usando datos básicos de localStorage para el usuario")
          setUserData({
            _id: userId,
            nombre: userName,
            correo: userEmail,
            rol: localStorage.getItem("userRole") || "cliente",
          })
        } else {
          Swal.fire("Error", "No se pudieron cargar tus datos de perfil", "error")
          setIsLoading(false)
          return
        }
      }

      // 2. Obtener todas las citas
      try {
        const todasCitasResponse = await axios.get(`https://gitbf.onrender.com/api/citas`, { headers })
        const todasLasCitas = todasCitasResponse.data.citas || todasCitasResponse.data || []

        // Intentar buscar por correo electrónico y otros campos
        const correoUsuario = userData?.correo || userData?.email || userEmail
        const nombreUsuario = userData?.nombre || userName

        // Buscar citas que coincidan con cualquier dato del usuario
        const citasFiltradas = todasLasCitas.filter((cita) => {
          // Verificar por ID directo o similar
          if (areIdsSimilar(cita.nombrecliente, userId) || areIdsSimilar(cita.cliente, userId)) {
            return true
          }

          // Verificar por ID en objetos anidados
          if (areIdsSimilar(cita.nombrecliente?._id, userId) || areIdsSimilar(cita.cliente?._id, userId)) {
            return true
          }

          // Verificar por correo
          const correoCliente = cita.nombrecliente?.correocliente || cita.cliente?.correocliente
          if (correoUsuario && correoCliente && areEmailsSimilar(correoCliente, correoUsuario)) {
            return true
          }

          // Verificar por nombre
          const nombreCliente = cita.nombrecliente?.nombrecliente || cita.cliente?.nombrecliente || cita.cliente?.nombre
          if (nombreUsuario && nombreCliente && areNamesSimilar(nombreCliente, nombreUsuario)) {
            return true
          }

          return false
        })

        if (citasFiltradas.length > 0) {
          // Formatear citas para el calendario
          const citasFormateadas = citasFiltradas.map((cita) => {
            const fechaInicio = new Date(cita.fechacita)
            const duracionTotal = cita.duracionTotal || 60 // Duración en minutos
            const fechaFin = new Date(fechaInicio.getTime() + duracionTotal * 60000)

            // Determinar el color según el estado
            let colorEvento = "#3174ad" // Azul por defecto (Pendiente)
            if (cita.estadocita === "Completada") colorEvento = "#5cb85c" // Verde
            if (cita.estadocita === "Cancelada") colorEvento = "#d9534f" // Rojo
            if (cita.estadocita === "En Progreso") colorEvento = "#f0ad4e" // Amarillo

            return {
              id: cita._id,
              title: `${cita.nombreempleado?.nombreempleado || "Sin asignar"}`,
              start: fechaInicio,
              end: fechaFin,
              estado: cita.estadocita,
              cita: cita,
              backgroundColor: colorEvento,
            }
          })

          setCitas(citasFormateadas)
        }
      } catch (error) {
        console.error("Error al obtener todas las citas:", error)
      }

      // 3. Obtener todas las ventas
      try {
        const todasVentasResponse = await axios.get(`https://gitbf.onrender.com/api/ventas`, { headers })
        const todasLasVentas = todasVentasResponse.data.ventas || todasVentasResponse.data || []

        // Intentar buscar por correo electrónico y otros campos
        const correoUsuario = userData?.correo || userData?.email || userEmail
        const nombreUsuario = userData?.nombre || userName

        // Buscar ventas que coincidan con cualquier dato del usuario
        const ventasFiltradas = todasLasVentas.filter((venta) => {
          // Verificar por ID directo o similar
          if (areIdsSimilar(venta.cliente, userId)) {
            return true
          }

          // Verificar por ID en objetos anidados
          if (venta.cliente?._id && areIdsSimilar(venta.cliente._id, userId)) {
            return true
          }

          // Verificar por correo
          const correoCliente = venta.cliente?.correocliente
          if (correoUsuario && correoCliente && areEmailsSimilar(correoCliente, correoUsuario)) {
            return true
          }

          // Verificar por nombre
          const nombreCliente = venta.cliente?.nombrecliente || venta.cliente?.nombre
          if (nombreUsuario && nombreCliente && areNamesSimilar(nombreCliente, nombreUsuario)) {
            return true
          }

          return false
        })

        if (ventasFiltradas.length > 0) {
          setVentas(ventasFiltradas)
        }
      } catch (error) {
        console.error("Error al obtener todas las ventas:", error)
      }

      // Actualizar la hora de la última actualización
      const newFetchTime = new Date()
      setLastFetchTime(newFetchTime)
    } catch (error) {
      console.error("Error general:", error)
      Swal.fire("Error", "No se pudieron cargar tus datos", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para crear datos de prueba
  const crearCitasDePrueba = () => {
    // Obtener el nombre real del usuario para personalizar los datos de prueba
    const nombreReal = userData?.nombre || localStorage.getItem("userName") || "Cliente"

    const citasPrueba = [
      {
        id: "cita-prueba-1",
        title: "Manicure con Lucia",
        start: new Date(new Date().setDate(new Date().getDate() + 2)),
        end: new Date(new Date().setDate(new Date().getDate() + 2) + 60 * 60 * 1000),
        estado: "Pendiente",
        backgroundColor: "#3174ad",
        cita: {
          servicios: [{ nombreServicio: "Manicure Semipermanente", precio: 45000 }],
          montototal: 45000,
          nombrecliente: { nombrecliente: nombreReal },
          nombreempleado: { nombreempleado: "Lucia Martínez" },
          fechacita: new Date(new Date().setDate(new Date().getDate() + 2)),
        },
      },
      {
        id: "cita-prueba-2",
        title: "Pedicure con Carlos",
        start: new Date(new Date().setDate(new Date().getDate() + 5)),
        end: new Date(new Date().setDate(new Date().getDate() + 5) + 90 * 60 * 1000),
        estado: "Confirmada",
        backgroundColor: "#5cb85c",
        cita: {
          servicios: [{ nombreServicio: "Pedicure Spa", precio: 55000 }],
          montototal: 55000,
          nombrecliente: { nombrecliente: nombreReal },
          nombreempleado: { nombreempleado: "Carlos Rodríguez" },
          fechacita: new Date(new Date().setDate(new Date().getDate() + 5)),
        },
      },
      {
        id: "cita-prueba-3",
        title: "Tratamiento facial con Ana",
        start: new Date(new Date().setDate(new Date().getDate() + 7)),
        end: new Date(new Date().setDate(new Date().getDate() + 7) + 120 * 60 * 1000),
        estado: "Pendiente",
        backgroundColor: "#3174ad",
        cita: {
          servicios: [{ nombreServicio: "Tratamiento Facial Hidratante", precio: 75000 }],
          montototal: 75000,
          nombrecliente: { nombrecliente: nombreReal },
          nombreempleado: { nombreempleado: "Ana López" },
          fechacita: new Date(new Date().setDate(new Date().getDate() + 7)),
        },
      },
    ]

    setCitas(citasPrueba)

    const ventasPrueba = [
      {
        _id: "venta-prueba-1",
        codigoVenta: "VP001",
        fechaCreacion: new Date(),
        servicios: [{ nombreServicio: "Manicure Semipermanente", precio: 45000 }],
        productos: [],
        total: 45000,
        estado: true,
        cliente: { nombrecliente: nombreReal },
      },
      {
        _id: "venta-prueba-2",
        codigoVenta: "VP002",
        fechaCreacion: new Date(new Date().setDate(new Date().getDate() - 10)),
        servicios: [],
        productos: [{ nombreProducto: "Esmalte Premium", precio: 25000 }],
        total: 25000,
        estado: true,
        cliente: { nombrecliente: nombreReal },
      },
      {
        _id: "venta-prueba-3",
        codigoVenta: "VP003",
        fechaCreacion: new Date(new Date().setDate(new Date().getDate() - 20)),
        servicios: [{ nombreServicio: "Pedicure Spa", precio: 55000 }],
        productos: [{ nombreProducto: "Crema Hidratante", precio: 35000 }],
        total: 90000,
        estado: true,
        cliente: { nombrecliente: nombreReal },
      },
      {
        _id: "venta-prueba-4",
        codigoVenta: "VP004",
        fechaCreacion: new Date(new Date().setDate(new Date().getDate() - 30)),
        servicios: [{ nombreServicio: "Tratamiento Capilar", precio: 65000 }],
        productos: [],
        total: 65000,
        estado: true,
        cliente: { nombrecliente: nombreReal },
      },
      {
        _id: "venta-prueba-5",
        codigoVenta: "VP005",
        fechaCreacion: new Date(new Date().setDate(new Date().getDate() - 45)),
        servicios: [{ nombreServicio: "Depilación", precio: 40000 }],
        productos: [],
        total: 40000,
        estado: true,
        cliente: { nombrecliente: nombreReal },
      },
    ]

    setVentas(ventasPrueba)

    // Actualizar la hora de la última actualización
    const newFetchTime = new Date()
    setLastFetchTime(newFetchTime)

    Swal.fire({
      title: "Datos de prueba cargados",
      text: `Se han cargado datos de prueba personalizados para ${nombreReal}`,
      icon: "success",
      confirmButtonText: "Entendido",
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  const handleSelectCita = (event) => {
    Swal.fire({
      title: "Detalles de la Cita",
      html: `
        <div class="text-left">
          <p><strong>Fecha:</strong> ${moment(event.start).format("DD/MM/YYYY")}</p>
          <p><strong>Hora:</strong> ${moment(event.start).format("HH:mm")}</p>
          <p><strong>Empleado:</strong> ${event.title}</p>
          <p><strong>Estado:</strong> ${event.estado}</p>
          <p><strong>Servicios:</strong></p>
          <ul>
            ${
              event.cita.servicios
                ?.map((servicio) => `<li>${servicio.nombreServicio} - $${servicio.precio}</li>`)
                .join("") || "No hay servicios registrados"
            }
          </ul>
          <p><strong>Total:</strong> $${event.cita.montototal || 0}</p>
        </div>
      `,
      confirmButtonText: "Cerrar",
      showCancelButton: false,
    })
  }

  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-light-bg">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Cargando tus datos...</p>
        </div>
      </div>
    )
  }

  // Usar datos del usuario
  const nombre = userData?.nombre || localStorage.getItem("userName") || "Usuario"
  const apellido = userData?.apellido || ""
  const correo = userData?.correo || userData?.email || localStorage.getItem("userEmail") || ""

  // Calcular estadísticas básicas
  const citasPendientes = citas.filter((cita) => cita.estado === "Pendiente" || cita.estado === "Confirmada").length
  const totalVentas = ventas.length
  const totalGastado = ventas.reduce((total, venta) => total + (venta.total || 0), 0)

  // Obtener la próxima cita
  const citasOrdenadas = [...citas].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  const proximaCita = citasOrdenadas.find((cita) => new Date(cita.start) > new Date()) || null

  // Preparar datos para gráficos
  const ventasPorMes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Inicializar con ceros para cada mes

  ventas.forEach((venta) => {
    const fecha = new Date(venta.fechaCreacion || venta.fecha)
    const mes = fecha.getMonth() // 0-11
    ventasPorMes[mes] += venta.total || 0
  })

  return (
    <div className="dashboard-container p-6">
      <div className="dashboard-header p-6 mb-6">
        <div className="dashboard-bubble"></div>
        <div className="dashboard-bubble"></div>
        <div className="dashboard-bubble"></div>

        <div className="header-content flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="welcome-text text-2xl">
            Bienvenido, {nombre} {apellido}
          </h1>
          <div className="user-actions mt-2 md:mt-0 flex items-center">
            <span className="user-info mr-4">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              {correo || "Sin correo registrado"}
            </span>
            <div className="dropdown relative">
              <button className="action-button action-button-info mr-3" title="Opciones">
                <FontAwesomeIcon icon={faCog} size="lg" />
              </button>
              <div className="dropdown-content">
                <button onClick={() => fetchData(true)} className="dropdown-item">
                  <FontAwesomeIcon icon={faSync} className="mr-2" />
                  Actualizar datos
                </button>
                <button onClick={crearCitasDePrueba} className="dropdown-item">
                  <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                  Cargar datos de prueba
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard
            title="Total Compras"
            value={totalVentas.toString()}
            description="Historial de compras"
            icon={faShoppingBag}
            color="stat-card-purchases"
            trend={{
              value: "+12%",
              isPositive: true,
              text: "desde el mes pasado",
            }}
          />
          <StatCard
            title="Citas Programadas"
            value={citasPendientes.toString()}
            description="Citas pendientes"
            icon={faCalendarAlt}
            color="stat-card-appointments"
            trend={{
              value: "2",
              isPositive: true,
              text: "nuevas este mes",
            }}
          />
          <StatCard
            title="Total Gastado"
            value={`$${totalGastado.toLocaleString()}`}
            description="En todos los servicios"
            icon={faCreditCard}
            color="stat-card-next"
            trend={{
              value: "+5%",
              isPositive: true,
              text: "desde el mes pasado",
            }}
          />
        </div>
      </div>

      {/* Mensaje de advertencia si no hay datos */}
      {citas.length === 0 && ventas.length === 0 && (
        <div className="warning-message mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Nota:</strong> No se encontraron citas ni compras asociadas a tu cuenta. Si acabas de
                registrarte, esto es normal. Si crees que deberías ver tus datos, por favor contacta al administrador o
                haz clic en el botón <FontAwesomeIcon icon={faFileInvoice} className="text-green-500" />
                para cargar datos de prueba y visualizar la interfaz.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="dashboard-tabs flex">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FontAwesomeIcon icon={faChartBar} className="mr-2" />
            Resumen
          </button>
          <button
            className={`tab-button ${activeTab === "citas" ? "active" : ""}`}
            onClick={() => setActiveTab("citas")}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            Mis Citas
          </button>
          <button
            className={`tab-button ${activeTab === "ventas" ? "active" : ""}`}
            onClick={() => setActiveTab("ventas")}
          >
            <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
            Mis Compras
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="fade-in">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="md:col-span-2 content-container">
              <h2 className="text-xl font-semibold mb-4">Historial de Compras</h2>
              <BarChart data={ventasPorMes} />
            </div>

            <div className="space-y-6">
              <UpcomingAppointment appointment={proximaCita} />
              <LoyaltyPoints points={Math.floor(totalGastado / 10000)} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="content-container p-6">
              <h2 className="text-xl font-semibold mb-4">Citas Recientes</h2>
              <RecentAppointments appointments={citas.slice(0, 5)} />
            </div>

            <div className="content-container p-6">
              <h2 className="text-xl font-semibold mb-4">Servicios Recomendados</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-pink-100 p-3">
                    <FontAwesomeIcon icon={faScissors} className="text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Tratamiento Capilar Premium</h4>
                    <p className="text-sm text-gray-500">Hidratación profunda y reparación</p>
                  </div>
                  <span className="badge badge-new">Nuevo</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 p-3">
                    <FontAwesomeIcon icon={faMagicWandSparkles} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Manicure Deluxe</h4>
                    <p className="text-sm text-gray-500">Con diseños exclusivos</p>
                  </div>
                  <span className="badge badge-popular">Popular</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <FontAwesomeIcon icon={faHeart} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Facial Rejuvenecedor</h4>
                    <p className="text-sm text-gray-500">Tratamiento anti-edad</p>
                  </div>
                  <span className="badge badge-discount">-15%</span>
                </div>
              </div>
              <button className="btn-outline w-full mt-6">
                <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                Ver todos los servicios
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "citas" && (
        <div className="content-container fade-in">
          <h2 className="text-xl font-semibold p-4 border-b">Mis Citas</h2>
          {citas.length > 0 ? (
            <div className="calendar-container">
              <Calendar
                localizer={localizer}
                events={citas}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectEvent={handleSelectCita}
                eventPropGetter={eventStyleGetter}
                views={["month", "week", "day"]}
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tienes citas programadas
              <p className="mt-2 text-sm">
                <em>
                  Nota: Si acabas de registrarte, es posible que aún no tengas citas asignadas. Puedes usar el botón{" "}
                  <FontAwesomeIcon icon={faFileInvoice} className="text-green-500" /> para cargar datos de prueba.
                </em>
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "ventas" && (
        <div className="content-container fade-in">
          <h2 className="text-xl font-semibold p-4 border-b">Mis Compras</h2>
          {ventas.length > 0 ? (
            <div className="overflow-x-auto p-4">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Código</th>
                    <th>Servicios</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta._id}>
                      <td>{formatearFechaHora(venta.fechaCreacion || venta.fecha)}</td>
                      <td>{venta.codigoVenta || venta._id.substring(0, 8)}</td>
                      <td>
                        {venta.servicios && venta.servicios.length > 0
                          ? venta.servicios.map((s) => s.nombreServicio).join(", ")
                          : "Ninguno"}
                      </td>
                      <td>
                        {venta.productos && venta.productos.length > 0
                          ? venta.productos.map((p) => p.nombreProducto).join(", ")
                          : "Ninguno"}
                      </td>
                      <td>${venta.total?.toLocaleString() || "0"}</td>
                      <td>
                        <span
                          className={`status-badge ${venta.estado ? "status-badge-completed" : "status-badge-pending"}`}
                        >
                          {venta.estado ? "Completada" : "Pendiente"}
                        </span>
                      </td>
                      <td>
                        <button className="action-button">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tienes compras registradas
              <p className="mt-2 text-sm">
                <em>
                  Nota: Si acabas de registrarte, es posible que aún no tengas compras registradas. Puedes usar el botón{" "}
                  <FontAwesomeIcon icon={faFileInvoice} className="text-green-500" /> para cargar datos de prueba.
                </em>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClientDashboard

