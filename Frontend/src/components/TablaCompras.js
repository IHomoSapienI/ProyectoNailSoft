import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import FormularioCompra from './FormularioCompra';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
//import "@fortawesome/fontawesome-free/css/all.min.css";

Modal.setAppElement('#root');

const TablaCompras = () => {
    const [compras, setCompras] = useState([]);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [formModalIsOpen, setFormModalIsOpen] = useState(false);
    const [detallesModalIsOpen, setDetallesModalIsOpen] = useState(false);
    
    const [paginaActual, setPaginaActual] = useState(1);
    const comprasPorPagina = 5;

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        obtenerCompras();
    }, []);

    const obtenerCompras = async () => {
        try {
            const token = localStorage.getItem('token'); // Obtén el token del localStorage
            console.log('Token al obtener compras:', token); // Log para depuración
    
            const respuesta = await axios.get('https://gitbf.onrender.com/api/compras', {
                headers: {
                    'Authorization': `Bearer ${token}` // Asegúrate de que el token se envíe correctamente
                }
            });
    
            console.log('Datos recibidos de la API:', respuesta.data);



            setCompras(respuesta.data || []);
        } catch (error) {
            console.error('Error al obtener las compras:', error);
            Swal.fire('Error', 'No tienes permiso para estar aqui :) post: tu token no es válido', 'error');
        }
    };

    
    
    
    const abrirFormulario = (compra) => {
        setCompraSeleccionada(compra);
        setFormModalIsOpen(true);
    };

    const cerrarFormulario = () => {
        setFormModalIsOpen(false);
        setCompraSeleccionada(null);
    };

    const abrirDetalles = (compra) => {
        setCompraSeleccionada(compra);
        setDetallesModalIsOpen(true);
    };

    const cerrarDetalles = () => {
        setDetallesModalIsOpen(false);
        setCompraSeleccionada(null);
    };

    const manejarCompraActualizada = () => {
        obtenerCompras();
        cerrarFormulario();
    };

    const manejarEliminarCompra = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarla!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`https://gitbf.onrender.com/api/compras/${id}`);
                obtenerCompras();
                Swal.fire('Eliminado!', 'La compra ha sido eliminada.', 'success');
            } catch (error) {
                console.error('Error al eliminar la compra:', error);
                Swal.fire('Error', 'No se pudo eliminar la compra', 'error');
            }
        }
    };

    const indiceUltimaCompra = paginaActual * comprasPorPagina;
    const indicePrimeraCompra = indiceUltimaCompra - comprasPorPagina;
    const comprasActuales = compras
        .filter(compra => 
            compra.proveedor?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            compra.recibo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            new Date(compra.fechaCompra).toLocaleDateString().includes(searchQuery) || 
            compra.monto.toString().includes(searchQuery))
        .slice(indicePrimeraCompra, indiceUltimaCompra);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const paginasTotales = Math.ceil(compras.length / comprasPorPagina);

    const paginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const paginaSiguiente = () => {
        if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1);
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <h1 className="text-2xl font-semibold mb-4">Compras</h1>

            <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
            <button
    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center gap-2"
    onClick={() => { setFormModalIsOpen(true); setCompraSeleccionada(null); }}
>
    <FontAwesomeIcon icon={faPlus} />
    <span>Agregar compra</span>
</button>

                <input
                    type="text"
                    className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Buscar compras"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />                
            </div>
            <a 
    href="https://wa.me/3015789978?text=Quisiera realizar una reserva y poner magia en mis uñas" 
    className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300 z-50"
    target="_blank" 
    rel="noopener noreferrer"
>
    <i className="fab fa-whatsapp text-2xl"></i>
</a>

            <div className="overflow-x-auto w-full max-w-4xl">
                <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Recibo</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Compra</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Insumos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {comprasActuales.map((compra) => (
                            <tr key={compra._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{compra.proveedor?.nombreProveedor}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compra.recibo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(compra.fechaCompra).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(compra.fechaRegistro).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${compra.monto ? compra.monto.toFixed(2) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {compra.insumos.length} insumos
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => abrirFormulario(compra)}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => abrirDetalles(compra)}
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEliminarCompra(compra._id)}
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

            <Modal
                isOpen={formModalIsOpen}
                onRequestClose={cerrarFormulario}
                className="fixed inset-0 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-xl font-semibold mb-4">{compraSeleccionada ? 'Editar Compra' : 'Agregar Compra'}</h2>
                    <FormularioCompra
                        compra={compraSeleccionada}
                        onClose={cerrarFormulario}
                        onSuccess={manejarCompraActualizada}
                    />
                </div>
            </Modal>

            <Modal
  isOpen={detallesModalIsOpen}
  onRequestClose={cerrarDetalles}
  className="fixed inset-0 flex items-center justify-center p-4"
  overlayClassName="fixed inset-0 bg-black bg-opacity-50"
>
  <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Detalles de la Compra</h2>
      <button
        className="text-gray-500 hover:text-gray-700"
        onClick={cerrarDetalles}
      >
        ✕
      </button>
    </div>

    {compraSeleccionada ? (
      <div>
        <p><strong>Proveedor:</strong> {compraSeleccionada?.proveedor?.nombreProveedor || "N/A"}</p>
        <p><strong>Recibo:</strong> {compraSeleccionada?.recibo || "N/A"}</p>
        <p><strong>Fecha de Compra:</strong> {compraSeleccionada?.fechaCompra ? new Date(compraSeleccionada.fechaCompra).toLocaleDateString() : "N/A"}</p>
        <p><strong>Fecha de Registro:</strong> {compraSeleccionada?.fechaRegistro ? new Date(compraSeleccionada.fechaRegistro).toLocaleDateString() : "N/A"}</p>
        <p><strong>Monto Total:</strong> ${compraSeleccionada.monto.toFixed(2)}</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Insumos:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Insumo</th>
                <th className="px-4 py-2 border">Cantidad</th>
                <th className="px-4 py-2 border">Precio Unitario</th>
              </tr>
            </thead>
            <tbody>
              {compraSeleccionada?.insumos?.length > 0 ? (
                compraSeleccionada.insumos.map((insumo, index) => (
                  <tr key={index} className="border">
                    <td className="px-4 py-2 border">{insumo?.insumo?.nombreInsumo || "N/A"}</td>
                    <td className="px-4 py-2 border">{insumo?.cantidad || 0}</td>
                    <td className="px-4 py-2 border">${insumo.insumo.precio.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-center text-gray-500">No hay insumos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <p className="text-gray-500">No hay datos disponibles.</p>
    )}

    <div className="flex justify-end mt-4">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={cerrarDetalles}
      >
        Cerrar
      </button>
    </div>
  </div>
</Modal>
        </div>
    );
};

export default TablaCompras;