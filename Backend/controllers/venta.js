const { response } = require("express")
const Venta = require("../modules/venta")
const Contador = require("../modules/contador")
const Cita = require("../modules/cita")
const Cliente = require("../modules/cliente")
const Servicio = require("../modules/servicio")
const Producto = require("../modules/producto")
const Empleado = require("../modules/empleado")


// Función para obtener el siguiente código de venta
const obtenerSiguienteCodigoVenta = async () => {
  const contador = await Contador.findOneAndUpdate(
    { nombre: "venta" },
    { $inc: { secuencia: 1 } },
    { new: true, upsert: true },
  )

  // Formatear el número con ceros a la izquierda (ej: V0001)
  const codigoFormateado = `V${contador.secuencia.toString().padStart(4, "0")}`
  return codigoFormateado
}

// Obtener todas las ventas
const obtenerVentas = async (req, res = response) => {
  try {
    const ventas = await Venta.find()
      .populate("cliente", "nombrecliente apellidocliente correocliente celularcliente")
      .populate("empleado", "nombreempleado")
      .populate({
        path: "cita",
        select: "fechacita",
      })
      .populate("productos.producto", "nombreProducto precio stock categoria")
      .populate("servicios.servicio", "nombreServicio precio tiempo")
      .sort({ fechaCreacion: -1 }) // Ordenar por fecha de creación descendente
      .lean()

    if (ventas.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron ventas en la base de datos",
      })
    }

    res.json({ ventas })
  } catch (error) {
    console.error("Error al obtener las ventas:", error)
    res.status(500).json({
      msg: "Error al obtener las ventas",
      error: error.message,
    })
  }
}

// Obtener una venta por ID
const obtenerVentaPorId = async (req, res = response) => {
  const { id } = req.params

  try {
    const venta = await Venta.findById(id)
      .populate("cliente", "nombrecliente apellidocliente correocliente celularcliente")
      .populate("empleado", "nombreempleado")
      .populate({
        path: "cita",
        select: "fechacita estadocita",
      })
      .populate("productos.producto", "nombreProducto categoria stock")
      .populate("servicios.servicio", "nombreServicio categoria")

    if (!venta) {
      return res.status(404).json({
        msg: "Venta no encontrada",
      })
    }

    res.json({ venta })
  } catch (error) {
    console.error("Error al obtener la venta:", error)
    res.status(500).json({
      msg: "Error al obtener la venta",
      error: error.message,
    })
  }
}

