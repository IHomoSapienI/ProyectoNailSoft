const { Router } = require('express');
const { obtenerBajasProductos, crearBajaProducto, eliminarBajaProducto } = require('../controllers/bajaproducto');
// const { validarJWT } = require('../middlewares/verificartoken');
// const verificarPermisos = require('../middlewares/verificarPermisos');

const router = Router();
// router.use(validarJWT);

// Obtener todas las bajas de productos con detalles del insumo
router.get('/', obtenerBajasProductos);

// Crear una nueva baja de producto
router.post('/', crearBajaProducto);

// Eliminar una baja de producto y restaurar el stock
router.delete('/:id',eliminarBajaProducto);

module.exports = router;