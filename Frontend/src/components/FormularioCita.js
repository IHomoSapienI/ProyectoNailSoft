import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function FormularioCita({ cita, fechaSeleccionada, onCitaActualizada, onClose }) {
  const location = useLocation();
  const totalDesdeSeleccionarServicios = location.state?.total || 0;

  const [formData, setFormData] = useState({
    nombreempleado: '',
    nombrecliente: '',
    fechacita: '',
    montototal: 0,
    estadocita: '',
  });

  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({ id: '', nombre: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const [empleadosResponse, clientesResponse, serviciosResponse] = await Promise.all([
          axios.get('https://gitbf.onrender.com/api/empleados'),
          axios.get('https://gitbf.onrender.com/api/clientes'),
          fetch('https://gitbf.onrender.com/api/servicios', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.json())
        ]);

        setEmpleados(empleadosResponse.data);
        setClientes(clientesResponse.data);
        setServicios(serviciosResponse.servicios || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    if (cita) {
      setFormData({
        nombreempleado: cita.nombreempleado?._id || '',
        nombrecliente: cita.nombrecliente?._id || '',
        fechacita: new Date(cita.fechacita).toISOString().slice(0, 16),
        montototal: cita.montototal || 0,
        estadocita: cita.estadocita || 'Pendiente',
      });
      setServiciosSeleccionados(cita.servicios || []);
    } else {
      setFormData(prevData => ({
        ...prevData,
        montototal: totalDesdeSeleccionarServicios,
        fechacita: fechaSeleccionada ? fechaSeleccionada.toISOString().slice(0, 16) : '',
        estadocita: 'Pendiente',
      }));
    }
  }, [cita, totalDesdeSeleccionarServicios, fechaSeleccionada]);

  const precioTotal = useMemo(() => {
    return serviciosSeleccionados.reduce((total, servicio) => total + servicio.precio, 0);
  }, [serviciosSeleccionados]);

  const totalTiempo = useMemo(() => {
    return serviciosSeleccionados.reduce((total, servicio) => total + servicio.tiempo, 0);
  }, [serviciosSeleccionados]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const agregarServicio = () => {
    if (nuevoServicio.id) {
      const servicioSeleccionado = servicios.find(serv => serv._id === nuevoServicio.id);
      if (servicioSeleccionado && !serviciosSeleccionados.some(serv => serv._id === servicioSeleccionado._id)) {
        setServiciosSeleccionados(prev => [
          ...prev,
          {
            _id: servicioSeleccionado._id,
            nombreServicio: servicioSeleccionado.nombreServicio,
            precio: servicioSeleccionado.precio,
            tiempo: servicioSeleccionado.tiempo
          }
        ]);
        setNuevoServicio({ id: '', nombre: '' });
      } else {
        Swal.fire('Error', 'Este servicio ya fue agregado o no existe.', 'error');
      }
    } else {
      Swal.fire('Error', 'Debes seleccionar un servicio antes de agregar.', 'error');
    }
  };

  const eliminarServicio = (id) => {
    setServiciosSeleccionados(prev => prev.filter(servicio => servicio._id !== id));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      servicios: serviciosSeleccionados.map(servicio => servicio._id),
      montototal: precioTotal,
    };

    try {
      if (cita) {
        await axios.put(`https://gitbf.onrender.com/api/citas/${cita._id}`, dataToSend);
        Swal.fire('Éxito', 'Cita actualizada correctamente', 'success');
      } else {
        await axios.post('https://gitbf.onrender.com/api/citas', dataToSend);
        Swal.fire('Éxito', 'Cita creada correctamente', 'success');
      }


      


      onCitaActualizada();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al guardar la cita:', error);
      Swal.fire('Error', 'Error al guardar la cita. Por favor, intente de nuevo.', 'error');
    }
  };

  const manejarEliminar = async () => {
    if (await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => result.isConfirmed)) {
      try {
        await axios.delete(`https://gitbf.onrender.com/api/citas/${cita._id}`);
        Swal.fire('Eliminado', 'La cita ha sido eliminada.', 'success');
        onCitaActualizada();
        onClose();
      } catch (error) {
        console.error('Error al eliminar la cita:', error);
        Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
      }
    }
  };

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <form onSubmit={manejarSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Empleado:</label>
        <select
          name="nombreempleado"
          value={formData.nombreempleado}
          onChange={manejarCambio}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
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
        <label className="block text-sm font-medium text-gray-700">Cliente:</label>
        <select
          name="nombrecliente"
          value={formData.nombrecliente}
          onChange={manejarCambio}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente._id} value={cliente._id}>
              {cliente.nombrecliente}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Servicios:</label>
        <select
          value={nuevoServicio.id}
          onChange={(e) => setNuevoServicio({ 
            id: e.target.value, 
            nombre: servicios.find(s => s._id === e.target.value)?.nombreServicio || '' 
          })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
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
                {serviciosSeleccionados.map(servicio => (
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
        <label className="block text-sm font-medium text-gray-700">Fecha:</label>
        <input
          type="datetime-local"
          name="fechacita"
          value={formData.fechacita}
          onChange={manejarCambio}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Monto Total:</label>
        <input
          type="number"
          name="montototal"
          value={precioTotal}
          readOnly
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estado:</label>
        <select
          name="estadocita"
          value={formData.estadocita}
          onChange={manejarCambio}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <div className="flex justify-between mt-4">
        {cita && (
          <button
            type="button"
            onClick={manejarEliminar}
            className="py-2 px-4 border border-red-300 text-red-600 rounded-md shadow-sm hover:bg-red-50"
          >
            Eliminar
          </button>
        )}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
          >
            {cita ? 'Actualizar' : 'Crear'} Cita
          </button>
        </div>
      </div>
    </form>
  );
}