const { Schema, model } = require("mongoose")

const VentaSchema = Schema(
  {
    codigoVenta: {
      type: String,
      unique: true,
    },
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: [true, "El cliente es obligatorio"],
    },
    cita: {
      type: Schema.Types.ObjectId,
      ref: "Cita",
    },
    empleado: {
      type: Schema.Types.ObjectId,
      ref: "Empleado",
      required: [true, "El empleado es obligatorio"],
    },
    // Array de productos incluidos en la venta
    productos: [
      {
        producto: {
          type: Schema.Types.ObjectId,
          ref: "Producto",
          required: true,
        },
        nombreProducto: {
          type: String,
          required: true,
          trim: true,
        },
        precio: {
          type: Number,
          required: true,
          min: 0,
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    // Array de servicios incluidos en la venta
    servicios: [
      {
        servicio: {
          type: Schema.Types.ObjectId,
          ref: "Servicio",
          required: true,
        },
        nombreServicio: {
          type: String,
          required: true,
          trim: true,
        },
        precio: {
          type: Number,
          required: true,
          min: 0,
        },
        tiempo: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotalProductos: {
      type: Number,
      default: 0,
    },
    subtotalServicios: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    metodoPago: {
      type: String,
      enum: ["Efectivo", "Tarjeta", "Transferencia", "Otro"],
      default: "Efectivo",
    },
    estado: {
      type: Boolean,
      default: true, // true = completada, false = pendiente
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaFinalizacion: {
      type: Date,
    },
    observaciones: {
      type: String,
      trim: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Middleware para calcular subtotales y total antes de guardar
VentaSchema.pre("save", function (next) {
  // Calcular subtotal de productos
  if (this.productos && this.productos.length > 0) {
    this.subtotalProductos = this.productos.reduce((total, item) => {
      return total + (item.subtotal || 0)
    }, 0)
  } else {
    this.subtotalProductos = 0
  }

  // Calcular subtotal de servicios
  if (this.servicios && this.servicios.length > 0) {
    this.subtotalServicios = this.servicios.reduce((total, item) => {
      return total + (item.precio || 0)
    }, 0)
  } else {
    this.subtotalServicios = 0
  }

  // Calcular total general
  this.total = this.subtotalProductos + this.subtotalServicios

  next()
})

// Virtuals para información del cliente
VentaSchema.virtual("clienteNombre").get(function () {
  return this.cliente ? this.cliente.nombrecliente : "Cliente no especificado"
})

VentaSchema.virtual("clienteApellido").get(function () {
  return this.cliente ? this.cliente.apellidocliente : "Apellido no especificado"
})

VentaSchema.virtual("clienteEmail").get(function () {
  return this.cliente ? this.cliente.correocliente : "Correo no especificado"
})

VentaSchema.virtual("clienteCelular").get(function () {
  return this.cliente ? this.cliente.celularcliente : "Celular no especificado"
})

// Virtual para información de la cita
VentaSchema.virtual("citaFecha").get(function () {
  return this.cita ? this.cita.fechacita : "Fecha no especificada"
})

// Virtual para información del empleado
VentaSchema.virtual("empleadoNombre").get(function () {
  return this.empleado ? this.empleado.nombreempleado : "Empleado no especificado"
})

// Virtual para determinar si la venta incluye productos
VentaSchema.virtual("tieneProductos").get(function () {
  return this.productos && this.productos.length > 0
})

// Virtual para determinar si la venta incluye servicios
VentaSchema.virtual("tieneServicios").get(function () {
  return this.servicios && this.servicios.length > 0
})

// Virtual para obtener el tipo de venta (mixta, solo productos, solo servicios)
VentaSchema.virtual("tipoVenta").get(function () {
  const tieneProductos = this.productos && this.productos.length > 0
  const tieneServicios = this.servicios && this.servicios.length > 0

  if (tieneProductos && tieneServicios) {
    return "mixta"
  } else if (tieneProductos) {
    return "productos"
  } else if (tieneServicios) {
    return "servicios"
  } else {
    return "sin items"
  }
})

module.exports = model("Venta", VentaSchema)