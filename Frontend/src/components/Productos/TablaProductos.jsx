import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import FormularioProducto from './FormularioProducto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

const TablaProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const productosPorPagina = 5;

    const obtenerProductos = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                return;
            }

            const respuesta = await fetch('https://gitbf.onrender.com/api/productos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
            const productosData = await respuesta.json();
            setProductos(productosData.productos || []);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        }
    }, []);

    useEffect(() => {
        obtenerProductos();
    }, [obtenerProductos]);

    const manejarAgregarNuevo = () => {
        setProductoSeleccionado(null);
        setFormModalIsOpen(true);
    };

    const manejarCerrarModal = () => {
        setFormModalIsOpen(false);
        setProductoSeleccionado(null);
    };

    const manejarProductoAgregadoOActualizado = async () => {
        await obtenerProductos();
        manejarCerrarModal();
    };

    const manejarEditar = (producto) => {
        setProductoSeleccionado(producto);
        setFormModalIsOpen(true);
    };

    const manejarEliminarProducto = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    await Swal.fire('Error', 'No se encontró el token de autenticación. Por favor, inicia sesión.', 'error');
                    return;
                }

                await fetch(`https://gitbf.onrender.com/api/productos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                await obtenerProductos();
                Swal.fire(
                    'Eliminado!',
                    'El producto ha sido eliminado.',
                    'success'
                );
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
                Swal.fire('Error', 'Hubo un problema al eliminar el producto.', 'error');
            }
        }
    };

    const indiceUltimoProducto = paginaActual * productosPorPagina;
    const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
    const productosActuales = productos.slice(indicePrimerProducto, indiceUltimoProducto);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const paginasTotales = Math.ceil(productos.length / productosPorPagina);

    const paginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const paginaSiguiente = () => {
        if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1);
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <h2 className="text-3xl font-semibold mb-8">Gestión de Productos</h2>

            <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={manejarAgregarNuevo}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>

                <input
                    type="text"
                    id="searchInput"
                    className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Buscar en la tabla"
                />
            </div>

            <div className="w-full max-w-4xl">
                <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {productosActuales.map((producto) => (
                            <tr key={producto._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producto.nombreProducto}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof producto.categoria === 'object' ? producto.categoria.nombreCp : producto.categoria}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${producto.precio}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEditar(producto)}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEliminarProducto(producto._id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                        paginaActual === index + 1 ? 'bg-gray-300 text-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

            <Modal
                isOpen={formModalIsOpen}
                onRequestClose={manejarCerrarModal}
                contentLabel="Formulario de Producto"
                className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto"
            >
                <FormularioProducto
                    producto={productoSeleccionado}
                    onClose={manejarProductoAgregadoOActualizado}
                />
            </Modal>
        </div>
    );
};

export default TablaProductos;