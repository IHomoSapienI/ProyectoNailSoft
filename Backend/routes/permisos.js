const { Router } = require('express');
const router = Router();
const {permisosGet, permisosPost, permisosPut, permisosDelete} =require ('../controllers/permiso');

router.get('/',  permisosGet);
router.post('/', permisosPost);
router.put('/:id', permisosPut);
router.delete('/:id', permisosDelete);
module.exports = router;