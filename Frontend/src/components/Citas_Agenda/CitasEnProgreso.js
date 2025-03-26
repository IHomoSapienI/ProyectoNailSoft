"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import { FaPlay, FaEdit, FaSpinner, FaExclamationTriangle } from "react-icons/fa"

const CitasEnProgreso = () => {
  const [citas, setCitas] = useState([])
  const [ventas, setVentas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const API_URL = "https://gitbf.onrender.com/api"

  // Modificar la función fetchData para manejar mejor las respuestas vacías
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Obtener citas confirmadas y en progreso
      try {
        const citasResponse = await axios.get(`${API_URL}/citas`, { headers })
        const citasData = citasResponse.data.citas || []

        // Filtrar citas válidas (con estado adecuado)
        const citasFiltradas = citasData.filter(
          (cita) =>
            cita.estadocita === "Confirmada" || cita.estadocita === "En Progreso" || cita.estadocita === "Pendiente",
        )

        // Verificar que las citas tengan la información necesaria
        const citasValidas = citasFiltradas.filter((cita) => cita._id && cita.nombrecliente && cita.nombreempleado)

        setCitas(citasValidas)
      } catch (citasError) {
        console.error("Error al cargar citas:", citasError)
        setError("No se pudieron cargar las citas")
      }

      // Obtener ventas activas - MEJORADO para manejar respuestas vacías
      try {
        const ventasResponse = await axios.get(`${API_URL}/ventaservicios`, { headers })

        // Verificar si la respuesta tiene la estructura esperada
        let ventasData = []

        if (ventasResponse.data) {
          if (Array.isArray(ventasResponse.data)) {
            // Si la respuesta es directamente un array
            ventasData = ventasResponse.data
          } else if (ventasResponse.data.ventaservicios && Array.isArray(ventasResponse.data.ventaservicios)) {
            // Si la respuesta tiene la estructura esperada
            ventasData = ventasResponse.data.ventaservicios
          } else if (typeof ventasResponse.data === "object") {
            // Si la respuesta es un objeto pero no tiene la estructura esperada
            // Intentamos extraer cualquier array que pueda contener
            const posiblesArrays = Object.values(ventasResponse.data).filter((val) => Array.isArray(val))
            if (posiblesArrays.length > 0) {
              ventasData = posiblesArrays[0]
            }
          }
        }

        // Filtrar ventas activas (no finalizadas)
        const ventasActivas = ventasData.filter((venta) => venta && venta.estado === true)
        setVentas(ventasActivas)

        console.log("Ventas cargadas correctamente:", ventasActivas.length)
      } catch (ventasError) {
        console.error("Error al cargar ventas:", ventasError)
        // No interrumpimos el flujo si no se pueden cargar las ventas
        setVentas([]) // Establecer un array vacío para evitar errores
      }
    } catch (error) {
      console.error("Error general al cargar datos:", error)
      setError("No se pudieron cargar los datos necesarios")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Configurar un intervalo para actualizar los datos cada 30 segundos
    const intervalId = setInterval(fetchData, 30000)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId)
  }, [location.pathname])

  // Verificar si una cita ya tiene una venta asociada
  const tieneVentaAsociada = (citaId) => {
    if (!citaId) return false
    return ventas.some((venta) => {
      const ventaCitaId = venta.cita?._id || venta.cita
      return ventaCitaId === citaId
    })
  }

  // Obtener el ID de la venta asociada a una cita
  const getVentaIdPorCita = (citaId) => {
    if (!citaId) return null
    const venta = ventas.find((v) => {
      const ventaCitaId = v.cita?._id || v.cita
      return ventaCitaId === citaId
    })
    return venta ? venta._id : null
  }

  // Modificar la función continuarVenta para manejar mejor los errores 404
  const continuarVenta = async (ventaId) => {
    if (!ventaId) {
      Swal.fire("Error", "ID de venta no válido", "error")
      return
    }

    // Mostrar indicador de carga
    Swal.fire({
      title: "Verificando venta...",
      text: "Por favor espere",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Verificar primero si la venta existe - CORREGIDO: Usar la ruta correcta
      try {
        // Cambiado de /ventaservicios/ a /ventaservicio/ (singular) si es necesario según la API
        const ventaResponse = await axios.get(`${API_URL}/ventaservicio/${ventaId}`, { headers })

        if (ventaResponse.data) {
          Swal.close()
          navigate(`/gestion-venta/${ventaId}`)
        } else {
          throw new Error("Venta no encontrada")
        }
      } catch (error) {
        // Si la venta no existe, intentar encontrar la cita asociada
        console.error("Error al verificar la venta:", error)

        // Buscar la cita asociada a esta venta
        const citaAsociada = citas.find((cita) => getVentaIdPorCita(cita._id) === ventaId)

        if (citaAsociada) {
          // Si encontramos la cita, ir directamente a crear una nueva venta
          Swal.fire({
            title: "Venta no encontrada",
            text: "La venta que intentas acceder no existe o ha sido eliminada. Se iniciará una nueva venta para esta cita.",
            icon: "warning",
            confirmButtonText: "Continuar",
          }).then(() => {
            iniciarVenta(citaAsociada._id)
          })
        } else {
          Swal.fire({
            title: "Error",
            text: "No se pudo encontrar la venta ni la cita asociada.",
            icon: "error",
            confirmButtonText: "Volver a la lista",
          }).then(() => {
            window.location.reload()
          })
        }
      }
    } catch (error) {
      console.error("Error general:", error)
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al procesar la solicitud.",
        icon: "error",
        confirmButtonText: "Aceptar",
      })
    }
  }

  // Modificar la función iniciarVenta para manejar mejor el flujo
  const iniciarVenta = async (citaId) => {
    if (!citaId) {
      Swal.fire("Error", "ID de cita no válido", "error")
      return
    }

    // Mostrar indicador de carga
    Swal.fire({
      title: "Verificando cita...",
      text: "Por favor espere",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Verificar si la cita existe
      const citaResponse = await axios.get(`${API_URL}/citas/${citaId}`, { headers })

      if (citaResponse.data && citaResponse.data.cita) {
        // Verificar si ya existe una venta para esta cita - CORREGIDO: Usar la ruta correcta
        try {
          // Cambiado de /ventas a /ventaservicios
          const ventasResponse = await axios.get(`${API_URL}/ventaservicios`, { headers })
          const ventasData = ventasResponse.data.ventaservicios || []

          // Buscar si ya existe una venta para esta cita
          const ventaExistente = ventasData.find((v) => {
            const ventaCitaId = v.cita?._id || v.cita
            return ventaCitaId === citaId && v.estado === true
          })

          if (ventaExistente) {
            // Si ya existe una venta, ir a esa venta
            Swal.close()
            navigate(`/gestion-venta/${ventaExistente._id}`)
          } else {
            // Si no existe una venta, ir a crear una nueva
            Swal.close()
            navigate(`/gestion-venta/new/${citaId}`)
          }
        } catch (error) {
          console.error("Error al verificar ventas existentes:", error)
          // Si hay error al verificar ventas, asumimos que no hay y creamos una nueva
          Swal.close()
          navigate(`/gestion-venta/new/${citaId}`)
        }
      } else {
        throw new Error("Cita no encontrada")
      }
    } catch (error) {
      console.error("Error al verificar la cita:", error)
      Swal.fire({
        title: "Cita no encontrada",
        text: "La cita seleccionada no existe o ha sido eliminada",
        icon: "error",
        confirmButtonText: "Actualizar lista",
      }).then(() => {
        window.location.reload()
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          <FaSpinner className="inline mr-2 text-pink-600" />
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Citas Activas</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FaSpinner className="mr-2" />
          Actualizar lista
        </button>
      </div>

      {citas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citas.map((cita) => {
            const tieneVenta = tieneVentaAsociada(cita._id)
            const ventaId = getVentaIdPorCita(cita._id)

            return (
              <div key={cita._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  className={`p-4 ${
                    cita.estadocita === "En Progreso"
                      ? "bg-blue-100"
                      : cita.estadocita === "Confirmada"
                        ? "bg-green-100"
                        : "bg-yellow-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      {cita.nombrecliente?.nombrecliente} {cita.nombrecliente?.apellidocliente}
                    </h2>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        cita.estadocita === "En Progreso"
                          ? "bg-blue-200 text-blue-800"
                          : cita.estadocita === "Confirmada"
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {cita.estadocita}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Empleado:</strong> {cita.nombreempleado?.nombreempleado || "No asignado"}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Fecha:</strong>{" "}
                    {new Date(cita.fechacita).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Monto Total:</strong> ${cita.montototal?.toFixed(2) || "0.00"}
                  </p>

                  <div className="flex justify-end">
                    {tieneVenta ? (
                      <button
                        onClick={() => continuarVenta(ventaId)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        <FaEdit className="inline mr-2" />
                        Continuar Venta
                      </button>
                    ) : (
                      <button
                        onClick={() => iniciarVenta(cita._id)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        <FaPlay className="inline mr-2" />
                        Iniciar Venta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <FaExclamationTriangle className="inline-block text-yellow-500 text-4xl mb-2" />
          <p className="text-gray-500">No hay citas activas en este momento</p>
        </div>
      )}
    </div>
  )
}

export default CitasEnProgreso

