"use client"

import { useState, useEffect, useMemo } from "react"
import "./Formulario.css"

const FormularioVentaServicio = ({ venta, onGuardar, onCancelar }) => {
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [citas, setCitas] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [clienteId, setClienteId] = useState("")
  const [clienteEmail, setClienteEmail] = useState("")
  const [clienteApellido, setClienteApellido] = useState("")
  const [clienteCelular, setClienteCelular] = useState("")
  const [nuevoServicio, setNuevoServicio] = useState({ id: "", nombre: "" })
  const [estado, setEstado] = useState(true)
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [fecha, setFecha] = useState(new Date().toLocaleString())
  const [ventaId, setVentaId] = useState("")
  const [citaId, setCitaId] = useState("")
  const [empleadoId, setEmpleadoId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data from APIs with Token
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")

      const [clientesResponse, serviciosResponse, citasResponse, empleadosResponse] = await Promise.all([
        fetch("https://gitbf.onrender.com/api/clientes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://gitbf.onrender.com/api/servicios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://gitbf.onrender.com/api/citas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://gitbf.onrender.com/api/empleados", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      if (!clientesResponse.ok || !serviciosResponse.ok || !citasResponse.ok || !empleadosResponse.ok) {
        throw new Error("Error en una o más solicitudes")
      }

      const [clientesData, serviciosData, citasData, empleadosData] = await Promise.all([
        clientesResponse.json(),
        serviciosResponse.json(),
        citasResponse.json(),
        empleadosResponse.json(),
      ])

      setClientes(clientesData)
      setServicios(serviciosData.servicios || [])
      setCitas(citasData.citas || [])
      setEmpleados(empleadosData)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Error al cargar los datos. Por favor, intente de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (venta) {
      setClienteId(venta.cliente?._id || "")
      setServiciosSeleccionados(
        venta.servicios.map((servicio) => ({
          _id: servicio.servicio?._id || servicio._id,
          nombreServicio: servicio.nombreServicio || "",
          precio: servicio.precio || 0,
          tiempo: servicio.tiempo || 0,
        })),
      )
      setEstado(venta.estado || true)
      setVentaId(venta._id || "")
      setCitaId(venta.cita?._id || "")
      setFecha(venta.cita ? new Date(venta.cita.fechacita).toLocaleString() : "")
      setEmpleadoId(venta.empleado?._id || "")
    }
  }, [venta])

  useEffect(() => {
    const clienteSeleccionado = clientes.find((cliente) => cliente._id === clienteId)
    if (clienteSeleccionado) {
      setClienteEmail(clienteSeleccionado.correocliente || "")
      setClienteApellido(clienteSeleccionado.apellidocliente || "")
      setClienteCelular(clienteSeleccionado.celularcliente || "")
    } else {
      setClienteEmail("")
      setClienteApellido("")
      setClienteCelular("")
    }
  }, [clienteId, clientes])

  const precioTotal = useMemo(() => {
    return serviciosSeleccionados.reduce((total, servicio) => total + servicio.precio, 0)
  }, [serviciosSeleccionados])

  const totalTiempo = useMemo(() => {
    return serviciosSeleccionados.reduce((total, servicio) => total + servicio.tiempo, 0)
  }, [serviciosSeleccionados])

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
        alert("Este servicio ya fue agregado o no existe.")
      }
    } else {
      alert("Debes seleccionar un servicio antes de agregar.")
    }
  }

  const eliminarServicio = (id) => {
    setServiciosSeleccionados((prev) => prev.filter((servicio) => servicio._id !== id))
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    if (!clienteId || !citaId || !empleadoId || serviciosSeleccionados.length === 0 || precioTotal <= 0) {
      alert("Por favor, complete todos los campos requeridos.")
      return
    }

    const ventaData = {
      cliente: clienteId,
      cita: citaId,
      empleado: empleadoId,
      servicios: serviciosSeleccionados.map((servicio) => ({
        servicio: servicio._id,
        nombreServicio: servicio.nombreServicio,
        precio: servicio.precio,
        tiempo: servicio.tiempo,
      })),
      precioTotal,
      estado,
    }

    try {
      await onGuardar(ventaData, ventaId)
    } catch (error) {
      console.error("Error al guardar la venta:", error)
      alert(`Error al guardar la venta: ${error.message}`)
    }
  }

  if (isLoading) return <div>Cargando datos...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="formulario max-h-96 overflow-y-auto">
      <form onSubmit={manejarSubmit} className="formulario space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          {venta ? "Editar Venta de Servicio" : "Agregar Venta de Servicio"}
        </h2>

        {ventaId && (
          <div>
            <label htmlFor="ventaId" className="block mb-1">
              ID de la Venta
            </label>
            <input id="ventaId" value={ventaId} readOnly className="w-full p-2 border rounded bg-gray-100" />
          </div>
        )}

        {venta && venta.codigoVenta && (
          <div>
            <label htmlFor="codigoVenta" className="block mb-1">
              Código de Venta
            </label>
            <input
              id="codigoVenta"
              value={venta.codigoVenta}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
        )}

        <div>
          <label htmlFor="fecha" className="block mb-1">
            Fecha de Venta
          </label>
          <input id="fecha" value={fecha} readOnly className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label htmlFor="cliente" className="block mb-1">
            Cliente
          </label>
          <select
            id="cliente"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nombrecliente} {cliente.apellidocliente} - {cliente.correocliente}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="email" className="block mb-1">
            Email del Cliente
          </label>
          <input id="email" value={clienteEmail} readOnly className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label htmlFor="apellido" className="block mb-1">
            Apellido del Cliente
          </label>
          <input id="apellido" value={clienteApellido} readOnly className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label htmlFor="celular" className="block mb-1">
            Celular del Cliente
          </label>
          <input id="celular" value={clienteCelular} readOnly className="w-full p-2 border rounded bg-gray-100" />
        </div>

        <div>
          <label htmlFor="cita" className="block mb-1">
            Cita
          </label>
          <select
            id="cita"
            value={citaId}
            onChange={(e) => setCitaId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona una cita</option>
            {citas.map((cita) => (
              <option key={cita._id} value={cita._id}>
                {new Date(cita.fechacita).toLocaleString()} - {cita.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="empleado" className="block mb-1">
            Empleado
          </label>
          <select
            id="empleado"
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un empleado</option>
            {empleados.map((empleado) => (
              <option key={empleado._id} value={empleado._id}>
                {empleado.nombreempleado}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="servicio" className="block mb-1">
            Servicios
          </label>
          <select
            id="servicio"
            value={nuevoServicio.id}
            onChange={(e) =>
              setNuevoServicio({
                id: e.target.value,
                nombre: servicios.find((s) => s._id === e.target.value)?.nombreServicio || "",
              })
            }
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un servicio</option>
            {servicios.map((servicio) => (
              <option key={servicio._id} value={servicio._id}>
                {servicio.nombreServicio}
              </option>
            ))}
          </select>
          <button type="button" onClick={agregarServicio} className="mt-2 p-2 bg-blue-500 text-white rounded">
            Agregar Servicio
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Servicios Agregados</h3>
          {serviciosSeleccionados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Nombre del Servicio</th>
                    <th className="py-2 px-4 border-b">Precio</th>
                    <th className="py-2 px-4 border-b">Tiempo (mins)</th>
                    <th className="py-2 px-4 border-b">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {serviciosSeleccionados.map((servicio) => (
                    <tr key={servicio._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{servicio.nombreServicio}</td>
                      <td className="py-2 px-4 border-b text-right">${servicio.precio.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b text-right">{servicio.tiempo}</td>
                      <td className="py-2 px-4 border-b text-center">
                        <button
                          type="button"
                          onClick={() => eliminarServicio(servicio._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="py-2 px-4 border-t">Total</td>
                    <td className="py-2 px-4 border-t text-right">${precioTotal.toFixed(2)}</td>
                    <td className="py-2 px-4 border-t text-right">{totalTiempo} mins</td>
                    <td className="py-2 px-4 border-t"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No hay servicios seleccionados</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">Resumen de la Venta</h3>
          <p>Total Precio: ${precioTotal.toFixed(2)}</p>
          <p>Total Tiempo: {totalTiempo} mins</p>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="estado"
              checked={estado}
              onChange={(e) => setEstado(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="estado">Estado</label>
          </div>
        </div>

        <div className="flex justify-between">
          <button type="submit" className="p-2 bg-green-500 text-white rounded">
            Guardar Venta
          </button>
          <button type="button" onClick={onCancelar} className="p-2 bg-gray-300 rounded">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioVentaServicio

