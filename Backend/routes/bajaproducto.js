const { Router } = require('express');

const {obtenerBajasProductos, crearBajaProducto, eliminarBajaProducto, actualizarBajaProducto } = require('../controllers/bajaproducto');
const { validarJWT } = require('../middlewares/verificartoken'); // Asegúrate de que la ruta sea correcta
const verificarPermisos = require('../middlewares/verificarPermisos'); // Asegúrate de que la ruta sea correcta
const router = Router();
router.use(validarJWT);
// Obtener todas las bajas de productos
router.get('/', verificarPermisos (['verBajaProducto']),  obtenerBajasProductos);

// Crear una nueva baja de producto
router.post('/', verificarPermisos (['crearBajaProducto']), crearBajaProducto);

// Actualizar una baja de producto por ID
router.put('/:id', verificarPermisos (['actualizarBajaProducto']), actualizarBajaProducto); // Agregada ruta para actualizar

// Eliminar una baja de producto por ID
router.delete('/:id', verificarPermisos (['eliminarBajaProducto']),  eliminarBajaProducto);

module.exports = router;
