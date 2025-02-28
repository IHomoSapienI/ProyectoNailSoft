import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import FormularioEmpleado from './FormularioEmpleado';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importa SweetAlert2

// Configura el contenedor del modal
Modal.setAppElement('#root');

const TablaEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);

    // Estado para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const empleadosPorPagina = 5; // Cantidad de empleados a mostrar por página

    useEffect(() => {
        obtenerEmpleados();
    }, []);

    const obtenerEmpleados = async () => {
        try {
            const respuesta = await axios.get('https://gitbf.onrender.com/api/empleados');
            setEmpleados(respuesta.data || []);
        } catch (error) {
            console.error('Error al obtener los empleados:', error);
        }
    };

    const abrirFormulario = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setFormModalIsOpen(true);
    };

    const cerrarFormulario = () => {
        setFormModalIsOpen(false);
        setEmpleadoSeleccionado(null);
    };

    const manejarEmpleadoActualizado = () => {
        obtenerEmpleados();
        cerrarFormulario();
    };

    const manejarEliminarEmpleado = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`https://gitbf.onrender.com/api/empleados/${id}`);
                obtenerEmpleados();
                Swal.fire('Eliminado!', 'El empleado ha sido eliminado.', 'success');
            } catch (error) {
                console.error('Error al eliminar el empleado:', error);
            }
        }
    };

    // Funciones de paginación
    const indiceUltimoEmpleado = paginaActual * empleadosPorPagina;
    const indicePrimerEmpleado = indiceUltimoEmpleado - empleadosPorPagina;
    const empleadosActuales = empleados.slice(indicePrimerEmpleado, indiceUltimoEmpleado);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const paginasTotales = Math.ceil(empleados.length / empleadosPorPagina);

    const paginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const paginaSiguiente = () => {
        if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1);
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <h1 className="text-3xl font-semibold mb-8">Gestión de Empleados</h1>
            <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
                <button 
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => { setFormModalIsOpen(true); setEmpleadoSeleccionado(null); }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
                {/* Buscador */}
                <input
                    type="text"
                    id="searchInput"
                    className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Buscar en la tabla"
                />
            </div>
            {/* Tabla de empleados ajustada */}
            <div className="w-full max-w-4xl">
                <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {empleadosActuales.length > 0 ? (
                            empleadosActuales.map((empleado) => (
                                <tr key={empleado._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empleado.nombreempleado}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.apellidoempleado}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.telefonoempleado}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empleado.estadoempleado}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                            onClick={() => abrirFormulario(empleado)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                            onClick={() => manejarEliminarEmpleado(empleado._id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm font-medium text-gray-500">No hay empleados disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="mt-4">
                <nav className="flex justify-center">
                    <ul className="inline-flex items-center">
                        <li>
                            <button
                                onClick={paginaAnterior}
                                disabled={paginaActual === 1}
                                className={`px-3 py-1 mx-1 rounded ${
                                    paginaActual === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                &lt; {/* Flecha izquierda */}
                            </button>
                        </li>
                        {Array.from({ length: paginasTotales }, (_, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => cambiarPagina(index + 1)}
                                    className={`px-3 py-1 mx-1 rounded ${
                                        paginaActual === index + 1
                                            ? 'bg-gray-300 text-gray-700'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={paginaSiguiente}
                                disabled={paginaActual === paginasTotales}
                                className={`px-3 py-1 mx-1 rounded ${
                                    paginaActual === paginasTotales ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                &gt; {/* Flecha derecha */}
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Modal para el formulario de agregar o editar empleado */}
            <Modal
                isOpen={formModalIsOpen}
                onRequestClose={cerrarFormulario}
                contentLabel="Formulario de Empleado"
                className="fixed inset-0 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={cerrarFormulario}
                    >
                        &times;
                    </button>
                    <h2 className="text-lg font-semibold mb-4">{empleadoSeleccionado ? 'Actualizar Empleado' : 'Agregar Empleado'}</h2>
                    <FormularioEmpleado
                        empleado={empleadoSeleccionado}
                        onClose={manejarEmpleadoActualizado}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default TablaEmpleados;
