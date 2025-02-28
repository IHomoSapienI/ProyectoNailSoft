import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ArticlesGrid = () => {
  const [servicios, setServicios] = useState([]);
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

  const baseUrl = 'https://gitbf.onrender.com/uploads';

  const manejarClickServicio = (servicio) => {
    const total = servicio.precio;
    navigate('/citas', { state: { total } });
  };

  const manejarAgregarCita = () => {
    navigate('/seleccionarservicios');
  };

  return (
    <div className="container my-12 mx-auto px-8 md:px-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-purple-600">
        💖 ¡Descubre Nuestros Magníficos Servicios de Uñas! 💖
      </h2>
      <div className="mt-8 text-center">
        <button
          className="bg-pink-300 text-white py-2 px-4 rounded-full font-semibold hover:bg-pink-500 transition-transform transform hover:scale-105"
          onClick={manejarAgregarCita}
        >
          Selecciona los servicios & Agenda tú Cita
        </button>
      </div>
      <div className="flex flex-wrap -mx-2">
        {servicios.map((servicio) => (
          <div
            key={servicio._id}
            className="my-4 px-2 w-full md:w-1/2 lg:w-1/3"
          >
            <article
              className="flex flex-col h-full overflow-hidden rounded-lg shadow-2xl transition-transform transform hover:scale-105 bg-white p-4 cursor-pointer"
              onClick={() => manejarClickServicio(servicio)}
            >
              <div className="relative overflow-hidden rounded-lg group">
                <img
                  alt={servicio.nombreServicio}
                  className="h-48 w-full object-cover rounded-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
                  src={`${baseUrl}/${servicio.imagenUrl}`}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-white text-lg font-bold text-center">
                    ¡Haz clic para más detalles!
                  </p>
                </div>
              </div>

              <header className="flex items-center justify-between leading-tight mb-2 mt-4">
                <h1 className="text-lg font-bold text-purple-700">{servicio.nombreServicio}</h1>
                <p className="text-lg text-pink-600 font-semibold">${servicio.precio}</p>
              </header>

              <div className="flex-1 p-2 bg-gray-50 mb-2 rounded-lg shadow-inner">
                <p className="text-gray-800 text-sm">{servicio.descripcion || 'Descripción no disponible'}</p>
              </div>

              <footer className="flex items-center justify-between leading-none p-2">
                <div className="flex items-center">
                  <span className="text-pink-600 text-sm mr-1">Tipo:</span>
                  <span className="ml-1 text-sm font-medium">{servicio.tipoServicio.nombreTs}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-pink-600 text-sm mr-1">Duración:</span>
                  <span className="text-sm font-medium">{servicio.tiempo} mins</span>
                </div>
              </footer>
            </article>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-3xl font-bold text-center mb-8 text-pink-600">
          ✨ ¡No pierdas tu tiempo, descubre nuestros servicios y novedades! ✨
        </h2>
        <button
          className="bg-pink-300 text-white py-2 px-4 rounded-full font-semibold hover:bg-pink-500 transition-transform transform hover:scale-105"
          onClick={manejarAgregarCita}
        >
          Agendar Cita
        </button>
      </div>
    </div>
  );
};

export default ArticlesGrid;