import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const FormularioInsumo = ({ insumo, onClose, onUpdated }) => {
    const [nombreInsumo, setNombreInsumo] = useState('');
    const [stock, setStock] = useState('');
    const [precio, setPrecio] = useState('');
    const [estado, setEstado] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [modoEdicion, setModoEdicion] = useState(false);
    const apiUrl = 'https://gitbf.onrender.com/api/insumos';

    useEffect(() => {
        if (insumo) {
            setNombreInsumo(insumo.nombreInsumo || '');
            setStock(insumo.stock || '');
            setPrecio(insumo.precio || '');
            setEstado(insumo.estado || true);
            setModoEdicion(true);
        } else {
            setModoEdicion(false);
            setNombreInsumo('');
            setStock('');
            setPrecio('');
            setEstado(true);
        }
    }, [insumo]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
            return;
        }

        const insumoData = { nombreInsumo, stock, precio, estado };

        try {
            if (modoEdicion) {
                await axios.put(`${apiUrl}/${insumo._id}`, insumoData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Insumo actualizado exitosamente',
                    confirmButtonText: 'Ok',
                });
            } else {
                await axios.post(apiUrl, insumoData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Insumo creado exitosamente',
                    confirmButtonText: 'Ok',
                });
            }
            onUpdated();
            onClose();
        } catch (error) {
            console.error('Error al guardar el insumo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar el insumo',
            });
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">
                {modoEdicion ? 'Editar Insumo' : 'Agregar Insumo'}
            </h2>
            {mensaje && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{mensaje}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nombreInsumo" className="block text-sm font-medium text-gray-700">
                        Nombre del Insumo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="nombreInsumo"
                        value={nombreInsumo}
                        onChange={(e) => setNombreInsumo(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Ingrese el nombre del insumo"
                    />
                </div>

                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                        Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                        min="0"
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
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Ingrese el precio"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="estado"
                        checked={estado}
                        onChange={(e) => setEstado(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <label htmlFor="estado" className="ml-2 block text-sm text-gray-900">Activo</label>
                </div>

                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {modoEdicion ? 'Actualizar Insumo' : 'Agregar Insumo'}
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

export default FormularioInsumo;