const BajaProducto = require('../modules/bajaproducto');
const Insumo = require('../modules/insumo');

// Funciones para manejar las rutas
const obtenerBajasProductos = async (req, res) => {
    try {
        const bajas = await BajaProducto.find().populate('productoId'); // Poblamos el ID del producto
        res.json(bajas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las bajas de productos', error });
    }
};

const crearBajaProducto = async (req, res) => {
    const { productoId, fechaBaja, cantidad, observaciones } = req.body;

    try {
        const insumo = await Insumo.findById(productoId);
        if (!insumo) {
            return res.status(404).json({ message: 'Producto no encontrado en insumos' });
        }

        const nuevaBaja = new BajaProducto({
            productoId, // Guarda el ID del producto
            producto: insumo.nombreInsumo,
            fechaBaja,
            cantidad,
            observaciones
        });

        await nuevaBaja.save();
        res.status(201).json({ message: 'Baja de producto creada con éxito', baja: nuevaBaja });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la baja de producto', error });
    }
};

const actualizarBajaProducto = async (req, res) => {
    const { id } = req.params;
    const { productoId, fechaBaja, cantidad, observaciones } = req.body;

    try {
        const bajaActualizada = await BajaProducto.findByIdAndUpdate(
            id,
            { productoId, fechaBaja, cantidad, observaciones },
            { new: true }
        ).populate('productoId'); // Poblamos el ID del producto

        if (!bajaActualizada) {
            return res.status(404).json({ message: 'Baja de producto no encontrada' });
        }

        res.json({ message: 'Baja de producto actualizada con éxito', baja: bajaActualizada });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la baja de producto', error });
    }
};

const eliminarBajaProducto = async (req, res) => {
    const { id } = req.params;

    try {
        const bajaEliminada = await BajaProducto.findByIdAndDelete(id);

        if (!bajaEliminada) {
            return res.status(404).json({ message: 'Baja de producto no encontrada' });
        }

        res.json({ message: 'Baja de producto eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la baja de producto', error });
    }
};

const cambiarEstadoBajaProducto = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const baja = await BajaProducto.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        );

        if (!baja) {
            return res.status(404).json({ message: 'Baja de producto no encontrada' });
        }

        res.json({ message: 'Estado de la baja de producto actualizado', baja });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar el estado de la baja de producto', error });
    }
};

module.exports = {
    obtenerBajasProductos,
    crearBajaProducto,
    actualizarBajaProducto,
    eliminarBajaProducto,
    cambiarEstadoBajaProducto
};
