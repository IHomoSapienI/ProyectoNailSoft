"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Modal from "react-modal"
import FormularioCliente from "./FormularioCliente"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import { useSidebar } from "../Sidebar/Sidebar"

Modal.setAppElement("#root")

const TablaClientes = () => {
  const { isCollapsed } = useSidebar()
  const [clientes, setClientes] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [busqueda, setBusqueda] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const clientesPorPagina = 5

  useEffect(() => {
    obtenerClientes()
  }, [])

  const obtenerClientes = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        Swal.fire({
          title: "Error",
          text: "No tienes permiso para estar aquí. No se encontró un token válido.",
          icon: "error",
          confirmButtonColor: "#db2777",
        })
        setError("Token no encontrado.")
        return
      }

      const respuesta = await axios.get("https://gitbf.onrender.com/api/clientes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setClientes(respuesta.data || [])
      setError(null)
    } catch (error) {
      console.error("Error al obtener los clientes:", error)
      setError("Error al cargar los clientes. Por favor, intente de nuevo.")
      Swal.fire({
        title: "Error",
        text: "No tienes permiso para estar aquí. Tu token no es válido.",
        icon: "error",
        confirmButtonColor: "#db2777",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const manejarCerrarModal = () => {
    setModalIsOpen(false)
  }

  const manejarEditar = (cliente) => {
    setClienteSeleccionado(cliente)
    setModalIsOpen(true)
  }

  const manejarEliminar = async (id) => {
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
      try {
        const token = localStorage.getItem("token")
        await axios.delete(`https://gitbf.onrender.com/api/clientes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setClientes(clientes.filter(c => c._id !== id))
        Swal.fire({
          title: "Eliminado!",
          text: "El cliente ha sido eliminado.",
          icon: "success",
          confirmButtonColor: "#db2777",
        })
      } catch (error) {
        console.error("Error al eliminar el cliente:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el cliente.",
          icon: "error",
          confirmButtonColor: "#db2777",
        })
      }
    }
  }

  const filtrarClientes = () => {
    return clientes.filter(
      (cliente) =>
        cliente.nombrecliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.apellidocliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.correocliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.celularcliente?.toLowerCase().includes(busqueda.toLowerCase())
    )
  }

  const clientesFiltrados = filtrarClientes()
  const indiceUltimoCliente = paginaActual * clientesPorPagina
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina
  const clientesActuales = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente)
  const paginasTotales = Math.ceil(clientesFiltrados.length / clientesPorPagina)

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
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  return (
    <div className="tabla-container transition-all duration-100 dark:bg-primary">
      <h2 className="text-3xl font-semibold mb-6 text-foreground px-4 pt-4">Gestión de Clientes</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-4">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input dark:card-gradient-4"
            placeholder="Buscar clientes..."
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow mx-4">
        <table className="serv-tabla-moderna w-full">
          <thead className="dark:card-gradient-4">
            <tr className="text-foreground">
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Celular</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesActuales.length > 0 ? (
              clientesActuales.map((cliente) => (
                <tr key={cliente._id}>
                  <td className="font-medium">{cliente.nombrecliente}</td>
                  <td>{cliente.apellidocliente}</td>
                  <td>{cliente.correocliente}</td>
                  <td>{cliente.celularcliente}</td>
                  <td>
                    <span className={`estado-badge ${cliente.estadocliente ? "activo" : "inactivo"}`}>
                      {cliente.estadocliente ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button className="btn-edit" onClick={() => manejarEditar(cliente)} title="Editar">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="btn-delete" onClick={() => manejarEliminar(cliente._id)} title="Eliminar">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {clientesFiltrados.length > 0 && (
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

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={manejarCerrarModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            onClick={manejarCerrarModal}
          >
            &times;
          </button>
          <FormularioCliente
            cliente={clienteSeleccionado}
            onClose={() => {
              manejarCerrarModal()
              obtenerClientes()
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default TablaClientes