const { Router } = require('express');

const { login, register } = require('../controllers/authController'); // Asegúrate de importar el controlador de registro también
const router = Router();

router.post('/login', login); // Ruta para login
router.post('/register', register); // Ruta para registro

module.exports = router;
