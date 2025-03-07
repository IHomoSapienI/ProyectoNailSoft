"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import "./Formulario.css"

export default function FormularioUsuario({ onClose, onUsuarioActualizado, usuarioEditando, roles }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    password: "",
    confirmPassword: "",
    rol: "",
    tipoUsuario: "",
    estado: "Activo", // Cambiado de boolean a string
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (usuarioEditando) {
      // Find the role object to determine the user type
      const userRole = roles.find((r) => r._id === usuarioEditando.rol)
      const tipoUsuario = userRole
        ? userRole.nombreRol.toLowerCase() === "cliente"
          ? "cliente"
          : userRole.nombreRol.toLowerCase() === "empleado"
            ? "empleado"
            : ""
        : ""

      setFormData((prevState) => ({
        ...prevState,
        nombre: usuarioEditando.nombre || "",
        apellido: usuarioEditando.apellido || "",
        email: usuarioEditando.email || "",
        celular: usuarioEditando.celular || "",
        rol: usuarioEditando.rol || "",
        tipoUsuario: tipoUsuario,
        estado: usuarioEditando.estado || "Activo",
      }))
    } else {
      // For new users, set default role if available
      const clienteRole = roles.find((r) => r.nombreRol.toLowerCase() === "cliente")
      if (clienteRole) {
        setFormData((prevState) => ({
          ...prevState,
          rol: clienteRole._id,
          tipoUsuario: "cliente",
        }))
      }
    }
  }, [usuarioEditando, roles])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      // Convertir el checkbox a 'Activo'/'Inactivo'
      setFormData((prevState) => ({
        ...prevState,
        [name]: e.target.checked ? "Activo" : "Inactivo",
      }))
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }

    // Si se selecciona un rol, actualizar automáticamente el tipoUsuario
    if (name === "rol") {
      const selectedRole = roles.find((r) => r._id === value)
      if (selectedRole) {
        const tipoUsuario =
          selectedRole.nombreRol.toLowerCase() === "cliente"
            ? "cliente"
            : selectedRole.nombreRol.toLowerCase() === "empleado"
              ? "empleado"
              : ""
        setFormData((prevState) => ({
          ...prevState,
          tipoUsuario,
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validar campos obligatorios
    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.email ||
      !formData.celular ||
      !formData.rol ||
      (!usuarioEditando && (!formData.password || !formData.confirmPassword))
    ) {
      setError("Todos los campos son obligatorios")
      setLoading(false)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Todos los campos son obligatorios",
      })
      return
    }

    // Validar coincidencia de contraseñas
    if (!usuarioEditando && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      })
      return
    }

    try {
      const url = usuarioEditando
        ? `https://gitbf.onrender.com/api/usuarios/${usuarioEditando._id}`
        : "https://gitbf.onrender.com/api/usuarios"
      const method = usuarioEditando ? "PUT" : "POST"
      const token = localStorage.getItem("token")

      // Preparar los datos a enviar
      const data = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        celular: formData.celular,
        rol: formData.rol,
        tipoUsuario: formData.tipoUsuario,
        estado: formData.estado === "Activo", // Booleano para estado general
        estadocliente: formData.estado, // Enviar como string: 'Activo' o 'Inactivo'
        ...(!usuarioEditando && {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      }

      // Agregar campos específicos para empleados
      if (formData.tipoUsuario === "empleado") {
        data.telefonoempleado = formData.celular // Usar el celular como teléfono del empleado
        data.celularempleado = formData.celular
        data.estadoempleado = formData.estado
      }

      console.log("Datos a enviar:", data)

      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: usuarioEditando ? "Actualización Exitosa" : "Registro Exitoso",
          text: usuarioEditando ? "Usuario actualizado exitosamente!" : "Usuario creado exitosamente!",
        })
        onUsuarioActualizado()
        onClose()
      }
    } catch (error) {
      console.error("Error completo:", error)
      console.error("Respuesta del servidor:", error.response?.data)
      console.error("Error:", error)
      setError(error.response?.data?.msg || "Error al procesar la solicitud")
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.msg || "Error al procesar la solicitud",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="formulario bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {usuarioEditando ? "Editar Usuario" : "Agregar Usuario"}
      </h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese su nombre"
          />
        </div>

        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese su apellido"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="ejemplo@dominio.com"
          />
        </div>

        <div>
          <label htmlFor="celular" className="block text-sm font-medium text-gray-700">
            Celular <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese su número de celular"
          />
        </div>

        {!usuarioEditando && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={7}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Ingrese su contraseña"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={7}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Confirme su contraseña"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Seleccionar rol</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.nombreRol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* Campo oculto para asegurar que tipoUsuario siempre se envíe */}
        <input type="hidden" name="tipoUsuario" value={formData.tipoUsuario} />

        <div className="flex justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Procesando..." : usuarioEditando ? "Actualizar" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

