import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import Swal from "sweetalert2"

const FormularioCompra = ({ compra, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    proveedor: "",
    recibo: "",
    fechaCompra: "",
    fechaRegistro: new Date().toISOString().split("T")[0],
    insumos: [],
  })
  const [proveedores, setProveedores] = useState([])
  const [insumos, setInsumos] = useState([])
  const [nuevoInsumo, setNuevoInsumo] = useState({ id: "", nombre: "" })
  const [montoTotal, setMontoTotal] = useState(0)

  const apiUrl = "https://gitbf.onrender.com/api/compras"
  const proveedoresUrl = "https://gitbf.onrender.com/api/proveedores"
  const insumosUrl = "https://gitbf.onrender.com/api/insumos"

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [proveedoresRes, insumosRes] = await Promise.all([
                axios.get(proveedoresUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get(insumosUrl, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setProveedores(proveedoresRes.data || []);
            setInsumos(insumosRes.data || []);

            if (compra) {
              setFormData({
                proveedor: compra.proveedor?._id || "",
                recibo: compra.recibo || "",
                fechaCompra: compra.fechaCompra ? compra.fechaCompra.split('T')[0] : "",
                fechaRegistro: compra.fechaRegistro ? compra.fechaRegistro.split('T')[0] : new Date().toISOString().split('T')[0],
                insumos: compra.insumos ? compra.insumos.map(insumo => ({
                    _id: insumo.insumo?._id || "",
                    nombreInsumo: insumo.insumo?.nombreInsumo || "Desconocido",
                    cantidad: insumo.cantidad || 1,
                    precio: insumo.insumo?.precio || 0  // Aquí usamos insumo.insumo.precio en lugar de insumo.precio
                })) : []
            });
            } else {
                const nuevoRecibo = `REC-${Date.now()}`;
                setFormData(prevState => ({
                    ...prevState,
                    recibo: nuevoRecibo
                }));
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error');
        }
    };

    fetchData();
}, [compra]);


  const montoTotalCalculado = useMemo(() => {
    return formData.insumos.reduce((total, insumo) => total + insumo.cantidad * insumo.precio, 0)
  }, [formData.insumos])

  useEffect(() => {
    setMontoTotal(montoTotalCalculado)
  }, [montoTotalCalculado])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const agregarInsumo = () => {
    if (nuevoInsumo.id) {
      const insumoSeleccionado = insumos.find((i) => i._id === nuevoInsumo.id)
      if (insumoSeleccionado && !formData.insumos.some((i) => i._id === insumoSeleccionado._id)) {
        setFormData((prevState) => ({
          ...prevState,
          insumos: [
            ...prevState.insumos,
            {
              _id: insumoSeleccionado._id,
              nombreInsumo: insumoSeleccionado.nombreInsumo,
              cantidad: 1,
              precio: insumoSeleccionado.precio,
            },
          ],
        }))
        setNuevoInsumo({ id: "", nombre: "" })
      } else {
        Swal.fire("Advertencia", "Este insumo ya fue agregado o no existe.", "warning")
      }
    } else {
      Swal.fire("Advertencia", "Debes seleccionar un insumo antes de agregar.", "warning")
    }
  }

  const eliminarInsumo = (id) => {
    setFormData((prevState) => ({
      ...prevState,
      insumos: prevState.insumos.filter((insumo) => insumo._id !== id),
    }))
  }

  const handleInsumoChange = (id, field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      insumos: prevState.insumos.map((insumo) =>
        insumo._id === id
          ? { ...insumo, [field]: field === "precio" ? Number.parseFloat(value) || 0 : Number.parseInt(value) || 0 }
          : insumo,
      ),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const compraData = {
      proveedor: formData.proveedor,
      recibo: formData.recibo,
      fechaCompra: formData.fechaCompra,
      fechaRegistro: formData.fechaRegistro,
      insumos: formData.insumos.map((insumo) => ({
        insumo: insumo._id,
        cantidad: insumo.cantidad,
        precio: insumo.precio,
      })),
      monto: montoTotal,
    }
    const token = localStorage.getItem("token")

    try {
      console.log("Datos de compra a enviar:", compraData)
      let response
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      }

      if (compra) {
        response = await axios.put(`${apiUrl}/${compra._id}`, compraData, config)
      } else {
        response = await axios.post(apiUrl, compraData, config)
      }

      console.log("Respuesta del servidor:", response)

      if (response.status === 200 || response.status === 201) {
        Swal.fire("¡Éxito!", compra ? "Compra actualizada con éxito" : "Compra creada con éxito", "success")
        onSuccess()
      } else {
        throw new Error(`Respuesta inesperada del servidor: ${response.status}`)
      }
    } catch (error) {
      console.error("Error detallado al guardar la compra:", error)
      console.error("Respuesta del servidor:", error.response)
      if (error.response) {
        console.error("Datos de la respuesta de error:", error.response.data)
        console.error("Estado de la respuesta de error:", error.response.status)
        console.error("Cabeceras de la respuesta de error:", error.response.headers)
      }
      if (error.response && error.response.status === 401) {
        Swal.fire("Error", "No autorizado. Por favor, inicie sesión nuevamente.", "error")
      } else if (error.response && error.response.status === 400) {
        Swal.fire(
          "Error",
          `Error en los datos enviados: ${error.response.data.message || "Verifique los campos e intente nuevamente."}`,
          "error",
        )
      } else {
        Swal.fire("Error", "No se pudo guardar la compra. Por favor, intente nuevamente.", "error")
      }
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl overflow-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">{compra ? "Editar Compra" : "Agregar Compra"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                id="proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Selecciona un proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov._id} value={prov._id}>
                    {prov.nombreProveedor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Recibo</label>
              <input
                type="text"
                name="recibo"
                value={formData.recibo}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Compra <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaCompra"
                value={formData.fechaCompra}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
              <input
                type="date"
                name="fechaRegistro"
                value={formData.fechaRegistro}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                readOnly
              />
            </div>
          </div>

          <div>
            <label htmlFor="insumo" className="block mb-1">
              Insumos
            </label>
            <div className="flex space-x-2">
              <select
                id="insumo"
                value={nuevoInsumo.id}
                onChange={(e) =>
                  setNuevoInsumo({
                    id: e.target.value,
                    nombre: insumos.find((i) => i._id === e.target.value)?.nombreInsumo || "",
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Selecciona un insumo</option>
                {insumos.map((insumo) => (
                  <option key={insumo._id} value={insumo._id}>
                    {insumo.nombreInsumo}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={agregarInsumo}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="mt-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left text-sm font-medium text-gray-600">Nombre</th>
                  <th className="py-2 text-left text-sm font-medium text-gray-600">Cantidad</th>
                  <th className="py-2 text-left text-sm font-medium text-gray-600">Precio</th>
                  <th className="py-2 text-left text-sm font-medium text-gray-600">Subtotal</th>
                  <th className="py-2 text-left text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formData.insumos.map((insumo) => (
                  <tr key={insumo._id} className="border-b">
                    <td className="py-2 text-sm text-gray-700">{insumo.nombreInsumo}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={insumo.cantidad}
                        min="1"
                        onChange={(e) => handleInsumoChange(insumo._id, "cantidad", e.target.value)}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={insumo.precio}
                        min="0"
                        step="0.01"
                        onChange={(e) => handleInsumoChange(insumo._id, "precio", e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    </td>
                    <td className="py-2 text-sm text-gray-700">${(insumo.cantidad * insumo.precio).toFixed(2)}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => eliminarInsumo(insumo._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4">
            <h3 className="text-lg font-semibold">Monto Total: ${montoTotal.toFixed(2)}</h3>
            <div>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
              >
                {compra ? "Actualizar Compra" : "Crear Compra"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioCompra