const CatProducto = require('../modules/categoriaproducto'); // Asegúrate de que el nombre del archivo modelo sea correcto

// Obtener todas las categorías
const getCategorias = async (req, res) => {
    try {
        const categorias = await CatProducto.find();
        res.json({
            ok: true,
            categorias
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener categorías de productos'
        });
    }
};

// Obtener una categoría por ID
const getCategoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await CatProducto.findById(id);
        if (!categoria) {
            return res.status(404).json({
                ok: false,
                msg: 'Categoría no encontrada'
            });
        }
        res.json({
            ok: true,
            categoria
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la categoría'
        });
    }
};

// Crear una nueva categoría
const crearCategoria = async (req, res) => {
    const { nombreCp, descripcionCp } = req.body;
    try {
        const nuevaCategoria = new CatProducto({ nombreCp, descripcionCp });
        await nuevaCategoria.save();
        res.json({
            ok: true,
            msg: 'Categoría creada con éxito',
            categoria: nuevaCategoria
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la categoría'
        });
    }
};

// Actualizar una categoría
const actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombreCp, descripcionCp, activo } = req.body;
    try {
        const categoria = await CatProducto.findById(id);
        if (!categoria) {
            return res.status(404).json({
                ok: false,
                msg: 'Categoría no encontrada'
            });
        }

        categoria.nombreCp = nombreCp || categoria.nombreCp;
        categoria.descripcionCp = descripcionCp || categoria.descripcionCp;
        categoria.activo = activo !== undefined ? activo : categoria.activo;

        await categoria.save();
        res.json({
            ok: true,
            msg: 'Categoría actualizada con éxito',
            categoria
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la categoría'
        });
    }
};

// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await CatProducto.findById(id);
        if (!categoria) {
            return res.status(404).json({
                ok: false,
                msg: 'Categoría no encontrada'
            });
        }

        await categoria.remove();
        res.json({
            ok: true,
            msg: 'Categoría eliminada con éxito'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la categoría'
        });
    }
};

module.exports = {
    getCategorias,
    getCategoriaById,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};
