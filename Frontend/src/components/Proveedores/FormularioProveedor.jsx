"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import axios from "axios"

const FormularioProveedor = ({ proveedor, onProveedorActualizado, onClose }) => {
  const [nombreProveedor, setNombreProveedor] = useState("")
  const [contacto, setContacto] = useState("")
  const [numeroContacto, setNumeroContacto] = useState("")
  const [provee, setProvee] = useState("")
  const [estado, setEstado] = useState(true)
  const [modoEdicion, setModoEdicion] = useState(false)
  const apiUrl = "https://gitbf.onrender.com/api/proveedores"

  // Estados para errores de validación
  const [errores, setErrores] = useState({
    nombreProveedor: "",
    contacto: "",
    numeroContacto: "",
    estado: "",
  })

  useEffect(() => {
    if (proveedor) {
      setNombreProveedor(proveedor.nombreProveedor)
      setContacto(proveedor.contacto)
      setNumeroContacto(proveedor.numeroContacto)
      setProvee(proveedor.provee)
      setEstado(proveedor.estado)
      setModoEdicion(true)
    } else {
      setModoEdicion(false)
    }
  }, [proveedor])

  // Función para validar el nombre del proveedor
  const validarNombreProveedor = (nombre) => {
    if (!nombre || nombre.trim() === "") {
      return "El nombre del proveedor no puede estar vacío"
    }

    if (nombre.length < 3 || nombre.length > 20) {
      return "El nombre del proveedor debe tener entre 3 y 20 caracteres"
    }

    // Verificar si contiene caracteres no alfanuméricos
    if (!/^[a-zA-Z0-9\s]+$/.test(nombre)) {
      return "El nombre del proveedor solo puede contener letras, números y espacios"
    }

    return ""
  }

  // Función para validar el contacto
  const validarContacto = (contacto) => {
    if (!contacto || contacto.trim() === "") {
      return "El contacto no puede estar vacío"
    }

    if (contacto.length < 3 || contacto.length > 20) {
      return "El contacto debe tener entre 3 y 20 caracteres"
    }

    // Verificar si contiene caracteres no alfabéticos (solo letras)
    if (!/^[a-zA-Z\s]+$/.test(contacto)) {
      return "El contacto solo puede contener letras y espacios"
    }

    return ""
  }

  // Función para validar el número de contacto
  const validarNumeroContacto = (numero) => {
    if (!numero || numero.trim() === "") {
      return "El número de contacto no puede estar vacío"
    }

    // Verificar si solo contiene números
    if (!/^\d+$/.test(numero)) {
      return "El número de contacto solo puede contener dígitos"
    }

    // Verificar longitud
    if (numero.length > 12) {
      return "El número de contacto debe tener menos de 12 dígitos"
    }

    if (numero.length <= 7) {
      return "El número de contacto debe tener más de 7 dígitos"
    }

    return ""
  }

  // Validar campos al cambiar
  const handleNombreChange = (e) => {
    const valor = e.target.value
    setNombreProveedor(valor)
    setErrores({
      ...errores,
      nombreProveedor: validarNombreProveedor(valor),
    })
  }

  const handleContactoChange = (e) => {
    const valor = e.target.value
    setContacto(valor)
    setErrores({
      ...errores,
      contacto: validarContacto(valor),
    })
  }

  const handleNumeroContactoChange = (e) => {
    const valor = e.target.value
    setNumeroContacto(valor)
    setErrores({
      ...errores,
      numeroContacto: validarNumeroContacto(valor),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    const errorNombre = validarNombreProveedor(nombreProveedor)
    const errorContacto = validarContacto(contacto)
    const errorNumero = validarNumeroContacto(numeroContacto)

    // Actualizar errores
    setErrores({
      nombreProveedor: errorNombre,
      contacto: errorContacto,
      numeroContacto: errorNumero,
      estado: "",
    })

    // Si hay errores, no enviar el formulario
    if (errorNombre || errorContacto || errorNumero) {
      return
    }

    const proveedorData = {
      nombreProveedor,
      contacto,
      numeroContacto,
      provee,
      estado,
    }

    try {
      let response
      if (modoEdicion) {
        response = await axios.put(`${apiUrl}/${proveedor._id}`, proveedorData)
      } else {
        response = await axios.post(apiUrl, proveedorData)
      }

      Swal.fire({
        icon: "success",
        title: modoEdicion ? "Proveedor actualizado exitosamente" : "Proveedor creado exitosamente",
        confirmButtonText: "Ok",
      })

      if (onProveedorActualizado) {
        onProveedorActualizado(response.data)
      }

      // Cerrar el formulario después de guardar
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error("Error al guardar el proveedor:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.mensaje || "Error al guardar el proveedor",
      })
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {modoEdicion ? "Editar Proveedor" : "Agregar Proveedor"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombreProveedor" className="block text-sm font-medium text-gray-700">
            Nombre del Proveedor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombreProveedor"
            value={nombreProveedor}
            onChange={handleNombreChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
              errores.nombreProveedor ? "border-red-500" : ""
            }`}
            placeholder="Ingrese el nombre del proveedor"
          />
          {errores.nombreProveedor && <p className="mt-1 text-sm text-red-600">{errores.nombreProveedor}</p>}
          <p className="mt-1 text-xs text-gray-500">
            El nombre debe tener entre 3 y 20 caracteres y solo puede contener letras, números y espacios.
          </p>
        </div>

        <div>
          <label htmlFor="contacto" className="block text-sm font-medium text-gray-700">
            Contacto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contacto"
            value={contacto}
            onChange={handleContactoChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
              errores.contacto ? "border-red-500" : ""
            }`}
            placeholder="Ingrese el contacto"
          />
          {errores.contacto && <p className="mt-1 text-sm text-red-600">{errores.contacto}</p>}
          <p className="mt-1 text-xs text-gray-500">
            El contacto debe tener entre 3 y 20 caracteres y solo puede contener letras y espacios.
          </p>
        </div>

        <div>
          <label htmlFor="numeroContacto" className="block text-sm font-medium text-gray-700">
            Número de Contacto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="numeroContacto"
            value={numeroContacto}
            onChange={handleNumeroContactoChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
              errores.numeroContacto ? "border-red-500" : ""
            }`}
            placeholder="Ingrese el número de contacto"
          />
          {errores.numeroContacto && <p className="mt-1 text-sm text-red-600">{errores.numeroContacto}</p>}
          <p className="mt-1 text-xs text-gray-500">
            El número debe tener entre 8 y 12 dígitos y solo puede contener números.
          </p>
        </div>

        <div>
          <label htmlFor="provee" className="block text-sm font-medium text-gray-700">
            Provee <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="provee"
            value={provee}
            onChange={(e) => setProvee(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese lo que provee"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="estado"
            checked={estado}
            onChange={(e) => setEstado(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <label htmlFor="estado" className="ml-2 block text-sm text-gray-900">
            Activo
          </label>
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            disabled={errores.nombreProveedor || errores.contacto || errores.numeroContacto}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              errores.nombreProveedor || errores.contacto || errores.numeroContacto
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {modoEdicion ? "Actualizar Proveedor" : "Agregar Proveedor"}
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

export default FormularioProveedor