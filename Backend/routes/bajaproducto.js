const { Router } = require('express');
const { obtenerBajasProductos, crearBajaProducto, eliminarBajaProducto } = require('../controllers/bajaproducto');
const { validarJWT } = require('../middlewares/verificartoken');
const verificarPermisos = require('../middlewares/verificarPermisos');

const router = Router();
router.use(validarJWT);

// Obtener todas las bajas de productos con detalles del insumo
router.get('/', verificarPermisos(['verBajaProducto']), async (req, res) => {
    try {
        const bajas = await BajaProducto.find().populate('productoId'); // Cargar datos del insumo
        res.json(bajas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las bajas de productos', error });
    }
});

// Crear una nueva baja de producto
router.post('/', verificarPermisos(['crearBajaProducto']), crearBajaProducto);

// Eliminar una baja de producto y restaurar el stock
router.delete('/:id', verificarPermisos(['eliminarBajaProducto']), eliminarBajaProducto);

module.exports = router;