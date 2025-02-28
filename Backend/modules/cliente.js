const { Schema, model } = require('mongoose');

const ClienteSchema = Schema({
    documentocliente: {
        type: String,
        required: true,
        unique: true // Asegura que no haya duplicados de documento de cliente
    },
    nombrecliente: {
        type: String,
        required: true
    },
    direccioncliente: {
        type: String,
        required: true
    },
    celularcliente: {
        type: String,
        required: true
    },
    estadocliente: {
        type: String,
        enum: ['Activo', 'Inactivo'], // Limita a estos dos valores
        default: 'Activo'
    }
});

module.exports = model('Cliente', ClienteSchema);
