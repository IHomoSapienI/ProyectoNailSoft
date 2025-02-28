import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FormularioServicio = ({ servicioSeleccionado, onClose, onServicioActualizado }) => {
    const [formData, setFormData] = useState({
        nombreServicio: '',
        tipoServicio: '',
        tiempo: '',
        precio: '',
        descripcion: '',
        estado: true,
        imagen: null
    });
    const [tiposServicios, setTiposServicios] = useState([]);

    useEffect(() => {
        const obtenerTiposServicios = async () => {
            try {
                const respuesta = await axios.get('https://gitbf.onrender.com/api/tiposervicios');
                setTiposServicios(respuesta.data.tiposervicios || []);
            } catch (error) {
                console.error('Error al obtener los tipos de servicios:', error);
            }
        };

        obtenerTiposServicios();
    }, []);

    useEffect(() => {
        if (servicioSeleccionado) {
            setFormData({
                nombreServicio: servicioSeleccionado.nombreServicio || '',
                tipoServicio: servicioSeleccionado.tipoServicio ? servicioSeleccionado.tipoServicio._id : '',
                tiempo: servicioSeleccionado.tiempo || '',
                precio: servicioSeleccionado.precio || '',
                descripcion: servicioSeleccionado.descripcion || '',
                estado: servicioSeleccionado.estado || true,
                imagen: null
            });
        }
    }, [servicioSeleccionado]);

    const manejarCambio = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        });
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        for (const key in formData) {
            data.append(key, formData[key]);
        }

        try {
            const token = localStorage.getItem('token');
            let response;
            if (servicioSeleccionado) {
                response = await axios.put(`https://gitbf.onrender.com/api/servicios/${servicioSeleccionado._id}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                response = await axios.post('https://gitbf.onrender.com/api/servicios', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            Swal.fire('¡Éxito!', 'Servicio guardado correctamente.', 'success');
            onServicioActualizado(response.data.servicio);
            onClose();
        } catch (error) {
            console.error('Error al guardar el servicio:', error.response ? error.response.data : error.message);
            Swal.fire('Error', 'No se pudo guardar el servicio. Inténtalo nuevamente.', 'error');
        }
    };
    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">
                {servicioSeleccionado ? 'Editar Servicio' : 'Agregar Servicio'}
            </h2>
            <form onSubmit={manejarSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nombreServicio" className="block text-sm font-medium text-gray-700">
                        Nombre Servicio <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="nombreServicio"
                        name="nombreServicio"
                        value={formData.nombreServicio}
                        onChange={manejarCambio}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Ingrese el nombre del servicio"
                    />
                    <p className="mt-1 text-sm text-gray-500">Ingrese un nombre descriptivo para el servicio.</p>
                </div>

                <div>
                    <label htmlFor="tipoServicio" className="block text-sm font-medium text-gray-700">
                        Tipo de Servicio <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="tipoServicio"
                        name="tipoServicio"
                        value={formData.tipoServicio}
                        onChange={manejarCambio}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">Seleccione un tipo</option>
                        {tiposServicios.map((tipo) => (
                            <option key={tipo._id} value={tipo._id}>{tipo.nombreTs}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">Seleccione la categoría a la que pertenece el servicio.</p>
                </div>

                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="tiempo" className="block text-sm font-medium text-gray-700">
                            Duración (minutos) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="tiempo"
                            name="tiempo"
                            value={formData.tiempo}
                            onChange={manejarCambio}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            placeholder="Ingrese la duración del servicio"
                        />
                        <p className="mt-1 text-sm text-gray-500">Ingrese la duración del servicio en minutos.</p>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                            Precio <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="precio"
                            name="precio"
                            value={formData.precio}
                            onChange={manejarCambio}
                            required
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            placeholder="Ingrese el precio"
                        />
                        <p className="mt-1 text-sm text-gray-500">Ingrese el precio del servicio (use punto para decimales).</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                        Descripción
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={manejarCambio}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        rows="3"
                        placeholder="Ingrese la descripción del servicio"
                    ></textarea>
                    <p className="mt-1 text-sm text-gray-500">Proporcione una descripción detallada del servicio.</p>
                </div>

                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={manejarCambio}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value={true}>Activo</option>
                        <option value={false}>Inactivo</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">Seleccione si el servicio está activo o inactivo.</p>
                </div>

                <div>
                    <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
                        Imagen del Servicio <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="imagen" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Subir un archivo</span>
                                    <input
                                        id="imagen"
                                        name="imagen"
                                        type="file"
                                        className="sr-only"
                                        onChange={manejarCambio}
                                        required={!servicioSeleccionado}
                                    />
                                </label>
                                <p className="pl-1">o arrastrar y soltar</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {servicioSeleccionado ? 'Actualizar Servicio' : 'Agregar Servicio'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioServicio;