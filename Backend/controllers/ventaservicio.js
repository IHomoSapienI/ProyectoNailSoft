const { response } = require('express');
const Ventaservicio = require('../modules/ventaservicio');
const Cita = require('../modules/cita');
const Cliente = require('../modules/cliente');
const Servicio = require('../modules/servicio');
const Empleado = require('../modules/empleado'); // Importar el modelo de empleado

// Obtener todas las ventas de servicios
const ventaserviciosGet = async (req, res = response) => {
    try {
        const ventaservicios = await Ventaservicio.find()
            .populate('cliente', 'nombrecliente documentocliente') // Obtener el cliente
            .populate('empleado', 'nombreempleado') // Obtener el empleado directamente
            .populate({
                path: 'cita',
                select: 'fechacita', // Obtener solo la fecha de la cita
            })
            .populate('servicios.servicio', 'nombreServicio precio tiempo') // Obtener los servicios
            .lean();

        if (ventaservicios.length === 0) {
            return res.status(404).json({
                msg: 'No se encontraron ventas de servicios en la base de datos'
            });
        }

        // Formatear los datos para que se muestren correctamente
        const ventasFormateadas = ventaservicios.map(venta => ({
            ...venta,
            cliente: venta.cliente ? {
                _id: venta.cliente._id,
                nombrecliente: venta.cliente.nombrecliente || 'Nombre no disponible',
                documentocliente: venta.cliente.documentocliente || 'Documento no disponible' // Asegúrate de incluir el documento
            } : null,
            cita: venta.cita ? {
                _id: venta.cita._id,
                fechacita: venta.cita.fechacita || 'Fecha no disponible'
            } : null,
            empleado: venta.empleado ? {
                _id: venta.empleado._id,
                nombreempleado: venta.empleado.nombreempleado || 'Nombre no disponible'
            } : null,
            servicios: Array.isArray(venta.servicios) ? venta.servicios.map(servicio => ({
                ...servicio,
                servicio: servicio.servicio ? {
                    _id: servicio.servicio._id,
                    nombreServicio: servicio.servicio.nombreServicio || 'Servicio no especificado',
                    precio: servicio.precio,
                    tiempo: servicio.tiempo
                } : null
            })) : []
        }));

        res.json({ ventaservicios: ventasFormateadas });
    } catch (error) {
        console.error('Error al obtener las ventas de los servicios:', error);
        res.status(500).json({
            msg: 'Error al obtener las ventas de los servicios',
            error: error.message // Incluyendo detalles del error para depuración
        });
    }
};
// Crear una nueva venta de servicio
const ventaserviciosPost = async (req, res = response) => {
    const { cita, cliente, empleado, servicios, precioTotal, estado } = req.body;

    // Verificación de campos obligatorios
    if (!cita || !cliente || !empleado || !servicios || !precioTotal || estado === undefined) {
        return res.status(400).json({
            msg: 'Cita, cliente, empleado, servicios, precio total y estado son obligatorios.'
        });
    }

    try {
        const [existeCita, existeCliente, existeEmpleado] = await Promise.all([
            Cita.findById(cita),
            Cliente.findById(cliente),
            Empleado.findById(empleado)
        ]);

        if (!existeCita || !existeCliente || !existeEmpleado) {
            return res.status(400).json({
                msg: 'La cita, el cliente o el empleado especificado no existe en la base de datos.'
            });
        }

        // Validar los servicios
        const serviciosIds = servicios.map(servicio => servicio.servicio);
        const serviciosValidos = await Servicio.find({ _id: { $in: serviciosIds } });

        if (serviciosValidos.length !== servicios.length) {
            return res.status(400).json({
                msg: 'Uno o más servicios no existen en la base de datos.'
            });
        }

        const serviciosConTiempo = serviciosValidos.map(servicio => ({
            servicio: servicio._id,
            nombreServicio: servicio.nombreServicio,
            precio: servicio.precio,
            tiempo: servicio.tiempo
        }));

        const ventaservicio = new Ventaservicio({
            cita,
            cliente,
            empleado, // Agregar el empleado a la venta
            servicios: serviciosConTiempo,
            precioTotal,
            estado
        });

        await ventaservicio.save();

        res.status(201).json({
            msg: 'Venta de servicio creada correctamente',
            ventaservicio
        });
    } catch (error) {
        console.error('Error al crear la venta de servicio:', error);
        res.status(500).json({
            msg: 'Error al crear la venta de servicio'
        });
    }
};

// Actualizar una venta de servicio
const ventaserviciosPut = async (req, res = response) => {
    const { id } = req.params;
    const { cita, cliente, empleado, servicios, precioTotal, estado } = req.body;

    // Verificación de campos obligatorios
    if (!cita || !cliente || !empleado || !servicios || !precioTotal || estado === undefined) {
        return res.status(400).json({
            msg: 'Cita, cliente, empleado, servicios, precio total y estado son obligatorios.'
        });
    }

    try {
        const venta = await Ventaservicio.findById(id);
        if (!venta) {
            return res.status(404).json({
                msg: 'Venta de servicio no encontrada'
            });
        }

        const [existeCita, existeCliente, existeEmpleado] = await Promise.all([
            Cita.findById(cita),
            Cliente.findById(cliente),
            Empleado.findById(empleado)
        ]);

        if (!existeCita || !existeCliente || !existeEmpleado) {
            return res.status(400).json({
                msg: 'La cita, el cliente o el empleado especificado no existe en la base de datos.'
            });
        }

        const serviciosIds = servicios.map(servicio => servicio.servicio);
        const serviciosValidos = await Servicio.find({ _id: { $in: serviciosIds } });

        if (serviciosValidos.length !== servicios.length) {
            return res.status(400).json({
                msg: 'Uno o más servicios no existen en la base de datos.'
            });
        }

        const serviciosConTiempo = serviciosValidos.map(servicio => ({
            servicio: servicio._id,
            nombreServicio: servicio.nombreServicio,
            precio: servicio.precio,
            tiempo: servicio.tiempo
        }));

        // Actualizar los campos
        venta.cita = cita;
        venta.cliente = cliente;
        venta.empleado = empleado; // Actualizar el empleado
        venta.servicios = serviciosConTiempo;
        venta.precioTotal = precioTotal;
        venta.estado = estado;

        await venta.save();

        res.json({
            msg: 'Venta de servicio actualizada correctamente',
            venta
        });
    } catch (error) {
        console.error('Error al actualizar la venta de servicio:', error);
        res.status(500).json({
            msg: 'Error al actualizar la venta de servicio'
        });
    }
};

// Eliminar una venta de servicio
const ventaserviciosDelete = async (req, res = response) => {
    const { id } = req.params;

    try {
        const result = await Ventaservicio.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({
                msg: 'Venta de servicio no encontrada'
            });
        }

        res.json({
            msg: 'Venta de servicio eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar la venta de servicio:', error);
        res.status(500).json({
            msg: 'Error al eliminar la venta de servicio'
        });
    }
};

module.exports = {
    ventaserviciosGet,
    ventaserviciosPost,
    ventaserviciosPut, 
    ventaserviciosDelete
};
