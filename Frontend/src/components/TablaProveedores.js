import { useState, useEffect } from "react"
import axios from "axios"
import Modal from "react-modal"
import FormularioProveedor from "./FormularioProveedor"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"

Modal.setAppElement("#root")

const TablaProveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
  const [formModalIsOpen, setFormModalIsOpen] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [busqueda, setBusqueda] = useState("")
  const proveedoresPorPagina = 5

  const obtenerProveedores = async () => {
    try {
      const respuesta = await axios.get("https://gitbf.onrender.com/api/proveedores")
      setProveedores(respuesta.data || [])
    } catch (error) {
      console.error("Error al obtener los proveedores:", error)
      Swal.fire("Error", "No se pudieron cargar los proveedores", "error")
    }
  }

  useEffect(() => {
    obtenerProveedores()
  }, [])

  const manejarAgregarNuevo = () => {
    setProveedorSeleccionado(null)
    setFormModalIsOpen(true)
  }

  const manejarCerrarModal = () => {
    setFormModalIsOpen(false)
    setProveedorSeleccionado(null)
  }

  const manejarProveedorActualizado = async (proveedorActualizado) => {
    await obtenerProveedores()
    manejarCerrarModal()
    Swal.fire("Éxito", "Proveedor actualizado correctamente", "success")
  }

  const manejarEditarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor)
    setFormModalIsOpen(true)
  }

  const manejarEliminarProveedor = async (id) => {
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
        await axios.delete(`https://gitbf.onrender.com/api/proveedores/${id}`)
        await obtenerProveedores()
        Swal.fire("Eliminado!", "El proveedor ha sido eliminado.", "success")
      } catch (error) {
        console.error("Error al eliminar el proveedor:", error)
        Swal.fire("Error", "No se pudo eliminar el proveedor", "error")
      }
    }
  }

  const indiceUltimoProveedor = paginaActual * proveedoresPorPagina
  const indicePrimerProveedor = indiceUltimoProveedor - proveedoresPorPagina
  const proveedoresActuales = proveedores.slice(indicePrimerProveedor, indiceUltimoProveedor)

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
  }

  const paginasTotales = Math.ceil(proveedores.length / proveedoresPorPagina)

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1)
  }

  const paginaSiguiente = () => {
    if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1)
  }

  const proveedoresFiltrados = proveedoresActuales.filter((proveedor) =>
    proveedor.nombreProveedor.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-8">Gestión de Proveedores</h2>

      <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
      <button
    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300 flex items-center justify-center gap-2"
    onClick={manejarAgregarNuevo}
>
    <FontAwesomeIcon icon={faPlus} />
    <span>Agregar proveedor</span>
</button>

        <input
          type="text"
          className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Buscar proveedores"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="w-full max-w-4xl">
        <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-400 rounded-lg shadow-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Proveedor
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número de Contacto
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
            {proveedoresFiltrados.map((proveedor) => (
              <tr key={proveedor._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  {proveedor.nombreProveedor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{proveedor.contacto}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {proveedor.numeroContacto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${proveedor.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {proveedor.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center space-x-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => manejarEditarProveedor(proveedor)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => manejarEliminarProveedor(proveedor._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <nav className="flex justify-center">
          <ul className="inline-flex items-center">
            <li>
              <button
                onClick={paginaAnterior}
                disabled={paginaActual === 1}
                className={`px-3 py-1 mx-1 rounded ${
                  paginaActual === 1 ? "bg-gray-200 text-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                &lt;
              </button>
            </li>
            {Array.from({ length: paginasTotales }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => cambiarPagina(index + 1)}
                  className={`px-3 py-1 mx-1 rounded ${
                    paginaActual === index + 1
                      ? "bg-gray-300 text-gray-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={paginaSiguiente}
                disabled={paginaActual === paginasTotales}
                className={`px-3 py-1 mx-1 rounded ${
                  paginaActual === paginasTotales
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

      <Modal
        isOpen={formModalIsOpen}
        onRequestClose={manejarCerrarModal}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
          <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onClick={manejarCerrarModal}>
            &times;
          </button>
          <h3 className="text-lg font-semibold mb-4">
            {proveedorSeleccionado ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}
          </h3>
          <FormularioProveedor
            proveedor={proveedorSeleccionado}
            onProveedorActualizado={manejarProveedorActualizado}
            onClose={manejarCerrarModal}
          />
        </div>
      </Modal>
    </div>
  )
}

export default TablaProveedores