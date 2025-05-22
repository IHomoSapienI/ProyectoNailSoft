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
  const { nombre, apellido, email, password, confirmPassword, rol, estado, celular } = req.body

  console.log("Registro - Datos recibidos:", { nombre, email, rol, estado })

  try {
    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password || !confirmPassword || !celular) {
      console.log("Faltan campos obligatorios")
      return res.status(400).json({
        msg: "Faltan campos obligatorios (nombre, apellido, email, password, confirmPassword, celular)",
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

    const newUser = await createUser({
      nombre,
      apellido,
      email,
      password,
      rol: rolId,
      estado,
      celular,
    })

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
// En la función requestPasswordReset:
const requestPasswordReset = async (req, res) => {
  const { email } = req.body

  console.log("Solicitud de restablecimiento de contraseña para:", email)

  try {
    const user = await User.findOne({ email }).populate("rol")
    if (!user) {
      console.log("Usuario no encontrado para restablecimiento de contraseña:", email)
      return res.status(200).json({
        message: "Si el correo existe en nuestra base de datos, recibirás un código para restablecer tu contraseña.",
      })
    }

    if (!user.estado) {
      console.log("Usuario inactivo solicitando restablecimiento:", email)
      return res.status(200).json({
        message: "Si el correo existe en nuestra base de datos, recibirás un código para restablecer tu contraseña.",
      })
    }

    // Generar token de 6 dígitos
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Guardar token hasheado y fecha de expiración (15 minutos)
    user.resetPasswordToken = await bcrypt.hash(resetToken, 10)
    user.resetPasswordExpires = Date.now() + 900000 // 15 minutos

    await user.save({ validateBeforeSave: false })

    console.log("Token de restablecimiento generado para:", email)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Código de verificación para restablecer contraseña",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de verificación</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #e1e1e1;
      border-radius: 5px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #e1e1e1;
    }
    .content {
      padding: 20px 0;
    }
    .code {
      font-size: 24px;
      letter-spacing: 3px;
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 5px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e1e1e1;
      font-size: 12px;
      color: #777;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://gitbf.onrender.com/uploads/logo1.png" alt="NailsSoft Logo" class="logo">
      <h1>NailsSoft</h1>
    </div>
    <div class="content">
      <h2>Código de verificación</h2>
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para verificar tu identidad:</p>
      
      <div class="code">${resetToken}</div>
      
      <p>Este código expirará en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
    <div class="footer">
      <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
      <p>&copy; ${new Date().getFullYear()} NailsSoft. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`,
    }

    await transporter.sendMail(mailOptions)
    console.log("Correo con código de verificación enviado a:", email)

    res.status(200).json({
      message: "Se ha enviado un código de verificación a tu correo electrónico.",
      email: user.email // Enviamos el email para usarlo en la verificación
    })
  } catch (error) {
    console.error("Error al solicitar restablecimiento de contraseña:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// En la función verifyResetToken:
const verifyResetToken = async (req, res) => {
  const { token, email } = req.body

  console.log("Verificando token de restablecimiento:", token, "para email:", email)

  try {
    // Buscar usuario por email con token válido y no expirado
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      console.log("Usuario no encontrado o token expirado")
      return res.status(400).json({ message: "El código ha expirado o es inválido" })
    }

    // Verificar que el token coincida
    const isValid = await bcrypt.compare(token, user.resetPasswordToken)

    if (!isValid) {
      console.log("Token no coincide")
      return res.status(400).json({ message: "Código incorrecto" })
    }

    console.log("Token verificado correctamente para usuario:", user.email)
    
    // Generar un token temporal para permitir el restablecimiento
    const tempToken = jwt.sign(
      { userId: user._id, resetVerified: true },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "15m" }
    )

    res.status(200).json({ 
      message: "Código verificado correctamente",
      resetToken: tempToken // Token temporal para autorizar el restablecimiento
    })
  } catch (error) {
    console.error("Error al verificar token:", error)
    res.status(500).json({ message: "Error en el servidor" })
  }
}

// En la función resetPassword:
const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  console.log("Restableciendo contraseña con token de autorización");

  try {
    // Verificar el token temporal primero
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    if (!decoded.resetVerified) {
      return res.status(401).json({ message: "Autorización inválida" });
    }

    // Buscar usuario por ID del token
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("Usuario no encontrado");
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      console.log("Las contraseñas no coinciden");
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    // Hashear y guardar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("Contraseña restablecida correctamente para:", user.email);

    res.status(200).json({ message: "Contraseña restablecida correctamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "La sesión de restablecimiento ha expirado" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token de autorización inválido" });
    }
    res.status(500).json({ 
      message: "Error en el servidor",
      error: error.message 
    });
  }
};

// Añade la función a los exports
module.exports = {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
}
