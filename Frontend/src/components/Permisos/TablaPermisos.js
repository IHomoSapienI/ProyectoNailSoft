"use client"

import { useState, useEffect } from "react"
import Modal from "react-modal"
import FormularioPermiso from "./FormularioPermiso"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faEdit,
  faTrash,
  faInfoCircle,
  faPowerOff,
  faFileExcel,
  faDownload,
  faFilter,
} from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
// Reemplazar la línea de importación de axiosInstance
//import axiosInstance from "../utils/axiosConfig" // Importar la instancia configurada de axios

// Con la importación de axios normal y eliminar la referencia a axiosInstance
import axios from "axios"

Modal.setAppElement("#root")

export default function TablaPermisos() {
  const [permisos, setPermisos] = useState([])
  const [modalPermisoIsOpen, setModalPermisoIsOpen] = useState(false)
  const [modalDetallesIsOpen, setModalDetallesIsOpen] = useState(false)
  const [permisoSeleccionado, setPermisoSeleccionado] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const permisosPorPagina = 10
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [exportando, setExportando] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState(null)

  const categorias = [
    { value: "", label: "Todas las categorías" },
    { value: "categoriaProductos", label: "Categorías de Productos" },
    { value: "citas", label: "Citas" },
    { value: "clientes", label: "Clientes" },
    { value: "compras", label: "Compras" },
    { value: "configuración", label: "Configuración" },
    { value: "empleados", label: "Empleados" },
    { value: "insumos", label: "Insumos" },
    { value: "permisos", label: "Permisos" },
    { value: "productos", label: "Productos" },
    { value: "proveedores", label: "Proveedores" },
    { value: "reportes", label: "Reportes" },
    { value: "roles", label: "Roles" },
    { value: "servicios", label: "Servicios" },
    { value: "usuarios", label: "Usuarios" },
    { value: "ventaServicios", label: "Venta de Servicios" },
    { value: "ventaProductos", label: "Venta de Productos" },
  ]

  // Reemplazar la función obtenerPermisos que usa axiosInstance
  const obtenerPermisos = async () => {
    try {
      setCargando(true)
      setError(null)

      // Usar axiosInstance en lugar de axios directamente
      //const response = await axiosInstance.get("/permisos")

      //setPermisos(response.data.permisos || [])
      const token = localStorage.getItem("token")
      const response = await axios.get("https://gitbf.onrender.com/api/permisos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setPermisos(response.data.permisos || [])
    } catch (error) {
      console.error("Error al obtener los permisos:", error)
      setError("No se pudieron cargar los permisos. " + (error.response?.data?.msg || error.message))

      // Solo mostrar alerta si no es un error de permiso desactivado (ya manejado por el interceptor)
      //if (!error.response?.data?.permisoDesactivado) {
      //  Swal.fire("Error", "No se pudieron cargar los permisos", "error")
      //}
      Swal.fire("Error", "No se pudieron cargar los permisos", "error")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    obtenerPermisos()
  }, [])

  const manejarAgregarNuevo = () => {
    setPermisoSeleccionado(null)
    setEditMode(false)
    setModalPermisoIsOpen(true)
  }

  const manejarCerrarModal = () => {
    setModalPermisoIsOpen(false)
  }

  const manejarCerrarModalDetalles = () => {
    setModalDetallesIsOpen(false)
  }

  const manejarPermisoCreado = () => {
    manejarCerrarModal()
    obtenerPermisos()
  }

  const manejarEditar = (permiso) => {
    setPermisoSeleccionado(permiso)
    setEditMode(true)
    setModalPermisoIsOpen(true)
  }

  const manejarVerDetalles = (permiso) => {
    setPermisoSeleccionado(permiso)
    setModalDetallesIsOpen(true)
  }

  const manejarToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual
    const accion = nuevoEstado ? "activar" : "desactivar"

    const result = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${accion} este permiso?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sí, ${accion}!`,
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        // Mostrar indicador de carga
        const loadingToast = Swal.fire({
          title: "Procesando...",
          html: '<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div><p class="mt-4">Por favor espere</p>',
          showConfirmButton: false,
          allowOutsideClick: false,
        })

        // También reemplazar las otras instancias donde se usa axiosInstance con axios directo
        // Por ejemplo, en manejarToggleEstado:
        // Usar axiosInstance en lugar de axios directamente
        //const response = await axiosInstance.put(`/permisos/${id}`, { activo: nuevoEstado })
        const token = localStorage.getItem("token")
        const response = await axios.put(
          `https://gitbf.onrender.com/api/permisos/${id}`,
          { activo: nuevoEstado },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )

        // Cerrar indicador de carga
        loadingToast.close()

        // Actualizar el estado local
        setPermisos(permisos.map((permiso) => (permiso._id === id ? { ...permiso, activo: nuevoEstado } : permiso)))

        Swal.fire(
          `${nuevoEstado ? "Activado" : "Desactivado"}!`,
          `El permiso ha sido ${nuevoEstado ? "activado" : "desactivado"}.`,
          "success",
        )
      } catch (error) {
        console.error(`Error al ${accion} el permiso:`, error)

        // Solo mostrar alerta si no es un error de permiso desactivado (ya manejado por el interceptor)
        //if (!error.response?.data?.permisoDesactivado) {
        //  Swal.fire("Error", `No se pudo ${accion} el permiso`, "error")
        //}
        Swal.fire("Error", `No se pudo ${accion} el permiso`, "error")
      }
    }
  }

  const manejarEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto! Ten en cuenta que eliminar un permiso puede afectar a los roles que lo utilizan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminarlo!",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        // Mostrar indicador de carga
        const loadingToast = Swal.fire({
          title: "Eliminando...",
          html: '<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div><p class="mt-4">Por favor espere</p>',
          showConfirmButton: false,
          allowOutsideClick: false,
        })

        // Usar axiosInstance en lugar de axios directamente
        //const response = await axiosInstance.delete(`/permisos/${id}`)
        const token = localStorage.getItem("token")
        const response = await axios.delete(`https://gitbf.onrender.com/api/permisos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Cerrar indicador de carga
        loadingToast.close()

        setPermisos(permisos.filter((permiso) => permiso._id !== id))
        Swal.fire("Eliminado!", "El permiso ha sido eliminado.", "success")
      } catch (error) {
        console.error("Error al eliminar el permiso:", error)

        // Solo mostrar alerta si no es un error de permiso desactivado (ya manejado por el interceptor)
        //if (!error.response?.data?.permisoDesactivado) {
        //  Swal.fire("Error", "No se pudo eliminar el permiso", "error")
        //}
        Swal.fire("Error", "No se pudo eliminar el permiso", "error")
      }
    }
  }

  const exportarExcel = async () => {
    try {
      setExportando(true)

      // Crear un libro de Excel en el cliente usando la biblioteca exceljs
      const ExcelJS = await import("exceljs")
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Permisos")

      // Definir las columnas
      worksheet.columns = [
        { header: "ID", key: "id", width: 30 },
        { header: "Nombre", key: "nombre", width: 30 },
        { header: "Descripción", key: "descripcion", width: 40 },
        { header: "Categoría", key: "categoria", width: 20 },
        { header: "Nivel", key: "nivel", width: 15 },
        { header: "Estado", key: "estado", width: 15 },
      ]

      // Estilo para el encabezado
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      }

      // Agregar los datos
      permisos.forEach((permiso) => {
        worksheet.addRow({
          id: permiso._id,
          nombre: permiso.nombrePermiso,
          descripcion: permiso.descripcion,
          categoria: permiso.categoria,
          nivel: permiso.nivel === "read" ? "Lectura" : permiso.nivel === "write" ? "Escritura" : "Eliminación",
          estado: permiso.activo ? "Activo" : "Inactivo",
        })
      })

      // Generar el archivo
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "permisos.xlsx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Archivo exportado correctamente",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      })
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      Swal.fire("Error", "No se pudo exportar la lista de permisos a Excel", "error")
    } finally {
      setExportando(false)
    }
  }

  // Filtrar permisos
  const permisosFiltrados = permisos.filter(
    (permiso) =>
      permiso.nombrePermiso.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoriaFiltro === "" || permiso.categoria === categoriaFiltro),
  )

  // Paginación
  const indiceUltimoPermiso = paginaActual * permisosPorPagina
  const indicePrimerPermiso = indiceUltimoPermiso - permisosPorPagina
  const permisosActuales = permisosFiltrados.slice(indicePrimerPermiso, indiceUltimoPermiso)

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
  }

  const paginasTotales = Math.ceil(permisosFiltrados.length / permisosPorPagina)

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1)
  }

  const paginaSiguiente = () => {
    if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1)
  }

  // Traducir nivel a español
  const traducirNivel = (nivel) => {
    switch (nivel) {
      case "read":
        return "Lectura"
      case "write":
        return "Escritura"
      case "delete":
        return "Eliminación"
      default:
        return nivel
    }
  }

  // Renderizar spinner durante la carga
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Cargando Permisos...</p>
        </div>
      </div>
    )
  }

  // Renderizar mensaje de error si hay un error
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center text-center">
          <div className="text-red-500 text-5xl mb-4">
            <FontAwesomeIcon icon={faInfoCircle} />
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error al cargar los permisos</h3>
          <p className="text-gray-600 max-w-md">{error}</p>
          <button
            onClick={obtenerPermisos}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-8">Gestión de Permisos</h2>

      <div className="flex justify-between mb-5 w-full max-w-6xl">
        <div className="flex space-x-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
            onClick={manejarAgregarNuevo}
            title="Agregar nuevo permiso"
          >
            <FontAwesomeIcon icon={faPlus} />
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
              <>
                <FontAwesomeIcon icon={faFileExcel} className="mr-1" />
                <FontAwesomeIcon icon={faDownload} className="text-xs" />
              </>
            )}
          </button>
        </div>

        <div className="flex space-x-2 w-2/3">
          <div className="relative w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-4 w-2/3 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Buscar permiso"
          />
        </div>
      </div>

      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permisosActuales.length > 0 ? (
              permisosActuales.map((permiso) => (
                <tr key={permiso._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {permiso.nombrePermiso}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{permiso.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permiso.categoria}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{traducirNivel(permiso.nivel)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        permiso.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {permiso.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                      onClick={() => manejarEditar(permiso)}
                      title="Editar permiso"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                      onClick={() => manejarEliminar(permiso._id)}
                      title="Eliminar permiso"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                      onClick={() => manejarVerDetalles(permiso)}
                      title="Ver detalles"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                    <button
                      className={`${
                        permiso.activo ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"
                      } text-white font-bold py-1 px-2 rounded transition duration-300`}
                      onClick={() => manejarToggleEstado(permiso._id, permiso.activo)}
                      title={permiso.activo ? "Desactivar permiso" : "Activar permiso"}
                    >
                      <FontAwesomeIcon icon={faPowerOff} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron permisos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginasTotales > 1 && (
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
      )}

      <Modal
        isOpen={modalPermisoIsOpen}
        onRequestClose={manejarCerrarModal}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={manejarCerrarModal}>
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4">{editMode ? "Editar Permiso" : "Agregar Nuevo Permiso"}</h2>
          <FormularioPermiso
            permisoSeleccionado={permisoSeleccionado}
            editMode={editMode}
            onClose={manejarCerrarModal}
            onPermisoCreated={manejarPermisoCreado}
          />
        </div>
      </Modal>

      <Modal
        isOpen={modalDetallesIsOpen}
        onRequestClose={manejarCerrarModalDetalles}
        className="fixed inset-0 flex items-center justify-center p-12"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
          <button
            className="absolute top-2 right-4 text-gray-900 hover:text-gray-700"
            onClick={manejarCerrarModalDetalles}
          >
            &times;
          </button>
          <h2 className="text-xl font-semibold mb-3 text-center">Detalles del Permiso</h2>
          {permisoSeleccionado ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre:</p>
                <p className="text-lg font-semibold">{permisoSeleccionado.nombrePermiso}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Descripción:</p>
                <p className="text-base">{permisoSeleccionado.descripcion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Categoría:</p>
                <p className="text-base">{permisoSeleccionado.categoria}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nivel:</p>
                <p className="text-base">{traducirNivel(permisoSeleccionado.nivel)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado:</p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    permisoSeleccionado.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {permisoSeleccionado.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              {permisoSeleccionado.createdAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Creado:</p>
                  <p className="text-base">
                    {new Date(permisoSeleccionado.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              {permisoSeleccionado.updatedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Última actualización:</p>
                  <p className="text-base">
                    {new Date(permisoSeleccionado.updatedAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">Cargando detalles...</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

