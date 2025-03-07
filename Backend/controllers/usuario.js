const { response } = require("express")
const Rol = require("../modules/rol")
const Usuario = require("../modules/usuario")
const Cliente = require("../modules/cliente")
const Empleado = require("../modules/empleado")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { createUser } = require("./userHelper")

// Obtener todos los usuarios (sin mostrar contraseñas)
const usuariosGet = async (req, res = response) => {
  try {
    const usuarios = await Usuario.find().select("-password").populate("rol", "nombreRol") // Incluir información del rol

    res.json({
      usuarios,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    res.status(500).json({
      msg: "Error al obtener usuarios",
      error: error.message,
    })
  }
}

// Crear un nuevo usuario
const usuariosPost = async (req, res = response) => {
  console.log("usuariosPost - Datos recibidos:", JSON.stringify(req.body, null, 2))

  const { nombre, apellido, correo, email, celular, password, confirmPassword, rol, tipoUsuario, estadocliente } =
    req.body

  try {
    // Usar correo o email según lo que venga en la petición
    const emailUsuario = correo || email

    // Validar campos obligatorios
    if (!nombre || !emailUsuario || !password) {
      return res.status(400).json({
        msg: "Faltan campos obligatorios (nombre, correo/email, password)",
      })
    }

    // Verificar que la contraseña y la confirmación coincidan si se proporciona confirmPassword
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        msg: "Las contraseñas no coinciden",
      })
    }

    // Verificar si el usuario ya existe
    const existeEmail = await Usuario.findOne({
      $or: [{ correo: emailUsuario }, { email: emailUsuario }],
    })

    if (existeEmail) {
      return res.status(400).json({
        msg: "El correo ya está registrado",
      })
    }

    // Determinar el rol a asignar
    let rolAsignado

    if (rol) {
      // Si se proporciona un ID de rol, verificar que exista
      rolAsignado = await Rol.findById(rol)
      if (!rolAsignado) {
        return res.status(400).json({
          msg: `El rol con ID ${rol} no existe`,
        })
      }
    } else if (tipoUsuario) {
      // Si se proporciona un tipo de usuario, buscar el rol correspondiente
      const tipoRol = tipoUsuario === "cliente" ? "Cliente" : tipoUsuario === "empleado" ? "Empleado" : "Cliente"

      rolAsignado = await Rol.findOne({ nombreRol: tipoRol })
      if (!rolAsignado) {
        return res.status(400).json({
          msg: `El rol ${tipoRol} no existe en la base de datos`,
        })
      }
    } else {
      // Por defecto, asignar rol de Cliente
      rolAsignado = await Rol.findOne({ nombreRol: "Cliente" })

      // Si no existe el rol Cliente, verificar si hay usuarios
      if (!rolAsignado) {
        const usuarios = await Usuario.countDocuments()

        // Si no hay usuarios, buscar rol Admin
        if (usuarios === 0) {
          rolAsignado = await Rol.findOne({ nombreRol: "Admin" })
        }

        // Si aún no hay rol asignado, error
        if (!rolAsignado) {
          return res.status(400).json({
            msg: "No se encontró un rol válido para asignar",
          })
        }
      }
    }

    console.log("Rol asignado:", JSON.stringify(rolAsignado, null, 2))

    // Usar el helper existente para crear el usuario
    const userData = {
      nombre,
      apellido: apellido || "",
      email: emailUsuario,
      correo: emailUsuario,
      celular: celular || "",
      password,
      rol: rolAsignado._id,
      estado: true,
    }

    // Crear el usuario usando el helper existente
    const nuevoUsuario = await createUser(userData)
    console.log("Usuario creado:", JSON.stringify(nuevoUsuario, null, 2))

    // Verificar el rol y crear el cliente o empleado correspondiente
    if (rolAsignado.nombreRol === "Cliente") {
      // Verificar si ya existe un cliente con este correo
      const clienteExistente = await Cliente.findOne({
        $or: [{ correocliente: emailUsuario }, { usuario: nuevoUsuario._id }],
      })

      if (!clienteExistente) {
        // Crear un nuevo cliente
        const nuevoCliente = new Cliente({
          nombrecliente: nombre,
          apellidocliente: apellido || "",
          correocliente: emailUsuario,
          celularcliente: celular || "",
          estadocliente: estadocliente === "Activo" || estadocliente === true ? true : false,
          usuario: nuevoUsuario._id, // Vincular con el usuario
        })

        await nuevoCliente.save()
        console.log("Cliente creado:", JSON.stringify(nuevoCliente, null, 2))
      }

      // Asegurar que no exista como empleado
      await Empleado.findOneAndDelete({
        $or: [{ correoempleado: emailUsuario }, { usuario: nuevoUsuario._id }],
      })
    } else if (rolAsignado.nombreRol === "Empleado") {
      // Verificar si ya existe un empleado con este correo
      const empleadoExistente = await Empleado.findOne({
        $or: [{ correoempleado: emailUsuario }, { usuario: nuevoUsuario._id }],
      })

      if (!empleadoExistente) {
        // Crear un nuevo empleado
        const nuevoEmpleado = new Empleado({
          nombreempleado: nombre,
          apellidoempleado: apellido || "",
          correoempleado: emailUsuario,
          celularempleado: celular || "",
          telefonoempleado: celular || "", // Añadir el campo telefonoempleado
          estadoempleado: true,
          usuario: nuevoUsuario._id, // Vincular con el usuario
        })

        await nuevoEmpleado.save()
        console.log("Empleado creado:", JSON.stringify(nuevoEmpleado, null, 2))
      }

      // Asegurar que no exista como cliente
      await Cliente.findOneAndDelete({
        $or: [{ correocliente: emailUsuario }, { usuario: nuevoUsuario._id }],
      })
    }

    // Generar token JWT usando el mismo formato que en authController
    const token = jwt.sign(
      { userId: nuevoUsuario._id, role: rolAsignado.nombreRol },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" },
    )

    // Eliminar el campo de la contraseña de la respuesta
    const usuarioResponse = nuevoUsuario.toObject ? nuevoUsuario.toObject() : { ...nuevoUsuario }
    delete usuarioResponse.password

    res.status(201).json({
      msg: "Usuario registrado correctamente",
      usuario: usuarioResponse,
      token,
      role: rolAsignado.nombreRol,
    })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    let msg = "Error al registrar usuario"
    if (error.name === "ValidationError") {
      msg = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ")
    }
    res.status(500).json({
      msg,
      error: error.message,
    })
  }
}

