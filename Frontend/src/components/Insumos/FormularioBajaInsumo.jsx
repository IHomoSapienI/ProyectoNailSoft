"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExclamationTriangle, faTimes } from "@fortawesome/free-solid-svg-icons"

const FormularioBajaInsumo = ({ insumo, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    cantidad: 1,
    observaciones: "",
    fechaBaja: new Date().toISOString().split("T")[0],
  })

  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    cantidad: "",
    fechaBaja: "",
    observaciones: "",
  })

  // Funciones de validación del lado del cliente
  const validarCantidad = (valor) => {
    if (isNaN(valor) || valor === "" || valor === null) {
      return "La cantidad debe ser un número válido"
    }

    const num = Number(valor)

    if (num <= 0) {
      return "La cantidad debe ser mayor a cero"
    }

    if (!Number.isInteger(num)) {
      return "La cantidad debe ser un número entero"
    }

    if (num > (insumo?.stock || 0)) {
      return `La cantidad no puede ser mayor al stock disponible (${insumo?.stock || 0})`
    }

    return ""
  }

  const validarFecha = (fecha) => {
    if (!fecha) {
      return "La fecha de baja es requerida"
    }

    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    const fechaSeleccionada = new Date(fecha)
    fechaSeleccionada.setHours(0, 0, 0, 0)

    if (fechaSeleccionada > fechaActual) {
      return "La fecha no puede ser futura"
    }

    // Validar que no sea muy antigua (más de 1 año)
    const unAñoAtras = new Date()
    unAñoAtras.setFullYear(unAñoAtras.getFullYear() - 1)
    unAñoAtras.setHours(0, 0, 0, 0)

    if (fechaSeleccionada < unAñoAtras) {
      return "La fecha no puede ser anterior a un año"
    }

    return ""
  }

  const validarObservaciones = (texto) => {
    if (!texto || texto.trim() === "") {
      return "Las observaciones son requeridas"
    }

    const textoTrimmed = texto.trim()

    if (textoTrimmed.length < 10) {
      return "Las observaciones deben tener al menos 10 caracteres"
    }

    if (textoTrimmed.length > 300) {
      return "Las observaciones no pueden exceder los 300 caracteres"
    }

    // Permitir más caracteres para observaciones
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:()\-¿?¡!]+$/.test(textoTrimmed)) {
      return "Las observaciones contienen caracteres no válidos"
    }

    return ""
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newValue = value

    // Validación en tiempo real
    let errorMessage = ""
    if (name === "cantidad") {
      errorMessage = validarCantidad(newValue)
    } else if (name === "fechaBaja") {
      errorMessage = validarFecha(newValue)
    } else if (name === "observaciones") {
      errorMessage = validarObservaciones(newValue)
    }

    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage,
    })

    setFormData({
      ...formData,
      [name]: newValue,
    })
  }

  const validateForm = () => {
    const errors = {
      cantidad: validarCantidad(formData.cantidad),
      fechaBaja: validarFecha(formData.fechaBaja),
      observaciones: validarObservaciones(formData.observaciones),
    }

    setFieldErrors(errors)

    return !Object.values(errors).some((error) => error !== "")
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    // Crear objeto con los datos de la baja
    const datosBaja = {
      insumoId: insumo._id,
      fechaBaja: formData.fechaBaja,
      cantidad: Number(formData.cantidad),
      observaciones: formData.observaciones.trim(),
    }

    // Enviar datos al componente padre
    onSubmit(datosBaja)
    setLoading(false)
  }

  // Calcular stock restante después de la baja
  const stockRestante = (insumo?.stock || 0) - Number(formData.cantidad || 0)

  return (
    <div className="p-6 w-full mx-auto" style={{ maxWidth: "90%", minWidth: "600px" }}>
      <h2 className="text-2xl font-semibold mb-6 text-center text-pink-600">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
        Dar de Baja Insumo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información del Insumo (Solo lectura) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">📦 Información del Insumo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Nombre del Insumo</label>
              <input
                type="text"
                value={insumo?.nombreInsumo || ""}
                className="form-input w-full bg-gray-100"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Actual</label>
              <input
                type="text"
                value={`${insumo?.stock || 0} unidades`}
                className="form-input w-full bg-gray-100"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Campos del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="fechaBaja" className="form-label">
              Fecha de Baja <span className="text-pink-500">*</span>
            </label>
            <input
              type="date"
              id="fechaBaja"
              name="fechaBaja"
              value={formData.fechaBaja}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className={`form-input w-full ${fieldErrors.fechaBaja ? "border-red-500" : ""}`}
              required
            />
            {fieldErrors.fechaBaja && <p className="text-red-500 text-sm mt-1">{fieldErrors.fechaBaja}</p>}
            <p className="text-xs text-gray-500 mt-1">La fecha debe ser actual o pasada</p>
          </div>

          <div className="form-group">
            <label htmlFor="cantidad" className="form-label">
              Cantidad a dar de baja <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                min="1"
                max={insumo?.stock || 1}
                step="1"
                className={`form-input w-full ${fieldErrors.cantidad ? "border-red-500" : ""}`}
                placeholder="Cantidad"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 text-sm">unidades</span>
              </div>
            </div>
            {fieldErrors.cantidad && <p className="text-red-500 text-sm mt-1">{fieldErrors.cantidad}</p>}
            <p className="text-xs text-gray-500 mt-1">Máximo disponible: {insumo?.stock || 0} unidades</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="observaciones" className="form-label">
            Observaciones <span className="text-pink-500">*</span>
            <span className="ml-2 text-xs text-gray-500">({formData.observaciones.length}/300)</span>
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            maxLength={300}
            className={`form-input w-full resize-none ${fieldErrors.observaciones ? "border-red-500" : ""}`}
            rows={4}
            placeholder="Motivo de la baja (vencimiento, daño, deterioro, etc.)"
            required
          />
          {fieldErrors.observaciones && <p className="text-red-500 text-sm mt-1">{fieldErrors.observaciones}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Describa detalladamente el motivo de la baja (mínimo 10 caracteres)
          </p>
        </div>

        {/* Resumen de la operación */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-pink-800 mb-2">📊 Resumen de la Baja</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-pink-700">
            <div>
              <span className="font-medium">Stock Actual:</span>
              <span className="ml-2 font-bold">{insumo?.stock || 0} unidades</span>
            </div>
            <div>
              <span className="font-medium">Cantidad a dar de baja:</span>
              <span className="ml-2 font-bold text-red-600">{formData.cantidad || 0} unidades</span>
            </div>
            <div>
              <span className="font-medium">Stock Restante:</span>
              <span className={`ml-2 font-bold ${stockRestante <= 0 ? "text-red-600" : "text-green-600"}`}>
                {stockRestante} unidades
              </span>
            </div>
          </div>
          {stockRestante <= 0 && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
              ⚠️ <strong>Advertencia:</strong> Esta baja dejará el insumo sin stock disponible.
            </div>
          )}
        </div>

        <div className="btn-container mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500"
            disabled={loading || Object.values(fieldErrors).some((error) => error !== "")}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                Dar de Baja
              </>
            )}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioBajaInsumo