import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import FormularioInsumo from './FormularioInsumo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importa SweetAlert2

// Configura el contenedor del modal
Modal.setAppElement('#root');

const TablaInsumos = () => {
    const [insumos, setInsumos] = useState([]);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);

    // Estado para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const insumosPorPagina = 5; // Cantidad de insumos a mostrar por página

    useEffect(() => {
        obtenerInsumos();
    }, []);

    const obtenerInsumos = async () => {
        try {
            const token = localStorage.getItem('token'); // Obtener el token del localStorage
            if (!token) {
                await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                return;
            }

            const respuesta = await axios.get('https://gitbf.onrender.com/api/insumos', {
                headers: {
                    'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
                }
            });
            setInsumos(respuesta.data || []);
        } catch (error) {
            console.error('Error al obtener los insumos:', error);
            Swal.fire('Error', 'No tienes permiso para estar aqui :) post: tu token no es válido', 'error');
        }
    };

    const abrirFormulario = (insumo) => {
        setInsumoSeleccionado(insumo);
        setFormModalIsOpen(true);
    };

    const cerrarFormulario = () => {
        setFormModalIsOpen(false);
        setInsumoSeleccionado(null);
    };

    const manejarInsumoActualizado = () => {
        obtenerInsumos();
        cerrarFormulario();
    };

    const manejarEliminarInsumo = async (id) => {
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
                const token = localStorage.getItem('token'); // Obtener el token del localStorage
                if (!token) {
                    await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                    return;
                }

                await axios.delete(`https://gitbf.onrender.com/api/insumos/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
                    }
                });
                obtenerInsumos();
                Swal.fire('Eliminado!', 'El insumo ha sido eliminado.', 'success');
            } catch (error) {
                console.error('Error al eliminar el insumo:', error);
                Swal.fire('Error', 'No se pudo eliminar el insumo.', 'error');
            }
        }
    };

    // Funciones de paginación
    const indiceUltimoInsumo = paginaActual * insumosPorPagina;
    const indicePrimerInsumo = indiceUltimoInsumo - insumosPorPagina;
    const insumosActuales = insumos.slice(indicePrimerInsumo, indiceUltimoInsumo);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const paginasTotales = Math.ceil(insumos.length / insumosPorPagina);

    const paginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const paginaSiguiente = () => {
        if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1);
    };


    return (
        <div className="p-6 flex flex-col items-center" id='arroz'>
            <h2 className="text-3xl font-semibold mb-8">Gestión de Insumos</h2>

            {/* Botones y funcionalidades adicionales */}
            <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
                {/* Botón para agregar nuevo insumo ajustado */}
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => { setFormModalIsOpen(true); setInsumoSeleccionado(null); }}
                >
                    <FontAwesomeIcon icon={faPlus} /> {/* Icono de agregar */}
                </button>

                {/* Buscador */}
                <input
                    type="text"
                    id="searchInput"
                    className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Buscar en la tabla"
                />
            </div>

            {/* Tabla de insumos ajustada */}
            <div className="w-full max-w-4xl">
                <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-50 content-center">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Insumo</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {insumosActuales.map((insumo) => (
                            <tr key={insumo._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insumo.nombreInsumo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${insumo.precio}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.estado ? 'Disponible' : 'No disponible'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => abrirFormulario(insumo)}
                                    >
                                        <FontAwesomeIcon icon={faEdit} /> {/* Icono de editar */}
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEliminarInsumo(insumo._id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> {/* Icono de eliminar */}
                                    </button>
                                </td>
                            </tr>
                        ))}
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

            {/* El Modal */}
            <Modal
                isOpen={formModalIsOpen}
                onRequestClose={cerrarFormulario}
                className="fixed inset-0 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={cerrarFormulario}
                    >
                        <FontAwesomeIcon icon="times" />
                    </button>
                    <h2 className="text-2xl font-semibold mb-4">
                        {insumoSeleccionado ? 'Actualizar Insumo' : 'Nuevo Insumo'}
                    </h2>
                    <FormularioInsumo
                        insumo={insumoSeleccionado}
                        onClose={cerrarFormulario}
                        onUpdated={manejarInsumoActualizado}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default TablaInsumos;
