const { Router } = require('express');
const {rolesGet, rolesPost,rolesPut, rolesDelete} =require ('../controllers/rol');
const { validarJWT } = require('../middlewares/verificartoken'); // Asegúrate de que la ruta sea correcta
const verificarPermisos = require('../middlewares/verificarPermisos'); // Asegúrate de que la ruta sea correcta

const router = Router();

router.use(validarJWT);

router.get('/', verificarPermisos (['verRoles']),rolesGet);

router.post('/', verificarPermisos (['crearRol']),rolesPost);

router.put('/:id', verificarPermisos (['actualizarRol']),rolesPut);

router.delete('/:id', verificarPermisos (['eliminarRol']),rolesDelete);

module.exports = router;