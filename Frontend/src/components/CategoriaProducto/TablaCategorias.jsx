import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import FormularioCategoriaProducto from './FormularioCategoriaProducto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importa SweetAlert2

// Configura el contenedor del modal
Modal.setAppElement('#root');

const TablaCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);

    // Estado para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const categoriasPorPagina = 5; // Cantidad de categorías a mostrar por página

    useEffect(() => {
        obtenerCategorias();
    }, []);

    const obtenerCategorias = async () => {
        const token = localStorage.getItem('token'); // Obtener el token del localStorage
        if (!token) {
            await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
            return;
        }

        try {
            const respuesta = await axios.get('https://gitbf.onrender.com/api/categoriaproductos', {
                headers: {
                    'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
                }
            });
            setCategorias(respuesta.data.categorias || []);
        } catch (error) {
            console.error('Error al obtener las categorías:', error);
            Swal.fire('Error', 'No tienes permiso para estar aqui :) post: tu token no es válido', 'error');
        }
    };

    const manejarAgregarNuevo = () => {
        setCategoriaSeleccionada(null);
        setFormModalIsOpen(true);
    };

    const manejarCerrarModal = () => {
        setFormModalIsOpen(false);
    };

    const manejarCategoriaAgregadaOActualizada = () => {
        obtenerCategorias(); // Recargar las categorías después de agregar o editar
        manejarCerrarModal();
    };

    const manejarEditar = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setFormModalIsOpen(true);
    };

    const manejarEliminarCategoria = async (id) => {
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
            const token = localStorage.getItem('token'); // Obtener el token del localStorage
            if (!token) {
                await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                return;
            }

            try {
                await axios.delete(`https://gitbf.onrender.com/api/categoriaproductos/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
                    }
                });
                setCategorias(categorias.filter(categoria => categoria._id !== id));
                Swal.fire(
                    'Eliminado!',
                    'La categoría ha sido eliminada.',
                    'success'
                );
            } catch (error) {
                console.error('Error al eliminar la categoría:', error);
                Swal.fire('Error', 'No se pudo eliminar la categoría.', 'error');
            }
        }
    };

    // Funciones de paginación
    const indiceUltimaCategoria = paginaActual * categoriasPorPagina;
    const indicePrimeraCategoria = indiceUltimaCategoria - categoriasPorPagina;
    const categoriasActuales = categorias.slice(indicePrimeraCategoria, indiceUltimaCategoria);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const paginasTotales = Math.ceil(categorias.length / categoriasPorPagina);

    const paginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const paginaSiguiente = () => {
        if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1);
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <h2 className="text-3xl font-semibold mb-8">Gestión de Categorías</h2>

            {/* Botones y buscador */}
            <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={manejarAgregarNuevo}
                >
                    <FontAwesomeIcon icon={faPlus} /> {/* Icono de agregar */}
                </button>

                <input
                    type="text"
                    id="searchInput"
                    className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Buscar en la tabla"
                />
            </div>

            {/* Tabla de categorías */}
            <div className="w-full max-w-4xl">
                <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de la Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categoriasActuales.map((categoria) => (
                            <tr key={categoria._id}>
                                {/* Cambié 'nombreCategoria' por 'nombreCp', 'descripcionCp' y 'activo' */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{categoria.nombreCp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{categoria.descripcionCp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {categoria.activo ? 'Activo' : 'Inactivo'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEditar(categoria)}
                                    >
                                        <FontAwesomeIcon icon={faEdit} /> {/* Icono de editar */}
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEliminarCategoria(categoria._id)}
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
                                &lt;
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
                                &gt;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* El Modal */}
            <Modal
                isOpen={formModalIsOpen}
                onRequestClose={manejarCerrarModal}
                contentLabel="Formulario de Categoría Producto"
                className="w-1/2 mx-auto bg-white p-4 rounded-lg shadow-lg"
            >
                <FormularioCategoriaProducto
                    categoria={categoriaSeleccionada}
                    onFormClose={manejarCerrarModal}
                    onCategoriaAgregadaOActualizada={manejarCategoriaAgregadaOActualizada}
                />
            </Modal>
        </div>
    );
};

export default TablaCategorias;