// Crear una nueva venta
const crearVenta = async (req, res = response) => {
  try {
    const { cliente, empleado, cita, productos, servicios, metodoPago, estado, observaciones } = req.body

    // Verificar que al menos hay productos o servicios
    if ((!productos || productos.length === 0) && (!servicios || servicios.length === 0)) {
      return res.status(400).json({
        msg: "La venta debe incluir al menos un producto o un servicio",
      })
    }

    // Verificar cliente y empleado
    const [existeCliente, existeEmpleado] = await Promise.all([Cliente.findById(cliente), Empleado.findById(empleado)])

    if (!existeCliente || !existeEmpleado) {
      return res.status(400).json({
        msg: "El cliente o el empleado especificado no existe en la base de datos",
      })
    }

    // Verificar cita si se proporciona
    let existeCita = null
    if (cita) {
      existeCita = await Cita.findById(cita)
      if (!existeCita) {
        return res.status(400).json({
          msg: "La cita especificada no existe en la base de datos",
        })
      }
    }

    // Procesar productos
    const productosValidados = []
    if (productos && productos.length > 0) {
      // Obtener todos los productos de la base de datos
      const productosIds = productos.map((p) => p.producto)
      const productosDB = await Producto.find({ _id: { $in: productosIds } })

      // Verificar que todos los productos existen
      if (productosDB.length !== productosIds.length) {
        return res.status(400).json({
          msg: "Uno o más productos no existen en la base de datos",
        })
      }

      // Verificar stock y preparar productos validados
      for (const productoItem of productos) {
        const productoDB = productosDB.find((p) => p._id.toString() === productoItem.producto)

        // Verificar stock
        if (productoDB.stock < productoItem.cantidad) {
          return res.status(400).json({
            msg: `Stock insuficiente para el producto ${productoDB.nombreProducto}. Disponible: ${productoDB.stock}`,
          })
        }

        // Añadir a productos validados
        productosValidados.push({
          producto: productoDB._id,
          nombreProducto: productoDB.nombreProducto,
          precio: productoItem.precio || productoDB.precio,
          cantidad: productoItem.cantidad,
          subtotal: (productoItem.precio || productoDB.precio) * productoItem.cantidad,
        })

        // Actualizar stock
        productoDB.stock -= productoItem.cantidad
        await productoDB.save()
      }
    }

    // Procesar servicios
    const serviciosValidados = []
    if (servicios && servicios.length > 0) {
      // Obtener todos los servicios de la base de datos
      const serviciosIds = servicios.map((s) => s.servicio)
      const serviciosDB = await Servicio.find({ _id: { $in: serviciosIds } })

      // Verificar que todos los servicios existen
      if (serviciosDB.length !== serviciosIds.length) {
        return res.status(400).json({
          msg: "Uno o más servicios no existen en la base de datos",
        })
      }

      // Preparar servicios validados
      for (const servicioItem of servicios) {
        const servicioDB = serviciosDB.find((s) => s._id.toString() === servicioItem.servicio)

        serviciosValidados.push({
          servicio: servicioDB._id,
          nombreServicio: servicioDB.nombreServicio,
          precio: servicioItem.precio || servicioDB.precio,
          tiempo: servicioDB.tiempo,
        })
      }
    }

    // Obtener el siguiente código de venta
    const codigoVenta = await obtenerSiguienteCodigoVenta()

    // Calcular subtotales
    const subtotalProductos = productosValidados.reduce((total, item) => total + item.subtotal, 0)
    const subtotalServicios = serviciosValidados.reduce((total, item) => total + item.precio, 0)
    const total = subtotalProductos + subtotalServicios

    // Crear la venta
    const venta = new Venta({
      codigoVenta,
      cliente,
      empleado,
      cita,
      productos: productosValidados,
      servicios: serviciosValidados,
      subtotalProductos,
      subtotalServicios,
      total,
      metodoPago,
      estado: estado !== undefined ? estado : true,
      observaciones,
    })

    // Si la venta está completada, actualizar la cita
    if (estado && cita) {
      await Cita.findByIdAndUpdate(
        cita,
        { estadocita: "Completada" },
        {
          new: true,
          runValidators: false,
        },
      )
      venta.fechaFinalizacion = new Date()
    }

    await venta.save()

    // Obtener la venta con los datos populados
    const ventaCompleta = await Venta.findById(venta._id)
      .populate("cliente", "nombrecliente apellidocliente correocliente celularcliente")
      .populate("empleado", "nombreempleado")
      .populate({
        path: "cita",
        select: "fechacita estadocita",
      })
      .populate("productos.producto", "nombreProducto categoria stock")
      .populate("servicios.servicio", "nombreServicio categoria")

    res.status(201).json({
      msg: "Venta creada correctamente",
      venta: ventaCompleta,
    })
  } catch (error) {
    console.error("Error al crear la venta:", error)
    res.status(500).json({
      msg: "Error al crear la venta",
      error: error.message,
    })
  }
}

