import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import FormularioUsuario from './Formulario';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Configura el contenedor del modal
Modal.setAppElement('#root');

const TablaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [rolMap, setRolMap] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    // Estado para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const usuariosPorPagina = 5;

    useEffect(() => {
        obtenerUsuariosYRoles();
    }, []);

    const obtenerUsuariosYRoles = async () => {
        try {
            // Obtén el token de localStorage o sessionStorage
            const token = localStorage.getItem('token'); // Asegúrate de que 'token' sea la clave correcta
    
            const usuariosResponse = await fetch('https://gitbf.onrender.com/api/usuarios', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` , // Agrega el token a la cabecera x-token
                    'Content-Type': 'application/json' // Es buena práctica especificar el tipo de contenido
                },
            });
    
            if (!usuariosResponse.ok) {
                const errorData = await usuariosResponse.json();
                throw new Error(errorData.msg || 'Error al obtener los usuarios');
            }
    
            const usuariosData = await usuariosResponse.json();
            setUsuarios(usuariosData.usuarios || []);
            
            const rolesResponse = await fetch('https://gitbf.onrender.com/api/roles', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` , // Agrega el token aquí también
                    'Content-Type': 'application/json'
                },
            });
    
            if (!rolesResponse.ok) {
                const errorData = await rolesResponse.json();
                throw new Error(errorData.msg || 'Error al obtener los roles');
            }
    
            const rolesData = await rolesResponse.json();
            setRoles(rolesData.roles || []);
    
            const rolMap = {};
            rolesData.roles.forEach(rol => {
                rolMap[rol._id] = rol.nombreRol;
            });
            setRolMap(rolMap);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            Swal.fire('Error', error.message, 'error');
        }
    };
    

    const manejarAgregarNuevo = () => {
        setUsuarioEditando(null);
        setModalIsOpen(true);
    };

    const manejarCerrarModal = () => {
        setModalIsOpen(false);
        setUsuarioEditando(null);
    };

    const manejarUsuarioActualizado = () => {
        manejarCerrarModal();
        obtenerUsuariosYRoles();
    };

    const manejarEditar = (usuario) => {
        setUsuarioEditando(usuario);
        setModalIsOpen(true);
    };

    const manejarEliminar = async (id) => {
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
                const token = localStorage.getItem('token');
                const response = await fetch(`https://gitbf.onrender.com/api/usuarios/${id}`, {
                    
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}` // Agrega el token a la cabecera
                      }
                });

                if (response.ok) {
                    obtenerUsuariosYRoles();
                    Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
                } else {
                    const errorData = await response.json();
                    Swal.fire('Error', errorData.msg || 'Error al eliminar el usuario.', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error en la solicitud para eliminar el usuario.', 'error');
            }
        }
    };

    const filtrarUsuarios = () => {
        return usuarios.filter(usuario =>
            usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            usuario.email.toLowerCase().includes(busqueda.toLowerCase())
        );
    };

    const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
    const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
    const usuariosActuales = filtrarUsuarios().slice(indicePrimerUsuario, indiceUltimoUsuario);

    const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);
    const paginasTotales = Math.ceil(filtrarUsuarios().length / usuariosPorPagina);
    const paginaAnterior = () => paginaActual > 1 && setPaginaActual(paginaActual - 1);
    const paginaSiguiente = () => paginaActual < paginasTotales && setPaginaActual(paginaActual + 1);

    return (
        <div className="p-6 flex flex-col items-center">
            <h2 className="text-3xl font-semibold mb-8">Gestión de Usuarios</h2>
            <div className="flex justify-between mb-5 w-full h-7 max-w-4xl">
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={manejarAgregarNuevo}
                    disabled={modalIsOpen} // Deshabilita el botón cuando el modal está abierto
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
                <input
                    type="text"
                    id="searchInput"
                    className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Buscar en la tabla"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)} // Actualiza el estado de búsqueda
                />
            </div>

            <div className="w-full max-w-4xl " inert={modalIsOpen ? true : undefined}>
                <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {usuariosActuales.map((usuario) => (
                            <tr key={usuario._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usuario.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rolMap[usuario.rol] || 'Desconocido'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.estado ? 'Activo' : 'Inactivo'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  space-x-2">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEditar(usuario)}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                                        onClick={() => manejarEliminar(usuario._id)}
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
                                className={`px-3 py-1 mx-1 rounded ${paginaActual === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                &lt;
                            </button>
                        </li>
                        {Array.from({ length: paginasTotales }, (_, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => cambiarPagina(index + 1)}
                                    className={`px-3 py-1 mx-1 rounded ${paginaActual === index + 1 ? 'bg-gray-300 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={paginaSiguiente}
                                disabled={paginaActual === paginasTotales}
                                className={`px-3 py-1 mx-1 rounded ${paginaActual === paginasTotales ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                &gt;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={manejarCerrarModal}
                contentLabel="Formulario Usuario"
                className="fixed inset-0 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={manejarCerrarModal}
                    >
                        &times;
                    </button>
                    <h2 className="text-lg font-semibold mb-4">{usuarioEditando ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h2>
                    <FormularioUsuario
                        onClose={manejarCerrarModal}
                        onUsuarioActualizado={manejarUsuarioActualizado}
                        usuarioEditando={usuarioEditando}
                        roles={roles}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default TablaUsuarios;
