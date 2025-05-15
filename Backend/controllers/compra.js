const Compra = require('../modules/compra');
const Proveedor = require('../modules/proveedor');
const Insumo = require('../modules/insumo');
const mongoose = require('mongoose');

// Crear una nueva compra
// Crear una nueva compra
exports.crearCompra = async (req, res) => {
    try {
        const { proveedor, recibo, fechaCompra, estado, insumos } = req.body;

        // Validar que los campos requeridos estén presentes
        if (!proveedor || !recibo || !fechaCompra || !insumos || insumos.length === 0) {
            return res.status(400).json({ mensaje: "Faltan campos requeridos o la lista de insumos está vacía." });
        }

        // Verificar si el proveedor existe
        const proveedorExistente = await Proveedor.findById(proveedor);
        if (!proveedorExistente) {
            return res.status(400).json({ mensaje: "Proveedor no encontrado." });
        }

        // Convertir los IDs de los insumos a ObjectId
        const insumoIds = insumos.map(item => new  mongoose.Types.ObjectId(item.insumo));

        // Buscar los insumos en la base de datos
        const insumosExistentes = await Insumo.find({ _id: { $in: insumoIds } });

        // Identificar los insumos faltantes
        const insumosFaltantes = insumos.filter(item => 
            !insumosExistentes.some(insumo => insumo._id.equals(item.insumo))
        );

        if (insumosFaltantes.length > 0) {
            return res.status(400).json({
                mensaje: "Algunos insumos no fueron encontrados.",
                insumosFaltantes
            });
        }

        // Calcular el monto total basándose en los precios de los insumos
        const montoTotal = insumos.reduce((total, item) => {
            const insumoEncontrado = insumosExistentes.find(insumo => insumo._id.equals(item.insumo));
            return total + (insumoEncontrado.precio * item.cantidad);
        }, 0);

        // Crear la nueva compra
        const nuevaCompra = new Compra({
            proveedor,
            recibo,
            fechaCompra,
            fechaRegistro: new Date(),
            monto: montoTotal,
            estado: estado !== undefined ? estado : true,
            insumos
        });

        await nuevaCompra.save();

        return res.status(201).json(nuevaCompra);
    } catch (error) {
        console.error("Error al crear la compra:", error);
        return res.status(500).json({ mensaje: "Error al crear la compra", error: error.message });
    }
};

// Obtener todas las compras
exports.obtenerCompras = async (req, res) => {
    try {
        const compras = await Compra.find()
            .populate('proveedor', 'nombreProveedor contacto')
            .populate('insumos.insumo', 'nombreInsumo precio')
            .limit(100);

        return res.status(200).json(compras);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener las compras', error: error.message });
    }
};

// Obtener una compra por ID
exports.obtenerCompraPorId = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ mensaje: 'ID inválido' });
        }

        const compra = await Compra.findById(req.params.id)
            .populate('proveedor', 'nombre contacto')
            .populate('insumos.insumo', 'nombreInsumo precio');

        if (!compra) {
            return res.status(404).json({ mensaje: 'Compra no encontrada' });
        }

        return res.status(200).json(compra);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener la compra', error: error.message });
    }
};

// Actualizar una compra
// Actualizar una compra
exports.actualizarCompra = async (req, res) => {
    try {
        const { proveedor, recibo, fechaCompra, estado, insumos } = req.body;

        if (!insumos || insumos.length === 0) {
            return res.status(400).json({ mensaje: 'No se proporcionaron insumos para la compra' });
        }

        // Verificar que el proveedor existe
        if (proveedor) {
            const proveedorExistente = await Proveedor.findById(proveedor);
            if (!proveedorExistente) {
                return res.status(400).json({ mensaje: 'Proveedor no encontrado' });
            }
        }

        // Verificar que los insumos existen
        const insumosExistentes = await Insumo.find({ _id: { $in: insumos.map(item => item.insumo) } });
        const insumosFaltantes = insumos.filter(item => 
            !insumosExistentes.some(insumo => insumo._id.equals(item.insumo))
        );

        if (insumosFaltantes.length > 0) {
            return res.status(400).json({
                mensaje: 'Algunos insumos no fueron encontrados',
                insumosFaltantes
            });
        }

        // Calcular el nuevo monto total
        const montoTotal = insumos.reduce((total, item) => {
            const insumoEncontrado = insumosExistentes.find(insumo => insumo._id.equals(item.insumo));
            return total + (insumoEncontrado.precio * item.cantidad);
        }, 0);

        const compraActualizada = await Compra.findByIdAndUpdate(
            req.params.id,
            { proveedor, recibo, fechaCompra, monto: montoTotal, estado, insumos },
            { new: true, runValidators: true }
        );

        if (!compraActualizada) {
            return res.status(404).json({ mensaje: 'Compra no encontrada' });
        }

        return res.status(200).json(compraActualizada);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al actualizar la compra', error: error.message });
    }
};


// Eliminar una compra
exports.eliminarCompra = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ mensaje: 'ID inválido' });
        }

        const compraEliminada = await Compra.findByIdAndDelete(req.params.id);
        if (!compraEliminada) {
            return res.status(404).json({ mensaje: 'Compra no encontrada' });
        }

        return res.status(200).json({ mensaje: 'Compra eliminada con éxito' });
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al eliminar la compra', error: error.message });
    }
};