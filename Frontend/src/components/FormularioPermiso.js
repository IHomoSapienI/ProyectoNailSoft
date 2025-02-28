import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FormularioPermiso = ({ onClose, onPermisoCreated }) => {
  const [formData, setFormData] = useState({
    nombrePermiso: '',
    descripcion: '',
    activo: true,
    categoria: '',
    nivel: 'read'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://gitbf.onrender.com/api/permisos', formData);
      Swal.fire({
        icon: 'success',
        title: 'Permiso creado exitosamente',
        showConfirmButton: false,
        timer: 1500
      });
      onPermisoCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error al crear el permiso:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el permiso. Por favor, inténtelo de nuevo.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 text-center">Crear Permiso</h2>
        
        <div>
            <label htmlFor="nombrePermiso" className="block text-sm font-medium text-gray-700">Nombre del Permiso:</label>
            <input
                type="text"
                id="nombrePermiso"
                name="nombrePermiso"
                value={formData.nombrePermiso}
                onChange={handleChange}
                required
                minLength={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Ejemplo: Crear Usuarios, Editar Roles.</p> {/* Mensaje de ayuda */}
        </div>

        <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                Descripción <span className="text-red-500">*</span> {/* Campo obligatorio */}
            </label>
            <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                minLength={10}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Descripción del permiso"
            />
        </div>

        <div className="flex items-center">
            <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">Activo</label>
        </div>

        <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                Categoría <span className="text-red-500">*</span> {/* Campo obligatorio */}
            </label>
            <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
                <option value="">Selecciona una categoría</option>
                <option value="categoriaProductos">Categorías de Productos</option>
                <option value="citas">Citas</option>
                <option value="clientes">Clientes</option>
                <option value="compras">Compras</option>
                <option value="configuración">Configuración</option>
                <option value="empleados">Empleados</option>
                <option value="insumos">Insumos</option>
                <option value="permisos">Venta de servicios</option>
                <option value="productos">Productos</option>
                <option value="proveedores">Proveedores</option>
                <option value="reportes">Reportes</option>
                <option value="roles">Roles</option>
                <option value="servicios">Servicios</option>
                <option value="usuarios">Usuarios</option>
                <option value="ventaServicios">Venta de Servicios</option>
                <option value="ventaProductos">Venta de Productos</option>
            </select>
        </div>

        <div>
            <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">Nivel</label>
            <select
                id="nivel"
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
                <option value="read">Lectura</option>
                <option value="write">Escritura</option>
                <option value="delete">Eliminación</option>
            </select>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
        <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Crear Permiso
            </button>
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Cancelar
            </button>
            
        </div>
    </form>
);
};

export default FormularioPermiso;
