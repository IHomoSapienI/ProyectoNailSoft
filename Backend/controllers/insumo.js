const Insumo = require('../modules/insumo');
const BajaProducto = require('../modules/bajaproducto');

// Obtener todos los insumos
const obtenerInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.find();
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los insumos', error });
    }
};

// Crear un nuevo insumo
const crearInsumo = async (req, res) => {
    const { nombreInsumo, stock, precio, estado } = req.body;

    try {
        const nuevoInsumo = new Insumo({ nombreInsumo, stock, precio, estado });
        await nuevoInsumo.save();
        res.status(201).json({ message: 'Insumo creado con éxito', insumo: nuevoInsumo });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el insumo', error });
    }
};

// Actualizar un insumo por ID
const actualizarInsumo = async (req, res) => {
    const { id } = req.params;
    const { nombreInsumo, stock, precio, estado } = req.body;

    try {
        const insumoActualizado = await Insumo.findByIdAndUpdate(
            id,
            { nombreInsumo, stock, precio, estado },
            { new: true }
        );

        if (!insumoActualizado) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        res.json({ message: 'Insumo actualizado con éxito', insumo: insumoActualizado });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el insumo', error });
    }
};

// Eliminar un insumo por ID
const eliminarInsumo = async (req, res) => {
    const { id } = req.params;

    try {
        const insumoEliminado = await Insumo.findByIdAndDelete(id);

        if (!insumoEliminado) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        res.json({ message: 'Insumo eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el insumo', error });
    }
};

// Cambiar el estado de un insumo por ID
const cambiarEstadoInsumo = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const insumo = await Insumo.findByIdAndUpdate(id, { estado }, { new: true });
        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }
        res.json({ message: 'Estado del insumo actualizado', insumo });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar el estado del insumo', error });
    }
};

// Dar de baja un insumo y descontar del stock
const darDeBajaInsumo = async (req, res) => {
    try {
        const { insumoId, fechaBaja, cantidad, observaciones } = req.body;

        const insumo = await Insumo.findById(insumoId);
        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        if (insumo.stock < cantidad) {
            return res.status(400).json({ message: 'Stock insuficiente para dar de baja' });
        }

        const baja = new BajaProducto({
            productoId: insumo._id,
            producto: insumo.nombreInsumo,
            fechaBaja,
            cantidad,
            observaciones
        });

        await baja.save();

        insumo.stock -= cantidad;
        if (insumo.stock === 0) {
            insumo.estado = false;
        }
        await insumo.save();

        res.json({ message: 'Insumo dado de baja correctamente', baja, stockActual: insumo.stock });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al dar de baja el insumo', error });
    }
};

module.exports = {
    obtenerInsumos,
    crearInsumo,
    actualizarInsumo,
    eliminarInsumo,
    cambiarEstadoInsumo,
    darDeBajaInsumo
};