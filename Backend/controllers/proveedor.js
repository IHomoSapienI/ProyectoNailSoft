const Proveedor = require('../modules/proveedor');


// Obtener todos los proveedores
const obtenerProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find();
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los proveedores', error });
    }
};

// Crear un nuevo proveedor
const crearProveedor = async (req, res) => {
    const { nombreProveedor, contacto, numeroContacto, provee } = req.body;

    try {
        const nuevoProveedor = new Proveedor({
            nombreProveedor,
            contacto,
            numeroContacto,
            provee
        });

        await nuevoProveedor.save();
        res.status(201).json({ message: 'Proveedor creado con éxito', proveedor: nuevoProveedor });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el proveedor', error });
    }
};

// Actualizar un proveedor por ID
const actualizarProveedor = async (req, res) => {
    const { id } = req.params;
    const { nombreProveedor, contacto, numeroContacto, provee, estado } = req.body;

    try {
        const proveedorActualizado = await Proveedor.findByIdAndUpdate(
            id,
            { nombreProveedor, contacto, numeroContacto, provee, estado },
            { new: true }
        );

        if (!proveedorActualizado) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        res.json({ message: 'Proveedor actualizado con éxito', proveedor: proveedorActualizado });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proveedor', error });
    }
};

// Eliminar un proveedor por ID
const eliminarProveedor = async (req, res) => {
    const { id } = req.params;

    try {
        const proveedorEliminado = await Proveedor.findByIdAndDelete(id);

        if (!proveedorEliminado) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        res.json({ message: 'Proveedor eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el proveedor', error });
    }
};

// Cambiar el estado de un proveedor por ID
const cambiarEstadoProveedor = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const proveedor = await Proveedor.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        );

        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        res.json({ message: 'Estado del proveedor actualizado', proveedor });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar el estado del proveedor', error });
    }
};

module.exports = {
    obtenerProveedores,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
    cambiarEstadoProveedor
};
