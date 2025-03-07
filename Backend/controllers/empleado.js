const Empleado = require('../modules/empleado');

// Crear un nuevo empleado
const crearEmpleado = async (req, res) => {
    try {
        const { nombreempleado, apellidoempleado, correoempleado, telefonoempleado, estadoempleado } = req.body;

        // Validar campos obligatorios
        if (!nombreempleado || !apellidoempleado || !correoempleado || !telefonoempleado) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Verificar si el correo ya existe
        const existeCorreo = await Empleado.findOne({ correoempleado });
        if (existeCorreo) {
            return res.status(400).json({ message: 'El correo ya está en uso' });
        }

        // Crear una nueva instancia de Empleado
        const nuevoEmpleado = new Empleado({
            nombreempleado,
            apellidoempleado,
            correoempleado,
            telefonoempleado,
            estadoempleado
        });

        // Guardar el empleado en la base de datos
        await nuevoEmpleado.save();
        res.status(201).json({ message: 'Empleado creado con éxito', empleado: nuevoEmpleado });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el empleado', error });
    }
};

// Obtener todos los empleados
const obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.status(200).json(empleados);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los empleados', error });
    }
};

// Obtener un empleado por ID
const obtenerEmpleadoPorId = async (req, res) => {
    try {
        const empleado = await Empleado.findById(req.params.id);
        if (!empleado) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(200).json(empleado);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el empleado', error });
    }
};

// Actualizar un empleado
const actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreempleado, apellidoempleado, correoempleado, telefonoempleado, estadoempleado } = req.body;

        // Verificar si el empleado existe
        const empleadoExistente = await Empleado.findById(id);
        if (!empleadoExistente) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        // Verificar si el correo ya está en uso por otro empleado
        if (correoempleado && correoempleado !== empleadoExistente.correoempleado) {
            const existeCorreo = await Empleado.findOne({ correoempleado });
            if (existeCorreo) {
                return res.status(400).json({ message: 'El correo ya está en uso' });
            }
        }

        const empleadoActualizado = await Empleado.findByIdAndUpdate(
            id,
            { nombreempleado, apellidoempleado, correoempleado, telefonoempleado, estadoempleado },
            { new: true }
        );

        res.status(200).json({ message: 'Empleado actualizado con éxito', empleado: empleadoActualizado });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el empleado', error });
    }
};

// Eliminar un empleado
const eliminarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const empleadoEliminado = await Empleado.findByIdAndDelete(id);
        if (!empleadoEliminado) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(200).json({ message: 'Empleado eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el empleado', error });
    }
};

module.exports = {
    crearEmpleado,
    obtenerEmpleados,
    obtenerEmpleadoPorId,
    actualizarEmpleado,
    eliminarEmpleado
};
