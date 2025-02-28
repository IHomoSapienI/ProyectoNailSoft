const BajaProductoSchema = Schema({
    productoId: {
        type: Schema.Types.ObjectId,
        ref: 'Insumo', // Referencia al modelo Insumo
        required: true
    },
    producto: {
        type: String,
        required: true
    },
    fechaBaja: {
        type: Date,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0
    },
    observaciones: {
        type: String,
        default: ''
    }
});
