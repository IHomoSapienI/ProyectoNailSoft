// Optimizar la función para obtener servicios con descuento
export const obtenerServiciosConDescuento = async () => {
  try {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem("token")

    if (!token) {
      console.error("No se encontró token de autenticación")
      throw new Error("No se encontró token de autenticación")
    }

    // Realizar la solicitud con el token en los headers
    const response = await fetch("https://gitbf.onrender.com/api/servicios", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    const servicios = data.servicios || []

    // Obtener los tipos de servicio para verificar descuentos
    const tiposResponse = await fetch("https://gitbf.onrender.com/api/tiposervicios", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!tiposResponse.ok) throw new Error(`HTTP error al obtener tipos de servicio! status: ${tiposResponse.status}`)

    const tiposData = await tiposResponse.json()
    const tiposServicio = tiposData.tiposervicios || []

    // Crear un mapa de tipos de servicio para búsqueda rápida
    const tiposMap = {}
    tiposServicio.forEach((tipo) => {
      tiposMap[tipo._id] = tipo
    })

    console.log("Tipos de servicio disponibles:", tiposServicio)

    // Filtrar servicios activos
    const serviciosActivos = servicios.filter((servicio) => servicio.estado === true)

    // Calcular precios con descuento
    const serviciosConDescuento = serviciosActivos.map((servicio) => {
      // Manejar el caso en que tipoServicio sea null o undefined
      if (!servicio.tipoServicio) {
        // Si no hay tipo de servicio, no hay descuento
        const precioOriginal = Number.parseFloat(servicio.precio || 0)

        return {
          ...servicio,
          tieneDescuento: false,
          precioOriginal,
          precioConDescuento: precioOriginal,
          porcentajeDescuento: 0,
          esPromocional: false,
        }
      }

      // Obtener el ID del tipo de servicio
      const tipoServicioId =
        typeof servicio.tipoServicio === "object" ? servicio.tipoServicio._id : servicio.tipoServicio

      // Buscar el tipo de servicio completo en el mapa
      const tipoServicioCompleto = tiposMap[tipoServicioId]

      // Verificar si el tipo de servicio existe y tiene descuento
      const tieneDescuento =
        tipoServicioCompleto && tipoServicioCompleto.descuento && tipoServicioCompleto.descuento > 0

      // Asegurar que el precio es un número
      const precioOriginal = Number.parseFloat(servicio.precio || 0)

      // Calcular el precio con descuento solo si hay descuento
      const precioConDescuento = tieneDescuento
        ? precioOriginal - (precioOriginal * tipoServicioCompleto.descuento) / 100
        : precioOriginal

      // Devolver el objeto con toda la información necesaria
      return {
        ...servicio,
        tieneDescuento,
        precioOriginal,
        precioConDescuento: Number.parseFloat(precioConDescuento.toFixed(2)), // Redondear a 2 decimales
        porcentajeDescuento: tieneDescuento ? tipoServicioCompleto.descuento : 0,
        esPromocional: tipoServicioCompleto ? tipoServicioCompleto.esPromocional : false,
        // Asegurarnos de que tipoServicio tenga toda la información
        tipoServicio: tipoServicioCompleto || servicio.tipoServicio,
      }
    })

    console.log("Servicios procesados con descuentos:", serviciosConDescuento)
    return serviciosConDescuento
  } catch (error) {
    console.error("Error al obtener los servicios:", error)
    // En caso de error, intentar obtener servicios de forma alternativa
    try {
      // Intentar obtener servicios usando axios como alternativa
      const axios = await import("axios").then((module) => module.default)
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      const headers = { Authorization: `Bearer ${token}` }
      const serviciosResponse = await axios.get("https://gitbf.onrender.com/api/servicios", { headers })

      if (serviciosResponse.data && serviciosResponse.data.servicios) {
        const servicios = serviciosResponse.data.servicios.filter((s) => s.estado === true)

        // Devolver servicios sin información de descuento en caso de error
        return servicios.map((servicio) => ({
          ...servicio,
          tieneDescuento: false,
          precioOriginal: Number.parseFloat(servicio.precio || 0),
          precioConDescuento: Number.parseFloat(servicio.precio || 0),
          porcentajeDescuento: 0,
          esPromocional: false,
        }))
      }
    } catch (alternativeError) {
      console.error("Error al obtener servicios de forma alternativa:", alternativeError)
    }

    throw error
  }
}

// Función para calcular el precio con descuento
export const calcularPrecioConDescuento = (precio, tipoServicio) => {
  if (!tipoServicio || !precio) return Number.parseFloat(precio || 0)

  // Verificar si el tipo de servicio tiene descuento
  const tieneDescuento = tipoServicio && tipoServicio.descuento && tipoServicio.descuento > 0

  // Convertir precio a número
  const precioOriginal = Number.parseFloat(precio || 0)

  // Calcular precio con descuento si aplica
  if (tieneDescuento) {
    const descuento = tipoServicio.descuento / 100
    const precioConDescuento = precioOriginal - precioOriginal * descuento
    return Number.parseFloat(precioConDescuento.toFixed(2))
  }

  // Si no hay descuento, devolver el precio original
  return precioOriginal
}

