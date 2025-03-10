"use client"

import { useState, useEffect } from "react"
import Modal from "react-modal"
import FormularioRol from "./FormularioRol"
import FormularioPermiso from "../Permisos/FormularioPermiso"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faEdit,
  faTrash,
  faInfoCircle,
  faShieldAlt,
  faPowerOff,
  faFileExcel,
  faDownload,
  faSync,
} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"

Modal.setAppElement("#root")

export default function TablaRoles() {
  const [roles, setRoles] = useState([])
  const [permisoMap, setPermisoMap] = useState({})
  const [modalRolIsOpen, setModalRolIsOpen] = useState(false)
  const [modalDetallesIsOpen, setModalDetallesIsOpen] = useState(false)
  const [modalPermisoIsOpen, setModalPermisoIsOpen] = useState(false)
  const [rolSeleccionado, setRolSeleccionado] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const rolesPorPagina = 5
  const [busqueda, setBusqueda] = useState("")
  const [exportando, setExportando] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const obtenerRoles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const rolesResponse = await fetch("https://gitbf.onrender.com/api/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!rolesResponse.ok) throw new Error(`HTTP error! status: ${rolesResponse.status}`)
      const rolesData = await rolesResponse.json()
      setRoles(rolesData.roles || [])

      const permisosResponse = await fetch("https://gitbf.onrender.com/api/permisos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!permisosResponse.ok) throw new Error(`HTTP error! status: ${permisosResponse.status}`)
      const permisosData = await permisosResponse.json()
      const permisoMap = {}
      permisosData.permisos.forEach((permiso) => {
        permisoMap[permiso._id] = permiso.nombrePermiso
      })
      setPermisoMap(permisoMap)
    } catch (error) {
      console.error("Error al obtener los datos:", error)
      setError("No se pudieron cargar los datos. Por favor, intenta de nuevo.")
      Swal.fire("Error", "No tienes permiso para estar aqui :) post: tu token no es válido", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    obtenerRoles()
  }, [])

  const manejarAgregarNuevo = () => {
    setRolSeleccionado(null)
    setModalRolIsOpen(true)
  }

  const manejarAgregarPermiso = () => {
    setModalPermisoIsOpen(true)
  }
  const manejarCerrarModal = () => {
    setModalRolIsOpen(false)
  }

  const manejarCerrarModalDetalles = () => {
    setModalDetallesIsOpen(false)
  }

  const manejarCerrarModalPermiso = () => {
    setModalPermisoIsOpen(false)
  }

  const manejarRolAgregadoOActualizado = () => {
    manejarCerrarModal()
    obtenerRoles()
  }

  const manejarPermisoCreado = () => {
    manejarCerrarModalPermiso()
    obtenerRoles()
  }

  const manejarEditar = (rol) => {
    setRolSeleccionado(rol)
    setModalRolIsOpen(true)
  }

  const manejarVerDetalles = (rol) => {
    setRolSeleccionado(rol)
    setModalDetallesIsOpen(true)
  }

  const manejarToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual
    const accion = nuevoEstado ? "activar" : "desactivar"

    const result = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${accion} este rol?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sí, ${accion}!`,
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`https://gitbf.onrender.com/api/roles/${id}/toggle-estado`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Actualizar el estado local
        setRoles(roles.map((rol) => (rol._id === id ? { ...rol, estadoRol: nuevoEstado } : rol)))

        Swal.fire(
          `${nuevoEstado ? "Activado" : "Desactivado"}!`,
          `El rol ha sido ${nuevoEstado ? "activado" : "desactivado"}.`,
          "success",
        )
      } catch (error) {
        console.error(`Error al ${accion} el rol:`, error)
        Swal.fire("Error", `No se pudo ${accion} el rol`, "error")
      }
    }
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
        const response = await fetch(`https://gitbf.onrender.com/api/roles/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        setRoles(roles.filter((rol) => rol._id !== id))
        Swal.fire("Eliminado!", "El rol ha sido eliminado.", "success")
      } catch (error) {
        console.error("Error al eliminar el rol:", error)
        Swal.fire("Error", "No se pudo eliminar el rol", "error")
      }
    }
  }

  const exportarExcel = async () => {
    try {
      setExportando(true)
      const token = localStorage.getItem("token")

      // Mostrar notificación de inicio de descarga
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })

      toast.fire({
        icon: "info",
        title: "Preparando la descarga...",
      })

      // Realizar la solicitud para descargar el archivo
      const response = await fetch("https://gitbf.onrender.com/api/roles/export-excel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Obtener el blob del archivo
      const blob = await response.blob()

      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(blob)

      // Crear un elemento <a> para descargar el archivo
      const a = document.createElement("a")
      a.href = url
      a.download = "roles.xlsx"
      document.body.appendChild(a)
      a.click()

      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Mostrar notificación de éxito
      toast.fire({
        icon: "success",
        title: "Archivo descargado correctamente",
      })
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      Swal.fire("Error", "No se pudo exportar la lista de roles a Excel", "error")
    } finally {
      setExportando(false)
    }
  }

  const indiceUltimoRol = paginaActual * rolesPorPagina
  const indicePrimerRol = indiceUltimoRol - rolesPorPagina
  const rolesActuales = roles.slice(indicePrimerRol, indiceUltimoRol)

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
  }

  const paginasTotales = Math.ceil(roles.length / rolesPorPagina)

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1)
  }

  const paginaSiguiente = () => {
    if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1)
  }

  const rolesFiltrados = rolesActuales.filter((rol) => rol.nombreRol.toLowerCase().includes(busqueda.toLowerCase()))

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Cargando roles...</p>
        </div>
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
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          onClick={() => obtenerRoles()}
        >
          <FontAwesomeIcon icon={faSync} className="mr-2" />
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-8">Gestión de Roles</h2>

      <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
        <div className="flex space-x-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
            onClick={manejarAgregarNuevo}
            title="Agregar nuevo rol"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
            onClick={manejarAgregarPermiso}
            title="Agregar nuevo permiso"
          >
            <FontAwesomeIcon icon={faShieldAlt} />
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded transition duration-300 flex items-center"
            onClick={exportarExcel}
            disabled={exportando}
            title="Exportar a Excel"
          >
            {exportando ? (
              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-pink rounded-full mr-1"></div>
            ) : (
              <FontAwesomeIcon icon={faFileExcel} className="mr-1" />
            )}
            <FontAwesomeIcon icon={faDownload} className="text-xs" />
          </button>
        </div>

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Buscar rol"
        />
      </div>

      <div className="w-full max-w-4xl">
        <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-s font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Rol
              </th>
              <th className="px-6 py-3 text-center text-s font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-s font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rolesFiltrados.length > 0 ? (
              rolesFiltrados.map((rol) => (
                <tr key={rol._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {rol.nombreRol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rol.estadoRol ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {rol.estadoRol ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                      onClick={() => manejarEditar(rol)}
                      title="Editar rol"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                      onClick={() => manejarEliminar(rol._id)}
                      title="Eliminar rol"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                      onClick={() => manejarVerDetalles(rol)}
                      title="Ver detalles"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                    <button
                      className={`${rol.estadoRol ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"} text-white font-bold py-1 px-2 rounded transition duration-300`}
                      onClick={() => manejarToggleEstado(rol._id, rol.estadoRol)}
                      title={rol.estadoRol ? "Desactivar rol" : "Activar rol"}
                    >
                      <FontAwesomeIcon icon={faPowerOff} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron roles con ese criterio de búsqueda
                </td>
              </tr>
            )}
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
        isOpen={modalRolIsOpen}
        onRequestClose={manejarCerrarModal}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={manejarCerrarModal}>
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4">{rolSeleccionado ? "Editar Rol" : "Agregar Nuevo Rol"}</h2>
          <FormularioRol
            rolSeleccionado={rolSeleccionado}
            onRolActualizado={manejarRolAgregadoOActualizado}
            onClose={manejarCerrarModal}
          />
        </div>
      </Modal>

      <Modal
        isOpen={modalDetallesIsOpen}
        onRequestClose={manejarCerrarModalDetalles}
        className="fixed inset-0 flex items-center justify-center p-12 overflow-y-scroll"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
          <button
            className="absolute top-2 right-4 text-gray-900 hover:text-gray-700"
            onClick={manejarCerrarModalDetalles}
          >
            &times;
          </button>
          <h2 className="text-xl font-semibold mb-3 text-center ">Detalles del Rol</h2>
          {rolSeleccionado && permisoMap && Object.keys(permisoMap).length > 0 ? (
            <div>
              <p className="mb-3">
                <strong>Nombre del Rol:</strong> {rolSeleccionado.nombreRol}
              </p>
              <p className="mb-3">
                <strong>Estado:</strong>
                <span
                  className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rolSeleccionado.estadoRol ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {rolSeleccionado.estadoRol ? "Activo" : "Inactivo"}
                </span>
              </p>
              <p className="mb-3">
                <strong>Permisos:</strong>
              </p>
              <ul className="list-disc list-inside">
                {rolSeleccionado.permisoRol.map((permiso) => (
                  <li key={permiso._id}>{permisoMap[String(permiso._id)] || "Permiso  desconocido"}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              <p className="ml-2">Cargando permisos...</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modalPermisoIsOpen}
        onRequestClose={manejarCerrarModalPermiso}
        className="fixed inset-0 flex items-center justify-center p-4 overflow-y-scroll"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={manejarCerrarModalPermiso}
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4">Agregar Nuevo Permiso</h2>
          <FormularioPermiso onClose={manejarCerrarModalPermiso} onPermisoCreated={manejarPermisoCreado} />
        </div>
      </Modal>
    </div>
  )
}

