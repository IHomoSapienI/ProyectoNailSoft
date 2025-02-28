const { Schema, model } = require('mongoose');

// Definición del esquema para insumos
const InsumoSchema = Schema({
    nombreInsumo: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0 
    },    
    estado: {
        type: Boolean,
        default: true 
    }
});

module.exports = model('Insumo', InsumoSchema);