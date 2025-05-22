"use client"

import { useState } from "react"

const FormularioBajaInsumo = ({ insumo, onClose, onSubmit }) => {
  const [cantidad, setCantidad] = useState(1)
  const [observaciones, setObservaciones] = useState("")
  const [fechaBaja, setFechaBaja] = useState(new Date().toISOString().split("T")[0])

  // Estados para errores de validación
  const [errores, setErrores] = useState({
    cantidad: "",
    fechaBaja: "",
    observaciones: "",
  })

  // Función para validar la cantidad
  const validarCantidad = (valor) => {
    if (isNaN(valor) || valor === "") {
      return "La cantidad debe ser un número"
    }

    if (valor <= 0) {
      return "La cantidad debe ser mayor a cero"
    }

    if (valor > insumo.stock) {
      return "La cantidad no puede ser mayor al stock disponible"
    }

    return ""
  }

  // Función para validar la fecha
  const validarFecha = (fecha) => {
    if (!fecha) {
      return "La fecha no puede estar vacía"
    }

    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    const fechaSeleccionada = new Date(fecha)
    fechaSeleccionada.setHours(0, 0, 0, 0)

    if (fechaSeleccionada > fechaActual) {
      return "La fecha no puede ser futura"
    }

    return ""
  }

  // Función para validar las observaciones
  const validarObservaciones = (texto) => {
    if (!texto || texto.trim() === "") {
      return "Las observaciones no pueden estar vacías"
    }

    if (texto.length > 300) {
      return "Las observaciones no pueden exceder los 300 caracteres"
    }

    if (!/^[a-zA-Z0-9\s.,]+$/.test(texto)) {
      return "Las observaciones solo pueden contener caracteres alfanuméricos, espacios, puntos y comas"
    }

    return ""
  }

  // Manejadores de cambio con validación
  const handleCantidadChange = (e) => {
    const valor = e.target.value
    setCantidad(Number(valor))
    setErrores({
      ...errores,
      cantidad: validarCantidad(valor),
    })
  }

  const handleFechaChange = (e) => {
    const valor = e.target.value
    setFechaBaja(valor)
    setErrores({
      ...errores,
      fechaBaja: validarFecha(valor),
    })
  }

  const handleObservacionesChange = (e) => {
    const valor = e.target.value
    setObservaciones(valor)
    setErrores({
      ...errores,
      observaciones: validarObservaciones(valor),
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    const errorCantidad = validarCantidad(cantidad)
    const errorFecha = validarFecha(fechaBaja)
    const errorObservaciones = validarObservaciones(observaciones)

    // Actualizar errores
    setErrores({
      cantidad: errorCantidad,
      fechaBaja: errorFecha,
      observaciones: errorObservaciones,
    })

    // Si hay errores, no enviar el formulario
    if (errorCantidad || errorFecha || errorObservaciones) {
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
          onChange={handleFechaChange}
          className={`mt-1 block w-full rounded-md ${
            errores.fechaBaja ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          required
        />
        {errores.fechaBaja && <p className="mt-1 text-sm text-red-600">{errores.fechaBaja}</p>}
        <p className="mt-1 text-xs text-gray-500">La fecha debe ser actual o pasada, no puede ser futura.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cantidad a dar de baja</label>
        <input
          type="number"
          value={cantidad}
          onChange={handleCantidadChange}
          min="1"
          max={insumo?.stock || 1}
          className={`mt-1 block w-full rounded-md ${
            errores.cantidad ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          required
        />
        {errores.cantidad && <p className="mt-1 text-sm text-red-600">{errores.cantidad}</p>}
        <p className="mt-1 text-xs text-gray-500">
          La cantidad debe ser mayor a 0 y no puede exceder el stock actual ({insumo?.stock || 0}).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Observaciones
          <span className="ml-1 text-xs text-gray-500">({observaciones.length}/300)</span>
        </label>
        <textarea
          value={observaciones}
          onChange={handleObservacionesChange}
          className={`mt-1 block w-full rounded-md ${
            errores.observaciones ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          rows="3"
          placeholder="Motivo de la baja (vencimiento, daño, etc.)"
          required
        />
        {errores.observaciones && <p className="mt-1 text-sm text-red-600">{errores.observaciones}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Solo se permiten caracteres alfanuméricos, espacios, puntos y comas. Máximo 300 caracteres.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="submit"
          disabled={errores.cantidad || errores.fechaBaja || errores.observaciones}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            errores.cantidad || errores.fechaBaja || errores.observaciones ? "opacity-50 cursor-not-allowed" : ""
          }`}
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
