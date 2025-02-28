import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Importa SweetAlert2
import axios from 'axios';

const FormularioCliente = ({ cliente, onClose }) => {
    const [documento, setDocumento] = useState('');
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [celular, setCelular] = useState('');
    const [estado, setEstado] = useState('Activo');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        if (cliente) {
            setDocumento(cliente.documentocliente);
            setNombre(cliente.nombrecliente);
            setDireccion(cliente.direccioncliente);
            setCelular(cliente.celularcliente);
            setEstado(cliente.estadocliente);
        }
    }, [cliente]);

    const manejarSubmit = async (e) => {
        e.preventDefault();

        const nuevoCliente = {
            documentocliente: documento,
            nombrecliente: nombre,
            direccioncliente: direccion,
            celularcliente: celular,
            estadocliente: estado,
        };

        try {
            let response;
            if (cliente) {
                // Si el cliente existe, actualizar
                response = await axios.put(`https://gitbf.onrender.com/api/clientes/${cliente._id}`, nuevoCliente);
                Swal.fire({
                    icon: 'success',
                    title: 'Cliente actualizado exitosamente',
                    confirmButtonText: 'Ok',
                });
            } else {
                // Si no, crear nuevo cliente
                response = await axios.post('https://gitbf.onrender.com/api/clientes', nuevoCliente);
                Swal.fire({
                    icon: 'success',
                    title: 'Cliente creado exitosamente',
                    confirmButtonText: 'Ok',
                });
            }
            onClose(); // Cerrar el modal después de agregar o actualizar
        } catch (error) {
            console.error('Error al guardar el cliente:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al guardar el cliente',
            });
        }
    };

    return (
        <form onSubmit={manejarSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
            {/* Documento del cliente */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Documento:</label>
                <input
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                    disabled={cliente ? true : false} // Deshabilitar si es edición
                />
            </div>

            {/* Nombre del cliente */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
            </div>

            {/* Dirección */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Dirección:</label>
                <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
            </div>

            {/* Celular */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Celular:</label>
                <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
            </div>

            {/* Estado */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Estado:</label>
                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-between">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    {cliente ? 'Actualizar Cliente' : 'Agregar Cliente'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                    Cerrar
                </button>
            </div>

            {/* Mensaje de estado */}
            {mensaje && <div className="mt-4 p-2 text-red-600">{mensaje}</div>}
        </form>
    );
};

export default FormularioCliente;
