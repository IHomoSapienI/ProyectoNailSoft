const { response } = require('express');
const Producto = require('../modules/producto');
const CategoriaProducto = require('../modules/categoriaproducto');

// Obtener todos los productos
const productosGet = async (req, res = response) => {
  try {
    const productos = await Producto.find().populate('categoria', 'nombreCp'); // Poblamos la categoría para obtener más detalles

    if (productos.length === 0) {
      return res.status(404).json({
        msg: 'No se encontraron productos en la base de datos'
      });
    }

    res.json({
      productos
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Error al obtener los productos'
    });
  }
};

// Crear un nuevo producto
const productosPost = async (req, res = response) => {
  const { nombreProducto, precio, stock, categoria, estado } = req.body;

  if (!nombreProducto || precio === undefined || stock === undefined || !categoria || estado === undefined || !req.file) {
    return res.status(400).json({
      msg: 'Nombre del producto, precio, stock, categoría, estado e imagen son obligatorios.'
    });
  }

  const imagenUrl = req.file.filename; // Solo guardamos el nombre del archivo de la imagen

  try {
    const existeCategoria = await CategoriaProducto.findById(categoria);
    if (!existeCategoria) {
      return res.status(400).json({
        msg: 'La categoría especificada no existe en la base de datos.'
      });
    }

    const producto = new Producto({ nombreProducto, precio, stock, categoria, estado, imagenUrl });
    await producto.save();
    res.status(201).json({
      msg: 'Producto creado correctamente',
      producto
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Error al crear el producto'
    });
  }
};

// Actualizar un producto
const productosPut = async (req, res = response) => {
  const { id } = req.params;
  const { nombreProducto, precio, stock, categoria, estado } = req.body;
  const imagenUrl = req.file ? req.file.filename : undefined; // Actualizamos si hay nueva imagen

  try {
    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({
        msg: 'Producto no encontrado'
      });
    }

    // Actualizamos solo los campos que hayan sido proporcionados
    producto.nombreProducto = nombreProducto || producto.nombreProducto;
    producto.precio = precio !== undefined ? precio : producto.precio;
    producto.stock = stock !== undefined ? stock : producto.stock;
    producto.categoria = categoria || producto.categoria;
    producto.estado = estado !== undefined ? estado : producto.estado;
    if (imagenUrl) producto.imagenUrl = imagenUrl; // Actualizamos la imagen si hay nueva

    await producto.save();
    res.json({
      msg: 'Producto actualizado correctamente',
      producto
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Error al actualizar el producto'
    });
  }
};

// Eliminar un producto
const productosDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      return res.status(404).json({
        msg: 'Producto no encontrado'
      });
    }

    res.json({
      msg: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: 'Error al eliminar el producto'
    });
  }
};

module.exports = {
  productosGet,
  productosPost,
  productosPut,
  productosDelete
};
