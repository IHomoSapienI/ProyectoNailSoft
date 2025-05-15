const Proveedor = require("../modules/proveedor")

// Funciones de validación
const validarCampo = (campo, valor) => {
  // Validar longitud (3-20 caracteres)
  if (valor.length < 3 || valor.length > 20) {
    return {
      valido: false,
      mensaje: `El campo ${campo} debe tener entre 3 y 20 caracteres`,
    }
  }

  // Validar que no contenga caracteres especiales
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/
  if (!regex.test(valor)) {
    return {
      valido: false,
      mensaje: `El campo ${campo} no debe contener caracteres especiales`,
    }
  }

  return { valido: true }
}

const validarNumeroContacto = (numero) => {
  // Validar que solo contenga números
  const regex = /^\d+$/
  if (!regex.test(numero)) {
    return {
      valido: false,
      mensaje: "El número de contacto solo debe contener dígitos",
    }
  }

  // Validar longitud (máximo 13 dígitos)
  if (numero.length > 13) {
    return {
      valido: false,
      mensaje: "El número de contacto debe tener máximo 13 dígitos",
    }
  }

  return { valido: true }
}

// Obtener todos los proveedores
const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.find()
    res.json(proveedores)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los proveedores", error })
  }
}

// Crear un nuevo proveedor
const crearProveedor = async (req, res) => {
  const { nombreProveedor, contacto, numeroContacto, provee } = req.body

  // Validar campos
  const errores = []

  // Validar nombreProveedor
  if (nombreProveedor) {
    const validacionNombre = validarCampo("nombreProveedor", nombreProveedor)
    if (!validacionNombre.valido) {
      errores.push(validacionNombre.mensaje)
    }
  } else {
    errores.push("El nombre del proveedor es requerido")
  }

  // Validar contacto
  if (contacto) {
    const validacionContacto = validarCampo("contacto", contacto)
    if (!validacionContacto.valido) {
      errores.push(validacionContacto.mensaje)
    }
  } else {
    errores.push("El contacto es requerido")
  }

  // Validar numeroContacto
  if (numeroContacto) {
    const validacionNumero = validarNumeroContacto(numeroContacto)
    if (!validacionNumero.valido) {
      errores.push(validacionNumero.mensaje)
    }
  } else {
    errores.push("El número de contacto es requerido")
  }

  // Validar provee
  if (provee) {
    const validacionProvee = validarCampo("provee", provee)
    if (!validacionProvee.valido) {
      errores.push(validacionProvee.mensaje)
    }
  } else {
    errores.push("El campo provee es requerido")
  }

  // Si hay errores, retornar
  if (errores.length > 0) {
    return res.status(400).json({ message: "Error de validación", errores })
  }

  try {
    const nuevoProveedor = new Proveedor({
      nombreProveedor,
      contacto,
      numeroContacto,
      provee,
    })

    await nuevoProveedor.save()
    res.status(201).json({ message: "Proveedor creado con éxito", proveedor: nuevoProveedor })
  } catch (error) {
    res.status(500).json({ message: "Error al crear el proveedor", error })
  }
}

// Actualizar un proveedor por ID
const actualizarProveedor = async (req, res) => {
  const { id } = req.params
  const { nombreProveedor, contacto, numeroContacto, provee, estado } = req.body

  // Validar campos
  const errores = []

  // Validar nombreProveedor si se proporciona
  if (nombreProveedor) {
    const validacionNombre = validarCampo("nombreProveedor", nombreProveedor)
    if (!validacionNombre.valido) {
      errores.push(validacionNombre.mensaje)
    }
  }

  // Validar contacto si se proporciona
  if (contacto) {
    const validacionContacto = validarCampo("contacto", contacto)
    if (!validacionContacto.valido) {
      errores.push(validacionContacto.mensaje)
    }
  }

  // Validar numeroContacto si se proporciona
  if (numeroContacto) {
    const validacionNumero = validarNumeroContacto(numeroContacto)
    if (!validacionNumero.valido) {
      errores.push(validacionNumero.mensaje)
    }
  }

  // Validar provee si se proporciona
  if (provee) {
    const validacionProvee = validarCampo("provee", provee)
    if (!validacionProvee.valido) {
      errores.push(validacionProvee.mensaje)
    }
  }

  // Si hay errores, retornar
  if (errores.length > 0) {
    return res.status(400).json({ message: "Error de validación", errores })
  }

  try {
    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      id,
      { nombreProveedor, contacto, numeroContacto, provee, estado },
      { new: true },
    )

    if (!proveedorActualizado) {
      return res.status(404).json({ message: "Proveedor no encontrado" })
    }

    res.json({ message: "Proveedor actualizado con éxito", proveedor: proveedorActualizado })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el proveedor", error })
  }
}

// Eliminar un proveedor por ID
const eliminarProveedor = async (req, res) => {
  const { id } = req.params

  try {
    const proveedorEliminado = await Proveedor.findByIdAndDelete(id)

    if (!proveedorEliminado) {
      return res.status(404).json({ message: "Proveedor no encontrado" })
    }

    res.json({ message: "Proveedor eliminado con éxito" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el proveedor", error })
  }
}

// Cambiar el estado de un proveedor por ID
const cambiarEstadoProveedor = async (req, res) => {
  const { id } = req.params
  const { estado } = req.body

  try {
    const proveedor = await Proveedor.findByIdAndUpdate(id, { estado }, { new: true })

    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" })
    }

    res.json({ message: "Estado del proveedor actualizado", proveedor })
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar el estado del proveedor", error })
  }
}

module.exports = {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  cambiarEstadoProveedor,
}