// Actualizar un usuario existente
const usuariosPut = async (req, res = response) => {
  const { id } = req.params
  const { _id, password, correo, email, rol, ...resto } = req.body

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id).populate("rol")
    if (!usuario) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      })
    }

    // Si se está cambiando el rol
    if (rol && rol !== usuario.rol._id.toString()) {
      // Verificar que el nuevo rol exista
      const nuevoRol = await Rol.findById(rol)
      if (!nuevoRol) {
        return res.status(400).json({
          msg: "El rol especificado no existe",
        })
      }

      // Determinar si está cambiando de cliente a empleado o viceversa
      const eraCliente = usuario.rol.nombreRol === "Cliente"
      const eraEmpleado = usuario.rol.nombreRol === "Empleado"
      const seraCliente = nuevoRol.nombreRol === "Cliente"
      const seraEmpleado = nuevoRol.nombreRol === "Empleado"

      // Si cambia de cliente a empleado
      if (eraCliente && seraEmpleado) {
        // Eliminar de la tabla de clientes
        await Cliente.findOneAndDelete({
          $or: [{ correocliente: usuario.email || usuario.correo }, { usuario: id }],
        })

        // Crear en la tabla de empleados
        const empleado = new Empleado({
          nombreempleado: usuario.nombre,
          apellidoempleado: usuario.apellido || resto.apellido || "",
          correoempleado: usuario.email || usuario.correo,
          celularempleado: usuario.celular || resto.celular || "",
          estadoempleado: true,
          usuario: usuario._id,
        })
        await empleado.save()
      }
      // Si cambia de empleado a cliente
      else if (eraEmpleado && seraCliente) {
        // Eliminar de la tabla de empleados
        await Empleado.findOneAndDelete({
          $or: [{ correoempleado: usuario.email || usuario.correo }, { usuario: id }],
        })

        // Crear en la tabla de clientes
        const cliente = new Cliente({
          nombrecliente: usuario.nombre,
          apellidocliente: usuario.apellido || resto.apellido || "",
          correocliente: usuario.email || usuario.correo,
          celularcliente: usuario.celular || resto.celular || "",
          estadocliente: true,
          usuario: usuario._id,
        })
        await cliente.save()
      }
    }

    // Si se está actualizando la contraseña
    if (password) {
      const salt = bcrypt.genSaltSync(10)
      resto.password = bcrypt.hashSync(password, salt)
    }

    // Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { ...resto, rol: rol || usuario.rol._id },
      { new: true },
    )
      .select("-password")
      .populate("rol")

    res.json({
      msg: "Usuario actualizado correctamente",
      usuario: usuarioActualizado,
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    res.status(500).json({
      msg: "Error al actualizar usuario",
      error: error.message,
    })
  }
}

// Eliminar un usuario
const usuariosDelete = async (req, res = response) => {
  const { id } = req.params

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id).populate("rol")
    if (!usuario) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      })
    }

    // Eliminar registros relacionados según el rol
    if (usuario.rol.nombreRol === "Cliente") {
      await Cliente.findOneAndDelete({
        $or: [{ correocliente: usuario.email || usuario.correo }, { usuario: id }],
      })
    } else if (usuario.rol.nombreRol === "Empleado") {
      await Empleado.findOneAndDelete({
        $or: [{ correoempleado: usuario.email || usuario.correo }, { usuario: id }],
      })
    }

    // Eliminar el usuario
    const usuarioEliminado = await Usuario.findByIdAndDelete(id)

    res.json({
      msg: "Usuario eliminado correctamente",
      usuario: usuarioEliminado,
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    res.status(500).json({
      msg: "Error al eliminar usuario",
      error: error.message,
    })
  }
}

// Consultar usuarios con parámetros (PromGet)
const PromGet = async (req, res = response) => {
  const { q, nombre, page = 1, limit = 10 } = req.query
  const limitNum = Number(limit)
  const skip = (Number(page) - 1) * limitNum

  try {
    // Construir filtro
    const filtro = {}
    if (q) {
      filtro.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { apellido: { $regex: q, $options: "i" } },
        { correo: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ]
    }
    if (nombre) {
      filtro.nombre = { $regex: nombre, $options: "i" }
    }

    // Consultar usuarios con paginación
    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments(filtro),
      Usuario.find(filtro).select("-password").populate("rol", "nombreRol").skip(skip).limit(limitNum),
    ])

    res.json({
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: Number(page),
      limit: limitNum,
      usuarios,
    })
  } catch (error) {
    console.error("Error en PromGet:", error)
    res.status(500).json({
      msg: "Error al obtener usuarios",
      error: error.message,
    })
  }
}

module.exports = {
  usuariosGet,
  usuariosPost,
  usuariosPut,
  usuariosDelete,
  PromGet,
}

