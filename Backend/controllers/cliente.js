const Cliente = require('../modules/cliente');

// Crear un nuevo cliente
const crearCliente = async (req, res) => {
    try {
        const { documentocliente, nombrecliente, direccioncliente, celularcliente, estadocliente } = req.body;

        // Crear una nueva instancia de Cliente
        const nuevoCliente = new Cliente({
            documentocliente,
            nombrecliente,
            direccioncliente,
            celularcliente,
            estadocliente
        });

        // Guardar el cliente en la base de datos
        await nuevoCliente.save();
        res.status(201).json({ message: 'Cliente creado con éxito', cliente: nuevoCliente });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el cliente', error });
    }
};

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los clientes', error });
    }
};

// Obtener un cliente por ID
const obtenerClientePorId = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el cliente', error });
    }
};

// Actualizar un cliente
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;

        const clienteActualizado = await Cliente.findByIdAndUpdate(id, datosActualizados, { new: true });
        if (!clienteActualizado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Cliente actualizado con éxito', cliente: clienteActualizado });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el cliente', error });
    }
};

// Eliminar un cliente
const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const clienteEliminado = await Cliente.findByIdAndDelete(id);
        if (!clienteEliminado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json({ message: 'Cliente eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el cliente', error });
    }
};

module.exports = {
    crearCliente,
    obtenerClientes,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente
};
