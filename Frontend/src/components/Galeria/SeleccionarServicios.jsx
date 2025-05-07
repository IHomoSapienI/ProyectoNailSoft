"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  HeartCrack,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Search,
  Sparkles,
  Clock,
  DollarSign,
  Calendar,
  User,
  Check,
  ArrowRight,
  AlertCircle,
} from "lucide-react"
import "./SeleccionarServicios.css"
import Swal from "sweetalert2"
import { obtenerServiciosConDescuento } from "../Servicios/obtenerServicios"

// Componente de animación de corazones
const HeartBurst = ({ x, y, isBroken = false }) => {
  return (
    <div className="heart-burst" style={{ left: x, top: y }}>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`floating-heart ${isBroken ? "broken" : ""}`}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1.5, 1],
            x: Math.cos((i * 45 * Math.PI) / 180) * 50,
            y: Math.sin((i * 45 * Math.PI) / 180) * 50,
            opacity: [1, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        >
          {isBroken ? <HeartCrack className="heart-icon-burst" /> : <Heart className="heart-icon-burst" />}
        </motion.div>
      ))}
    </div>
  )
}

// Componente principal
const SeleccionarServicios = () => {
  const [servicios, setServicios] = useState([])
  const [serviciosFiltrados, setServiciosFiltrados] = useState([])
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [heartBursts, setHeartBursts] = useState([])
  const [tiposServicio, setTiposServicio] = useState([])
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Estado para el cliente logueado
  const [clienteLogueado, setClienteLogueado] = useState(null)
  const [isClienteLoading, setIsClienteLoading] = useState(false)

  // Nuevo estado para el flujo de reserva
  const [currentStep, setCurrentStep] = useState(1)
  const [empleados, setEmpleados] = useState([])
  const [clientes, setClientes] = useState([])
  const [formData, setFormData] = useState({
    nombreempleado: "",
    nombrecliente: "",
    telefono: "",
    email: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "",
    notas: "",
  })
  const [horariosDisponibles, setHorariosDisponibles] = useState([
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ])

  // Agregar un nuevo estado para almacenar las citas existentes
  const [citasExistentes, setCitasExistentes] = useState([])
  // Estado para controlar si estamos actualizando las citas
  const [actualizandoCitas, setActualizandoCitas] = useState(false)

  // Update the ITEMS_PER_PAGE constant to show fewer items per page for better visibility
  const ITEMS_PER_PAGE = 2 // Reduced from 3 to show fewer services per page with more details
  const totalPages = Math.ceil(serviciosFiltrados.length / ITEMS_PER_PAGE)

  // Verificar si hay un cliente logueado al cargar el componente
  useEffect(() => {
    const obtenerClienteLogueado = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("No hay token disponible")
        return
      }

      setIsClienteLoading(true)
      try {
        const headers = { Authorization: `Bearer ${token}` }

        // Obtener datos básicos del localStorage
        const userId = localStorage.getItem("userId")
        const userName = localStorage.getItem("userName")
        const userEmail = localStorage.getItem("userEmail")

        console.log("Datos en localStorage:", { userId, userName, userEmail })

        // Funciones auxiliares para comparaciones flexibles
        const areIdsSimilar = (id1, id2) => {
          if (!id1 || !id2) return false
          const str1 = String(id1)
          const str2 = String(id2)
          if (str1 === str2) return true
          const minLength = Math.min(str1.length, str2.length, 20)
          return str1.substring(0, minLength) === str2.substring(0, minLength)
        }

        const areEmailsSimilar = (email1, email2) => {
          if (!email1 || !email2) return false
          return String(email1).toLowerCase() === String(email2).toLowerCase()
        }

        const areNamesSimilar = (name1, name2) => {
          if (!name1 || !name2) return false
          const normalizedName1 = String(name1).toLowerCase().trim()
          const normalizedName2 = String(name2).toLowerCase().trim()
          if (normalizedName1 === normalizedName2) return true
          return normalizedName1.includes(normalizedName2) || normalizedName2.includes(normalizedName1)
        }

        // 1. Intentar obtener el perfil del usuario
        let usuarioData = null
        try {
          // Configurar opciones para manejar errores CORS
          const axiosConfig = {
            headers,
            timeout: 5000, // Timeout de 5 segundos
            validateStatus: (status) => {
              return status < 500 // Aceptar cualquier respuesta que no sea error 5xx
            },
          }

          const perfilResponse = await axios.get("https://gitbf.onrender.com/api/usuarios/perfil", axiosConfig)
          console.log("Perfil del usuario:", perfilResponse.data)
          usuarioData = perfilResponse.data
        } catch (perfilError) {
          console.error("Error al obtener el perfil del usuario:", perfilError)

          // Si tenemos userId, intentar obtener el usuario directamente
          if (userId) {
            try {
              const usuarioResponse = await axios.get(`https://gitbf.onrender.com/api/usuarios/${userId}`, {
                headers,
                timeout: 5000,
                validateStatus: (status) => status < 500,
              })
              console.log("Datos del usuario por ID:", usuarioResponse.data)
              usuarioData = usuarioResponse.data.usuario || usuarioResponse.data
            } catch (usuarioError) {
              console.error("Error al obtener usuario por ID:", usuarioError)
              // Intentar extraer el ID del token
              const parseJwt = (token) => {
                try {
                  const base64Url = token.split(".")[1]
                  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split("")
                      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                      .join(""),
                  )
                  return JSON.parse(jsonPayload)
                } catch (e) {
                  console.error("Error al decodificar el token:", e)
                  return null
                }
              }

              const decodedToken = parseJwt(token)
              if (decodedToken && (decodedToken.id || decodedToken._id || decodedToken.userId)) {
                usuarioData = {
                  _id: decodedToken.id || decodedToken._id || decodedToken.userId,
                  nombre: decodedToken.nombre || decodedToken.name || "Usuario",
                }
              }
            }
          }
        }

        // Extraer el ID del usuario de los datos obtenidos o del localStorage
        const usuarioId = usuarioData?._id || usuarioData?.id || userId
        console.log("ID del usuario identificado:", usuarioId)

        // 2. Intentar obtener el cliente asociado al usuario actual
        try {
          // Primero intentar con el endpoint específico de perfil
          const clienteResponse = await axios.get("https://gitbf.onrender.com/api/clientes/perfil", {
            headers,
            timeout: 5000,
            validateStatus: (status) => status < 500,
          })

          if (clienteResponse.data) {
            console.log("Cliente del usuario actual (endpoint perfil):", clienteResponse.data)
            setClienteLogueado(clienteResponse.data)

            if (currentStep === 4) {
              actualizarFormularioConDatosCliente(clienteResponse.data)
            }
            return
          }
        } catch (perfilClienteError) {
          console.error("Error al obtener el perfil del cliente:", perfilClienteError)
        }

        // 3. Si no funcionó el endpoint específico, obtener todos los clientes y filtrar
        try {
          const clientesResponse = await axios.get("https://gitbf.onrender.com/api/clientes", {
            headers,
            timeout: 5000,
            validateStatus: (status) => status < 500,
          })

          if (clientesResponse.data && Array.isArray(clientesResponse.data) && clientesResponse.data.length > 0) {
            console.log("Lista de clientes obtenida:", clientesResponse.data)

            // Intentar decodificar el token para obtener más información
            const parseJwt = (token) => {
              try {
                const base64Url = token.split(".")[1]
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join(""),
                )
                return JSON.parse(jsonPayload)
              } catch (e) {
                console.error("Error al decodificar el token:", e)
                return null
              }
            }

            const decodedToken = parseJwt(token)
            console.log("Token decodificado:", decodedToken)

            // Extraer información del token
            const tokenUserId = decodedToken?.id || decodedToken?._id || decodedToken?.sub || decodedToken?.userId
            const tokenEmail = decodedToken?.email || decodedToken?.correo
            const tokenName = decodedToken?.nombre || decodedToken?.name

            console.log("Datos extraídos del token:", { tokenUserId, tokenEmail, tokenName })

            // Buscar el cliente que coincida con cualquiera de los datos disponibles
            let clienteEncontrado = null

            // Buscar por ID de usuario
            if (usuarioId || tokenUserId) {
              clienteEncontrado = clientesResponse.data.find(
                (cliente) =>
                  areIdsSimilar(cliente.usuario, usuarioId) ||
                  areIdsSimilar(cliente.usuario, tokenUserId) ||
                  areIdsSimilar(cliente._id, usuarioId) ||
                  areIdsSimilar(cliente._id, tokenUserId),
              )

              if (clienteEncontrado) {
                console.log("Cliente encontrado por ID:", clienteEncontrado)
              }
            }

            // Si no encontramos por ID, buscar por email
            if (!clienteEncontrado && (userEmail || tokenEmail)) {
              clienteEncontrado = clientesResponse.data.find(
                (cliente) =>
                  areEmailsSimilar(cliente.correocliente, userEmail) ||
                  areEmailsSimilar(cliente.correocliente, tokenEmail) ||
                  areEmailsSimilar(cliente.email, userEmail) ||
                  areEmailsSimilar(cliente.email, tokenEmail),
              )

              if (clienteEncontrado) {
                console.log("Cliente encontrado por email:", clienteEncontrado)
              }
            }

            // Si aún no encontramos, buscar por nombre
            if (!clienteEncontrado && (userName || tokenName)) {
              clienteEncontrado = clientesResponse.data.find(
                (cliente) =>
                  areNamesSimilar(cliente.nombrecliente, userName) ||
                  areNamesSimilar(cliente.nombrecliente, tokenName) ||
                  (cliente.nombrecliente &&
                    cliente.apellidocliente &&
                    areNamesSimilar(`${cliente.nombrecliente} ${cliente.apellidocliente}`, userName || tokenName)),
              )

              if (clienteEncontrado) {
                console.log("Cliente encontrado por nombre:", clienteEncontrado)
              }
            }

            // Si encontramos un cliente, usarlo
            if (clienteEncontrado) {
              setClienteLogueado(clienteEncontrado)

              if (currentStep === 4) {
                actualizarFormularioConDatosCliente(clienteEncontrado)
              }
            } else {
              console.log("No se pudo identificar al cliente específico, usando el primero por defecto")
              setClienteLogueado(clientesResponse.data[0])

              if (currentStep === 4) {
                actualizarFormularioConDatosCliente(clientesResponse.data[0])
              }
            }
          } else {
            console.log("No se encontraron clientes en la respuesta")
            // Crear un cliente ficticio para desarrollo
            const clienteFicticio = {
              _id: "cliente_desarrollo",
              nombrecliente: "Cliente de Prueba",
              apellidocliente: "Desarrollo",
              celularcliente: "123456789",
              correocliente: "cliente@ejemplo.com",
            }
            setClienteLogueado(clienteFicticio)

            if (currentStep === 4) {
              actualizarFormularioConDatosCliente(clienteFicticio)
            }
          }
        } catch (clientesError) {
          console.error("Error al obtener clientes:", clientesError)
          // Crear un cliente ficticio para desarrollo
          const clienteFicticio = {
            _id: "cliente_desarrollo",
            nombrecliente: "Cliente de Prueba",
            apellidocliente: "Desarrollo",
            celularcliente: "123456789",
            correocliente: "cliente@ejemplo.com",
          }
          setClienteLogueado(clienteFicticio)

          if (currentStep === 4) {
            actualizarFormularioConDatosCliente(clienteFicticio)
          }
        }
      } finally {
        setIsClienteLoading(false)
      }
    }

    obtenerClienteLogueado()
  }, [currentStep])

  // Función para actualizar el formulario con los datos del cliente
  const actualizarFormularioConDatosCliente = (cliente) => {
    if (!cliente) return

    console.log("Actualizando formulario con datos del cliente:", cliente)

    // Inspeccionar todas las propiedades del objeto cliente
    console.log("Propiedades disponibles:", Object.keys(cliente))

    // Extraer nombre y apellido específicamente para este modelo de datos
    let nombreCompleto = ""

    // Combinar nombrecliente y apellidocliente (estructura específica de este modelo)
    if (cliente.nombrecliente !== undefined && cliente.apellidocliente !== undefined) {
      nombreCompleto = `${cliente.nombrecliente} ${cliente.apellidocliente}`.trim()
      console.log("Usando nombrecliente y apellidocliente:", nombreCompleto)
    }
    // Fallback a solo nombrecliente si no hay apellido
    else if (cliente.nombrecliente !== undefined) {
      nombreCompleto = cliente.nombrecliente
      console.log("Usando solo nombrecliente:", nombreCompleto)
    }

    // Extraer teléfono (celularcliente en este modelo)
    let telefono = ""
    if (cliente.celularcliente !== undefined) {
      telefono = cliente.celularcliente
      console.log("Usando celularcliente:", telefono)
    } else if (cliente.telefono !== undefined) {
      telefono = cliente.telefono
      console.log("Usando telefono:", telefono)
    }

    // Extraer email (correocliente en este modelo)
    let email = ""
    if (cliente.correocliente !== undefined) {
      email = cliente.correocliente
      console.log("Usando correocliente:", email)
    } else if (cliente.email !== undefined) {
      email = cliente.email
      console.log("Usando email:", email)
    }

    console.log("Datos finales extraídos:", { nombreCompleto, telefono, email })

    // Actualizar el formulario directamente con los valores extraídos
    const nuevoFormData = {
      ...formData,
      nombrecliente: nombreCompleto,
      telefono: telefono,
      email: email,
    }

    // Actualizar el estado del formulario
    setFormData(nuevoFormData)

    console.log("Formulario actualizado con:", nuevoFormData)
  }

  // Asegurarnos de que el formulario se actualice cuando cambiamos al paso 4
  useEffect(() => {
    if (currentStep === 4 && clienteLogueado) {
      console.log("Paso 4 activado, actualizando formulario con cliente:", clienteLogueado)
      actualizarFormularioConDatosCliente(clienteLogueado)
    }
  }, [currentStep, clienteLogueado])

  // Ocultar el footer cuando se monte el componente
  useEffect(() => {
    // Guardar el estado original del footer
    const footer = document.querySelector(".footer") || document.querySelector("footer")
    if (footer) {
      const originalDisplay = footer.style.display
      footer.style.display = "none"

      // Restaurar el footer cuando se desmonte el componente
      return () => {
        footer.style.display = originalDisplay
      }
    }
  }, [])

  // Obtener servicios y extraer tipos únicos
  useEffect(() => {
    const obtenerServicios = async () => {
      setIsLoading(true)
      try {
        const serviciosConDescuento = await obtenerServiciosConDescuento()

        console.log("Servicios obtenidos con descuentos aplicados:", serviciosConDescuento)
        setServicios(serviciosConDescuento)
        setServiciosFiltrados(serviciosConDescuento)

        // Extraer tipos únicos de servicios
        const tipos = [
          ...new Set(serviciosConDescuento.map((servicio) => servicio.tipoServicio?.nombreTs || "Sin categoría")),
        ]
        setTiposServicio(tipos)
        setIsLoading(false)
      } catch (error) {
        console.error("Error al obtener los servicios:", error)
        setError("No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.")
        setIsLoading(false)
      }
    }

    obtenerServicios()
  }, [])

  // Modificar la función handleInputChange para manejar correctamente las fechas
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "fecha") {
      // Para fechas, necesitamos asegurarnos de que no se ajuste por zona horaria
      // Crear la fecha a partir de los componentes para evitar ajustes de zona horaria
      const [year, month, day] = value.split("-").map(Number)

      // Crear una fecha usando UTC para evitar cualquier ajuste de zona horaria
      const correctedDate = `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`

      setFormData((prev) => ({
        ...prev,
        [name]: correctedDate,
      }))

      console.log(`Fecha seleccionada: ${value}, fecha guardada: ${correctedDate}`)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Modificar la función verificarDisponibilidad para usar el mismo enfoque
  const verificarDisponibilidad = (fecha, hora, empleadoId, duracion) => {
    // Si no hay citas existentes o no se ha seleccionado empleado, no hay conflicto
    if (citasExistentes.length === 0 || !empleadoId) return true

    // Convertir la hora seleccionada a minutos desde el inicio del día
    const [horaSeleccionada, minutosSeleccionados] = hora.split(":").map(Number)
    const inicioSeleccionado = horaSeleccionada * 60 + minutosSeleccionados
    const finSeleccionado = inicioSeleccionado + duracion

    // Verificar si la duración excede el horario de trabajo (hasta las 18:00)
    const finJornada = 18 * 60 // 18:00 en minutos
    if (finSeleccionado > finJornada) {
      console.log(
        `La cita excede el horario de trabajo. Terminaría a las ${Math.floor(finSeleccionado / 60)}:${finSeleccionado % 60 < 10 ? "0" + (finSeleccionado % 60) : finSeleccionado % 60}`,
      )
      return false
    }

    // Convertir la fecha seleccionada a formato YYYY-MM-DD para comparar
    // Usar el enfoque directo para evitar problemas de zona horaria
    const [year, month, day] = fecha.split("-").map(Number)
    const fechaFormateada = `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`

    console.log(
      `Verificando disponibilidad para ${fechaFormateada} a las ${hora} (${inicioSeleccionado}-${finSeleccionado} min)`,
    )

    // Buscar citas que coincidan con la fecha y el empleado seleccionados
    const citasDelDia = citasExistentes.filter((cita) => {
      // Verificar si la cita es del mismo día
      const fechaCita = new Date(cita.fechacita).toISOString().split("T")[0]

      // Obtener el ID del empleado (puede ser un objeto o un string)
      const citaEmpleadoId =
        typeof cita.nombreempleado === "object" && cita.nombreempleado !== null
          ? cita.nombreempleado._id
          : cita.nombreempleado

      // Solo considerar citas no canceladas
      return fechaCita === fechaFormateada && citaEmpleadoId === empleadoId && cita.estadocita !== "Cancelada"
    })

    console.log(`Citas existentes para este día y empleado: ${citasDelDia.length}`)

    // Verificar si hay solapamiento con alguna cita existente
    const hayConflicto = citasDelDia.some((cita) => {
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
  }

  // Obtener empleados y citas existentes cuando se avanza al paso 2
  useEffect(() => {
    if (currentStep >= 2) {
      const obtenerEmpleados = async () => {
        try {
          const token = localStorage.getItem("token")
          const headers = { Authorization: `Bearer ${token}` }

          try {
            const response = await axios.get("https://gitbf.onrender.com/api/empleados", {
              headers,
              timeout: 5000,
              validateStatus: (status) => status < 500,
            })

            if (response.data && response.data.length > 0) {
              setEmpleados(response.data)
            } else {
              console.error("No se encontraron empleados en la respuesta")
              // Usar datos de respaldo
              setEmpleados(obtenerEmpleadosRespaldo())
            }
          } catch (error) {
            console.error("Error al obtener empleados:", error)
            // Usar datos de respaldo
            setEmpleados(obtenerEmpleadosRespaldo())
          }

          // Obtener las citas existentes
          obtenerCitasExistentes()
        } catch (error) {
          console.error("Error general en obtenerEmpleados:", error)
          setEmpleados(obtenerEmpleadosRespaldo())
        }
      }

      obtenerEmpleados()
    }
  }, [currentStep])

  // Función para obtener citas existentes
  const obtenerCitasExistentes = async () => {
    if (actualizandoCitas) return

    setActualizandoCitas(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      console.log("Obteniendo citas existentes...")

      try {
        const response = await axios.get("https://gitbf.onrender.com/api/citas", {
          headers,
          timeout: 5000,
          validateStatus: (status) => status < 500,
        })

        if (response.data && Array.isArray(response.data.citas)) {
          console.log(`Se encontraron ${response.data.citas.length} citas existentes`)
          setCitasExistentes(response.data.citas)
        } else if (response.data && Array.isArray(response.data)) {
          console.log(`Se encontraron ${response.data.length} citas existentes`)
          setCitasExistentes(response.data)
        } else {
          console.log("No se pudieron obtener las citas existentes, usando datos de respaldo")
          setCitasExistentes([])
        }
      } catch (error) {
        console.error("Error al obtener citas existentes:", error)
        setCitasExistentes([])
      }
    } catch (error) {
      console.error("Error general en obtenerCitasExistentes:", error)
      setCitasExistentes([])
    } finally {
      setActualizandoCitas(false)
    }
  }

  // Obtener citas existentes cuando cambia la fecha o el empleado seleccionado
  useEffect(() => {
    if (currentStep >= 2 && formData.nombreempleado) {
      const obtenerCitasExistentes = async () => {
        try {
          const token = localStorage.getItem("token")
          const headers = { Authorization: `Bearer ${token}` }
          console.log("Obteniendo citas existentes...")
          const response = await axios.get("https://gitbf.onrender.com/api/citas", { headers })

          if (response.data && Array.isArray(response.data.citas)) {
            console.log(`Se encontraron ${response.data.citas.length} citas existentes`)
            setCitasExistentes(response.data.citas)
          } else if (response.data && Array.isArray(response.data)) {
            console.log(`Se encontraron ${response.data.length} citas existentes`)
            setCitasExistentes(response.data)
          } else {
            console.log("No se pudieron obtener las citas existentes")
            setCitasExistentes([])
          }
        } catch (error) {
          console.error("Error al obtener citas existentes:", error)
          setCitasExistentes([])
        }
      }

      obtenerCitasExistentes()
    }
  }, [currentStep, formData.nombreempleado, formData.fecha])

  // Filtrar servicios cuando cambia el filtro o la búsqueda
  useEffect(() => {
    let resultado = [...servicios]

    // Filtrar por tipo
    if (filtroTipo !== "todos") {
      resultado = resultado.filter((servicio) => servicio.tipoServicio?.nombreTs === filtroTipo)
    }

    // Filtrar por búsqueda
    if (busqueda.trim() !== "") {
      const terminoBusqueda = busqueda.toLowerCase()
      resultado = resultado.filter(
        (servicio) =>
          servicio.nombreServicio.toLowerCase().includes(terminoBusqueda) ||
          servicio.descripcion?.toLowerCase().includes(terminoBusqueda),
      )
    }

    setServiciosFiltrados(resultado)
    setCurrentPage(0) // Resetear a la primera página al filtrar
  }, [filtroTipo, busqueda, servicios])

  const manejarSeleccionServicio = (servicio, event) => {
    // Crear explosión de corazones en la posición del clic
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const yaSeleccionado = serviciosSeleccionados.find((s) => s._id === servicio._id)

    const newBurst = {
      id: Date.now(),
      x,
      y,
      isBroken: yaSeleccionado ? true : false,
    }

    setHeartBursts((prev) => [...prev, newBurst])
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((burst) => burst.id !== newBurst.id))
    }, 1000)

    if (yaSeleccionado) {
      const nuevosServiciosSeleccionados = serviciosSeleccionados.filter((s) => s._id !== servicio._id)
      setServiciosSeleccionados(nuevosServiciosSeleccionados)
      // Usar el precio con descuento si está disponible
      const precioARestar = servicio.tieneDescuento ? servicio.precioConDescuento : servicio.precioOriginal
      setTotal((prev) => Number.parseFloat((prev - precioARestar).toFixed(2)))
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, servicio])
      // Usar el precio con descuento si está disponible
      const precioASumar = servicio.tieneDescuento ? servicio.precioConDescuento : servicio.precioOriginal
      setTotal((prev) => Number.parseFloat((prev + precioASumar).toFixed(2)))
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setIsFlipping(true)
      setCurrentPage((prev) => prev + 1)
      setTimeout(() => setIsFlipping(false), 500)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setIsFlipping(true)
      setCurrentPage((prev) => prev - 1)
      setTimeout(() => setIsFlipping(false), 500)
    }
  }

  // Update the service item rendering to improve layout and spacing
  const getCurrentPageServices = () => {
    const start = currentPage * ITEMS_PER_PAGE
    return serviciosFiltrados.slice(start, start + ITEMS_PER_PAGE)
  }

  // Filtrar empleados según los servicios seleccionados
  const empleadosFiltrados = empleados

  // Calcular duración total
  const duracionTotal = serviciosSeleccionados.reduce((total, servicio) => total + (servicio.tiempo || 0), 0)

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (currentStep === 1 && serviciosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un servicio")
      return
    }

    if (currentStep === 2 && !formData.nombreempleado) {
      alert("Por favor, selecciona un empleado")
      return
    }

    if (currentStep === 3) {
      if (!formData.fecha) {
        alert("Por favor, selecciona una fecha")
        return
      }
      if (!formData.hora) {
        alert("Por favor, selecciona una hora")
        return
      }

      // Verificar disponibilidad antes de avanzar
      const disponible = verificarDisponibilidad(formData.fecha, formData.hora, formData.nombreempleado, duracionTotal)

      if (!disponible) {
        alert("Lo sentimos, este horario ya no está disponible. Por favor, selecciona otro horario.")
        return
      }
    }

    if (currentStep === 4) {
      if (!formData.nombrecliente) {
        alert("Por favor, ingresa tu nombre")
        return
      }
      if (!formData.telefono) {
        alert("Por favor, ingresa tu teléfono")
        return
      }
    }

    // Si vamos a avanzar al paso 4 y tenemos un cliente logueado, actualizar el formulario
    if (currentStep === 3 && clienteLogueado) {
      // Actualizar el formulario antes de cambiar de paso
      actualizarFormularioConDatosCliente(clienteLogueado)
      // Esperar un momento para que se actualice el estado antes de cambiar de paso
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 100)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verificar nuevamente la disponibilidad antes de enviar
    const disponible = verificarDisponibilidad(formData.fecha, formData.hora, formData.nombreempleado, duracionTotal)

    if (!disponible) {
      alert("Lo sentimos, este horario ya no está disponible. Por favor, selecciona otro horario.")
      return
    }

    // Preparar los servicios en el formato que espera el backend
    const serviciosFormateados = serviciosSeleccionados.map((servicio) => ({
      _id: servicio._id,
      nombreServicio: servicio.nombreServicio,
      precio: servicio.precio,
      tiempo: servicio.tiempo,
    }))

    // SOLUCIÓN CORREGIDA: Crear una fecha en formato ISO string sin conversión de zona horaria
    // Formato: "YYYY-MM-DDThh:mm:00Z" - La Z al final indica UTC
    // Esto asegura que la hora se mantenga exactamente como fue seleccionada
    const fechaISO = `${formData.fecha}T${formData.hora}:00`

    console.log("Fecha y hora seleccionadas:", formData.fecha, formData.hora)
    console.log("Fecha ISO a enviar:", fechaISO)

    // Crear el objeto de datos para enviar al servidor
    const dataToSend = {
      // Datos básicos de la cita
      nombreempleado: formData.nombreempleado,
      fechacita: fechaISO, // Usar el formato ISO sin conversión
      horacita: formData.hora, // Guardar la hora como string separado también
      duracionTotal: duracionTotal,
      servicios: serviciosFormateados,
      montototal: total,
      estadocita: "Pendiente",

      // Datos del cliente - Usar el ID del cliente logueado para nombrecliente
      nombrecliente: clienteLogueado ? clienteLogueado._id : formData.nombrecliente,

      // Incluir los datos adicionales del cliente como campos separados
      // Estos no se usarán para la relación en la base de datos, solo para información
      clienteNombreCompleto: formData.nombrecliente, // Guardar el nombre completo
      telefono: formData.telefono,
      email: formData.email,
      notas: formData.notas,
    }

    // Imprimir los datos que se enviarán para depuración
    console.log("Datos que se enviarán al servidor:", dataToSend)

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.post("https://gitbf.onrender.com/api/citas", dataToSend, { headers })

      // Actualizar las citas existentes para reflejar la nueva cita
      setCitasExistentes((prevCitas) => [
        ...prevCitas,
        {
          ...dataToSend,
          _id: response.data._id || Date.now().toString(),
        },
      ])

      // Mostrar Sweet Alert de éxito con la fecha y hora correctas (sin conversión)
      Swal.fire({
        icon: "success",
        title: "¡Cita agendada con éxito!",
        text: `Tu cita ha sido programada para el ${new Date(formData.fecha).toLocaleDateString("es-ES")} a las ${formData.hora}`,
        confirmButtonText: "Ir al Dashboard",
        confirmButtonColor: "#3498db",
        timer: 3000,
        timerProgressBar: true,
      }).then((result) => {
        // Redirigir al dashboard del empleado
        navigate("/mi-cuenta")
      })

      // Reiniciar formulario
      setServiciosSeleccionados([])
      setTotal(0)
      setFormData({
        nombreempleado: "",
        nombrecliente: "",
        telefono: "",
        email: "",
        fecha: new Date().toISOString().split("T")[0],
        hora: "",
        notas: "",
      })
      setCurrentStep(1)
    } catch (error) {
      console.error("Error completo:", error)
      let mensajeError = "Error al guardar la cita. Por favor, intente de nuevo."

      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data)
        if (error.response.data.error) {
          mensajeError = `Error: ${error.response.data.error}`
        } else if (error.response.data.message) {
          mensajeError = `Error: ${error.response.data.message}`
        }
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        confirmButtonColor: "#3498db",
      })
    }
  }

  // Renderizado condicional para estados de carga y error
  if (isLoading) {
    return (
      <div className="fullscreen-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando servicios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fullscreen-view">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="servicios-view">
      <div className="notebook-container">
        <div className="notebook">
          {/* Espiral de la libreta */}
          <div className="notebook-spiral">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="spiral-ring"></div>
            ))}
          </div>

          {/* Marcador */}
          <div className="bookmark">
            <Bookmark className="bookmark-icon" />
          </div>

          {/* Botones de navegación para servicios (solo visibles en paso 1) */}
          {currentStep === 1 && (
            <>
              <button
                className={`page-nav-button prev ${currentPage === 0 ? "disabled" : ""}`}
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="nav-icon" />
              </button>

              <button
                className={`page-nav-button next ${currentPage === totalPages - 1 ? "disabled" : ""}`}
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="nav-icon" />
              </button>
            </>
          )}

          {/* Contenido de la libreta */}
          <div className="notebook-content">
            {/* Página izquierda - Contenido dinámico según el paso */}
            <motion.div
              className={`notebook-page left-page ${isFlipping ? "flipping" : ""}`}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: isFlipping ? -180 : 0 }}
              transition={{ duration: 1 }}
            >
              {/* PASO 1: Selección de servicios */}
              {currentStep === 1 && (
                <>
                  <div className="page-header">
                    <h2>Servicios Disponibles</h2>
                    <span className="page-number">
                      Página {currentPage + 1} de {Math.max(1, totalPages)}
                    </span>
                  </div>

                  {/* Filtros y búsqueda */}
                  <div className="filters-section">
                    <div className="search-container">
                      <Search className="search-icon" />
                      <input
                        type="text"
                        placeholder="Buscar servicios..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="search-input"
                      />
                    </div>

                    <div className="filter-tabs">
                      <div className="tabs">
                        <div className="tabs-list">
                          <button
                            className={`tab-button ${filtroTipo === "todos" ? "active" : ""}`}
                            onClick={() => setFiltroTipo("todos")}
                          >
                            Todos
                          </button>
                          {tiposServicio.map((tipo) => (
                            <button
                              key={tipo}
                              className={`tab-button ${filtroTipo === tipo ? "active" : ""}`}
                              onClick={() => setFiltroTipo(tipo)}
                            >
                              {tipo}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="services-list custom-scrollbar">
                    {serviciosFiltrados.length === 0 ? (
                      <div className="no-results">
                        <p>No se encontraron servicios con los filtros actuales.</p>
                      </div>
                    ) : (
                      getCurrentPageServices().map((servicio) => {
                        const isSelected = serviciosSeleccionados.find((s) => s._id === servicio._id)
                        return (
                          <motion.div
                            key={servicio._id}
                            className={`service-item ${isSelected ? "selected" : ""}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => manejarSeleccionServicio(servicio, e)}
                          >
                            <div className="service-checkbox">
                              {isSelected ? (
                                <Heart className="heart-icon filled" />
                              ) : (
                                <Heart className="heart-icon outline" />
                              )}
                            </div>
                            <div className="service-details">
                              {/* Encabezado con nombre y tipo */}
                              <div className="service-header">
                                <h3>{servicio.nombreServicio}</h3>
                                <div className="service-type-badge">
                                  {servicio.tipoServicio?.nombreTs || "General"}
                                  {servicio.tipoServicio?.descuento > 0 && (
                                    <span className="discount-pill">{servicio.tipoServicio.descuento}% OFF</span>
                                  )}
                                </div>
                              </div>

                              {/* Información de precio y duración */}
                              <div className="service-info">
                                <div className="service-price">
                                  <DollarSign className="info-icon" />
                                  {servicio.tieneDescuento ? (
                                    <div className="price-with-discount">
                                      <span className="original-price">${servicio.precioOriginal.toFixed(2)}</span>
                                      <span>${servicio.precioConDescuento.toFixed(2)}</span>
                                    </div>
                                  ) : (
                                    <span>${servicio.precio}</span>
                                  )}
                                </div>
                                <div className="service-time">
                                  <Clock className="info-icon" />
                                  <span>{servicio.tiempo} min</span>
                                </div>
                              </div>

                              {/* Descripción completa */}
                              <div className="service-description-container">
                                <h4>Descripción:</h4>
                                <p className="service-description">
                                  {servicio.descripcion || "Sin descripción disponible para este servicio."}
                                </p>
                              </div>

                              {/* Calificación */}
                              <div className="service-rating">⭐⭐⭐⭐⭐</div>
                            </div>

                            {/* Animación de explosión de corazones */}
                            <AnimatePresence>
                              {heartBursts.map((burst) => (
                                <HeartBurst key={burst.id} x={burst.x} y={burst.y} isBroken={burst.isBroken} />
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </>
              )}

              {/* PASO 2: Selección de empleado */}
              {currentStep === 2 && (
                <>
                  <div className="page-header">
                    <h2>Selecciona un Estilista</h2>
                    <button onClick={prevStep} className="back-button">
                      <ChevronLeft className="nav-icon" /> Volver
                    </button>
                  </div>

                  <div className="employee-list">
                    {empleadosFiltrados.length === 0 ? (
                      <div className="no-results">
                        <p>No hay estilistas disponibles para los servicios seleccionados.</p>
                      </div>
                    ) : (
                      empleadosFiltrados.map((empleado) => (
                        <div
                          key={empleado._id}
                          className={`employee-item ${formData.nombreempleado === empleado._id ? "selected" : ""}`}
                          onClick={() => setFormData({ ...formData, nombreempleado: empleado._id })}
                        >
                          <div className="employee-avatar">{empleado.nombreempleado.charAt(0)}</div>
                          <div className="employee-details">
                            <h3>{empleado.nombreempleado}</h3>
                            <p>
                              Especialidades: {empleado.especialidades ? empleado.especialidades.join(", ") : "General"}
                            </p>
                          </div>
                          {formData.nombreempleado === empleado._id && (
                            <div className="employee-selected">
                              <Check className="check-icon" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* PASO 3: Selección de fecha y hora */}
              {currentStep === 3 && (
                <>
                  <div className="page-header">
                    <h2>Fecha y Hora</h2>
                    <button onClick={prevStep} className="back-button">
                      <ChevronLeft className="nav-icon" /> Volver
                    </button>
                  </div>

                  <div className="date-time-selection">
                    <div className="date-selection">
                      <label htmlFor="fecha" className="form-label">
                        Selecciona una fecha
                      </label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="date-input"
                      />
                    </div>

                    <div className="time-selection">
                      <label className="form-label">Horarios disponibles</label>

                      {/* Leyenda de disponibilidad */}
                      <div className="availability-legend">
                        <div className="legend-item">
                          <div className="legend-color available"></div>
                          <span>Disponible</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color selected"></div>
                          <span>Seleccionado</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color occupied"></div>
                          <span>Ocupado</span>
                        </div>
                      </div>

                      <div className="time-slots">
                        {horariosDisponibles.map((time) => {
                          // Verificar si el horario está disponible
                          const disponible = verificarDisponibilidad(
                            formData.fecha,
                            time,
                            formData.nombreempleado,
                            duracionTotal,
                          )

                          // Verificar si la hora + duración excede el horario de trabajo
                          const [hora, minutos] = time.split(":").map(Number)
                          const inicioMinutos = hora * 60 + minutos
                          const finMinutos = inicioMinutos + duracionTotal
                          const excedeTiempo = finMinutos > 18 * 60 // 18:00 en minutos

                          const razonNoDisponible = excedeTiempo
                            ? "La duración del servicio excede el horario de trabajo"
                            : "Horario no disponible"

                          return (
                            <div
                              key={time}
                              className={`time-slot ${formData.hora === time ? "selected" : ""} ${!disponible || excedeTiempo ? "ocupado" : ""}`}
                              onClick={() => disponible && !excedeTiempo && setFormData({ ...formData, hora: time })}
                              title={!disponible || excedeTiempo ? razonNoDisponible : ""}
                            >
                              {time}
                            </div>
                          )
                        })}
                      </div>

                      {/* Mensaje de advertencia sobre disponibilidad */}
                      <div className="availability-warning">
                        <AlertCircle className="warning-icon" />
                        <p>
                          Los horarios ocupados no pueden ser seleccionados porque ya hay una cita agendada con este
                          estilista.
                        </p>
                      </div>

                      {duracionTotal > 120 && (
                        <div
                          className="availability-warning"
                          style={{ marginTop: "10px", backgroundColor: "#f8d7da", borderLeftColor: "#dc3545" }}
                        >
                          <AlertCircle className="warning-icon" style={{ color: "#dc3545" }} />
                          <p style={{ color: "#721c24" }}>
                            Los servicios seleccionados suman {duracionTotal} minutos. Citas muy largas pueden tener
                            disponibilidad limitada.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* PASO 4: Datos del cliente */}
              {currentStep === 4 && (
                <>
                  <div className="page-header">
                    <h2>Tus Datos</h2>
                    <button onClick={prevStep} className="back-button">
                      <ChevronLeft className="nav-icon" /> Volver
                    </button>
                  </div>

                  {isClienteLoading ? (
                    <div className="loading-indicator">
                      <div className="loading-spinner-small"></div>
                      <p>Cargando tus datos...</p>
                    </div>
                  ) : clienteLogueado ? (
                    <div className="client-logged-info">
                      <div className="info-badge">
                        <User className="info-badge-icon" />
                        <span>Usando información de tu cuenta</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="client-form">
                    <div className="form-group">
                      <label htmlFor="nombrecliente" className="form-label">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="nombrecliente"
                        name="nombrecliente"
                        value={formData.nombrecliente}
                        onChange={handleInputChange}
                        placeholder="Tu nombre completo"
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono" className="form-label">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="Tu número de teléfono"
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Correo electrónico (opcional)
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Tu correo electrónico"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="notas" className="form-label">
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        id="notas"
                        name="notas"
                        value={formData.notas}
                        onChange={handleInputChange}
                        placeholder="Cualquier información adicional que quieras compartir"
                        className="form-textarea"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PASO 5: Confirmación */}
              {currentStep === 5 && (
                <>
                  <div className="page-header">
                    <h2>Confirma tu Cita</h2>
                    <button onClick={prevStep} className="back-button">
                      <ChevronLeft className="nav-icon" /> Volver
                    </button>
                  </div>

                  <div className="confirmation-details">
                    // Modificar la sección de confirmación para mostrar los precios correctos
                    <div className="confirmation-section">
                      <h3>Servicios seleccionados</h3>
                      <ul className="confirmation-services">
                        {serviciosSeleccionados.map((servicio) => (
                          <li key={servicio._id}>
                            <span>{servicio.nombreServicio}</span>
                            {servicio.tieneDescuento ? (
                              <div className="price-with-discount">
                                <span className="original-price">${Number.parseFloat(servicio.precio).toFixed(2)}</span>
                                <span className="discounted-price">${servicio.precioConDescuento.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span>${Number.parseFloat(servicio.precio).toFixed(2)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="confirmation-total">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="confirmation-duration">
                        <span>Duración total:</span>
                        <span>{duracionTotal} minutos</span>
                      </div>
                    </div>
                    <div className="confirmation-section">
                      <h3>Detalles de la cita</h3>
                      <div className="confirmation-detail">
                        <span>Estilista:</span>
                        <span>{empleados.find((e) => e._id === formData.nombreempleado)?.nombreempleado}</span>
                      </div>
                      <div className="confirmation-detail">
                        <span>Fecha:</span>
                        <span>
                          {(() => {
                            // Crear la fecha correctamente para mostrar
                            const [year, month, day] = formData.fecha.split("-").map(Number)
                            const fechaCorrecta = new Date(year, month - 1, day)
                            return fechaCorrecta.toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          })()}
                        </span>
                      </div>
                      <div className="confirmation-detail">
                        <span>Hora:</span>
                        <span>{formData.hora}</span>
                      </div>
                    </div>
                    <div className="confirmation-section">
                      <h3>Tus datos</h3>
                      <div className="confirmation-detail">
                        <span>Nombre:</span>
                        <span>{formData.nombrecliente}</span>
                      </div>
                      <div className="confirmation-detail">
                        <span>Teléfono:</span>
                        <span>{formData.telefono}</span>
                      </div>
                      {formData.email && (
                        <div className="confirmation-detail">
                          <span>Email:</span>
                          <span>{formData.email}</span>
                        </div>
                      )}
                      {formData.notas && (
                        <div className="confirmation-detail">
                          <span>Notas:</span>
                          <span>{formData.notas}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Página derecha - Selecciones y acciones */}
            <div className="notebook-page right-page">
              <div className="page-header">
                <h2>Mi Selección</h2>
                <div className="step-indicator">Paso {currentStep} de 5</div>
              </div>

              <div className="selected-services custom-scrollbar">
                {serviciosSeleccionados.length === 0 ? (
                  <div className="empty-selection">
                    <Sparkles className="sparkle-icon" />
                    <p>No has seleccionado ningún servicio aún.</p>
                    <p className="hint">Haz clic en los servicios de la izquierda para agregarlos.</p>
                  </div>
                ) : (
                  <div className="selection-list">
                    {serviciosSeleccionados.map((servicio) => (
                      <motion.div
                        key={servicio._id}
                        className="selected-item"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        onClick={(e) => manejarSeleccionServicio(servicio, e)}
                      >
                        <div className="selected-item-content">
                          <Heart className="selected-heart" />
                          <div className="selected-item-details">
                            <span className="item-name">{servicio.nombreServicio}</span>
                            <span className="item-time">{servicio.tiempo} min</span>
                          </div>
                        </div>
                        <div className="item-price">
                          {servicio.tieneDescuento ? (
                            <div className="price-with-discount">
                              <span className="original-price">${Number.parseFloat(servicio.precio).toFixed(2)}</span>
                              <span className="discounted-price">${servicio.precioConDescuento.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span>${Number.parseFloat(servicio.precio).toFixed(2)}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="appointment-summary">
                {currentStep >= 2 && (
                  <div className="summary-section">
                    <h3>Resumen de la cita</h3>

                    {currentStep >= 2 && formData.nombreempleado && (
                      <div className="summary-item">
                        <User className="summary-icon" />
                        <span>
                          Estilista: {empleados.find((e) => e._id === formData.nombreempleado)?.nombreempleado}
                        </span>
                      </div>
                    )}

                    {currentStep >= 3 && formData.fecha && formData.hora && (
                      <div className="summary-item">
                        <Calendar className="summary-icon" />
                        <span>
                          {(() => {
                            // Crear la fecha correctamente para mostrar
                            const [year, month, day] = formData.fecha.split("-").map(Number)
                            const fechaCorrecta = new Date(year, month - 1, day)
                            return fechaCorrecta.toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })
                          })()}
                          {" a las "}
                          {formData.hora}
                        </span>
                      </div>
                    )}

                    <div className="summary-item">
                      <Clock className="summary-icon" />
                      <span>Duración: {duracionTotal} minutos</span>
                    </div>
                  </div>
                )}

                <div className="total-section">
                  <div className="total-line">
                    <span>Total:</span>
                    <span className="total-amount">${total}</span>
                  </div>

                  {currentStep < 5 ? (
                    <motion.button
                      className="schedule-button"
                      onClick={nextStep}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={serviciosSeleccionados.length === 0}
                    >
                      {currentStep === 1 ? "Continuar" : "Siguiente"}
                      <ArrowRight className="button-icon" />
                    </motion.button>
                  ) : (
                    <motion.button
                      className="confirm-button"
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Confirmar Cita
                      <Check className="button-icon" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos adicionales para los nuevos componentes */}
      <style>
        {`
        /* Estilos para el paso de selección de empleado */
        .employee-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .employee-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .employee-item:hover {
          border-color: #3498db;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .employee-item.selected {
          border-color: #3498db;
          background-color: rgba(52, 152, 219, 0.05);
        }

        .employee-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 600;
          margin-right: 1rem;
        }

        .employee-details {
          flex: 1;
        }

        .employee-details h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.3rem;
        }

        .employee-details p {
          font-size: 0.85rem;
          color: #666;
        }

        .employee-selected {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .check-icon {
          width: 16px;
          height: 16px;
          color: white;
        }

        /* Estilos para el paso de fecha y hora */
        .date-time-selection {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1rem;
        }

        .date-selection, .time-selection {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
        }

        .date-input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .time-slot {
          padding: 0.5rem;
          text-align: center;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-slot:hover {
          border-color: #3498db;
          background-color: rgba(52, 152, 219, 0.05);
        }

        .time-slot.selected {
          border-color: #3498db;
          background-color: #3498db;
          color: white;
        }

        /* Estilos para el formulario de cliente */
        .client-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-input, .form-textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        /* Estilos para la confirmación */
        .confirmation-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .confirmation-section {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1rem;
        }

        .confirmation-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #eee;
        }

        .confirmation-services {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .confirmation-services li {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px dashed #eee;
        }

        .confirmation-total, .confirmation-duration {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          margin-top: 0.75rem;
        }

        .confirmation-detail {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px dashed #eee;
        }

        .confirmation-detail span:first-child {
          font-weight: 500;
          color: #666;
        }

        /* Estilos para el resumen de la cita */
        .appointment-summary {
          margin-top: auto;
        }

        .summary-section {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .summary-section h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .summary-icon {
          width: 16px;
          height: 16px;
          color: #666;
        }

        /* Botón de volver */
        .back-button {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.4rem 0.8rem;
          background: #f5f5f5;
          border: none;
          border-radius: 15px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #e0e0e0;
        }

        /* Indicador de paso */
        .step-indicator {
          font-size: 0.9rem;
          color: #888;
        }

        /* Botón de confirmar */
        .confirm-button {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #2ecc71;
          color: white;
        }

        .confirm-button:hover {
          background: #27ae60;
        }

        .button-icon {
          width: 18px;
          height: 18px;
        }

        /* Estilos para el indicador de cliente logueado */
        .client-logged-info {
          margin-bottom: 1rem;
        }

        .info-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #e8f4fd;
          border-radius: 8px;
          color: #3498db;
          font-size: 0.9rem;
        }

        .info-badge-icon {
          background-color: #e8f4fd;
          border-radius: 8px;
          color: #3498db;
          font-size: 0.9rem;
        }

        .info-badge-icon {
          width: 18px;
          height: 18px;
        }

        /* Estilos para el indicador de carga */
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .loading-spinner-small {
          width: 24px;
          height: 24px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.5rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Estilos para el botón de continuar */
        .schedule-button {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          background: #3498db;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .schedule-button:hover:not(:disabled) {
          background: #2980b9;
        }

        .schedule-button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        /* Estilos para los horarios ocupados */
        .time-slot.ocupado {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
          cursor: not-allowed;
          opacity: 0.7;
          text-decoration: line-through;
        }

        .time-slot.ocupado:hover {
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }

        /* Leyenda de disponibilidad */
        .availability-legend {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
        }

        .legend-color {
          width: 15px;
          height: 15px;
          border-radius: 3px;
        }

        .legend-color.available {
          border: 1px solid #ddd;
          background-color: white;
        }

        .legend-color.selected {
          background-color: #3498db;
          border: 1px solid #3498db;
        }

        .legend-color.occupied {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          text-decoration: line-through;
        }

        /* Mensaje de advertencia sobre disponibilidad */
        .availability-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 15px;
          padding: 10px;
          background-color: #fff3cd;
          border-radius: 5px;
          border-left: 4px solid #ffc107;
        }

        .warning-icon {
          width: 18px;
          height: 18px;
          color: #ffc107;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .availability-warning p {
          margin: 0;
          font-size: 0.85rem;
          color: #856404;
        }

        /* Estilos para el precio con descuento */
        .price-with-discount {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .original-price {
          text-decoration: line-through;
          color: #777;
          font-size: 0.9em;
        }

        .discount-pill {
          background-color: #e74c3c;
          color: white;
          padding: 2px 5px;
          border-radius: 5px;
          font-size: 0.7em;
        }
      `}
      </style>
    </div>
  )
}

// Función para obtener empleados de respaldo
// function obtenerEmpleadosRespaldo() {
//   console.log("Usando datos de empleados de respaldo")
//   return [
//     {
//       _id: "emp1",
//       nombreempleado: "Ana Martínez",
//       especialidades: ["Manicura", "Pedicura"],
//     },
//     {
//       _id: "emp2",
//       nombreempleado: "Carlos Rodríguez",
//       especialidades: ["Uñas Acrílicas", "Diseño de Uñas"],
//     },
//     {
//       _id: "emp3",
//       nombreempleado: "Laura Sánchez",
//       especialidades: ["Manicura", "Pedicura", "Uñas Acrílicas"],
//     },
//   ]
// }

export default SeleccionarServicios