// Actualizar una venta
const actualizarVenta = async (req, res = response) => {
  const { id } = req.params
  const { cliente, empleado, cita, productos, servicios, metodoPago, estado, observaciones } = req.body

  try {
    // Verificar que la venta existe
    const ventaExistente = await Venta.findById(id).populate("productos.producto").populate("servicios.servicio")

    if (!ventaExistente) {
      return res.status(404).json({
        msg: "Venta no encontrada",
      })
    }

    // Verificar que al menos hay productos o servicios
    if ((!productos || productos.length === 0) && (!servicios || servicios.length === 0)) {
      return res.status(400).json({
        msg: "La venta debe incluir al menos un producto o un servicio",
      })
    }

    // Verificar cliente y empleado si se proporcionan
    if (cliente) {
      const existeCliente = await Cliente.findById(cliente)
      if (!existeCliente) {
        return res.status(400).json({
          msg: "El cliente especificado no existe en la base de datos",
        })
      }
    }

    if (empleado) {
      const existeEmpleado = await Empleado.findById(empleado)
      if (!existeEmpleado) {
        return res.status(400).json({
          msg: "El empleado especificado no existe en la base de datos",
        })
      }
    }

    // Verificar cita si se proporciona
    if (cita) {
      const existeCita = await Cita.findById(cita)
      if (!existeCita) {
        return res.status(400).json({
          msg: "La cita especificada no existe en la base de datos",
        })
      }
    }

    // Restaurar stock de productos anteriores
    if (ventaExistente.productos && ventaExistente.productos.length > 0) {
      for (const productoItem of ventaExistente.productos) {
        const producto = await Producto.findById(productoItem.producto._id)
        if (producto) {
          producto.stock += productoItem.cantidad
          await producto.save()
        }
      }
    }

    // Procesar nuevos productos
    const productosValidados = []
    if (productos && productos.length > 0) {
      // Obtener todos los productos de la base de datos
      const productosIds = productos.map((p) => p.producto)
      const productosDB = await Producto.find({ _id: { $in: productosIds } })

      // Verificar que todos los productos existen
      if (productosDB.length !== productosIds.length) {
        // Restaurar el estado original en caso de error
        if (ventaExistente.productos && ventaExistente.productos.length > 0) {
          for (const productoItem of ventaExistente.productos) {
            const producto = await Producto.findById(productoItem.producto._id)
            if (producto) {
              producto.stock -= productoItem.cantidad
              await producto.save()
            }
          }
        }

        return res.status(400).json({
          msg: "Uno o más productos no existen en la base de datos",
        })
      }

      // Verificar stock y preparar productos validados
      for (const productoItem of productos) {
        const productoDB = productosDB.find((p) => p._id.toString() === productoItem.producto)

        // Verificar stock
        if (productoDB.stock < productoItem.cantidad) {
          // Restaurar el estado original en caso de error
          if (ventaExistente.productos && ventaExistente.productos.length > 0) {
            for (const productoItem of ventaExistente.productos) {
              const producto = await Producto.findById(productoItem.producto._id)
              if (producto) {
                producto.stock -= productoItem.cantidad
                await producto.save()
              }
            }
          }

          return res.status(400).json({
            msg: `Stock insuficiente para el producto ${productoDB.nombreProducto}. Disponible: ${productoDB.stock}`,
          })
        }

        // Añadir a productos validados
        productosValidados.push({
          producto: productoDB._id,
          nombreProducto: productoDB.nombreProducto,
          precio: productoItem.precio || productoDB.precio,
          cantidad: productoItem.cantidad,
          subtotal: (productoItem.precio || productoDB.precio) * productoItem.cantidad,
        })

        // Actualizar stock
        productoDB.stock -= productoItem.cantidad
        await productoDB.save()
      }
    }

    // Procesar nuevos servicios
    const serviciosValidados = []
    if (servicios && servicios.length > 0) {
      // Obtener todos los servicios de la base de datos
      const serviciosIds = servicios.map((s) => s.servicio)
      const serviciosDB = await Servicio.find({ _id: { $in: serviciosIds } })

      // Verificar que todos los servicios existen
      if (serviciosDB.length !== serviciosIds.length) {
        // Restaurar el estado original en caso de error
        if (ventaExistente.productos && ventaExistente.productos.length > 0) {
          for (const productoItem of ventaExistente.productos) {
            const producto = await Producto.findById(productoItem.producto._id)
            if (producto) {
              producto.stock -= productoItem.cantidad
              await producto.save()
            }
          }
        }

        return res.status(400).json({
          msg: "Uno o más servicios no existen en la base de datos",
        })
      }

      // Preparar servicios validados
      for (const servicioItem of servicios) {
        const servicioDB = serviciosDB.find((s) => s._id.toString() === servicioItem.servicio)

        serviciosValidados.push({
          servicio: servicioDB._id,
          nombreServicio: servicioDB.nombreServicio,
          precio: servicioItem.precio || servicioDB.precio,
          tiempo: servicioDB.tiempo,
        })
      }
    }

    // Calcular subtotales
    const subtotalProductos = productosValidados.reduce((total, item) => total + item.subtotal, 0)
    const subtotalServicios = serviciosValidados.reduce((total, item) => total + item.precio, 0)
    const total = subtotalProductos + subtotalServicios

    // Actualizar la venta
    const datosActualizados = {
      cliente: cliente || ventaExistente.cliente,
      empleado: empleado || ventaExistente.empleado,
      cita: cita || ventaExistente.cita,
      productos: productosValidados,
      servicios: serviciosValidados,
      subtotalProductos,
      subtotalServicios,
      total,
      metodoPago: metodoPago || ventaExistente.metodoPago,
      observaciones: observaciones !== undefined ? observaciones : ventaExistente.observaciones,
    }

    // Actualizar estado y fecha de finalización si es necesario
    if (estado !== undefined && estado !== ventaExistente.estado) {
      datosActualizados.estado = estado

      // Si la venta se marca como completada, actualizar la cita y la fecha de finalización
      if (estado && datosActualizados.cita) {
        await Cita.findByIdAndUpdate(
          datosActualizados.cita,
          { estadocita: "Completada" },
          {
            new: true,
            runValidators: false,
          },
        )
        datosActualizados.fechaFinalizacion = new Date()
      }
    }

    const ventaActualizada = await Venta.findByIdAndUpdate(id, datosActualizados, { new: true })
      .populate("cliente", "nombrecliente apellidocliente correocliente celularcliente")
      .populate("empleado", "nombreempleado")
      .populate({
        path: "cita",
        select: "fechacita estadocita",
      })
      .populate("productos.producto", "nombreProducto categoria stock")
      .populate("servicios.servicio", "nombreServicio categoria")

    res.json({
      msg: "Venta actualizada correctamente",
      venta: ventaActualizada,
    })
  } catch (error) {
    console.error("Error al actualizar la venta:", error)
    res.status(500).json({
      msg: "Error al actualizar la venta",
      error: error.message,
    })
  }
}

