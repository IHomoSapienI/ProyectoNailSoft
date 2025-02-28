import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FormularioProducto = ({ producto, onClose }) => {
    const [formData, setFormData] = useState({
        nombreProducto: '',
        categoria: '',
        stock: '',
        precio: '',
        descripcion: '',
        estado: true,
        imagen: null
    });
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                    return;
                }

                const respuesta = await axios.get('https://gitbf.onrender.com/api/categoriaproductos', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setCategorias(respuesta.data.categorias || []);
            } catch (error) {
                console.error('Error al obtener las categorías:', error);
                Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
            }
        };

        obtenerCategorias();
    }, []);

    useEffect(() => {
        if (producto) {
            setFormData({
                nombreProducto: producto.nombreProducto || '',
                categoria: producto.categoria ? producto.categoria._id : '',
                stock: producto.stock || '',
                precio: producto.precio || '',
                descripcion: producto.descripcion || '',
                estado: producto.estado || true,
                imagen: null
            });
        }
    }, [producto]);

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
            if (!token) {
                await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                return;
            }

            if (producto) {
                await axios.put(`https://gitbf.onrender.com/api/productos/${producto._id}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                Swal.fire('Actualizado!', 'El producto ha sido actualizado correctamente.', 'success');
            } else {
                await axios.post('https://gitbf.onrender.com/api/productos', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                Swal.fire('Agregado!', 'El producto ha sido agregado correctamente.', 'success');
            }
            if (onClose) onClose();
        } catch (error) {
            console.error('Error al crear o actualizar el producto:', error.response ? error.response.data : error.message);
            Swal.fire('Error', 'Hubo un problema al guardar el producto.', 'error');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">
                {producto ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <form onSubmit={manejarSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nombreProducto" className="block text-sm font-medium text-gray-700">
                        Nombre Producto <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="nombreProducto"
                        name="nombreProducto"
                        value={formData.nombreProducto}
                        onChange={manejarCambio}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Ingrese el nombre del producto"
                    />
                </div>

                <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                        Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={manejarCambio}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria) => (
                            <option key={categoria._id} value={categoria._id}>
                                {categoria.nombreCp}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                        Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={manejarCambio}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Ingrese el stock"
                    />
                </div>

                <div>
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring  focus:ring-indigo-200 focus:ring-opacity-50"
                        rows="3"
                        placeholder="Ingrese la descripción del producto"
                    ></textarea>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="estado"
                        name="estado"
                        checked={formData.estado}
                        onChange={manejarCambio}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <label htmlFor="estado" className="ml-2 block text-sm text-gray-900">Activo</label>
                </div>

                <div>
                    <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
                        Imagen del Producto
                    </label>
                    <input
                        type="file"
                        id="imagen"
                        name="imagen"
                        onChange={manejarCambio}
                        className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                </div>

                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {producto ? 'Actualizar Producto' : 'Crear Producto'}
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

export default FormularioProducto;