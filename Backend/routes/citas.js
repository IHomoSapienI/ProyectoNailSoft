const { Router } = require('express');


const { crearCita, obtenerCitas, obtenerCitaPorId, actualizarCita, eliminarCita} = require('../controllers/cita');
//const { validarJWT } = require('../middlewares/verificartoken'); // Asegúrate de que la ruta sea correcta
//const verificarPermisos = require('../middlewares/verificarPermisos'); // Asegúrate de que la ruta sea correcta
const router = Router();
//router.use(validarJWT);
// Definir las rutas para citas
// router.post('/', verificarPermisos (['crearCita']), crearCita);
// router.get('/', verificarPermisos (['verCita']),obtenerCitas);
// router.get('/:id', verificarPermisos (['verCita']), obtenerCitaPorId);
// router.put('/:id', verificarPermisos (['actualizarCita']), actualizarCita);
// router.delete('/:id', verificarPermisos (['eliminarCita']),eliminarCita);


router.post('/',  crearCita);
router.get('/', obtenerCitas);
router.get('/:id',  obtenerCitaPorId);
router.put('/:id',  actualizarCita);
router.delete('/:id', eliminarCita);


module.exports = router;
