// models/Permiso.js
const { Schema, model } = require('mongoose');

const PermisoSchema = Schema({
    nombrePermiso: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        minlength: [3, 'El nombre del permiso debe tener al menos 3 caracteres'], // Validación opcional
    },

    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        minlength: [10, 'La descripción debe tener al menos 10 caracteres'] // Validación opcional
    },

    activo: { 
        type: Boolean, 
        default: true 
    },

    categoria: { // Campo opcional para categorizar permisos
        type: String,
        enum: ['usuarios', 'roles', 'configuración', 'reportes', 'compras', 'servicios', 'ventaServicios', 'productos', 'ventaProductos','citas','empleados','clientes','insumos','proveedores', 'categoriaProductos'], // Ejemplo de categorías
    },

    nivel: { // Campo opcional para el nivel de permiso
        type: String,
        enum: ['read', 'write', 'delete'], // Ejemplo de niveles
        default: 'read', // Valor por defecto
    },
}, { timestamps: true }); // Opcional, para mantener un registro de creación y actualización

module.exports = model('Permiso', PermisoSchema); // Modelo en minúsculas
