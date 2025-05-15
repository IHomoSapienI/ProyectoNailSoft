"use client"

import { useState, useEffect } from "react"
import FormularioVenta from "./FormularioVenta"
import { useLocation, useNavigate } from "react-router-dom"
import Modal from "react-modal"
import axios from "axios"
import Swal from "sweetalert2"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEdit, faTrash, faInfoCircle, faSearch, faCheck, faTag } from "@fortawesome/free-solid-svg-icons"
import "./tablaVentaServicio.css"

Modal.setAppElement("#root")

const TablaVentas = () => {
  const [ventas, setVentas] = useState([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false)
  const [detallesVenta, setDetallesVenta] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const ventasPorPagina = 5
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos") // todos, productos, servicios, mixta
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const fetchVentas = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("https://gitbf.onrender.com/api/ventas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(ventas)
      setVentas(response.data.ventas || [])
    } catch (error) {
      console.error("Error al obtener las ventas:", error)
      Swal.fire("Error", "No tienes permiso para estar aquí o tu token no es válido", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVentas()
  }, [])

  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const manejarCancelar = () => {
    setVentaSeleccionada(null)
    setModalAbierto(false)
  }

  const manejarAgregarOActualizar = async (ventaData, ventaId) => {
    setIsProcessing(true)
    try {
      const token = localStorage.getItem("token")
      let response
      if (ventaId) {
        response = await axios.put(`https://gitbf.onrender.com/api/ventas/${ventaId}`, ventaData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        await Swal.fire("Actualizado!", "La venta ha sido actualizada.", "success")
      } else {
        response = await axios.post("https://gitbf.onrender.com/api/ventas", ventaData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        await Swal.fire("Agregado!", "La venta ha sido agregada.", "success")
      }

      await fetchVentas()
      setModalAbierto(false)
    } catch (error) {
      console.error("Error al agregar o actualizar la venta:", error)
      await Swal.fire("Error!", "Hubo un problema al guardar la venta.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const manejarEliminarVenta = async (idVenta) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminarlo!",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      setIsProcessing(true)
      try {
        const token = localStorage.getItem("token")
        await axios.delete(`https://gitbf.onrender.com/api/ventas/${idVenta}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        await fetchVentas()
        Swal.fire("Eliminado!", "La venta ha sido eliminada.", "success")
      } catch (error) {
        console.error("Error al eliminar la venta:", error)
        Swal.fire("Error!", "Hubo un problema al eliminar la venta.", "error")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const finalizarVenta = async (idVenta) => {
    const { value: metodoPago } = await Swal.fire({
      title: "Seleccione el método de pago",
      input: "select",
      inputOptions: {
        Efectivo: "Efectivo",
        Tarjeta: "Tarjeta",
        Transferencia: "Transferencia",
        Otro: "Otro",
      },
      inputPlaceholder: "Seleccione un método de pago",
      showCancelButton: true,
      confirmButtonText: "Finalizar venta",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve()
          } else {
            resolve("Debe seleccionar un método de pago")
          }
        })
      },
    })

    if (metodoPago) {
      setIsProcessing(true)
      try {
        const token = localStorage.getItem("token")
        await axios.put(
          `https://gitbf.onrender.com/api/ventas/${idVenta}/finalizar`,
          { metodoPago },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        await fetchVentas()
        Swal.fire("Finalizado!", "La venta ha sido finalizada correctamente.", "success")
      } catch (error) {
        console.error("Error al finalizar la venta:", error)
        Swal.fire("Error!", "Hubo un problema al finalizar la venta.", "error")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const mostrarDetallesVenta = async (venta) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      // Obtener detalles completos de la venta
      const response = await axios.get(`https://gitbf.onrender.com/api/ventas/${venta._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data && response.data.venta) {
        const ventaCompleta = response.data.venta

        // Procesar servicios para asegurar que la información de descuento esté correcta
        if (ventaCompleta.servicios && ventaCompleta.servicios.length > 0) {
          try {
            // Intentar obtener servicios con descuentos
            const { obtenerServiciosConDescuento } = await import("../Servicios/obtenerServicios")
            const serviciosConDescuento = await obtenerServiciosConDescuento()

            ventaCompleta.servicios = ventaCompleta.servicios.map((servicio) => {
              // Obtener el ID del servicio
              const servicioId = typeof servicio.servicio === "object" ? servicio.servicio._id : servicio.servicio

              // Buscar el servicio en la lista de servicios con descuento
              const servicioConDescuento = serviciosConDescuento.find((s) => s._id === servicioId)

              // Si encontramos el servicio con información de descuento, usamos esa información
              if (servicioConDescuento) {
                return {
                  ...servicio,
                  nombreServicio: servicio.nombreServicio || servicioConDescuento.nombreServicio,
                  tieneDescuento: servicioConDescuento.tieneDescuento || false,
                  precioOriginal: servicioConDescuento.precioOriginal || Number.parseFloat(servicio.precio || 0),
                  precioConDescuento:
                    servicioConDescuento.precioConDescuento || Number.parseFloat(servicio.precio || 0),
                  porcentajeDescuento: servicioConDescuento.porcentajeDescuento || 0,
                  tipoServicioNombre: servicioConDescuento.tipoServicio?.nombreTs || "No especificado",
                  esPromocional: servicioConDescuento.esPromocional || false,
                }
              }

              // Si ya tiene información de descuento, la mantenemos
              if (servicio.tieneDescuento !== undefined) {
                return {
                  ...servicio,
                  precioOriginal: Number.parseFloat(servicio.precioOriginal || servicio.precio || 0),
                  precioConDescuento: Number.parseFloat(servicio.precioConDescuento || servicio.precio || 0),
                }
              }

              // Verificar si hay indicios de descuento en el servicio
              const precioOriginal = Number.parseFloat(servicio.precioOriginal || servicio.precio || 0)
              const precioFinal = Number.parseFloat(servicio.precioConDescuento || servicio.precio || 0)

              const tieneDescuento =
                (servicio.porcentajeDescuento && servicio.porcentajeDescuento > 0) || precioOriginal > precioFinal

              let porcentajeDescuento = servicio.porcentajeDescuento || 0

              // Si tiene descuento pero no tenemos el porcentaje, calcularlo
              if (tieneDescuento && porcentajeDescuento === 0 && precioOriginal > 0) {
                porcentajeDescuento = Math.round(((precioOriginal - precioFinal) / precioOriginal) * 100)
              }

              return {
                ...servicio,
                tieneDescuento,
                precioOriginal,
                precioConDescuento: precioFinal,
                porcentajeDescuento,
              }
            })
          } catch (error) {
            console.error("Error al procesar servicios con descuentos:", error)
          }
        }

        setDetallesVenta(ventaCompleta)
        setModalDetallesAbierto(true)
      } else {
        throw new Error("Formato de respuesta inválido")
      }
    } catch (error) {
      console.error("Error al obtener detalles de la venta:", error)
      Swal.fire("Error", "No se pudieron cargar los detalles de la venta", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar ventas por tipo y búsqueda
  const ventasFiltradas = ventas.filter((venta) => {
    // Filtrar por tipo de venta
    if (filtroTipo !== "todos" && venta.tipoVenta !== filtroTipo) {
      return false
    }

    // Filtrar por búsqueda (nombre de cliente, apellido o correo)
    const terminoBusqueda = busqueda.toLowerCase()
    const nombreCliente = venta.cliente?.nombrecliente?.toLowerCase() || ""
    const apellidoCliente = venta.cliente?.apellidocliente?.toLowerCase() || ""
    const correoCliente = venta.cliente?.correocliente?.toLowerCase() || ""

    return (
      nombreCliente.includes(terminoBusqueda) ||
      apellidoCliente.includes(terminoBusqueda) ||
      correoCliente.includes(terminoBusqueda)
    )
  })

  // Paginación
  const indiceUltimaVenta = paginaActual * ventasPorPagina
  const indicePrimeraVenta = indiceUltimaVenta - ventasPorPagina
  const ventasActuales = ventasFiltradas.slice(indicePrimeraVenta, indiceUltimaVenta)
  const paginasTotales = Math.ceil(ventasFiltradas.length / ventasPorPagina)

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
  }

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1)
  }

  const paginaSiguiente = () => {
    if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[64vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-foreground">Cargando ventas...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="tabla-container dark:bg-primary">
      <h2 className="text-3xl font-semibold mb-8 text-foreground">Gestión de Ventas</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button
          className="btn-add"
          onClick={() => {
            setVentaSeleccionada(null)
            setModalAbierto(true)
          }}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="spinner"></span>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Nueva Venta
            </>
          )}
        </button>

        <div className="flex flex-col md:flex-row gap-4 items-center ">
          <div className="flex items-center  w-[40vh]">
            <label htmlFor="filtroTipo" className="mr-2 text-sm font-medium text-foreground">
              Tipo:
            </label>
            <select
              id="filtroTipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="form-select text-sm dark:card-gradient-4 text-foreground "
              disabled={isProcessing}
            >
              <option value="todos" className="dark:bg-gray-600 hover:bg-gray-500">
                Todos
              </option>
              <option value="productos" className="dark:bg-gray-600 hover:bg-gray-500">
                Solo Productos
              </option>
              <option value="servicios" className="dark:bg-gray-600 hover:bg-gray-500">
                Solo Servicios
              </option>
              <option value="mixta" className="dark:bg-gray-600 hover:bg-gray-500 hover:bg-gray-300">
                Mixta
              </option>
            </select>
          </div>

          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input dark:card-gradient-4"
              placeholder="Buscar por cliente (nombre, apellido o correo)"
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="venta-tabla-moderna w-full">
          <thead className="bg-pink-200 text-black dark:card-gradient-4">
            <tr className="text-foreground">
              <th className="dark:hover:bg-gray-500/50">Código</th>
              <th className="dark:hover:bg-gray-500/50">Cliente</th>
              <th className="dark:hover:bg-gray-500/50">Tipo</th>
              <th className="dark:hover:bg-gray-500/50">Fecha</th>
              <th className="dark:hover:bg-gray-500/50">Total</th>
              <th className="dark:hover:bg-gray-500/50">Estado</th>
              <th className="dark:hover:bg-gray-500/50">Acciones</th>
            </tr>
          </thead>
          <tbody className="dark:bg-zinc-900/80">
            {ventasActuales.length > 0 ? (
              ventasActuales.map((venta) => (
                <tr className="dark:hover:bg-gray-500/50 text-foreground" key={venta._id}>
                  <td>{venta.codigoVenta || venta._id.substring(0, 8)}</td>
                  <td className="font-medium">
                    {venta.cliente?.nombrecliente} {venta.cliente?.apellidocliente}
                  </td>
                  <td>
                    <span
                      className={`tipo-badge ${
                        venta.tipoVenta === "mixta"
                          ? "mixta"
                          : venta.tipoVenta === "productos"
                            ? "productos"
                            : "servicios"
                      }`}
                    >
                      {venta.tipoVenta === "mixta"
                        ? "Mixta"
                        : venta.tipoVenta === "productos"
                          ? "Productos"
                          : "Servicios"}
                    </span>
                  </td>
                  <td>{formatearFechaHora(venta.fechaCreacion || venta.fecha)}</td>
                  <td>${venta.total.toFixed(2)}</td>
                  <td>
                    <span className={`venta-estado-badge ${venta.estado ? "activo bg-emerald-500/50 dark:bg-emerald-500" : "inactivo bg-red-500/80"}`}>
                      {venta.estado ? "Completada" : "Pendiente"}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      {/* <button
                        className="btn-edit"
                        onClick={() => {
                          setVentaSeleccionada(venta)
                          setModalAbierto(true)
                        }}
                        title="Editar venta"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button> */}
                      {/* <button
                        className="btn-delete"
                        onClick={() => manejarEliminarVenta(venta._id)}
                        title="Eliminar venta"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button> */}
                      <button className="btn-info" onClick={() => mostrarDetallesVenta(venta)} title="Ver detalles">
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </button>
                      {!venta.estado && (
                        <button
                          className="btn-success-1 bg-emerald-500/50 dark:bg-emerald-500"
                          onClick={() => finalizarVenta(venta._id)}
                          title="Finalizar venta"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No se encontraron ventas con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {paginasTotales > 1 && (
        <div className="pagination-container mt-6">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className={`pagination-btn ${paginaActual === 1 ? "disabled" : ""}`}
          >
            &lt;
          </button>

          <div className="pagination-pages">
            {Array.from({ length: paginasTotales }, (_, index) => (
              <button
                key={index}
                onClick={() => cambiarPagina(index + 1)}
                className={`pagination-number ${paginaActual === index + 1 ? "active" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={paginaSiguiente}
            disabled={paginaActual === paginasTotales}
            className={`pagination-btn ${paginaActual === paginasTotales ? "disabled" : ""}`}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Modal para agregar/editar venta */}
      <Modal
        isOpen={modalAbierto}
        onRequestClose={() => setModalAbierto(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            onClick={() => setModalAbierto(false)}
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-6 text-center text-pink-600">
            {ventaSeleccionada ? "Editar Venta" : "Agregar Nueva Venta"}
          </h2>
          <FormularioVenta
            venta={ventaSeleccionada}
            onGuardar={manejarAgregarOActualizar}
            onCancelar={() => setModalAbierto(false)}
          />
        </div>
      </Modal>

      {/* Modal para mostrar detalles */}
      <Modal
        isOpen={modalDetallesAbierto}
        onRequestClose={() => setModalDetallesAbierto(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            onClick={() => setModalDetallesAbierto(false)}
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-6 text-center text-pink-600">Detalles de la Venta</h2>
          {detallesVenta && (
            <div className="space-y-4 p-4">
              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Código Venta:</p>
                <p className="text-lg font-semibold">{detallesVenta.codigoVenta || detallesVenta._id}</p>
              </div>
              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Cliente:</p>
                <p className="text-base">
                  {detallesVenta.cliente.nombrecliente} {detallesVenta.cliente.apellidocliente}
                </p>
              </div>
              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Email:</p>
                <p className="text-base">{detallesVenta.cliente?.correocliente || "Email no disponible"}</p>
              </div>
              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Celular:</p>
                <p className="text-base">{detallesVenta.cliente?.celularcliente || "Celular no disponible"}</p>
              </div>
              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Fecha y Hora de Venta:</p>
                <p className="text-base">{formatearFechaHora(detallesVenta.fechaCreacion || detallesVenta.fecha)}</p>
              </div>
              {detallesVenta.cita && (
                <div className="form-group">
                  <p className="text-sm font-medium text-gray-500">Fecha de Cita:</p>
                  <p className="text-base">
                    {new Date(detallesVenta.cita.fechacita).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {detallesVenta.cita && (
                <div className="form-group">
                  <p className="text-sm font-medium text-gray-500">Hora de Cita:</p>
                  <p className="text-base">
                    {detallesVenta.cita.horacita ||
                      new Date(detallesVenta.cita.fechacita).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </p>
                </div>
              )}
              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Empleado:</p>
                <p className="text-base">{detallesVenta.empleado?.nombreempleado || "Empleado no disponible"}</p>
              </div>

              {/* Productos */}
              {detallesVenta.productos && detallesVenta.productos.length > 0 && (
                <div className="form-group">
                  <p className="text-sm font-medium text-gray-500">Productos:</p>
                  <table className="tabla-servicios mt-2">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th className="text-right">Precio</th>
                        <th className="text-right">Cantidad</th>
                        <th className="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallesVenta.productos.map((producto, index) => (
                        <tr key={`producto-${index}`}>
                          <td>{producto.nombreProducto}</td>
                          <td className="text-right">${Number.parseFloat(producto.precio).toFixed(2)}</td>
                          <td className="text-right">{producto.cantidad}</td>
                          <td className="text-right">${Number.parseFloat(producto.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3">Subtotal Productos</td>
                        <td className="text-right">${detallesVenta.subtotalProductos.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Servicios */}
              {detallesVenta.servicios && detallesVenta.servicios.length > 0 && (
                <div className="form-group">
                  <p className="text-sm font-medium text-gray-500">Servicios:</p>
                  <table className="tabla-servicios mt-2">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th className="text-right">Precio Original</th>
                        <th className="text-center">Descuento</th>
                        <th className="text-right">Precio Final</th>
                        <th className="text-right">Tiempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallesVenta.servicios.map((servicio, index) => {
                        // Asegurar que los valores sean números
                        const precioOriginal = Number.parseFloat(servicio.precioOriginal || servicio.precio || 0)
                        const precioFinal = servicio.tieneDescuento
                          ? Number.parseFloat(servicio.precioConDescuento || 0)
                          : precioOriginal

                        return (
                          <tr key={`servicio-${index}`}>
                            <td>{servicio.nombreServicio}</td>
                            <td className="text-right">${precioOriginal.toFixed(2)}</td>
                            <td className="text-center">
                              {servicio.tieneDescuento && servicio.porcentajeDescuento > 0 ? (
                                <span className="discount-badge">
                                  <FontAwesomeIcon icon={faTag} className="mr-1" />
                                  {servicio.porcentajeDescuento || 0}% OFF
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="text-right">
                              {servicio.tieneDescuento ? (
                                <span className="discounted-price">${precioFinal.toFixed(2)}</span>
                              ) : (
                                <span>${precioFinal.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="text-right">{servicio.tiempo} min</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4">Subtotal Servicios</td>
                        <td className="text-right">${detallesVenta.subtotalServicios.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Resumen de Descuentos */}
              {detallesVenta.servicios && detallesVenta.servicios.some((s) => s.tieneDescuento) && (
                <div className="form-group">
                  <p className="text-sm font-medium text-gray-500">Resumen de Descuentos:</p>
                  <div className="p-4 bg-pink-50 rounded-md mt-2">
                    <ul className="space-y-2">
                      {detallesVenta.servicios
                        .filter((s) => s.tieneDescuento)
                        .map((servicio, index) => {
                          const precioOriginal = Number.parseFloat(servicio.precioOriginal || servicio.precio || 0)
                          const precioFinal = Number.parseFloat(servicio.precioConDescuento || servicio.precio || 0)
                          const ahorro = precioOriginal - precioFinal

                          return (
                            <li key={`descuento-${index}`} className="flex justify-between border-b pb-2">
                              <div>
                                <span className="font-medium">{servicio.nombreServicio}</span>
                                <span className="discount-badge ml-2 text-black">
                                  {servicio.porcentajeDescuento || 0}% OFF
                                </span>
                              </div>
                              <div className="text-right">
                                <div>
                                  <span className="original-price">${precioOriginal.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="discounted-price">${precioFinal.toFixed(2)}</span>
                                </div>
                                <div className="text-green-600 font-semibold">Ahorro: ${ahorro.toFixed(2)}</div>
                              </div>
                            </li>
                          )
                        })}
                    </ul>
                    <div className="mt-4 text-right">
                      <p className="text-lg font-bold text-green-600">
                        Total ahorrado: $
                        {detallesVenta.servicios
                          .filter((s) => s.tieneDescuento)
                          .reduce((total, servicio) => {
                            const precioOriginal = Number.parseFloat(servicio.precioOriginal || servicio.precio || 0)
                            const precioFinal = Number.parseFloat(servicio.precioConDescuento || servicio.precio || 0)
                            return total + (precioOriginal - precioFinal)
                          }, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Total:</p>
                <p className="text-xl font-bold">${detallesVenta.total.toFixed(2)}</p>
              </div>

              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Método de Pago:</p>
                <p className="text-base">{detallesVenta.metodoPago || "No especificado"}</p>
              </div>

              <div className="form-group">
                <p className="text-sm font-medium text-gray-500">Estado:</p>
                <span className={`estado-badge ${detallesVenta.estado ? "activo" : "inactivo"}`}>
                  {detallesVenta.estado ? "Completada" : "Pendiente"}
                </span>
              </div>

              {detallesVenta.observaciones && (
                <div className="form-group">
                  <p className="text-sm font-medium text-gray-500">Observaciones:</p>
                  <p className="text-base">{detallesVenta.observaciones}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button onClick={() => setModalDetallesAbierto(false)} className="btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TablaVentas
