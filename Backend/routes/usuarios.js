const { Router } = require('express');
//const { validarJWT } = require('../middlewares/verificartoken'); // Importar el middleware
//const verificarPermisos = require('../middlewares/verificarPermisos'); // Asegúrate de que la ruta sea correcta
const {usuariosGet, usuariosPost, usuariosPut, usuariosDelete } = require('../controllers/usuario');

const router = Router();
//router.use(validarJWT);
// // Ruta pública para registrar un usuario
// router.post('/', verificarPermisos (['crearUsuarios']), usuariosPost);

// // Ruta privada para obtener usuarios (requiere autenticación)
// router.get('/',  verificarPermisos (['verUsuarios']), usuariosGet); 

// // Ruta privada para actualizar un usuario (requiere autenticación)
// router.put('/:id',  verificarPermisos (['actualizarUsuarios']), usuariosPut); 

// // Ruta privada para eliminar un usuario (requiere autenticación)
// router.delete('/:id',  verificarPermisos (['eliminarUsuarios']), usuariosDelete);


// Ruta pública para registrar un usuario
router.post('/',  usuariosPost);

// Ruta privada para obtener usuarios (requiere autenticación)
router.get('/',   usuariosGet); 

// Ruta privada para actualizar un usuario (requiere autenticación)
router.put('/:id',   usuariosPut); 

// Ruta privada para eliminar un usuario (requiere autenticación)
router.delete('/:id',   usuariosDelete);


module.exports = router;
