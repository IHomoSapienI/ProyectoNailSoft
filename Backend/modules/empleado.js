const { Schema, model } = require('mongoose');

const EmpleadoSchema = Schema({
    nombreempleado: {
        type: String,
        required: true
    },
    apellidoempleado: {
        type: String,
        required: true
    },
    telefonoempleado: {
        type: String,
        required: true
    },
    estadoempleado: {
        type: String,
        enum: ['Activo', 'Inactivo'], // Limita a estos dos valores
        default: 'Activo'
    }
});

module.exports = model('Empleado', EmpleadoSchema);
