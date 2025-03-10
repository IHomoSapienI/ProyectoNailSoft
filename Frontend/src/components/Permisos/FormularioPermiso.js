"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"

const FormularioPermiso = ({ permisoSeleccionado, editMode, onClose, onPermisoCreated }) => {
  const [formData, setFormData] = useState({
    nombrePermiso: "",
    descripcion: "",
    activo: true,
    categoria: "",
    nivel: "read",
  })
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (editMode && permisoSeleccionado) {
      setFormData({
        nombrePermiso: permisoSeleccionado.nombrePermiso || "",
        descripcion: permisoSeleccionado.descripcion || "",
        activo: permisoSeleccionado.activo !== undefined ? permisoSeleccionado.activo : true,
        categoria: permisoSeleccionado.categoria || "",
        nivel: permisoSeleccionado.nivel || "read",
      })
    }
  }, [editMode, permisoSeleccionado])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)

    try {
      const token = localStorage.getItem("token")
      let response

      if (editMode && permisoSeleccionado) {
        // Actualizar permiso existente
        response = await axios.put(`https://gitbf.onrender.com/api/permisos/${permisoSeleccionado._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        Swal.fire({
          icon: "success",
          title: "Permiso actualizado exitosamente",
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        // Crear nuevo permiso
        response = await axios.post("https://gitbf.onrender.com/api/permisos", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        Swal.fire({
          icon: "success",
          title: "Permiso creado exitosamente",
          showConfirmButton: false,
          timer: 1500,
        })
      }

      if (onPermisoCreated) {
        onPermisoCreated(response.data)
      }
      onClose()
    } catch (error) {
      console.error("Error al guardar el permiso:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.msg || "No se pudo guardar el permiso. Por favor, inténtelo de nuevo.",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg">
      <div>
        <label htmlFor="nombrePermiso" className="block text-sm font-medium text-gray-700">
          Nombre del Permiso: <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nombrePermiso"
          name="nombrePermiso"
          value={formData.nombrePermiso}
          onChange={handleChange}
          required
          minLength={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">Ejemplo: crearUsuarios, verRoles, eliminarProductos.</p>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          required
          minLength={10}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Descripción detallada del permiso"
        />
      </div>

      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Selecciona una categoría</option>

          <option value="citas">Citas</option>
          <option value="clientes">Clientes</option>
          <option value="compras">Compras</option>
          <option value="configuración">Configuración</option>
          <option value="empleados">Empleados</option>
          <option value="insumos">Insumos</option>
          <option value="productos">Productos</option>
          <option value="proveedores">Proveedores</option>
          <option value="reportes">Reportes</option>
          <option value="roles">Roles</option>
          <option value="permisos">Permisos</option>
          <option value="servicios">Servicios</option>
          <option value="usuarios">Usuarios</option>
          <option value="ventaServicios">Venta de Servicios</option>
          <option value="ventaProductos">Venta de Productos</option>
        </select>
      </div>

      <div>
        <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">
          Nivel <span className="text-red-500">*</span>
        </label>
        <select
          id="nivel"
          name="nivel"
          value={formData.nivel}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="read">Lectura</option>
          <option value="write">Escritura</option>
          <option value="delete">Eliminación</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Lectura: solo ver, Escritura: crear/editar, Eliminación: eliminar registros
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="activo"
          name="activo"
          checked={formData.activo}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
          Activo
        </label>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="submit"
          disabled={cargando}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
        >
          {cargando ? (
            <>
              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-pink rounded-full mr-2"></div>
              <span>{editMode ? "Actualizando..." : "Creando..."}</span>
            </>
          ) : (
            <span>{editMode ? "Actualizar Permiso" : "Crear Permiso"}</span>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={cargando}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioPermiso

