// controllers/authController.js
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../modules/usuario")
const Rol = require("../modules/rol")
const { createUser } = require("../controllers/userHelper")

const login = async (req, res) => {
  const { email, password } = req.body

  console.log("Inicio de sesión - Email:", email)

  try {
    const user = await User.findOne({ email }).populate("rol")
    if (!user) {
      console.log("Usuario no encontrado")
      return res.status(400).json({ message: "Credenciales inválidas" })
    }

    console.log("Usuario encontrado:", JSON.stringify(user, null, 2))

    // Verificar si el usuario está activo
    if (!user.estado) {
      console.log("Usuario inactivo:", user.email)
      return res.status(401).json({
        message: "Tu cuenta ha sido desactivada. Por favor, contacta al administrador.",
        cuentaInactiva: true,
      })
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password)
    console.log("Resultado de bcrypt.compare:", isMatch)

    if (!isMatch) {
      console.log("Contraseña incorrecta")
      return res.status(400).json({ message: "Credenciales inválidas" })
    }

    // Verificar si el rol está activo
    if (!user.rol.estadoRol) {
      console.log("Rol desactivado:", user.rol.nombreRol)
      return res.status(403).json({
        message: "Tu rol ha sido desactivado. Contacta al administrador.",
        rolDesactivado: true,
      })
    }

    const token = jwt.sign({ userId: user._id, role: user.rol.nombreRol }, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "1h",
    })
    console.log("Token generado:", token)

    res.json({
      token,
      role: user.rol.nombreRol,
      user: {
        id: user._id,
        email: user.email,
        name: user.nombre,
      },
    })
  } catch (error) {
    console.error("Error en el login:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

const register = async (req, res) => {
  const { nombre, email, password, confirmPassword, rol, estado } = req.body

  console.log("Registro - Datos recibidos:", { nombre, email, rol, estado })

  try {
    if (!nombre || !email || !password || !confirmPassword) {
      console.log("Faltan campos obligatorios")
      return res.status(400).json({
        msg: "Faltan campos obligatorios (nombre, email, password, confirmPassword)",
      })
    }

    if (password !== confirmPassword) {
      console.log("Las contraseñas no coinciden")
      return res.status(400).json({
        msg: "Las contraseñas no coinciden",
      })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      console.log("El usuario ya existe:", email)
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    let rolId
    if (rol) {
      const existeRol = await Rol.findById(rol)
      if (!existeRol) {
        console.log("El rol especificado no es válido:", rol)
        return res.status(400).json({
          msg: "El rol especificado no es válido",
        })
      }

      // Verificar si el rol está activo
      if (!existeRol.estadoRol) {
        console.log("Rol desactivado:", existeRol.nombreRol)
        return res.status(403).json({
          msg: "El rol seleccionado está desactivado. Por favor, selecciona otro rol.",
          rolDesactivado: true,
        })
      }

      rolId = rol
    } else {
      const defaultRol = await Rol.findOne({ nombreRol: "Cliente" })

      // Verificar si el rol por defecto está activo
      if (!defaultRol.estadoRol) {
        console.log("Rol por defecto desactivado:", defaultRol.nombreRol)
        return res.status(403).json({
          msg: "El rol por defecto está desactivado. Por favor, contacta al administrador.",
          rolDesactivado: true,
        })
      }

      rolId = defaultRol._id
    }

    const newUser = await createUser({ nombre, email, password, rol: rolId, estado })
    console.log("Usuario guardado en la base de datos:", JSON.stringify(newUser, null, 2))

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.rol.nombreRol },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" },
    )
    console.log("Token generado:", token)

    res.json({
      token,
      role: newUser.rol.nombreRol,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.nombre,
      },
    })
  } catch (error) {
    console.error("Error en el registro:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Endpoint para verificar si el token es válido
const verificarToken = async (req, res) => {
  try {
    // El middleware validarJWT ya verificó el token y agregó el userId al request
    const userId = req.userId

    // Buscar el usuario en la base de datos
    const user = await User.findById(userId).populate("rol")

    if (!user) {
      return res.status(401).json({
        message: "Usuario no encontrado",
      })
    }

    // Verificar si el usuario está activo
    if (!user.estado) {
      return res.status(401).json({
        message: "Tu cuenta ha sido desactivada. Por favor, contacta al administrador.",
        cuentaInactiva: true,
      })
    }

    // Verificar si el rol está activo
    if (!user.rol.estadoRol) {
      return res.status(403).json({
        message: "Tu rol ha sido desactivado. Contacta al administrador.",
        rolDesactivado: true,
      })
    }

    res.json({
      message: "Token válido",
      user: {
        id: user._id,
        email: user.email,
        name: user.nombre,
        role: user.rol.nombreRol,
      },
    })
  } catch (error) {
    console.error("Error al verificar token:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

module.exports = {
  login,
  register,
  verificarToken,
}