// Eliminar una venta
const eliminarVenta = async (req, res = response) => {
  const { id } = req.params

  try {
    // Verificar que la venta existe
    const venta = await Venta.findById(id)

    if (!venta) {
      return res.status(404).json({
        msg: "Venta no encontrada",
      })
    }

    // Restaurar stock de productos
    if (venta.productos && venta.productos.length > 0) {
      for (const productoItem of venta.productos) {
        const producto = await Producto.findById(productoItem.producto)
        if (producto) {
          producto.stock += productoItem.cantidad
          await producto.save()
        }
      }
    }

    // Eliminar la venta
    await Venta.findByIdAndDelete(id)

    res.json({
      msg: "Venta eliminada correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar la venta:", error)
    res.status(500).json({
      msg: "Error al eliminar la venta",
      error: error.message,
    })
  }
}

// Finalizar una venta
const finalizarVenta = async (req, res = response) => {
  const { id } = req.params
  const { metodoPago } = req.body

  try {
    const venta = await Venta.findById(id)

    if (!venta) {
      return res.status(404).json({
        msg: "Venta no encontrada",
      })
    }

    // Actualizar la cita a "Completada" si existe
    if (venta.cita) {
      await Cita.findByIdAndUpdate(
        venta.cita,
        { estadocita: "Completada" },
        {
          new: true,
          runValidators: false,
        },
      )
    }

    // Actualizar la venta
    venta.metodoPago = metodoPago || venta.metodoPago
    venta.fechaFinalizacion = new Date()
    venta.estado = true // Marcar como completada

    await venta.save()

    // Obtener la venta actualizada con los datos populados
    const ventaActualizada = await Venta.findById(id)
      .populate("cliente", "nombrecliente apellidocliente correocliente celularcliente")
      .populate("empleado", "nombreempleado")
      .populate({
        path: "cita",
        select: "fechacita estadocita",
      })
      .populate("productos.producto", "nombreProducto categoria stock")
      .populate("servicios.servicio", "nombreServicio categoria")

    res.json({
      msg: "Venta finalizada correctamente",
      venta: ventaActualizada,
    })
  } catch (error) {
    console.error("Error al finalizar la venta:", error)
    res.status(500).json({
      msg: "Error al finalizar la venta",
      error: error.message,
    })
  }
}

// Agregar productos a una venta existente
const agregarProductosVenta = async (req, res = response) => {
  const { id } = req.params
  const { productos } = req.body

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({
      msg: "Debe proporcionar al menos un producto para añadir",
    })
  }

  try {
    const venta = await Venta.findById(id)

    if (!venta) {
      return res.status(404).json({
        msg: "Venta no encontrada",
      })
    }

    // Validar los productos nuevos
    const productosIds = productos.map((p) => p.producto)
    const productosDB = await Producto.find({ _id: { $in: productosIds } })

    if (productosDB.length !== productosIds.length) {
      return res.status(400).json({
        msg: "Uno o más productos no existen en la base de datos",
      })
    }

    // Verificar stock y preparar productos validados
    const nuevosProductos = []
    for (const productoItem of productos) {
      const productoDB = productosDB.find((p) => p._id.toString() === productoItem.producto)

      // Verificar stock
      if (productoDB.stock < productoItem.cantidad) {
        return res.status(400).json({
          msg: `Stock insuficiente para el producto ${productoDB.nombreProducto}. Disponible: ${productoDB.stock}`,
        })
      }

      // Añadir a productos validados
      nuevosProductos.push({
        producto: productoDB._id,
        nombreProducto: productoDB.nombreProducto,
        precio: productoItem.precio || productoDB.precio,
        cantidad: productoItem.cantidad,
        subtotal: (productoItem.precio || productoDB.precio) * productoItem.cantidad,
      })

      // Actualizar stock
      productoDB.stock -= productoItem.cantidad
      await productoDB.save()
    }

    // Añadir los nuevos productos a la venta
    venta.productos = [...venta.productos, ...nuevosProductos]

    // Recalcular subtotales y total
    venta.subtotalProductos = venta.productos.reduce((total, item) => total + item.subtotal, 0)
    venta.total = venta.subtotalProductos + venta.subtotalServicios

    await venta.save()

    // Obtener la venta actualizada con los datos populados
    const ventaActualizada = await Venta.findById(id)
      .populate("cliente", "nombrecliente apellidocliente correocliente celularcliente")
      .populate("empleado", "nombreempleado")
      .populate({
        path: "cita",
        select: "fechacita estadocita",
      })
      .populate("productos.producto", "nombreProducto categoria stock")
      .populate("servicios.servicio", "nombreServicio categoria")

    res.json({
      msg: "Productos añadidos correctamente",
      venta: ventaActualizada,
    })
  } catch (error) {
    console.error("Error al añadir productos a la venta:", error)
    res.status(500).json({
      msg: "Error al añadir productos a la venta",
      error: error.message,
    })
  }
}

