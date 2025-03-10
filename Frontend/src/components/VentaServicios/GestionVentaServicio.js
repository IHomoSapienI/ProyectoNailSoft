"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTrash, faSave, faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons"

const GestionVentaServicio = () => {
  const { id, citaId } = useParams()
  const navigate = useNavigate()
  const [venta, setVenta] = useState(null)
  const [cita, setCita] = useState(null)
  const [servicios, setServicios] = useState([])
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [nuevoServicio, setNuevoServicio] = useState({ id: "", nombre: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [metodoPago, setMetodoPago] = useState("Efectivo")
  const [error, setError] = useState(null)
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false)
  const API_URL = "https://gitbf.onrender.com/api"

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }

        // Cargar todos los servicios disponibles primero
        try {
          const serviciosResponse = await axios.get(`${API_URL}/servicios`, { headers })
          setServicios(serviciosResponse.data.servicios || [])
        } catch (serviciosError) {
          console.error("Error al cargar servicios:", serviciosError)
          // No interrumpimos el flujo si no se pueden cargar los servicios
        }

        // Intentar cargar servicios guardados en localStorage primero
        let serviciosGuardados = null
        if (citaId) {
          try {
            const serviciosLocalStorage = localStorage.getItem(`servicios_cita_${citaId}`)
            if (serviciosLocalStorage) {
              serviciosGuardados = JSON.parse(serviciosLocalStorage)
              console.log("Servicios recuperados de localStorage:", serviciosGuardados)

              if (Array.isArray(serviciosGuardados) && serviciosGuardados.length > 0) {
                setServiciosSeleccionados(serviciosGuardados)
                setCambiosSinGuardar(false)
              }
            }
          } catch (storageError) {
            console.error("Error al recuperar servicios de localStorage:", storageError)
          }
        }

        // Si tenemos un ID de venta, cargamos la venta existente
        if (id && id !== "new") {
          try {
            console.log(`Intentando cargar venta con ID: ${id}`)

            // Intentar obtener la venta directamente
            const ventaResponse = await axios.get(`${API_URL}/ventaservicios/${id}`, { headers })

            // Verificar la estructura de la respuesta
            if (!ventaResponse.data) {
              throw new Error("Respuesta vacía del servidor")
            }

            console.log("Respuesta de venta:", ventaResponse.data)

            // Determinar la estructura correcta de la venta
            let ventaData = null
            if (ventaResponse.data.venta) {
              ventaData = ventaResponse.data.venta
            } else if (ventaResponse.data.ventaservicio) {
              ventaData = ventaResponse.data.ventaservicio
            } else if (ventaResponse.data._id) {
              ventaData = ventaResponse.data
            }

            if (!ventaData) {
              throw new Error("No se pudo determinar la estructura de la venta")
            }

            setVenta(ventaData)

            // Verificar si la venta tiene una cita asociada
            const citaId = ventaData.cita?._id || ventaData.cita
            if (citaId) {
              try {
                const citaResponse = await axios.get(`${API_URL}/citas/${citaId}`, { headers })
                if (citaResponse.data && citaResponse.data.cita) {
                  setCita(citaResponse.data.cita)
                }
              } catch (citaError) {
                console.error("Error al cargar la cita asociada:", citaError)
                // No interrumpimos el flujo si no se puede cargar la cita
              }
            }

            // Si no tenemos servicios guardados en localStorage, usamos los de la venta
            if (!serviciosGuardados && ventaData.servicios && Array.isArray(ventaData.servicios)) {
              // Asegurarse de que cada servicio tenga la estructura correcta
              const serviciosFormateados = ventaData.servicios.map((servicio) => {
                // Obtener el ID del servicio
                const servicioId = servicio.servicio?._id || servicio.servicio || servicio._id

                // Buscar el servicio completo en la lista de servicios disponibles
                const servicioCompleto = servicios.find((s) => s._id === servicioId)

                return {
                  servicio: servicioId,
                  nombreServicio:
                    servicio.nombreServicio ||
                    servicio.servicio?.nombreServicio ||
                    (servicioCompleto ? servicioCompleto.nombreServicio : "Servicio"),
                  precio:
                    servicio.precio || servicio.servicio?.precio || (servicioCompleto ? servicioCompleto.precio : 0),
                  tiempo:
                    servicio.tiempo || servicio.servicio?.tiempo || (servicioCompleto ? servicioCompleto.tiempo : 0),
                }
              })

              console.log("Servicios formateados de la venta:", serviciosFormateados)
              setServiciosSeleccionados(serviciosFormateados)

              // Guardar estos servicios en localStorage para futuras visitas
              try {
                localStorage.setItem(`servicios_cita_${citaId}`, JSON.stringify(serviciosFormateados))
                console.log("Servicios de la venta guardados en localStorage")
              } catch (storageError) {
                console.error("Error al guardar servicios en localStorage:", storageError)
              }

              setCambiosSinGuardar(false)
            }
          } catch (ventaError) {
            console.error("Error al cargar la venta:", ventaError)
            setError("La venta solicitada no existe o ha sido eliminada")

            // Si la venta no existe, redirigir a la lista de citas en progreso después de un tiempo
            if (ventaError.response && ventaError.response.status === 404) {
              Swal.fire({
                title: "Venta no encontrada",
                text: "La venta que intentas acceder no existe o ha sido eliminada",
                icon: "error",
                confirmButtonText: "Volver a citas",
              }).then(() => {
                navigate("/citas-en-progreso")
              })
            }
          }
        }
        // Si tenemos un ID de cita pero no de venta, estamos creando una nueva venta desde una cita
        else if (citaId) {
          try {
            console.log(`Intentando cargar cita con ID: ${citaId}`)
            const citaResponse = await axios.get(`${API_URL}/citas/${citaId}`, { headers })

            if (!citaResponse.data || !citaResponse.data.cita) {
              throw new Error("Respuesta de cita inválida")
            }

            console.log("Respuesta de cita:", citaResponse.data)

            const citaData = citaResponse.data.cita
            setCita(citaData)

            // Verificar si ya existe una venta para esta cita
            // Esto es importante para citas en estado "En Progreso"
            let ventaExistente = null
            try {
              console.log(`Buscando ventas existentes para la cita: ${citaId}`)
              const ventasResponse = await axios.get(`${API_URL}/ventaservicios/cita/${citaId}`, { headers })

              if (ventasResponse.data && Array.isArray(ventasResponse.data) && ventasResponse.data.length > 0) {
                // Encontramos una venta existente para esta cita
                ventaExistente = ventasResponse.data[0]
                console.log("Venta existente encontrada:", ventaExistente)

                // Establecer la venta existente
                setVenta(ventaExistente)
              }
            } catch (ventasError) {
              console.error("Error al buscar ventas existentes para la cita:", ventasError)
              // No interrumpimos el flujo si no se pueden encontrar ventas
            }

            // Si no tenemos servicios guardados en localStorage, intentamos usar los de la venta o la cita
            if (!serviciosGuardados) {
              // Si encontramos una venta existente y tiene servicios, usamos esos
              if (
                ventaExistente &&
                ventaExistente.servicios &&
                Array.isArray(ventaExistente.servicios) &&
                ventaExistente.servicios.length > 0
              ) {
                const serviciosVenta = ventaExistente.servicios.map((servicio) => {
                  const servicioId = servicio.servicio?._id || servicio.servicio

                  // Buscar el servicio completo en la lista de servicios disponibles
                  const servicioCompleto = servicios.find((s) => s._id === servicioId)

                  return {
                    servicio: servicioId,
                    nombreServicio:
                      servicio.nombreServicio || (servicioCompleto ? servicioCompleto.nombreServicio : "Servicio"),
                    precio: servicio.precio || (servicioCompleto ? servicioCompleto.precio : 0),
                    tiempo: servicio.tiempo || (servicioCompleto ? servicioCompleto.tiempo : 0),
                  }
                })

                console.log("Servicios formateados de la venta existente:", serviciosVenta)
                setServiciosSeleccionados(serviciosVenta)

                // Guardar estos servicios en localStorage para futuras visitas
                try {
                  localStorage.setItem(`servicios_cita_${citaId}`, JSON.stringify(serviciosVenta))
                  console.log("Servicios de la venta existente guardados en localStorage")
                } catch (storageError) {
                  console.error("Error al guardar servicios en localStorage:", storageError)
                }

                setCambiosSinGuardar(false)
              }
              // Si no hay venta o no tiene servicios, usamos los de la cita
              else if (citaData && citaData.servicios && Array.isArray(citaData.servicios)) {
                // Asegurarse de que cada servicio tenga la estructura correcta
                const serviciosFormateados = citaData.servicios.map((servicio) => {
                  // Determinar el ID del servicio
                  const servicioId = servicio._id || servicio.servicio

                  // Buscar información adicional del servicio si está disponible
                  const servicioCompleto = servicios.find((s) => s._id === servicioId)

                  return {
                    servicio: servicioId,
                    nombreServicio:
                      servicio.nombreServicio || (servicioCompleto ? servicioCompleto.nombreServicio : "Servicio"),
                    precio: servicio.precio || (servicioCompleto ? servicioCompleto.precio : 0),
                    tiempo: servicio.tiempo || (servicioCompleto ? servicioCompleto.tiempo : 0),
                  }
                })

                console.log("Servicios formateados de la cita:", serviciosFormateados)
                setServiciosSeleccionados(serviciosFormateados)

                // Guardar estos servicios en localStorage para futuras visitas
                try {
                  localStorage.setItem(`servicios_cita_${citaId}`, JSON.stringify(serviciosFormateados))
                  console.log("Servicios de la cita guardados en localStorage")
                } catch (storageError) {
                  console.error("Error al guardar servicios en localStorage:", storageError)
                }

                setCambiosSinGuardar(false)
              }
            }
          } catch (citaError) {
            console.error("Error al cargar la cita:", citaError)
            setError("La cita solicitada no existe o ha sido eliminada")

            // Si la cita no existe, redirigir a la lista de citas en progreso
            if (citaError.response && citaError.response.status === 404) {
              Swal.fire({
                title: "Cita no encontrada",
                text: "La cita que intentas acceder no existe o ha sido eliminada",
                icon: "error",
                confirmButtonText: "Volver a citas",
              }).then(() => {
                navigate("/citas-en-progreso")
              })
            }
          }
        }
      } catch (error) {
        console.error("Error general al cargar datos:", error)
        setError("Error al cargar los datos necesarios")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, citaId, navigate, servicios.length])

  // Calcular el precio total
  const precioTotal = serviciosSeleccionados.reduce(
    (total, servicio) => total + (Number.parseFloat(servicio.precio) || 0),
    0,
  )

  // Calcular el tiempo total
  const tiempoTotal = serviciosSeleccionados.reduce(
    (total, servicio) => total + (Number.parseInt(servicio.tiempo) || 0),
    0,
  )

  // Agregar un nuevo servicio
  const agregarServicio = async () => {
    if (nuevoServicio.id) {
      const servicioSeleccionado = servicios.find((s) => s._id === nuevoServicio.id)
      if (servicioSeleccionado && !serviciosSeleccionados.some((s) => s.servicio === servicioSeleccionado._id)) {
        // Si llegamos aquí, agregamos el servicio
        const nuevoServicioItem = {
          servicio: servicioSeleccionado._id,
          nombreServicio: servicioSeleccionado.nombreServicio,
          precio: servicioSeleccionado.precio || 0,
          tiempo: servicioSeleccionado.tiempo || 0,
        }

        const nuevosServicios = [...serviciosSeleccionados, nuevoServicioItem]
        setServiciosSeleccionados(nuevosServicios)
        setNuevoServicio({ id: "", nombre: "" })
        setCambiosSinGuardar(true) // Marcar que hay cambios sin guardar

        // Guardar en localStorage
        if (cita && cita._id) {
          try {
            localStorage.setItem(`servicios_cita_${cita._id}`, JSON.stringify(nuevosServicios))
            console.log("Servicios actualizados guardados en localStorage después de agregar")
          } catch (storageError) {
            console.error("Error al guardar servicios en localStorage:", storageError)
          }
        }
      } else {
        Swal.fire("Advertencia", "Este servicio ya ha sido agregado o no existe", "warning")
      }
    } else {
      Swal.fire("Advertencia", "Por favor selecciona un servicio", "warning")
    }
  }

  // Eliminar un servicio
  const eliminarServicio = (servicioId) => {
    const nuevosServicios = serviciosSeleccionados.filter((s) => s.servicio !== servicioId)
    setServiciosSeleccionados(nuevosServicios)
    setCambiosSinGuardar(true) // Marcar que hay cambios sin guardar

    // Guardar en localStorage
    if (cita && cita._id) {
      try {
        localStorage.setItem(`servicios_cita_${cita._id}`, JSON.stringify(nuevosServicios))
        console.log("Servicios actualizados guardados en localStorage después de eliminar")
      } catch (storageError) {
        console.error("Error al guardar servicios en localStorage:", storageError)
      }
    }
  }

  // Guardar cambios en la cita (sin crear venta)
  const guardarCambios = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      if (serviciosSeleccionados.length === 0) {
        setIsSaving(false)
        return Swal.fire("Error", "Debe seleccionar al menos un servicio", "error")
      }

      // Verificar si tenemos la información necesaria
      if (!cita || !cita._id) {
        setIsSaving(false)
        return Swal.fire("Error", "Información de cita incompleta", "error")
      }

      // Verificar que la cita tenga cliente y empleado
      if (!cita.nombrecliente || !cita.nombreempleado) {
        setIsSaving(false)
        return Swal.fire("Error", "La cita no tiene cliente o empleado asignado", "error")
      }

      const clienteId = typeof cita.nombrecliente === "object" ? cita.nombrecliente._id : cita.nombrecliente
      const empleadoId = typeof cita.nombreempleado === "object" ? cita.nombreempleado._id : cita.nombreempleado

      // Guardar en localStorage primero para asegurar que no se pierdan los datos
      try {
        localStorage.setItem(`servicios_cita_${cita._id}`, JSON.stringify(serviciosSeleccionados))
        console.log("Servicios guardados en localStorage antes de guardar en API")
      } catch (storageError) {
        console.error("Error al guardar servicios en localStorage:", storageError)
      }

      // IMPORTANTE: Ahora solo actualizamos la cita, no creamos una venta
      try {
        // Actualizar el estado de la cita a "En Progreso" y guardar los servicios seleccionados
        const serviciosFormateados = serviciosSeleccionados.map((servicio) => ({
          servicio: typeof servicio.servicio === "object" ? servicio.servicio._id : servicio.servicio,
          precio: servicio.precio || 0,
          tiempo: servicio.tiempo || 0,
        }))

        // Actualizar la cita con los servicios seleccionados y cambiar su estado
        const citaResponse = await axios.put(
          `${API_URL}/citas/${cita._id}`,
          {
            nombreempleado: empleadoId,
            nombrecliente: clienteId,
            fechacita: cita.fechacita,
            horacita: cita.horacita || "00:00",
            duracionTotal: tiempoTotal,
            servicios: serviciosFormateados, // Guardar los servicios seleccionados en la cita
            montototal: precioTotal,
            estadocita: "En Progreso", // Cambiar estado a "En Progreso"
          },
          { headers },
        )

        console.log("Cita actualizada:", citaResponse.data)

        // Actualizar el estado local de la cita
        if (citaResponse.data && citaResponse.data.cita) {
          setCita(citaResponse.data.cita)
        }

        // Marcar que no hay cambios sin guardar
        setCambiosSinGuardar(false)

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "Éxito",
          text: "Cita actualizada correctamente",
          icon: "success",
          confirmButtonText: "Continuar",
        })
      } catch (error) {
        console.error("Error al actualizar la cita:", error)
        throw error
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error)

      // Mostrar información detallada del error para depuración
      if (error.response) {
        console.error("Datos de respuesta de error:", error.response.data)
        console.error("Estado de error:", error.response.status)
      }

      let mensajeError = "No se pudo guardar los cambios"

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          mensajeError = error.response.data.message
        } else if (error.response.data.error) {
          mensajeError = error.response.data.error
        } else if (typeof error.response.data === "string") {
          mensajeError = error.response.data
        }
      } else if (error.message) {
        mensajeError = error.message
      }

      Swal.fire("Error", mensajeError, "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Finalizar la venta (crear venta y finalizar)
  const finalizarVenta = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Verificar si tenemos la información necesaria
      if (!cita || !cita._id) {
        setIsSaving(false)
        return Swal.fire("Error", "Información de cita incompleta", "error")
      }

      // Verificar que la cita tenga cliente y empleado
      if (!cita.nombrecliente || !cita.nombreempleado) {
        setIsSaving(false)
        return Swal.fire("Error", "La cita no tiene cliente o empleado asignado", "error")
      }

      // Verificar que tengamos servicios seleccionados
      if (serviciosSeleccionados.length === 0) {
        // Intentar recuperar servicios del localStorage si no hay servicios seleccionados
        try {
          const serviciosGuardados = localStorage.getItem(`servicios_cita_${cita._id}`)
          if (serviciosGuardados) {
            const serviciosParsed = JSON.parse(serviciosGuardados)
            if (Array.isArray(serviciosParsed) && serviciosParsed.length > 0) {
              console.log("Recuperando servicios de localStorage para finalizar venta:", serviciosParsed)
              setServiciosSeleccionados(serviciosParsed)

              // Continuar con la finalización después de un breve retraso para asegurar que el estado se actualice
              setTimeout(() => {
                finalizarVenta()
              }, 500)
              return
            }
          }
        } catch (storageError) {
          console.error("Error al recuperar servicios de localStorage:", storageError)
        }

        setIsSaving(false)
        return Swal.fire("Error", "No hay servicios seleccionados para finalizar la venta", "error")
      }

      const clienteId = typeof cita.nombrecliente === "object" ? cita.nombrecliente._id : cita.nombrecliente
      const empleadoId = typeof cita.nombreempleado === "object" ? cita.nombreempleado._id : cita.nombreempleado

      // Formatear los servicios para enviar al backend
      const serviciosFormateados = serviciosSeleccionados.map((servicio) => {
        // Asegurarse de que estamos enviando el objeto completo con la estructura correcta
        const servicioId = typeof servicio.servicio === "object" ? servicio.servicio._id : servicio.servicio

        return {
          servicio: servicioId,
          precio: servicio.precio || 0,
          tiempo: servicio.tiempo || 0,
        }
      })

      console.log("Servicios formateados para finalizar venta:", serviciosFormateados)

      // Verificar si ya existe una venta para esta cita
      let ventaId = null

      if (venta && venta._id) {
        // Si ya tenemos una venta cargada, usamos su ID
        ventaId = venta._id
        console.log("Usando venta existente con ID:", ventaId)
      } else {
        // Intentar buscar si existe una venta para esta cita
        try {
          const ventasResponse = await axios.get(`${API_URL}/ventaservicios/cita/${cita._id}`, { headers })

          if (ventasResponse.data && Array.isArray(ventasResponse.data) && ventasResponse.data.length > 0) {
            // Encontramos una venta existente para esta cita
            const ventaExistente = ventasResponse.data[0]
            ventaId = ventaExistente._id
            console.log("Venta existente encontrada para la cita:", ventaId)
          }
        } catch (ventasError) {
          console.error("Error al buscar ventas existentes:", ventasError)
          // Continuamos con el flujo normal si no podemos encontrar ventas existentes
        }
      }

      // Si ya existe una venta, actualizamos sus servicios y la finalizamos
      if (ventaId) {
        try {
          // Primero actualizamos los servicios de la venta
          console.log("Actualizando servicios de la venta existente:", ventaId)

          // Intentar actualizar la venta directamente
          try {
            await axios.put(
              `${API_URL}/ventaservicios/${ventaId}`,
              {
                servicios: serviciosFormateados,
                precioTotal: precioTotal,
              },
              { headers },
            )
          } catch (updateError) {
            console.error("Error al actualizar venta directamente:", updateError)

            // Intentar con el endpoint específico para agregar servicios
            try {
              await axios.put(
                `${API_URL}/ventaservicios/${ventaId}/agregar-servicios`,
                { servicios: serviciosFormateados },
                { headers },
              )
            } catch (addServiciosError) {
              console.error("Error al agregar servicios:", addServiciosError)
              throw new Error("No se pudieron actualizar los servicios de la venta")
            }
          }

          // Luego finalizamos la venta
          console.log("Finalizando venta existente:", ventaId)
          try {
            await axios.put(`${API_URL}/ventaservicios/${ventaId}/finalizar`, { metodoPago }, { headers })
          } catch (finalizeError) {
            console.error("Error al finalizar venta:", finalizeError)

            // Intentar actualizar el estado directamente
            await axios.put(
              `${API_URL}/ventaservicios/${ventaId}`,
              {
                estado: true,
                metodoPago: metodoPago,
                finalizada: true,
              },
              { headers },
            )
          }

          // Actualizar el estado de la cita a "Completada"
          await axios.put(
            `${API_URL}/citas/${cita._id}`,
            {
              nombreempleado: empleadoId,
              nombrecliente: clienteId,
              fechacita: cita.fechacita,
              horacita: cita.horacita || "00:00",
              duracionTotal: tiempoTotal,
              servicios: serviciosFormateados,
              montototal: precioTotal,
              estadocita: "Completada", // Cambiar estado a "Completada"
            },
            { headers },
          )

          // Limpiar localStorage
          try {
            localStorage.removeItem(`servicios_cita_${cita._id}`)
            console.log("Servicios eliminados de localStorage después de finalizar venta")
          } catch (storageError) {
            console.error("Error al limpiar localStorage:", storageError)
          }

          // Marcar que no hay cambios sin guardar
          setCambiosSinGuardar(false)

          Swal.fire({
            title: "Éxito",
            text: "Venta finalizada correctamente",
            icon: "success",
            confirmButtonText: "Ir a ventas",
          }).then(() => {
            navigate("/ventas")
          })

          return // Terminamos aquí si ya existía una venta
        } catch (error) {
          console.error("Error al actualizar y finalizar venta existente:", error)
          throw error
        }
      }

      // Si no existe una venta, creamos una nueva
      // Crear objeto de venta con el formato correcto
      const ventaData = {
        cliente: clienteId,
        cita: cita._id,
        empleado: empleadoId,
        servicios: serviciosFormateados,
        precioTotal: precioTotal,
        estado: true,
        metodoPago: metodoPago, // Agregar el método de pago directamente en la creación
      }

      console.log("Creando nueva venta para finalizar:", ventaData)

      try {
        // Crear la venta
        const createResponse = await axios.post(`${API_URL}/ventaservicios`, ventaData, { headers })
        console.log("Respuesta de creación:", createResponse.data)

        // Determinar la estructura correcta de la venta creada
        let ventaCreada = null
        if (createResponse.data.venta) {
          ventaCreada = createResponse.data.venta
        } else if (createResponse.data.ventaservicio) {
          ventaCreada = createResponse.data.ventaservicio
        } else if (createResponse.data._id) {
          ventaCreada = createResponse.data
        }

        if (!ventaCreada || !ventaCreada._id) {
          throw new Error("No se pudo determinar la estructura de la venta creada")
        }

        // Finalizar la venta recién creada
        const nuevoVentaId = ventaCreada._id
        console.log(`Finalizando venta con ID: ${nuevoVentaId}`)

        try {
          await axios.put(`${API_URL}/ventaservicios/${nuevoVentaId}/finalizar`, { metodoPago }, { headers })
        } catch (finalizeError) {
          console.error("Error al finalizar la venta:", finalizeError)
          // Si falla la finalización, intentamos un enfoque alternativo
          if (finalizeError.response && finalizeError.response.status === 400) {
            console.log("Intentando finalizar con enfoque alternativo...")
            // Intentar actualizar el estado directamente
            try {
              await axios.put(
                `${API_URL}/ventaservicios/${nuevoVentaId}`,
                {
                  estado: true,
                  metodoPago: metodoPago,
                  finalizada: true,
                },
                { headers },
              )
            } catch (updateError) {
              console.error("Error en enfoque alternativo:", updateError)
              throw updateError
            }
          } else {
            throw finalizeError
          }
        }

        // Actualizar el estado de la cita a "Completada"
        await axios.put(
          `${API_URL}/citas/${cita._id}`,
          {
            nombreempleado: empleadoId,
            nombrecliente: clienteId,
            fechacita: cita.fechacita,
            horacita: cita.horacita || "00:00",
            duracionTotal: tiempoTotal,
            servicios: serviciosFormateados,
            montototal: precioTotal,
            estadocita: "Completada", // Cambiar estado a "Completada"
          },
          { headers },
        )

        // Limpiar localStorage
        try {
          localStorage.removeItem(`servicios_cita_${cita._id}`)
          console.log("Servicios eliminados de localStorage después de finalizar venta")
        } catch (storageError) {
          console.error("Error al limpiar localStorage:", storageError)
        }

        // Marcar que no hay cambios sin guardar
        setCambiosSinGuardar(false)

        Swal.fire({
          title: "Éxito",
          text: "Venta finalizada correctamente",
          icon: "success",
          confirmButtonText: "Ir a ventas",
        }).then(() => {
          navigate("/ventas")
        })
      } catch (error) {
        console.error("Error al crear y finalizar la venta:", error)
        throw error
      }
    } catch (error) {
      console.error("Error en el proceso de finalización:", error)
      let mensajeError = "No se pudo finalizar la venta"

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          mensajeError = error.response.data.message
        } else if (error.response.data.error) {
          mensajeError = error.response.data.error
        } else if (error.response.data.msg) {
          mensajeError = error.response.data.msg
        }
      } else if (error.message) {
        mensajeError = error.message
      }

      Swal.fire("Error", mensajeError, "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Update the loading state display
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )

  // Update the error state display
  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate("/citas-en-progreso")}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Volver a citas
        </button>
      </div>
    )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">
          {id && id !== "new" ? "Gestionar Venta de Servicio" : "Nueva Venta de Servicio"}
        </h1>
        <button
          onClick={async () => {
            // Si hay cambios sin guardar, preguntar al usuario
            if (cambiosSinGuardar) {
              const result = await Swal.fire({
                title: "¿Guardar cambios?",
                text: "Hay cambios sin guardar. ¿Desea guardarlos antes de volver?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, guardar",
                cancelButtonText: "No, volver sin guardar",
                showDenyButton: true,
                denyButtonText: "Cancelar",
              })

              if (result.isConfirmed) {
                // Usuario quiere guardar cambios
                await guardarCambios()
                // Esperar un momento para asegurar que los cambios se guarden
                setTimeout(() => navigate("/citas-en-progreso"), 500)
                return
              } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                // Usuario no quiere guardar cambios, pero guardar en localStorage de todos modos
                if (cita && cita._id) {
                  try {
                    localStorage.setItem(`servicios_cita_${cita._id}`, JSON.stringify(serviciosSeleccionados))
                    console.log("Servicios guardados en localStorage antes de navegar sin guardar")
                  } catch (storageError) {
                    console.error("Error al guardar servicios en localStorage:", storageError)
                  }
                }

                // Continuar con la navegación
                navigate("/citas-en-progreso")
                return
              } else {
                // Usuario canceló la acción
                return
              }
            }

            // Si no hay cambios, simplemente navegar
            // Pero guardar en localStorage de todos modos para asegurar persistencia
            if (cita && cita._id) {
              try {
                localStorage.setItem(`servicios_cita_${cita._id}`, JSON.stringify(serviciosSeleccionados))
                console.log("Servicios guardados en localStorage antes de navegar sin cambios")
              } catch (storageError) {
                console.error("Error al guardar servicios en localStorage:", storageError)
              }
            }

            navigate("/citas-en-progreso")
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Volver
        </button>
      </div>

      {/* Información de la cita */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Cita</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Cliente:</p>
            <p className="font-medium">
              {cita?.nombrecliente?.nombrecliente
                ? `${cita.nombrecliente.nombrecliente} ${cita.nombrecliente.apellidocliente || ""}`
                : "Cliente no disponible"}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Empleado:</p>
            <p className="font-medium">{cita?.nombreempleado?.nombreempleado || "Empleado no disponible"}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha:</p>
            <p className="font-medium">
              {cita?.fechacita
                ? new Date(cita.fechacita).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Fecha no disponible"}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Estado:</p>
            <p className="font-medium">{cita?.estadocita || "Estado no disponible"}</p>
          </div>
        </div>
      </div>

      {/* Servicios seleccionados */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Servicios Seleccionados</h2>

        {serviciosSeleccionados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Servicio</th>
                  <th className="py-2 px-4 border-b text-right">Precio</th>
                  <th className="py-2 px-4 border-b text-right">Tiempo (min)</th>
                  <th className="py-2 px-4 border-b text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {serviciosSeleccionados.map((servicio, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{servicio.nombreServicio}</td>
                    <td className="py-2 px-4 border-b text-right">${Number.parseFloat(servicio.precio).toFixed(2)}</td>
                    <td className="py-2 px-4 border-b text-right">{servicio.tiempo}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => eliminarServicio(servicio.servicio)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-2 px-4 border-t">Total</td>
                  <td className="py-2 px-4 border-t text-right">${precioTotal.toFixed(2)}</td>
                  <td className="py-2 px-4 border-t text-right">{tiempoTotal} min</td>
                  <td className="py-2 px-4 border-t"></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay servicios seleccionados</p>
        )}
      </div>

      {/* Agregar servicios */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Agregar Servicios</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <select
              value={nuevoServicio.id}
              onChange={(e) =>
                setNuevoServicio({
                  id: e.target.value,
                  nombre: servicios.find((s) => s._id === e.target.value)?.nombreServicio || "",
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map((servicio) => (
                <option key={servicio._id} value={servicio._id}>
                  {servicio.nombreServicio} - ${servicio.precio} ({servicio.tiempo} min)
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={agregarServicio}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                Agregando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Agregar Servicio
              </>
            )}
          </button>
        </div>
      </div>

      {/* Finalizar venta */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Finalizar Venta</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Método de Pago:</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <button
            onClick={guardarCambios}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                Guardando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
          <button
            onClick={finalizarVenta}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                Procesando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Finalizar Venta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GestionVentaServicio

