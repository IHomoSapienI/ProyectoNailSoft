const jwt = require("jsonwebtoken")
const User = require("../modules/usuario")

const validarJWT = async (req, res, next) => {
  const token = req.header("Authorization")

  if (!token) {
    return res.status(401).json({
      msg: "No hay token en la petición",
    })
  }

  try {
    // Eliminar 'Bearer ' del token si está presente
    const tokenWithoutBearer = token.replace("Bearer ", "")
    const { userId } = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET || "secret_key")

    // Guardar el ID del usuario en el request
    req.userId = userId

    // Verificar si el usuario existe y está activo
    const usuario = await User.findById(userId)

    if (!usuario) {
      return res.status(401).json({
        msg: "Token no válido - usuario no existe en DB",
      })
    }

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(401).json({
        msg: "Cuenta inactiva - usuario con estado: false",
        cuentaInactiva: true,
      })
    }

    // Guardar el usuario en el request para uso posterior
    req.usuario = usuario

    next()
  } catch (error) {
    console.log("Error en validarJWT:", error)
    return res.status(401).json({
      msg: "No tienes permiso para estar aqui :) post: tu token no es válido",
    })
  }
}

module.exports = {
  validarJWT,
}

