"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"
import Swal from "sweetalert2"
import { FaCalendarAlt, FaClock, FaUser, FaCut, FaTimes } from "react-icons/fa"

export default function FormularioCita({ cita, fechaSeleccionada, servicioSeleccionado, onCitaActualizada, onClose }) {
  const location = useLocation()
  const totalDesdeSeleccionarServicios = location.state?.total || 0
  const empleadoIdPredeterminado = location.state?.empleadoId || ""
  const serviciosDesdeSeleccionarServicios = location.state?.serviciosSeleccionados || []
  const vieneDePaginaServicios = location.state?.fromSeleccionarServicios || false

  const [formData, setFormData] = useState({
    nombreempleado: empleadoIdPredeterminado,
    nombrecliente: "",
    fechacita: fechaSeleccionada ? fechaSeleccionada.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    horacita: "",
    duracionTotal: 0,
    montototal: 0,
    estadocita: "Pendiente",
  })

  const [empleados, setEmpleados] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [nuevoServicio, setNuevoServicio] = useState({ id: "", nombre: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [horariosDisponibles, setHorariosDisponibles] = useState([])
  const [horaSeleccionada, setHoraSeleccionada] = useState("")
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([])
  const [paso, setPaso] = useState(1)
  const [currentMonth, setCurrentMonth] = useState(fechaSeleccionada ? new Date(fechaSeleccionada) : new Date())

  // Definir la función actualizarHorariosDisponibles con useCallback ANTES de usarla
  const actualizarHorariosDisponibles = useCallback(
    async (fecha, empleadoId) => {
      const empleado = empleados.find((e) => e._id === empleadoId)
      if (!empleado) {
        setHorariosDisponibles([])
        return
      }

      const diaSemana = fecha.getDay()
      const horarioDia = empleado.schedule?.find((s) => s.dayOfWeek === diaSemana)

      // Horario predeterminado o del empleado
      const horario = horarioDia || { startTime: "09:00", endTime: "18:00" }

      // Duración total de los servicios
      const duracionTotal = serviciosSeleccionados.reduce(
        (total, servicio) => total + (Number(servicio.tiempo) || 0),
        0,
      )

      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        const fechaStr = fecha.toISOString().split("T")[0]

        // Generar horarios disponibles básicos sin verificar conflictos
        // Esto es temporal para asegurar que siempre haya horarios disponibles
        const [horaInicio, minInicio] = horario.startTime.split(":").map(Number)
        const [horaFin, minFin] = horario.endTime.split(":").map(Number)
        const inicioMinutos = horaInicio * 60 + minInicio
        const finMinutos = horaFin * 60 + minFin

        const horarios = []
        for (let minutos = inicioMinutos; minutos <= finMinutos - duracionTotal; minutos += 30) {
          const hora = Math.floor(minutos / 60)
          const min = minutos % 60
          horarios.push(`${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`)
        }

        setHorariosDisponibles(horarios)

        if (horarios.length > 0 && (!horaSeleccionada || !horarios.includes(horaSeleccionada))) {
          setHoraSeleccionada(horarios[0])
          setFormData((prev) => ({ ...prev, horacita: horarios[0] }))
        }

        // Ahora intentamos obtener las citas existentes para filtrar los horarios
        try {
          const citasResponse = await axios.get(`https://gitbf.onrender.com/api/citas`, { headers })
          const citasDelDia = citasResponse.data.citas.filter((c) => {
            if (!c.fechacita || !c.nombreempleado) return false
            const citaFecha = new Date(c.fechacita).toISOString().split("T")[0]
            const citaEmpleadoId = typeof c.nombreempleado === "object" ? c.nombreempleado._id : c.nombreempleado
            return citaFecha === fechaStr && citaEmpleadoId === empleadoId && c._id !== (cita?._id || "")
          })

          // Si no hay citas, mantenemos los horarios básicos
          if (citasDelDia.length === 0) return

          // Crear bloques ocupados
          const bloquesOcupados = citasDelDia
            .map((c) => {
              if (!c.horacita) return null
              const [hora, min] = c.horacita.split(":").map(Number)
              const inicioBloque = hora * 60 + min
              const duracionCita = c.duracionTotal || 60
              return {
                inicio: inicioBloque,
                fin: inicioBloque + duracionCita,
              }
            })
            .filter(Boolean)

          // Filtrar horarios disponibles
          const horariosDisponiblesFiltrados = horarios.filter((horaStr) => {
            const [hora, min] = horaStr.split(":").map(Number)
            const inicioMinutos = hora * 60 + min
            const finMinutos = inicioMinutos + duracionTotal

            return !bloquesOcupados.some(
              (bloque) =>
                (inicioMinutos >= bloque.inicio && inicioMinutos < bloque.fin) ||
                (finMinutos > bloque.inicio && finMinutos <= bloque.fin) ||
                (inicioMinutos <= bloque.inicio && finMinutos >= bloque.fin),
            )
          })

          // Solo actualizamos si hay horarios disponibles después de filtrar
          if (horariosDisponiblesFiltrados.length > 0) {
            setHorariosDisponibles(horariosDisponiblesFiltrados)

            if (!horaSeleccionada || !horariosDisponiblesFiltrados.includes(horaSeleccionada)) {
              setHoraSeleccionada(horariosDisponiblesFiltrados[0])
              setFormData((prev) => ({ ...prev, horacita: horariosDisponiblesFiltrados[0] }))
            }
          }
        } catch (error) {
          console.error("Error al obtener citas:", error)
          // Si hay error al obtener citas, mantenemos los horarios básicos
        }
      } catch (error) {
        console.error("Error general:", error)
        // En caso de error, mostrar horarios sin validación
        const [horaInicio, minInicio] = horario.startTime.split(":").map(Number)
        const [horaFin, minFin] = horario.endTime.split(":").map(Number)
        const inicioMinutos = horaInicio * 60 + minInicio
        const finMinutos = horaFin * 60 + minFin

        const horarios = []
        for (let minutos = inicioMinutos; minutos <= finMinutos - duracionTotal; minutos += 30) {
          const hora = Math.floor(minutos / 60)
          const min = minutos % 60
          horarios.push(`${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`)
        }

        setHorariosDisponibles(horarios)

        if (horarios.length > 0 && (!horaSeleccionada || !horarios.includes(horaSeleccionada))) {
          setHoraSeleccionada(horarios[0])
          setFormData((prev) => ({ ...prev, horacita: horarios[0] }))
        }
      }
    },
    [empleados, serviciosSeleccionados, cita, horaSeleccionada],
  )

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }

        const [empleadosResponse, clientesResponse, serviciosResponse] = await Promise.all([
          axios.get("https://gitbf.onrender.com/api/empleados", { headers }),
          axios.get("https://gitbf.onrender.com/api/clientes", { headers }),
          axios.get("https://gitbf.onrender.com/api/servicios", { headers }),
        ])

        setEmpleados(empleadosResponse.data)
        setEmpleadosFiltrados(empleadosResponse.data)
        setClientes(clientesResponse.data)

        const serviciosData =
          serviciosResponse.data.servicios || (Array.isArray(serviciosResponse.data) ? serviciosResponse.data : [])
        setServicios(serviciosData)

        // Inicializar datos de la cita si existe
        if (cita) {
          setFormData({
            nombreempleado: cita.nombreempleado?._id || "",
            nombrecliente: cita.nombrecliente?._id || "",
            fechacita: new Date(cita.fechacita).toISOString().slice(0, 16),
            horacita: cita.horacita || "",
            duracionTotal: cita.duracionTotal || 0,
            montototal: cita.montototal || 0,
            estadocita: cita.estadocita || "Pendiente",
          })

          if (cita.servicios && Array.isArray(cita.servicios)) {
            setServiciosSeleccionados(cita.servicios)
          }

          const hora = new Date(cita.fechacita).getHours()
          const minutos = new Date(cita.fechacita).getMinutes()
          setHoraSeleccionada(`${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`)
          setCurrentMonth(new Date(cita.fechacita))
        }
      } catch (error) {
        setError("Error al cargar los datos. Por favor, intente de nuevo.")
        Swal.fire("Error", "No se pudieron cargar los datos necesarios", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [cita])

  // Inicializar formData con datos de location
  useEffect(() => {
    if (!cita) {
      const fechaAUsar = fechaSeleccionada ? fechaSeleccionada.toISOString().slice(0, 16) : formData.fechacita

      setFormData((prevData) => ({
        ...prevData,
        nombreempleado: empleadoIdPredeterminado || prevData.nombreempleado,
        montototal: totalDesdeSeleccionarServicios || prevData.montototal,
        fechacita: fechaAUsar,
      }))
    }
  }, [empleadoIdPredeterminado, totalDesdeSeleccionarServicios, fechaSeleccionada, cita, formData.fechacita])

  // NUEVO: Manejar servicios preseleccionados desde SeleccionarServicios
  useEffect(() => {
    if (vieneDePaginaServicios && serviciosDesdeSeleccionarServicios.length > 0 && !cita) {
      // Usar los servicios que vienen de la página de selección
      setServiciosSeleccionados(serviciosDesdeSeleccionarServicios)

      // Actualizar el monto total
      setFormData((prevData) => ({
        ...prevData,
        montototal: totalDesdeSeleccionarServicios,
      }))

      // Opcional: Avanzar automáticamente al paso 2 si estamos en el paso 1
      if (paso === 1) {
        setPaso(2)
      }
    }
  }, [vieneDePaginaServicios, serviciosDesdeSeleccionarServicios, totalDesdeSeleccionarServicios, cita, paso])

  // Agregar servicio seleccionado
  useEffect(() => {
    if (servicioSeleccionado && servicios.length > 0 && !cita) {
      const servicio = servicios.find((s) => s._id === servicioSeleccionado)
      if (servicio && !serviciosSeleccionados.some((s) => s._id === servicio._id)) {
        setServiciosSeleccionados((prev) => [
          ...prev,
          {
            _id: servicio._id,
            nombreServicio: servicio.nombreServicio,
            precio: servicio.precio,
            tiempo: servicio.tiempo,
          },
        ])
      }
    }
  }, [servicioSeleccionado, servicios, cita, serviciosSeleccionados])

  // Filtrar empleados según los servicios seleccionados
  useEffect(() => {
    if (serviciosSeleccionados.length > 0 && empleados.length > 0) {
      const especialidadesNecesarias = serviciosSeleccionados
        .map((servicio) => {
          const servicioCompleto = servicios.find((s) => s._id === servicio._id || s._id === servicio.servicio)
          return servicioCompleto?.nombreServicio || ""
        })
        .filter(Boolean)

      const empleadosConEspecialidades = empleados.filter((empleado) => {
        const especialidadesEmpleado = empleado.especialidades || []
        return especialidadesNecesarias.some((esp) => especialidadesEmpleado.includes(esp))
      })

      setEmpleadosFiltrados(empleadosConEspecialidades.length > 0 ? empleadosConEspecialidades : empleados)
    } else {
      setEmpleadosFiltrados(empleados)
    }
  }, [serviciosSeleccionados, empleados, servicios])

  // Actualizar horarios disponibles cuando cambia la fecha o el empleado
  useEffect(() => {
    if (formData.fechacita && formData.nombreempleado) {
      setHorariosDisponibles([])
      // Usar setTimeout para asegurar que la actualización se ejecute después de que el estado se haya actualizado
      setTimeout(() => {
        actualizarHorariosDisponibles(new Date(formData.fechacita), formData.nombreempleado)
      }, 0)
    }
  }, [formData.fechacita, formData.nombreempleado, serviciosSeleccionados, actualizarHorariosDisponibles])

  // Añadir un useEffect adicional para cargar los horarios disponibles cuando se carga el componente
  useEffect(() => {
    // Si tenemos fecha y empleado al cargar el componente, actualizar horarios disponibles
    if (formData.fechacita && formData.nombreempleado && isLoading === false) {
      console.log("Cargando horarios disponibles iniciales")
      actualizarHorariosDisponibles(new Date(formData.fechacita), formData.nombreempleado)
    }
  }, [isLoading]) // Solo se ejecuta cuando cambia isLoading (cuando termina de cargar)

  const precioTotal = useMemo(() => {
    return serviciosSeleccionados.reduce((total, servicio) => total + (servicio.precio || 0), 0)
  }, [serviciosSeleccionados])

  const totalTiempo = useMemo(() => {
    return serviciosSeleccionados.reduce((total, servicio) => total + (servicio.tiempo || 0), 0)
  }, [serviciosSeleccionados])

  // Actualizar duracionTotal cuando cambian los servicios seleccionados
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      duracionTotal: totalTiempo,
      montototal: precioTotal,
    }))
  }, [totalTiempo, precioTotal])

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))

    if (name === "hora") {
      setHoraSeleccionada(value)
      setFormData((prevData) => ({
        ...prevData,
        horacita: value,
      }))
    }
  }

  const agregarServicio = () => {
    if (nuevoServicio.id) {
      const servicioSeleccionado = servicios.find((serv) => serv._id === nuevoServicio.id)
      if (servicioSeleccionado && !serviciosSeleccionados.some((serv) => serv._id === servicioSeleccionado._id)) {
        setServiciosSeleccionados((prev) => [
          ...prev,
          {
            _id: servicioSeleccionado._id,
            nombreServicio: servicioSeleccionado.nombreServicio,
            precio: servicioSeleccionado.precio,
            tiempo: servicioSeleccionado.tiempo,
          },
        ])
        setNuevoServicio({ id: "", nombre: "" })
      } else {
        Swal.fire("Error", "Este servicio ya fue agregado o no existe.", "error")
      }
    } else {
      Swal.fire("Error", "Debes seleccionar un servicio antes de agregar.", "error")
    }
  }

  const eliminarServicio = (id) => {
    setServiciosSeleccionados((prev) => prev.filter((servicio) => servicio._id !== id))
  }

  // Reemplazar la función manejarSubmit con esta versión
  const manejarSubmit = async (e) => {
    e.preventDefault()

    if (serviciosSeleccionados.length === 0) {
      return Swal.fire("Error", "Debe seleccionar al menos un servicio", "error")
    }

    if (!formData.nombreempleado) {
      return Swal.fire("Error", "Debe seleccionar un empleado", "error")
    }

    if (!formData.nombrecliente) {
      return Swal.fire("Error", "Debe seleccionar un cliente", "error")
    }

    if (!horaSeleccionada) {
      return Swal.fire("Error", "Debe seleccionar una hora", "error")
    }

    // Obtener la fecha actual del estado
    const fechaActual = new Date(formData.fechacita)
    console.log("FECHA ACTUAL EN SUBMIT:", {
      fechaISO: fechaActual.toISOString(),
      fechaLocal: fechaActual.toLocaleDateString(),
      año: fechaActual.getFullYear(),
      mes: fechaActual.getMonth() + 1,
      día: fechaActual.getDate(),
    })

    // Extraer componentes de la fecha
    const year = fechaActual.getFullYear()
    const month = fechaActual.getMonth()
    const day = fechaActual.getDate()

    // Extraer componentes de la hora
    const [horas, minutos] = horaSeleccionada.split(":").map(Number)

    // Crear una nueva fecha combinando fecha y hora
    const fechaCompleta = new Date(year, month, day, horas, minutos, 0)

    console.log("FECHA FINAL PARA ENVIAR:", {
      fechaISO: fechaCompleta.toISOString(),
      fechaLocal: fechaCompleta.toLocaleDateString(),
      hora: horaSeleccionada,
      año: year,
      mes: month + 1,
      día: day,
    })

    // Preparar los servicios en el formato que espera el backend
    const serviciosFormateados = serviciosSeleccionados.map((servicio) => ({
      _id: servicio._id,
      nombreServicio: servicio.nombreServicio,
      precio: servicio.precio,
      tiempo: servicio.tiempo,
    }))

    const dataToSend = {
      ...formData,
      fechacita: fechaCompleta.toISOString(),
      horacita: horaSeleccionada,
      duracionTotal: totalTiempo,
      servicios: serviciosFormateados,
      montototal: precioTotal,
    }

    console.log("DATOS COMPLETOS A ENVIAR:", dataToSend)

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      if (cita) {
        const response = await axios.put(`https://gitbf.onrender.com/api/citas/${cita._id}`, dataToSend, { headers })
        console.log("RESPUESTA DEL SERVIDOR (ACTUALIZACIÓN):", response.data)
        Swal.fire("Éxito", "Cita actualizada correctamente", "success")
      } else {
        const response = await axios.post("https://gitbf.onrender.com/api/citas", dataToSend, { headers })
        console.log("RESPUESTA DEL SERVIDOR (CREACIÓN):", response.data)
        Swal.fire("Éxito", "Cita creada correctamente", "success")
      }

      onCitaActualizada()
      if (onClose) onClose()
    } catch (error) {
      let mensajeError = "Error al guardar la cita. Por favor, intente de nuevo."
      if (error.response?.data?.error) {
        mensajeError = `Error: ${error.response.data.error}`
      } else if (error.response?.data?.message) {
        mensajeError = `Error: ${error.response.data.message}`
      }
      console.error("ERROR COMPLETO:", error)
      Swal.fire("Error", mensajeError, "error")
    }
  }

  const manejarEliminar = async () => {
    if (
      await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff69b4",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
      }).then((result) => result.isConfirmed)
    ) {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }

        await axios.delete(`https://gitbf.onrender.com/api/citas/${cita._id}`, { headers })
        Swal.fire("Eliminado", "La cita ha sido eliminada.", "success")
        onCitaActualizada()
        onClose()
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar la cita.", "error")
      }
    }
  }

  const avanzarPaso = () => {
    if (paso === 1 && serviciosSeleccionados.length === 0) {
      return Swal.fire("Error", "Debe seleccionar al menos un servicio", "error")
    }

    if (paso === 2 && !formData.nombreempleado) {
      return Swal.fire("Error", "Debe seleccionar un empleado", "error")
    }

    if (paso === 3 && !formData.nombrecliente) {
      return Swal.fire("Error", "Debe seleccionar un cliente", "error")
    }

    setPaso(paso + 1)
  }

  const retrocederPaso = () => {
    setPaso(paso - 1)
  }

  // Cambiar mes en el calendario
  // Añadir este useEffect dentro del componente, justo antes del return
  useEffect(() => {
    console.log("CAMBIO EN FECHA:", {
      nuevaFecha: formData.fechacita,
      fechaLocal: new Date(formData.fechacita).toLocaleDateString(),
    })
  }, [formData.fechacita])

  // Renderizar el indicador de carga
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-lg p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-pink-500 font-medium">Cargando datos...</p>
      </div>
    )
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button onClick={onClose} className="mt-3 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded">
          Cerrar
        </button>
      </div>
    )
  }

  // Renderizar el formulario por pasos
  return (
    <div className="max-w-5xl mx-auto relative bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-xl overflow-hidden border border-pink-100">
      {/* Botón de cerrar mejorado */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 bg-white hover:bg-pink-50 text-pink-500 hover:text-pink-700 rounded-full p-2 shadow-md transition-all duration-200 z-20 transform hover:scale-110"
        aria-label="Cerrar"
      >
        <FaTimes size={18} />
      </button>

      {/* Indicador de pasos */}
      <div className="mb-8 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className={`step ${paso >= 1 ? "active" : ""}`}>
            <div className="step-circle">
              <FaCut className="step-icon" />
            </div>
            <div className="step-text">Servicios</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${paso >= 2 ? "active" : ""}`}>
            <div className="step-circle">
              <FaUser className="step-icon" />
            </div>
            <div className="step-text">Empleado</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${paso >= 3 ? "active" : ""}`}>
            <div className="step-circle">
              <FaCalendarAlt className="step-icon" />
            </div>
            <div className="step-text">Fecha y Hora</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${paso >= 4 ? "active" : ""}`}>
            <div className="step-circle">
              <FaClock className="step-icon" />
            </div>
            <div className="step-text">Confirmar</div>
          </div>
        </div>
      </div>

      <form onSubmit={manejarSubmit} className="space-y-6">
        {/* Paso 1: Selección de servicios */}
        {paso === 1 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100 mx-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-pink-500">Selecciona los servicios</h2>

            {/* NUEVO: Mostrar mensaje cuando los servicios ya están seleccionados */}
            {vieneDePaginaServicios && serviciosSeleccionados.length > 0 ? (
              <div className="bg-pink-50 p-4 rounded-lg mb-4">
                <p className="text-pink-700 font-medium">
                  Ya has seleccionado {serviciosSeleccionados.length} servicios desde la página anterior.
                </p>
                <div className="mt-3 bg-white p-3 rounded border border-pink-200">
                  {serviciosSeleccionados.map((servicio, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-pink-100 last:border-0"
                    >
                      <span>{servicio.nombreServicio}</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-4">${servicio.precio}</span>
                        <button
                          type="button"
                          onClick={() => eliminarServicio(servicio._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={avanzarPaso}
                  className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded transition-all duration-200 transform hover:translate-y-[-2px]"
                >
                  Continuar con estos servicios
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicios disponibles:</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={nuevoServicio.id}
                    onChange={(e) =>
                      setNuevoServicio({
                        id: e.target.value,
                        nombre: servicios.find((s) => s._id === e.target.value)?.nombreServicio || "",
                      })
                    }
                    className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-200"
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios.map((servicio) => (
                      <option key={servicio._id} value={servicio._id}>
                        {servicio.nombreServicio} - ${servicio.precio} ({servicio.tiempo} min)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={agregarServicio}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded whitespace-nowrap transition-all duration-200 transform hover:translate-y-[-2px]"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {serviciosSeleccionados.length > 0 && !vieneDePaginaServicios ? (
              <div className="mt-6">
                <h3 className="font-medium mb-2 text-pink-700">Servicios seleccionados:</h3>
                <div className="bg-pink-50 p-4 rounded-lg">
                  {serviciosSeleccionados.map((servicio, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-pink-100 last:border-0"
                    >
                      <div>
                        <span className="font-medium">{servicio.nombreServicio}</span>
                        <span className="text-sm text-gray-500 ml-2">({servicio.tiempo} min)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-4">${servicio.precio}</span>
                        <button
                          type="button"
                          onClick={() => eliminarServicio(servicio._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 font-bold">
                    <div>
                      <span>Total</span>
                      <span className="text-sm text-gray-500 ml-2">({totalTiempo} min)</span>
                    </div>
                    <span className="text-pink-600">${precioTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              !vieneDePaginaServicios && (
                <div className="text-center py-8 text-gray-500">No has seleccionado ningún servicio</div>
              )
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={avanzarPaso}
                disabled={serviciosSeleccionados.length === 0}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-2px] transition-all duration-200"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Selección de empleado */}
        {paso === 2 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100 mx-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-pink-500">Selecciona un empleado</h2>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Estos son los empleados disponibles que pueden realizar los servicios seleccionados:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empleadosFiltrados.length > 0 ? (
                  empleadosFiltrados.map((empleado) => (
                    <div
                      key={empleado._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        formData.nombreempleado === empleado._id
                          ? "border-pink-500 bg-pink-50 shadow-md"
                          : "hover:border-pink-300 hover:bg-pink-50"
                      }`}
                      onClick={() => setFormData({ ...formData, nombreempleado: empleado._id })}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center text-pink-700 font-bold mr-4">
                          {empleado.nombreempleado.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium">{empleado.nombreempleado}</h3>
                          <p className="text-sm text-gray-500">
                            Especialidades: {(empleado.especialidades || []).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No hay empleados disponibles para los servicios seleccionados
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={retrocederPaso}
                className="bg-white border border-pink-300 hover:bg-pink-50 text-gray-800 px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={avanzarPaso}
                disabled={!formData.nombreempleado}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-2px]"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Selección de fecha, hora y cliente */}
        {paso === 3 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100 mx-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-pink-500">Selecciona cliente y hora</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente:</label>
              <select
                name="nombrecliente"
                value={formData.nombrecliente}
                onChange={manejarCambio}
                className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all duration-200"
                required
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente._id} value={cliente._id}>
                    {cliente.nombrecliente} {cliente.apellidocliente || ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3 text-pink-700">Información de la cita</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Fecha seleccionada:</span>{" "}
                    <span className="text-pink-600">
                      {new Date(formData.fechacita).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Empleado:</span>{" "}
                    <span className="text-pink-600">
                      {empleados.find((e) => e._id === formData.nombreempleado)?.nombreempleado || "No seleccionado"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Duración total:</span>{" "}
                    <span className="text-pink-600">{totalTiempo} minutos</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Precio total:</span>{" "}
                    <span className="text-pink-600 font-bold">${precioTotal.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Horarios disponibles */}
            <div className="mt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-0">
                  Selecciona un horario disponible:
                </label>
                <div className="text-xs text-gray-500 bg-pink-50 p-2 rounded">
                  <p>
                    <strong>Horario del empleado:</strong> {(() => {
                      const empleado = empleados.find((e) => e._id === formData.nombreempleado)
                      if (!empleado) return "No seleccionado"

                      const diaSemana = new Date(formData.fechacita).getDay()
                      const horario = empleado.schedule?.find((s) => s.dayOfWeek === diaSemana)

                      if (horario) {
                        return `${horario.startTime} - ${horario.endTime}`
                      } else {
                        return "9:00 - 18:00 (horario predeterminado)"
                      }
                    })()}
                  </p>
                </div>
              </div>

              {horariosDisponibles.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {horariosDisponibles.map((hora) => (
                    <div
                      key={hora}
                      className={`p-2 border rounded-lg text-center cursor-pointer transition-all duration-200 ${
                        horaSeleccionada === hora
                          ? "bg-pink-500 text-white border-pink-500 shadow-md"
                          : "hover:bg-pink-50 hover:border-pink-300"
                      }`}
                      onClick={() => {
                        setHoraSeleccionada(hora)
                        setFormData({ ...formData, horacita: hora })
                      }}
                    >
                      {hora}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-yellow-50 text-yellow-700 rounded">
                  <p className="font-medium">No hay horarios disponibles para la fecha y empleado seleccionados.</p>
                  <p className="text-sm mt-2">Prueba con otra fecha o selecciona otro empleado en el paso anterior.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={retrocederPaso}
                className="bg-white border border-pink-300 hover:bg-pink-50 text-gray-800 px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={avanzarPaso}
                disabled={!formData.nombrecliente || !horaSeleccionada}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-2px]"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {paso === 4 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100 mx-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-pink-500">Confirma tu cita</h2>

            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-pink-700">Cliente</h3>
                  <p>{clientes.find((c) => c._id === formData.nombrecliente)?.nombrecliente || "No seleccionado"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-pink-700">Empleado</h3>
                  <p>{empleados.find((e) => e._id === formData.nombreempleado)?.nombreempleado || "No seleccionado"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-pink-700">Fecha y Hora</h3>
                  <p>
                    {new Date(formData.fechacita).toLocaleDateString()} a las {horaSeleccionada}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-pink-700">Duración Total</h3>
                  <p>{totalTiempo} minutos</p>
                </div>

                <div>
                  <h3 className="font-medium text-pink-700">Estado</h3>
                  <p>{formData.estadocita}</p>
                </div>

                <div>
                  <h3 className="font-medium text-pink-700">Precio Total</h3>
                  <p className="font-bold text-pink-600">${precioTotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-pink-700 mb-2">Servicios</h3>
                <ul className="list-disc pl-5">
                  {serviciosSeleccionados.map((servicio, index) => (
                    <li key={index}>
                      {servicio.nombreServicio} - ${servicio.precio} ({servicio.tiempo} min)
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <div>
                <button
                  type="button"
                  onClick={retrocederPaso}
                  className="bg-white border border-pink-300 hover:bg-pink-50 text-gray-800 px-6 py-2 rounded-lg shadow-sm transition-all duration-200 mr-2"
                >
                  Anterior
                </button>

                {cita && (
                  <button
                    type="button"
                    onClick={manejarEliminar}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 font-medium transform hover:translate-y-[-2px]"
              >
                {cita ? "Actualizar Cita" : "Crear Cita"}
              </button>
            </div>
          </div>
        )}
      </form>

      <style jsx>{`
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 80px;
          z-index: 10;
        }
        
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f9f0ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          color: #6b7280;
        }
        
        .step.active .step-circle {
          background-color: #ff69b4;
          color: white;
          box-shadow: 0 4px 6px rgba(255, 105, 180, 0.3);
          transform: scale(1.1);
        }
        
        .step-icon {
          font-size: 18px;
        }
        
        .step-text {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        
        .step.active .step-text {
          color: #ff69b4;
          font-weight: 500;
        }
        
        .step-line {
          flex-grow: 1;
          height: 2px;
          background-color: #f9f0ff;
          margin-top: -28px;
          z-index: 0;
        }
      `}</style>
    </div>
  )
}

