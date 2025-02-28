import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaUserAstronaut } from 'react-icons/fa';

const UserProfile = () => {
    const { user, token } = useAuth(); // Obtén el usuario y el token desde el contexto
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [foto, setFoto] = useState(null);

    useEffect(() => {
        if (user) {
            setNombre(user.name);
            setEmail(user.email);
            setDescripcion(user.descripcion || '');
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('email', email);
        formData.append('descripcion', descripcion);
        if (foto) {
            formData.append('foto', foto);
        }

        try {
            const response = await axios.put(`https://gitbf.onrender.com/api/usuarios/${user.id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Incluye el token aquí
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Perfil actualizado con éxito');
            setEditMode(false); // Salir del modo de edición
        } catch (error) {
            if (error.response) {
                setError(`Error ${error.response.status}: ${error.response.data.message || 'Error al actualizar el perfil'}`);
            } else if (error.request) {
                setError('No se recibió respuesta del servidor. Verifica tu conexión a internet.');
            } else {
                setError('Error al configurar la solicitud. Inténtalo de nuevo.');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">Perfil de Usuario</h2>
                    <p>No hay información de usuario disponible. Por favor, inicie sesión.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl">
            <h1 className="text-3xl font-bold text-center mb-4">Perfil de Usuario</h1>
            <div className="mb-8 mx-auto flex justify-center">
                <FaUserAstronaut size={50} className="text-blue-500" />
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold">Nombre:</p>
                <p className="text-gray-700">{nombre}</p>
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold">Email:</p>
                <p className="text-gray-700">{email}</p>
            </div>
            <div className="mb-4">
                <p className="text-lg font-semibold">Descripción:</p>
                {editMode ? (
                    <textarea
                        className="border p-2 rounded mt-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Escribe tu descripción aquí..."
                        rows="4"
                        required
                    />
                ) : (
                    <p className="text-gray-700">{descripcion || 'No hay descripción disponible.'}</p>
                )}
            </div>
            {editMode ? (
                <form onSubmit={handleUpdate} className="mt-6">
                    <input
                        className="border p-2 rounded mt-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre"
                        required
                    />
                    <input
                        className="border p-2 rounded mt-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-600 transition duration-200 w-full"
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                    </button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            ) : (
                <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-600 transition duration-200 w-full"
                >
                    Editar Perfil
                </button>
            )}
        </div>
    );
};

export default UserProfile;