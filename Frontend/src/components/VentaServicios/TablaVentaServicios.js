"use client"

import { useState, useEffect } from "react"
import FormularioVentaServicio from "./FormularioVentaServicio"
import { useLocation } from "react-router-dom"
import Modal from "react-modal"
import axios from "axios"
import Swal from "sweetalert2"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEdit, faTrash, faInfoCircle } from "@fortawesome/free-solid-svg-icons"

Modal.setAppElement("#root")

const TablaVentaServicios = () => {
  const [ventas, setVentas] = useState([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false)
  const [detallesCita, setDetallesCita] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const ventasPorPagina = 5
  const [busqueda, setBusqueda] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const location = useLocation()

  const fetchVentas = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("https://gitbf.onrender.com/api/ventaservicios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setVentas(response.data.ventaservicios || [])
    } catch (error) {
      console.error("Error al obtener las ventas:", error)
      Swal.fire("Error", "No tienes permiso para estar aqui :) post: tu token no es válido", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVentas()
  }, [])

  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
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
        response = await axios.put(`https://gitbf.onrender.com/api/ventaservicios/${ventaId}`, ventaData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        await Swal.fire("Actualizado!", "La venta ha sido actualizada.", "success")
      } else {
        response = await axios.post("https://gitbf.onrender.com/api/ventaservicios", ventaData, {
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
        await axios.delete(`https://gitbf.onrender.com/api/ventaservicios/${idVenta}`, {
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

  const mostrarDetallesCita = (venta) => {
    setDetallesCita(venta)
    setModalDetallesAbierto(true)
  }

  const indiceUltimaVenta = paginaActual * ventasPorPagina
  const indicePrimeraVenta = indiceUltimaVenta - ventasPorPagina
  const ventasActuales = ventas.slice(indicePrimeraVenta, indiceUltimaVenta)
  const paginasTotales = Math.ceil(ventas.length / ventasPorPagina)

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
  }

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1)
  }

  const paginaSiguiente = () => {
    if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1)
  }

  const ventasFiltradas = ventasActuales.filter(
    (venta) =>
      venta.cliente?.nombrecliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.cliente?.apellidocliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.cliente?.correocliente.toLowerCase().includes(busqueda.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Cargando ventas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className=" p-2 flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-8">Gestión de Ventas de Servicio</h2>

      <div className="flex justify-between mb-5 w-full h-7 ">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300 disabled:opacity-70"
          onClick={() => {
            setVentaSeleccionada(null)
            setModalAbierto(true)
          }}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : (
            <FontAwesomeIcon icon={faPlus} />
          )}
        </button>

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Buscar por cliente (nombre, apellido o correo)"
          disabled={isProcessing}
        />
      </div>

      <div className="w-full ">
        <table className="min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código Venta
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha y Hora de Venta
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ventas.slice((paginaActual - 1) * ventasPorPagina, paginaActual * ventasPorPagina).map((venta) => (
              <tr key={venta._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venta.codigoVenta || venta._id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {venta.cliente?.nombrecliente} {venta.cliente?.apellidocliente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venta.cliente?.correocliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatearFechaHora(venta.fecha)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${venta.precioTotal.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {venta.estado ? "Activo" : "Inactivo"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300 mr-2"
                    onClick={() => {
                      setVentaSeleccionada(venta)
                      setModalAbierto(true)
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300 mr-2"
                    onClick={() => manejarEliminarVenta(venta._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => mostrarDetallesCita(venta)}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4">
        <nav className="flex justify-center">
          <ul className="inline-flex items-center">
            <li>
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className={`px-3 py-1 mx-1 rounded ${
                  paginaActual === 1 ? "bg-gray-200 text-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                &lt;
              </button>
            </li>
            {[...Array(Math.ceil(ventas.length / ventasPorPagina)).keys()].map((numero) => (
              <li key={numero}>
                <button
                  onClick={() => setPaginaActual(numero + 1)}
                  className={`px-3 py-1 mx-1 rounded ${
                    paginaActual === numero + 1
                      ? "bg-gray-300 text-gray-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {numero + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() =>
                  setPaginaActual((prev) => Math.min(prev + 1, Math.ceil(ventas.length / ventasPorPagina)))
                }
                disabled={paginaActual === Math.ceil(ventas.length / ventasPorPagina)}
                className={`px-3 py-1 mx-1 rounded ${
                  paginaActual === Math.ceil(ventas.length / ventasPorPagina)
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                &gt;
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal para agregar/editar venta */}
      <Modal
        isOpen={modalAbierto}
        onRequestClose={() => setModalAbierto(false)}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative max-h-[80vh] overflow-y-auto">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setModalAbierto(false)}
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4">{ventaSeleccionada ? "Editar Venta" : "Agregar Nueva Venta"}</h2>
          <FormularioVentaServicio
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
        className="fixed inset-0 flex items-center justify-center p-4 overflow-y-scroll"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setModalDetallesAbierto(false)}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4">Detalles de la Venta</h2>
          {detallesCita && (
            <div className="space-y-4">
              <p>
                <strong>Código Venta:</strong> {detallesCita.codigoVenta || detallesCita._id}
              </p>
              <p>
                <strong>Cliente:</strong> {detallesCita.cliente.nombrecliente} {detallesCita.cliente.apellidocliente}
              </p>
              <p>
                <strong>Email:</strong> {detallesCita.cliente?.correocliente || "Email no disponible"}
              </p>
              <p>
                <strong>Celular:</strong> {detallesCita.cliente?.celularcliente || "Celular no disponible"}
              </p>

              <p>
                <strong>Fecha y Hora de Venta:</strong> {formatearFechaHora(detallesCita.fecha)}
              </p>
              <p>
                <strong>Fecha y Hora de Cita:</strong> {formatearFechaHora(detallesCita.cita.fechacita)}
              </p>
              <p>
                <strong>Empleado:</strong> {detallesCita.empleado?.nombreempleado || "Empleado no disponible"}
              </p>
              <div>
                <strong>Servicios:</strong>
                <table className="min-w-full divide-y divide-gray-200 mt-2">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiempo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detallesCita.servicios.map((servicio) => (
                      <tr key={servicio._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{servicio.nombreServicio}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${servicio.precio.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{servicio.tiempo} min</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${detallesCita.precioTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {detallesCita.servicios.reduce((total, servicio) => total + servicio.tiempo, 0)} min
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p>
                <strong>Estado:</strong> {detallesCita.estado ? "Activo" : "Inactivo"}
              </p>
            </div>
          )}
          <button
            onClick={() => setModalDetallesAbierto(false)}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default TablaVentaServicios

