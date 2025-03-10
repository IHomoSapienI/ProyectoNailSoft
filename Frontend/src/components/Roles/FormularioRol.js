"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import "../Formulario.css"

const FormularioRol = ({ rolSeleccionado, onRolActualizado, onClose }) => {
  const [nombreRol, setNombreRol] = useState("")
  const [permisos, setPermisos] = useState([])
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([])
  const [activo, setActivo] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [modoEdicion, setModoEdicion] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
  const [cargando, setCargando] = useState(false)

  const categorias = [
    "categoriaProductos",
    "citas",
    "clientes",
    "compras",
    "configuración",
    "empleados",
    "insumos",
    "permisos",
    "productos",
    "proveedores",
    "reportes",
    "roles",
    "servicios",
    "usuarios",
    "ventaProductos",
    "ventaServicios",
];


  useEffect(() => {
    const cargarPermisos = async () => {
      setCargando(true)
      setMensaje("")
      try {
        // Obtener el token de localStorage
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No se encontró token de autenticación")
        }

        // Realizar la solicitud con el token en el encabezado
        const response = await fetch("https://gitbf.onrender.com/api/permisos", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Error en respuesta:", errorData)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setPermisos(data.permisos || [])

        if (data.permisos && data.permisos.length === 0) {
          setMensaje("No hay permisos disponibles")
        }
      } catch (error) {
        console.error("Error al cargar permisos:", error)
        setMensaje(`Error al cargar permisos: ${error.message}`)

        // Si el error es de autenticación, mostrar un mensaje específico
        if (error.message.includes("401")) {
          Swal.fire({
            icon: "error",
            title: "Error de autenticación",
            text: "Tu sesión ha expirado o no tienes permiso para acceder a esta información.",
            confirmButtonText: "Entendido",
          })
        }
      } finally {
        setCargando(false)
      }
    }

    cargarPermisos()
  }, [])

  useEffect(() => {
    if (rolSeleccionado) {
      setNombreRol(rolSeleccionado.nombreRol || "")
      setPermisosSeleccionados(
        rolSeleccionado.permisoRol.map((permiso) => (typeof permiso === "object" ? permiso._id : permiso)),
      )
      setActivo(rolSeleccionado.estadoRol || true)
      setModoEdicion(true)
    } else {
      setNombreRol("")
      setPermisosSeleccionados([])
      setActivo(true)
      setModoEdicion(false)
    }
  }, [rolSeleccionado])

  const manejarCambioCheckbox = (permisoId) => {
    setPermisosSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(permisoId)
        ? prevSeleccionados.filter((id) => id !== permisoId)
        : [...prevSeleccionados, permisoId],
    )
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()

    if (permisosSeleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Advertencia",
        text: "Debes seleccionar al menos un permiso para el rol",
        confirmButtonText: "Entendido",
      })
      return
    }

    const nuevoRol = { nombreRol, permisoRol: permisosSeleccionados, estadoRol: activo }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      const url = modoEdicion
        ? `https://gitbf.onrender.com/api/roles/${rolSeleccionado._id}`
        : "https://gitbf.onrender.com/api/roles"

      const metodo = modoEdicion ? "PUT" : "POST"
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoRol),
      })

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: modoEdicion ? "Rol actualizado exitosamente" : "Rol creado exitosamente",
          confirmButtonText: "Ok",
        })

        if (onRolActualizado) onRolActualizado()
        setNombreRol("")
        setPermisosSeleccionados([])
        setActivo(true)
        if (onClose) onClose()
      } else {
        const errorData = await response.json()
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.msg || errorData.message || response.statusText,
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en la solicitud",
        text: error.message,
      })
    }
  }

  return (
    <div className="formulario max-h-96 overflow-y-auto">
      <form onSubmit={manejarEnvio} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre del Rol: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombreRol}
            onChange={(e) => setNombreRol(e.target.value)}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Ingrese nombre del rol"
          />
          <p className="mt-1 text-xs text-gray-500">Ejemplo: Administrador, Usuario, Empleado.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría de Permisos:</label>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Permisos:</label>
          {cargando ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 center" role="status">
                <span className="sr-only">Cargando...</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Cargando permisos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-2">
              {permisos.length > 0 ? (
                permisos
                  .filter((permiso) => !categoriaSeleccionada || permiso.categoria === categoriaSeleccionada)
                  .map((permiso) => (
                    <div key={permiso._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permiso._id}
                        value={permiso._id}
                        checked={permisosSeleccionados.includes(permiso._id)}
                        onChange={() => manejarCambioCheckbox(permiso._id)}
                        disabled={!permiso.activo}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <label
                        htmlFor={permiso._id}
                        className={`text-sm ${!permiso.activo ? "text-gray-400" : "text-gray-700"}`}
                      >
                        {permiso.nombrePermiso} {permiso.activo ? "" : "(Inactivo)"}
                      </label>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500">{mensaje || "No hay permisos disponibles"}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 mr-2">Activo:</label>
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
        </div>

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {modoEdicion ? "Actualizar Rol" : "Agregar Rol"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cerrar
          </button>
        </div>

        {mensaje && !cargando && <div className="mt-4 p-2 text-red-600 text-sm bg-red-100 rounded">{mensaje}</div>}
      </form>
    </div>
  )
}

export default FormularioRol

