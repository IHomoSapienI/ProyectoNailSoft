const { response } = require('express');
const Permiso = require('../modules/permiso'); // Asegúrate de que el path sea correcto

// Obtener todos los permisos
const permisosGet = async (req, res = response) => {
    try {
        const permisos = await Permiso.find();
        if (permisos.length === 0) {
            return res.status(404).json({
                msg: 'No se encontraron permisos en la base de datos'
            });
        }
        res.json({ permisos });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener los permisos' });
    }
};

// Crear un nuevo permiso
const permisosPost = async (req, res = response) => {
    const { nombrePermiso, descripcion, activo, categoria, nivel } = req.body;

    // Validar campos obligatorios
    if (!nombrePermiso || !descripcion || activo === undefined || !categoria || !nivel) {
        return res.status(400).json({
            msg: 'Nombre, descripción, estado activo, categoría y nivel son obligatorios.'
        });
    }

    // Verificar que el nivel sea válido
    const nivelesValidos = ['read', 'write', 'delete'];
    if (!nivelesValidos.includes(nivel)) {
        return res.status(400).json({
            msg: 'El nivel debe ser uno de los siguientes: read, write, delete.'
        });
    }

    const categoriasValidas = ['usuarios', 'roles', 'configuración', 'reportes', 'compras', 'servicios', 'ventaServicios', 'productos', 'ventaProductos','citas','empleados','clientes','insumos','proveedores', 'categoriaProductos']; // Incluye las categorías que deseas permitir
if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({
        msg: 'La categoría debe ser una de las siguientes: usuarios, roles, configuración, reportes, compras.'
    });
}


    const permiso = new Permiso({ nombrePermiso, descripcion, activo, categoria, nivel });

    try {
        await permiso.save();
        res.status(201).json({
            msg: 'Permiso creado correctamente',
            permiso
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al crear el permiso' });
    }
};

// Actualizar un permiso
const permisosPut = async (req, res = response) => {
    const { id } = req.params;
    const { nombrePermiso, descripcion, activo, categoria, nivel } = req.body;

    try {
        const permiso = await Permiso.findById(id);
        if (!permiso) {
            return res.status(404).json({ ok: false, msg: 'Permiso no encontrado' });
        }

        // Actualizar solo los campos que se proporcionan
        permiso.nombrePermiso = nombrePermiso || permiso.nombrePermiso;
        permiso.descripcion = descripcion || permiso.descripcion;
        permiso.activo = activo !== undefined ? activo : permiso.activo;
        permiso.categoria = categoria || permiso.categoria; // Solo se actualiza si se proporciona un valor
        
        // Validar el nivel antes de actualizarlo
        if (nivel) {
            const nivelesValidos = ['read', 'write', 'delete'];
            if (!nivelesValidos.includes(nivel)) {
                return res.status(400).json({
                    msg: 'El nivel debe ser uno de los siguientes: read, write, delete.'
                });
            }
            permiso.nivel = nivel; // Solo se actualiza si se proporciona un valor válido
        }

        await permiso.save();
        res.json({
            ok: true,
            msg: 'Permiso actualizado con éxito',
            permiso
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el permiso' });
    }
};

// Eliminar un permiso
const permisosDelete = async (req, res = response) => {
    const { id } = req.params;
    try {
        const permiso = await Permiso.findByIdAndDelete(id);
        if (!permiso) {
            return res.status(404).json({ ok: false, msg: 'Permiso no encontrado' });
        }
        res.json({ ok: true, msg: 'Permiso eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el permiso' });
    }
};

module.exports = {
    permisosGet,
    permisosPost,
    permisosPut,
    permisosDelete
};
