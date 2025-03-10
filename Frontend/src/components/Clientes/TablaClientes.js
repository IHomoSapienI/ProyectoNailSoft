"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Modal from "react-modal"
import FormularioCliente from "./FormularioCliente"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"

Modal.setAppElement("#root")

const TablaClientes = () => {
  const [clientes, setClientes] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [formModalIsOpen, setFormModalIsOpen] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [busqueda, setBusqueda] = useState("")
  const clientesPorPagina = 5

  useEffect(() => {
    obtenerClientes()
  }, [])

  const obtenerClientes = async () => {
    try {
      const respuesta = await axios.get("https://gitbf.onrender.com/api/clientes")
      setClientes(respuesta.data || [])
    } catch (error) {
      console.error("Error al obtener los clientes:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al obtener los clientes",
      })
    }
  }

  const filtrarClientes = () => {
    return clientes.filter(
      (cliente) =>
        cliente.nombrecliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.apellidocliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.correocliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.celularcliente?.toLowerCase().includes(busqueda.toLowerCase()),
    )
  }

  const clientesFiltrados = filtrarClientes()
  const indiceUltimoCliente = paginaActual * clientesPorPagina
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina
  const clientesActuales = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente)
  const paginasTotales = Math.ceil(clientesFiltrados.length / clientesPorPagina)

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-8">Gestión de Clientes</h2>

      <div className="flex justify-between mb-5 w-full max-w-4xl">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          onClick={() => {
            setFormModalIsOpen(true)
            setClienteSeleccionado(null)
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nuevo Cliente
        </button>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Buscar cliente..."
        />
      </div>

      <div className="w-full max-w-4xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Apellido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Celular
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientesActuales.map((cliente) => (
              <tr key={cliente._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.nombrecliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.apellidocliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.correocliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.celularcliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cliente.estadocliente ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cliente.estadocliente ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded mr-2 transition duration-300"
                    onClick={() => {
                      setClienteSeleccionado(cliente)
                      setFormModalIsOpen(true)
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => {
                      Swal.fire({
                        title: "¿Estás seguro?",
                        text: "No podrás revertir esta acción",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          // Aquí va la lógica para eliminar
                          axios
                            .delete(`https://gitbf.onrender.com/api/clientes/${cliente._id}`)
                            .then(() => {
                              obtenerClientes()
                              Swal.fire("Eliminado!", "El cliente ha sido eliminado.", "success")
                            })
                            .catch((error) => {
                              console.error("Error:", error)
                              Swal.fire("Error!", "No se pudo eliminar el cliente.", "error")
                            })
                        }
                      })
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
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
          <ul className="inline-flex items-center -space-x-px">
            <li>
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
            </li>
            {[...Array(paginasTotales)].map((_, index) => (
              <li key={index}>
                <button
                  onClick={() => setPaginaActual(index + 1)}
                  className={`px-3 py-2 leading-tight border border-gray-300 
                                        ${
                                          paginaActual === index + 1
                                            ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                                            : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                                        }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, paginasTotales))}
                disabled={paginaActual === paginasTotales}
                className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <Modal
        isOpen={formModalIsOpen}
        onRequestClose={() => setFormModalIsOpen(false)}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <FormularioCliente
            cliente={clienteSeleccionado}
            onClose={() => {
              setFormModalIsOpen(false)
              obtenerClientes()
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default TablaClientes