// Agregar servicios a una venta existente
const agregarServiciosVenta = async (req, res = response) => {
  const { id } = req.params
  const { servicios } = req.body

  if (!servicios || !Array.isArray(servicios) || servicios.length === 0) {
    return res.status(400).json({
      msg: "Debe proporcionar al menos un servicio para añadir",
    })
  }

  try {
    const venta = await Venta.findById(id)

    if (!venta) {
      return res.status(404).json({
        msg: "Venta no encontrada",
      })
    }

    // Validar los servicios nuevos
    const serviciosIds = servicios.map((s) => s.servicio)
    const serviciosDB = await Servicio.find({ _id: { $in: serviciosIds } })

    if (serviciosDB.length !== serviciosIds.length) {
      return res.status(400).json({
        msg: "Uno o más servicios no existen en la base de datos",
      })
    }

    // Preparar servicios validados
    const nuevosServicios = []
    for (const servicioItem of servicios) {
      const servicioDB = serviciosDB.find((s) => s._id.toString() === servicioItem.servicio)

      nuevosServicios.push({
        servicio: servicioDB._id,
        nombreServicio: servicioDB.nombreServicio,
        precio: servicioItem.precio || servicioDB.precio,
        tiempo: servicioDB.tiempo,
      })
    }

    // Añadir los nuevos servicios a la venta
    venta.servicios = [...venta.servicios, ...nuevosServicios]

    // Recalcular subtotales y total
    venta.subtotalServicios = venta.servicios.reduce((total, item) => total + item.precio, 0)
    venta.total = venta.subtotalProductos + venta.subtotalServicios

    await venta.save()

    // Obtener la venta actualizada con los datos populados
    const ventaActualizada = await Venta.findById(id)
      .populate("cliente", "nombrecliente apellidocliente correocliente celularcliente")
      .populate("empleado", "nombreempleado")
      .populate({
        path: "cita",
        select: "fechacita estadocita",
      })
      .populate("productos.producto", "nombreProducto categoria stock")
      .populate("servicios.servicio", "nombreServicio categoria")

    res.json({
      msg: "Servicios añadidos correctamente",
      venta: ventaActualizada,
    })
  } catch (error) {
    console.error("Error al añadir servicios a la venta:", error)
    res.status(500).json({
      msg: "Error al añadir servicios a la venta",
      error: error.message,
    })
  }
}


