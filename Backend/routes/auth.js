const { Router } = require("express")
const { login, register, verificarToken } = require("../controllers/authController")
const { validarJWT } = require("../middlewares/verificartoken")

const router = Router()

// Ruta para login
router.post("/login", login)

// Ruta para registro
router.post("/register", register)

// Ruta para verificar token
router.get("/verificar-token", validarJWT, verificarToken)

module.exports = router

