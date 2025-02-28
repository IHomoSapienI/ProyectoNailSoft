const {Schema, model} = require('mongoose')
 
const TipoServicioSchema = Schema({
    nombreTs: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
     activo: {
        type: Boolean, 
        default: true
    },

})

module.exports = model('TipoServ', TipoServicioSchema);