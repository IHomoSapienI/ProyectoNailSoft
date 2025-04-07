"use client"

import { useState } from "react"
import Swal from "sweetalert2"

const FormularioBajaInsumo = ({ insumo, onClose, onSubmit }) => {
  const [cantidad, setCantidad] = useState(1)
  const [observaciones, setObservaciones] = useState("")
  const [fechaBaja, setFechaBaja] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar que la cantidad no sea mayor al stock disponible
    if (cantidad > insumo.stock) {
      Swal.fire("Error", "La cantidad no puede ser mayor al stock disponible", "error")
      return
    }

    // Validar que la cantidad sea mayor a 0
    if (cantidad <= 0) {
      Swal.fire("Error", "La cantidad debe ser mayor a 0", "error")
      return
    }

    // Crear objeto con los datos de la baja
    const datosBaja = {
      productoId: insumo._id,
      fechaBaja,
      cantidad,
      observaciones,
    }

    // Enviar datos al componente padre
    onSubmit(datosBaja)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Insumo</label>
        <input
          type="text"
          value={insumo?.nombreInsumo || ""}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-100"
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stock Actual</label>
        <input
          type="text"
          value={insumo?.stock || 0}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-100"
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha de Baja</label>
        <input
          type="date"
          value={fechaBaja}
          onChange={(e) => setFechaBaja(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cantidad a dar de baja</label>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(Number.parseInt(e.target.value))}
          min="1"
          max={insumo?.stock || 1}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows="3"
          placeholder="Motivo de la baja (vencimiento, daño, etc.)"
          required
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Dar de Baja
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioBajaInsumo

