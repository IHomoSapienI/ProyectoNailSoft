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

  const handleSubmit = async (e) => {
    e.preventDefault()

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
    } catch (error) {
      console.error("Error al guardar el proveedor:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al guardar el proveedor",
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
            onChange={(e) => setNombreProveedor(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese el nombre del proveedor"
          />
        </div>

        <div>
          <label htmlFor="contacto" className="block text-sm font-medium text-gray-700">
            Contacto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contacto"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese el contacto"
          />
        </div>

        <div>
          <label htmlFor="numeroContacto" className="block text-sm font-medium text-gray-700">
            Número de Contacto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="numeroContacto"
            value={numeroContacto}
            onChange={(e) => setNumeroContacto(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese el número de contacto"
          />
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

