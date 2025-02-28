import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const FormularioEmpleado = ({ empleado, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('Activo');

    useEffect(() => {
        if (empleado) {
            setNombre(empleado.nombreempleado);
            setApellido(empleado.apellidoempleado);
            setTelefono(empleado.telefonoempleado);
            setEstado(empleado.estadoempleado);
        }
    }, [empleado]);

    const manejarSubmit = async (e) => {
        e.preventDefault();

        const nuevoEmpleado = {
            nombreempleado: nombre,
            apellidoempleado: apellido,
            telefonoempleado: telefono,
            estadoempleado: estado,
        };

        try {
            if (empleado) {
                await axios.put(`https://gitbf.onrender.com/api/empleados/${empleado._id}`, nuevoEmpleado);
                Swal.fire({
                    icon: 'success',
                    title: '¡Empleado actualizado con éxito!',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await axios.post('https://gitbf.onrender.com/api/empleados', nuevoEmpleado);
                Swal.fire({
                    icon: 'success',
                    title: '¡Empleado agregado con éxito!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            onClose(); // Cerrar el formulario después de guardar
        } catch (error) {
            console.error('Error al guardar el empleado:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el empleado. Por favor, inténtalo de nuevo.',
            });
        }
    };

    return (
        <form onSubmit={manejarSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
            <div>
                <label className="block text-gray-700">Nombre:</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700">Apellido:</label>
                <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700">Teléfono:</label>
                <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700">Estado:</label>
                <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                    {empleado ? 'Actualizar' : 'Agregar'}
                </button>
            </div>
        </form>
    );
};

export default FormularioEmpleado;
