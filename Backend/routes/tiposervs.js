const { Router} = require('express')

const router = Router()

const {tiposerviciosGet, tiposerviciosPost} = require('../controllers/tiposerv');

router.get('/', tiposerviciosGet)
router.post('/', tiposerviciosPost)

module.exports = router