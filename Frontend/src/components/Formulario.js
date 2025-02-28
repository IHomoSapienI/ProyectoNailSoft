import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function FormularioUsuario({ onClose, onUsuarioActualizado, usuarioEditando, roles }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: '',
    estado: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuarioEditando) {
      setFormData({
        ...formData,
        nombre: usuarioEditando.nombre,
        email: usuarioEditando.email,
        rol: usuarioEditando.rol,
        estado: usuarioEditando.estado
      });
    }
  }, [usuarioEditando]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!usuarioEditando && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    try {
      const url = usuarioEditando 
        ? `https://gitbf.onrender.com/api/usuarios/${usuarioEditando._id}`
        : 'https://gitbf.onrender.com/api/usuarios';
      const method = usuarioEditando ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: usuarioEditando ? 'Actualización Exitosa' : 'Registro Exitoso',
          text: usuarioEditando ? 'Usuario actualizado exitosamente!' : 'Usuario creado exitosamente!'
        });
        onUsuarioActualizado();
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.msg || 'Error al procesar la solicitud');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.msg || 'Error al procesar la solicitud'
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {usuarioEditando ? 'Editar Usuario' : 'Agregar Usuario'}
      </h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ingrese su nombre"
          />
          <p className="text-gray-500 text-xs">Por favor, introduzca su nombre completo.</p>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="ejemplo@dominio.com"
          />
          <p className="text-gray-500 text-xs">Asegúrese de que su email sea válido.</p>
        </div>
        {!usuarioEditando && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={7}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Ingrese su contraseña"
              />
              <p className="text-gray-500 text-xs">La contraseña debe tener al menos 7 caracteres.</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={7}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Confirme su contraseña"
              />
            </div>
          </>
        )}
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Seleccionar rol</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>{r.nombreRol}</option>
            ))}
          </select>
          <p className="text-gray-500 text-xs">Seleccione un rol para el nuevo usuario.</p>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="estado"
            name="estado"
            checked={formData.estado}
            onChange={handleChange}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <label htmlFor="estado" className="ml-2 block text-sm text-gray-900">Activo</label>
        </div>
        <div className="flex justify-between">
        <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Procesando...' : usuarioEditando ? 'Actualizar' : 'Guardar'}
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
}
