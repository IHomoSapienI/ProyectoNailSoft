const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../modules/usuario")
const Rol = require("../modules/rol")
const { createUser } = require("../controllers/userHelper")
const nodemailer = require("nodemailer")
const crypto = require("crypto")

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Solo para desarrollo
  },
})

// Verificación mejorada
transporter.verify((error, success) => {
  if (error) {
    console.error("Error al configurar el correo:", error)
    throw new Error("Error al configurar el servicio de correo")
  } else {
    console.log("Servidor de correo listo")
  }
})

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

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  const { email } = req.body

  console.log("Solicitud de restablecimiento de contraseña para:", email)

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ email }).populate("rol")
    if (!user) {
      console.log("Usuario no encontrado para restablecimiento de contraseña:", email)
      // Por seguridad, no informamos al cliente que el usuario no existe
      return res.status(200).json({
        message: "Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.",
      })
    }

    // Verificar si el usuario está activo
    if (!user.estado) {
      console.log("Usuario inactivo solicitando restablecimiento:", email)
      return res.status(200).json({
        message: "Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.",
      })
    }

    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Guardar token hasheado en la base de datos
    const hashedToken = await bcrypt.hash(resetToken, 10)

    // Actualizar usuario con el token y su fecha de expiración (1 hora)
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hora en milisegundos

    // Guardar el usuario sin validar el esquema completo
    // Esto evita problemas con valores predeterminados en otros campos
    await user.save({ validateBeforeSave: false })

    console.log("Token de restablecimiento generado para:", email)

    // Enviar correo con el token
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Restablecimiento de contraseña",
      html: `
        <h1>Restablecimiento de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Tu código de verificación es: <strong>${resetToken}</strong></p>
        <p>Este código expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("Correo de restablecimiento enviado a:", email)

    res.status(200).json({
      message: "Se ha enviado un correo con las instrucciones para restablecer tu contraseña.",
    })
  } catch (error) {
    console.error("Error al solicitar restablecimiento de contraseña:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Verificar token de restablecimiento
const verifyResetToken = async (req, res) => {
  const { token } = req.body

  console.log("Verificando token de restablecimiento:", token)

  try {
    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: { $exists: true },
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      console.log("Token inválido o expirado")
      return res.status(400).json({ message: "Token inválido o expirado" })
    }

    // Verificar que el token coincida
    const isValid = await bcrypt.compare(token, user.resetPasswordToken)

    if (!isValid) {
      console.log("Token no coincide")
      return res.status(400).json({ message: "Token inválido o expirado" })
    }

    console.log("Token verificado correctamente para usuario:", user.email)

    // Devolver un token temporal para permitir el restablecimiento
    const resetAuthToken = jwt.sign(
      { userId: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "15m" },
    )

    res.status(200).json({
      message: "Token verificado correctamente",
      resetAuthToken,
      email: user.email,
    })
  } catch (error) {
    console.error("Error al verificar token:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// Restablecer contraseña
const resetPassword = async (req, res) => {
  const { resetAuthToken, password, confirmPassword } = req.body

  console.log("Restableciendo contraseña con token de autorización")

  try {
    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      console.log("Las contraseñas no coinciden")
      return res.status(400).json({ message: "Las contraseñas no coinciden" })
    }

    // Verificar el token de autorización
    let decoded
    try {
      decoded = jwt.verify(resetAuthToken, process.env.JWT_SECRET || "secret_key")
    } catch (error) {
      console.log("Token de autorización inválido o expirado")
      return res.status(401).json({ message: "Sesión expirada. Por favor, solicita un nuevo restablecimiento." })
    }

    // Verificar que el propósito del token sea correcto
    if (decoded.purpose !== "password-reset") {
      console.log("Token con propósito incorrecto")
      return res.status(401).json({ message: "Token no autorizado para esta operación" })
    }

    // Buscar el usuario
    const user = await User.findById(decoded.userId)

    if (!user || !user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
      console.log("Usuario no encontrado o token expirado")
      return res.status(400).json({ message: "La sesión de restablecimiento ha expirado" })
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Actualizar la contraseña y limpiar los campos de restablecimiento usando updateOne
    // Esto evita problemas de validación con el esquema
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      },
    )

    console.log("Contraseña restablecida correctamente para:", user.email)

    res.status(200).json({ message: "Contraseña restablecida correctamente" })
  } catch (error) {
    console.error("Error al restablecer contraseña:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

module.exports = {
  login,
  register,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
}

