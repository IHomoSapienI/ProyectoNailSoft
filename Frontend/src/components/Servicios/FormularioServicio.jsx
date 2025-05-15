"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { useSidebar } from "../Sidebar/Sidebar"
import { FaUpload, FaSpinner, FaPercent, FaTag } from "react-icons/fa"
import "./formularioServ.css"
import { calcularPrecioConDescuento } from "./obtenerServicios"

const FormularioServicio = ({ servicioSeleccionado, onClose, onServicioActualizado }) => {
  const [formData, setFormData] = useState({
    nombreServicio: "",
    tipoServicio: "",
    tiempo: "",
    precio: "",
    descripcion: "",
    estado: true,
    imagen: null,
  })
  const [tiposServicios, setTiposServicios] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    const obtenerTiposServicios = async () => {
      setIsLoading(true)
      try {
        const respuesta = await axios.get("https://gitbf.onrender.com/api/tiposervicios")
        setTiposServicios(respuesta.data.tiposervicios || [])
      } catch (error) {
        console.error("Error al obtener los tipos de servicios:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los tipos de servicios",
          confirmButtonColor: "#db2777",
        })
      } finally {
        setIsLoading(false)
      }
    }

    obtenerTiposServicios()
  }, [])

  useEffect(() => {
    if (servicioSeleccionado) {
      setFormData({
        nombreServicio: servicioSeleccionado.nombreServicio || "",
        tipoServicio: servicioSeleccionado.tipoServicio ? servicioSeleccionado.tipoServicio._id : "",
        tiempo: servicioSeleccionado.tiempo || "",
        precio: servicioSeleccionado.precio || "",
        descripcion: servicioSeleccionado.descripcion || "",
        estado: servicioSeleccionado.estado || true,
        imagen: null,
      })

      // Si hay una imagen existente, mostrarla en la vista previa
      if (servicioSeleccionado.imagenUrl) {
        setPreviewImage(`https://gitbf.onrender.com/uploads/${servicioSeleccionado.imagenUrl}`)
      }
    }
  }, [servicioSeleccionado])

  const manejarCambio = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "file" && files[0]) {
      // Crear URL para vista previa de la imagen
      setPreviewImage(URL.createObjectURL(files[0]))
      setFormData({
        ...formData,
        [name]: files[0],
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      })
    }
  }

  const manejarCambioTipoServicio = (e) => {
    const tipoServicioId = e.target.value

    // Actualizar el estado del formulario
    setFormData({
      ...formData,
      tipoServicio: tipoServicioId,
    })

    // Si se seleccionó un tipo de servicio, verificar si tiene descuento
    if (tipoServicioId) {
      const tipoSeleccionado = tiposServicios.find((tipo) => tipo._id === tipoServicioId)

      if (tipoSeleccionado && tipoSeleccionado.descuento > 0) {
        // Calcular el precio con descuento si hay un precio ingresado
        if (formData.precio) {
          const precioOriginal = Number.parseFloat(formData.precio)
          const descuento = tipoSeleccionado.descuento / 100
          const precioConDescuento = precioOriginal - precioOriginal * descuento

          // Mostrar mensaje de descuento
          Swal.fire({
            icon: "info",
            title: "Descuento Aplicado",
            html: `
              <div class="text-left">
                <p>Este tipo de servicio tiene un descuento del <b>${tipoSeleccionado.descuento}%</b>.</p>
                <p class="mt-2">Precio original: <span style="text-decoration: line-through;">$${precioOriginal.toFixed(2)}</span></p>
                <p style="color: #e11d48; font-weight: bold;">Precio con descuento: $${precioConDescuento.toFixed(2)}</p>
                ${tipoSeleccionado.esPromocional ? '<p class="mt-2" style="color: #f59e0b;">Este es un tipo promocional.</p>' : ""}
              </div>
            `,
            confirmButtonColor: "#db2777",
          })
        }
      }
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const data = new FormData()

    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key])
      }
    }

    try {
      const token = localStorage.getItem("token")
      let response
      if (servicioSeleccionado) {
        response = await axios.put(`https://gitbf.onrender.com/api/servicios/${servicioSeleccionado._id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })
      } else {
        response = await axios.post("https://gitbf.onrender.com/api/servicios", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Servicio guardado correctamente.",
        confirmButtonColor: "#db2777",
      })
      onServicioActualizado(response.data.servicio)
      onClose()
    } catch (error) {
      console.error("Error al guardar el servicio:", error.response ? error.response.data : error.message)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el servicio. Inténtalo nuevamente.",
        confirmButtonColor: "#db2777",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para calcular el precio con descuento
  const calcularPrecioConDescuentoLocal = () => {
    if (!formData.tipoServicio || !formData.precio) return null

    const tipoSeleccionado = tiposServicios.find((t) => t._id === formData.tipoServicio)
    if (!tipoSeleccionado) return null

    const precioOriginal = Number.parseFloat(formData.precio)
    return calcularPrecioConDescuento(precioOriginal, tipoSeleccionado)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Obtener el tipo de servicio seleccionado
  const tipoServicioSeleccionado = formData.tipoServicio
    ? tiposServicios.find((t) => t._id === formData.tipoServicio)
    : null

  // Verificar si tiene descuento
  const tieneDescuento = tipoServicioSeleccionado && tipoServicioSeleccionado.descuento > 0

  // Calcular precio con descuento
  const precioConDescuento = calcularPrecioConDescuentoLocal()

  return (
    <div className="formulario-moderno bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-pink-600">
        {servicioSeleccionado ? "Editar Servicio" : "Agregar Servicio"}
      </h2>
      <form onSubmit={manejarSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="nombreServicio" className="form-label">
            Nombre Servicio <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            id="nombreServicio"
            name="nombreServicio"
            value={formData.nombreServicio}
            onChange={manejarCambio}
            required
            className="form-input"
            placeholder="Ingrese el nombre del servicio"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipoServicio" className="form-label flex items-center">
            <span>Tipo de Servicio</span> <span className="text-pink-500 ml-1">*</span>
          </label>
          <select
            id="tipoServicio"
            name="tipoServicio"
            value={formData.tipoServicio}
            onChange={manejarCambioTipoServicio}
            required
            className="form-select"
          >
            <option value="">Seleccione la categoría a la que pertenece el servicio</option>
            {tiposServicios.map((tipo) => (
              <option key={tipo._id} value={tipo._id}>
                {tipo.nombreTs}
                {tipo.descuento > 0 ? ` (${tipo.descuento}% descuento)` : ""}
                {tipo.esPromocional ? " - Promocional" : ""}
              </option>
            ))}
          </select>

          {tieneDescuento && (
            <div className="mt-2 p-3 bg-pink-50 border border-pink-200 rounded-md text-sm">
              <div className="flex items-center mb-1">
                <FaPercent className="text-pink-500 mr-2" />
                <p className="text-pink-700 font-semibold">Descuento aplicado: {tipoServicioSeleccionado.descuento}%</p>
              </div>

              {formData.precio && (
                <div className="flex items-center mt-2">
                  <span className="line-through text-gray-500 mr-2">
                    ${Number.parseFloat(formData.precio).toFixed(2)}
                  </span>
                  <span className="font-bold text-pink-600">${precioConDescuento.toFixed(2)}</span>
                </div>
              )}

              {tipoServicioSeleccionado.esPromocional && (
                <div className="flex items-center mt-2 text-amber-600">
                  <FaTag className="mr-2" />
                  <span>Tipo promocional</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="tiempo" className="form-label">
              Duración (minutos) <span className="text-pink-500">*</span>
            </label>
            <input
              type="number"
              id="tiempo"
              name="tiempo"
              value={formData.tiempo}
              onChange={manejarCambio}
              required
              className="form-input"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Ingrese la duración del servicio en minutos.</p>
          </div>

          <div className="form-group">
            <label htmlFor="precio" className="form-label">
              Precio <span className="text-pink-500">*</span>
            </label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={manejarCambio}
              required
              step="0.01"
              className="form-input"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Ingrese el precio del servicio (use punto para decimales).</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion" className="form-label">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={manejarCambio}
            className="form-textarea"
            rows="3"
            placeholder="Ingrese la descripción del servicio"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="estado" className="form-label">
            Estado del Servicio
          </label>
          <select id="estado" name="estado" value={formData.estado} onChange={manejarCambio} className="form-select">
            <option value={true}>Activo</option>
            <option value={false}>Inactivo</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="imagen" className="form-label">
            Imagen del Servicio {!servicioSeleccionado && <span className="text-pink-500">*</span>}
          </label>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-pink-300 border-dashed rounded-md hover:border-pink-500 transition-colors">
                <div className="space-y-1 text-center">
                  {!previewImage ? (
                    <>
                      <FaUpload className="mx-auto h-12 w-12 text-pink-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="imagen"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                        >
                          <span>Subir un archivo</span>
                          <input
                            id="imagen"
                            name="imagen"
                            type="file"
                            className="sr-only"
                            onChange={manejarCambio}
                            required={!servicioSeleccionado}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    </>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Vista previa"
                        className="max-h-40 mx-auto rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null)
                          setFormData({ ...formData, imagen: null })
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                      >
                        ×
                      </button>
                      <p className="mt-2 text-sm text-pink-600">
                        Haga clic para cambiar la imagen
                        <input
                          id="imagen"
                          name="imagen"
                          type="file"
                          className="sr-only"
                          onChange={manejarCambio}
                          accept="image/*"
                        />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span>{servicioSeleccionado ? "Actualizando..." : "Agregando..."}</span>
              </div>
            ) : servicioSeleccionado ? (
              "Actualizar Servicio"
            ) : (
              "Agregar Servicio"
            )}
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioServicio

