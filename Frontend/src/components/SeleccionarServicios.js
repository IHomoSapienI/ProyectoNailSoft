import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa'; // Importa el ícono de corazón
import './SeleccionarServicios.css'; // Asegúrate de que la ruta sea correcta

const SeleccionarServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerServicios = async () => {
      try {
        const response = await axios.get('https://gitbf.onrender.com/api/servicios');
        setServicios(response.data.servicios);
      } catch (error) {
        console.error('Error al obtener los servicios:', error);
      }
    };

    obtenerServicios();
  }, []);

  const manejarSeleccionServicio = (servicio) => {
    const yaSeleccionado = serviciosSeleccionados.find((s) => s._id === servicio._id);

    if (yaSeleccionado) {
      const nuevosServiciosSeleccionados = serviciosSeleccionados.filter(
        (s) => s._id !== servicio._id
      );
      setServiciosSeleccionados(nuevosServiciosSeleccionados);
      setTotal(total - servicio.precio);
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, servicio]);
      setTotal(total + servicio.precio);
    }
  };

  const manejarAgendarCita = () => {
    if (serviciosSeleccionados.length > 0) {
      navigate('/citas', { state: { serviciosSeleccionados, total } });
    } else {
      alert('Por favor, selecciona al menos un servicio.');
    }
  };

  return (
    <div className="container my-12 mx-auto px-4 md:px-12">
      {/* Título de Bienvenida */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">¡Bienvenidos a nuestro Servicio de Uñas!</h1>
        <p className="text-lg text-gray-600">Selecciona los mejores servicios para tus uñas y agenda tu cita hoy mismo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lista de Servicios con Checkboxes */}
        <div className="border rounded-lg shadow-lg p-6 bg-white">
          <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">Selecciona tus Servicios</h2>
          <div className="max-h-96 overflow-y-auto scrollbar-hidden space-y-4">
            {servicios.map((servicio) => (
              <div
                key={servicio._id}
                className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition duration-200 cursor-pointer"
                onClick={() => manejarSeleccionServicio(servicio)}
              >
                <div
                  className={`custom-checkbox mr-4 ${serviciosSeleccionados.find((s) => s._id === servicio._id) ? 'checked' : ''}`}
                >
                  {serviciosSeleccionados.find((s) => s._id === servicio._id) && (
                    <FaHeart className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{servicio.nombreServicio}</h3>
                  <p className="text-sm text-gray-600 font-semibold">Precio: ${servicio.precio}</p>
                  <p className="text-gray-600 text-sm">{servicio.descripcion || 'Descripción no disponible'}</p>
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de Servicios Seleccionados */}
        <div className="border rounded-lg shadow-lg p-6 bg-white flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-center text-violet-600">Resumen de Selección</h2>
          <div className="max-h-80 overflow-y-auto scrollbar-hidden mb-4">
            {serviciosSeleccionados.length === 0 ? (
              <p className="text-center text-gray-600">No has seleccionado ningún servicio.</p>
            ) : (
              <div>
                {serviciosSeleccionados.map((servicio) => (
                  <div key={servicio._id} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p>
                      <strong>{servicio.nombreServicio}</strong> - ${servicio.precio}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total estático */}
          <p className="text-lg font-bold text-center">Total: ${total}</p>

          <button
            className="mt-4 w-full bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 rounded"
            onClick={manejarAgendarCita}
          >
            Agendar Cita
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionarServicios;
