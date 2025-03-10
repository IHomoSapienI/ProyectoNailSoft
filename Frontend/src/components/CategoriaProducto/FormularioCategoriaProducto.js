import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FormularioCategoriaProducto = ({ categoriaId, onClose }) => {
    const [nombreCp, setNombreCp] = useState('');
    const [descripcionCp, setDescripcionCp] = useState('');
    const [activo, setActivo] = useState(true); 
    const apiUrl = 'https://gitbf.onrender.com/api/categoriaproductos'; 

    useEffect(() => {
        if (categoriaId) {
            // Cargar datos de la categoría si se está editando
            const fetchCategoria = async () => {
                const token = localStorage.getItem('token'); // Obtener el token del localStorage
                if (!token) {
                    await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                    return;
                }

                try {
                    const response = await axios.get(`${apiUrl}/${categoriaId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
                        }
                    });
                    const categoria = response.data.categoria;
                    setNombreCp(categoria.nombreCp);
                    setDescripcionCp(categoria.descripcionCp);
                    setActivo(categoria.activo);
                } catch (error) {
                    console.error('Error al cargar la categoría:', error);
                    Swal.fire('Error', 'No se pudo cargar la categoría', 'error');
                }
            };
            fetchCategoria();
        }
    }, [categoriaId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Obtener el token del localStorage
        if (!token) {
            await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
            return;
        }

        // Datos de la categoría a enviar
        const categoriaData = { 
            nombreCp, 
            descripcionCp, 
            activo 
        };

        try {
            if (categoriaId) {
                // Actualizar categoría existente
                await axios.put(`${apiUrl}/${categoriaId}`, categoriaData, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
                    }
                });
                Swal.fire('¡Éxito!', 'Categoría actualizada con éxito', 'success');
            } else {
                // Crear nueva categoría
                await axios.post(apiUrl, categoriaData, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
                    }
                });
                Swal.fire('¡Éxito!', 'Categoría creada con éxito', 'success');
            }
            console.log('Formulario enviado, actualizando categorías...');
            onClose(); // Cerrar el formulario y actualizar la tabla
        } catch (error) {
            console.error('Error al guardar la categoría:', error);
            Swal.fire('Error', 'No se pudo guardar la categoría', 'error');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Categoría:</label>
                <input
                    type="text"
                    value={nombreCp}
                    onChange={(e) => setNombreCp(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                <textarea
                    value={descripcionCp}
                    onChange={(e) => setDescripcionCp(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Estado:</label>
                <select
                    value={activo}
                    onChange={(e) => setActivo(e.target.value === 'true')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                </select>
            </div>
            <div className="flex justify-between mt-4">
                <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                    {categoriaId ? 'Actualizar Categoría' : 'Agregar Categoría'}
                </button>
                <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </form>
    );
};

export default FormularioCategoriaProducto;
