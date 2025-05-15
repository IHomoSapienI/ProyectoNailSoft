const { response } = require("express")
const Servicio = require("../modules/servicio")
const TipoServicio = require("../modules/tiposerv")

// Obtener todos los servicios
const serviciosGet = async (req, res = response) => {
  try {
    const servicios = await Servicio.find().populate("tipoServicio", "nombreTs") // Poblamos el tipoServicio para obtener más detalles

    if (servicios.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron servicios en la base de datos",
      })
    }

    res.json({
      servicios,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: "Error al obtener los servicios",
    })
  }
}

// Crear un nuevo servicio
const serviciosPost = async (req, res = response) => {
  const { nombreServicio, descripcion, precio, tiempo, tipoServicio, estado } = req.body

  if (
    !nombreServicio ||
    !descripcion ||
    precio === undefined ||
    tiempo === undefined ||
    !tipoServicio ||
    estado === undefined ||
    !req.file
  ) {
    return res.status(400).json({
      msg: "Nombre, descripción, precio, tiempo, tipo de servicio, estado e imagen son obligatorios.",
    })
  }

  const imagenUrl = req.file.filename // Solo guardamos el nombre del archivo

  try {
    const existeTipoServicio = await TipoServicio.findById(tipoServicio)
    if (!existeTipoServicio) {
      return res.status(400).json({
        msg: "El tipo de servicio especificado no existe en la base de datos.",
      })
    }

    const servicio = new Servicio({ nombreServicio, descripcion, precio, tiempo, tipoServicio, estado, imagenUrl })
    await servicio.save()
    res.status(201).json({
      msg: "Servicio creado correctamente",
      servicio,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: "Error al crear el servicio",
    })
  }
}

// Actualizar un servicio
const serviciosPut = async (req, res = response) => {
  const { id } = req.params
  const { nombreServicio, descripcion, precio, tiempo, tipoServicio, estado } = req.body
  const imagenUrl = req.file ? req.file.filename : undefined // Actualizamos si hay nueva imagen

  try {
    const servicio = await Servicio.findById(id)

    if (!servicio) {
      return res.status(404).json({
        msg: "Servicio no encontrado",
      })
    }

    // Actualizamos solo los campos que hayan sido proporcionados
    servicio.nombreServicio = nombreServicio || servicio.nombreServicio
    servicio.descripcion = descripcion || servicio.descripcion
    servicio.precio = precio !== undefined ? precio : servicio.precio
    servicio.tiempo = tiempo !== undefined ? tiempo : servicio.tiempo
    servicio.tipoServicio = tipoServicio || servicio.tipoServicio
    servicio.estado = estado !== undefined ? estado : servicio.estado
    if (imagenUrl) servicio.imagenUrl = imagenUrl // Actualizamos la imagen si hay nueva

    await servicio.save()
    res.json({
      msg: "Servicio actualizado correctamente",
      servicio,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: "Error al actualizar el servicio",
    })
  }
}

// Eliminar un servicio
const serviciosDelete = async (req, res = response) => {
  const { id } = req.params

  try {
    const servicio = await Servicio.findByIdAndDelete(id)

    if (!servicio) {
      return res.status(404).json({
        msg: "Servicio no encontrado",
      })
    }

    res.json({
      msg: "Servicio eliminado correctamente",
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: "Error al eliminar el servicio",
    })
  }
}

// Exportar servicios a Excel
const serviciosExportExcel = async (req, res = response) => {
  try {
    // Obtener todos los servicios
    const servicios = await Servicio.find().populate("tipoServicio", "nombreTs")

    if (servicios.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron servicios para exportar",
      })
    }

    // Crear un nuevo libro de Excel
    const ExcelJS = require("exceljs")
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Servicios")

    // Definir las columnas
    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Descripción", key: "descripcion", width: 40 },
      { header: "Tipo de Servicio", key: "tipoServicio", width: 20 },
      { header: "Precio", key: "precio", width: 15 },
      { header: "Tiempo (min)", key: "tiempo", width: 15 },
      { header: "Estado", key: "estado", width: 15 },
    ]

    // Estilo para el encabezado
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Agregar los datos
    servicios.forEach((servicio) => {
      worksheet.addRow({
        id: servicio._id.toString(),
        nombre: servicio.nombreServicio,
        descripcion: servicio.descripcion,
        tipoServicio: servicio.tipoServicio ? servicio.tipoServicio.nombreTs : "No definido",
        precio: Number.parseFloat(servicio.precio).toFixed(2),
        tiempo: servicio.tiempo,
        estado: servicio.estado ? "Activo" : "Inactivo",
      })
    })

    // Configurar la respuesta
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", "attachment; filename=servicios.xlsx")

    // Escribir el libro de Excel en la respuesta
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error al exportar servicios a Excel:", error)
    res.status(500).json({
      msg: "Error al exportar servicios a Excel",
      error: error.message,
    })
  }
}

// Cambiar el estado de un servicio (activar/desactivar)
const serviciosToggleEstado = async (req, res = response) => {
  const { id } = req.params

  try {
    const servicio = await Servicio.findById(id)

    if (!servicio) {
      return res.status(404).json({
        msg: "Servicio no encontrado",
      })
    }

    // Cambiar el estado (invertir el valor actual)
    servicio.estado = !servicio.estado

    await servicio.save()

    res.json({
      msg: `Servicio ${servicio.estado ? "activado" : "desactivado"} correctamente`,
      servicio,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: "Error al cambiar el estado del servicio",
    })
  }
}

module.exports = {
  serviciosGet,
  serviciosPost,
  serviciosPut,
  serviciosDelete,
  serviciosExportExcel,
  serviciosToggleEstado,
}