// En controllers/venta.js
const obtenerVentasPorCliente = async (req, res) => {
  try {
    const clienteId = req.query.clienteId || req.usuario?.id;
    
    if (!clienteId) {
      return res.status(400).json({ message: "ID de cliente no proporcionado" });
    }
    
    console.log("Buscando ventas para el cliente/usuario ID:", clienteId);
    
    // Buscar ventas donde el cliente coincida con el ID proporcionado
    // Primero intentar buscar por cliente (si es un ID de cliente)
    let ventas = await Venta.find({ cliente: clienteId })
      .populate("cliente")
      .populate("empleado")
      .populate("cita")
      .sort({ fechaCreacion: -1 });
    
    // Si no hay resultados, intentar buscar por usuario (si es un ID de usuario)
    if (ventas.length === 0) {
      // Primero intentar encontrar el cliente asociado al usuario
      const cliente = await Cliente.findOne({ usuario: clienteId });
      
      if (cliente) {
        ventas = await Venta.find({ cliente: cliente._id })
          .populate("cliente")
          .populate("empleado")
          .populate("cita")
          .sort({ fechaCreacion: -1 });
      }
    }
    
    console.log(`Se encontraron ${ventas.length} ventas para el cliente/usuario ID: ${clienteId}`);
    
    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas del cliente:", error);
    res.status(500).json({ message: "Error al obtener las ventas", error: error.message });
  }
};

module.exports = {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
  finalizarVenta,
  agregarProductosVenta,
  agregarServiciosVenta,
  obtenerVentasPorCliente
}
