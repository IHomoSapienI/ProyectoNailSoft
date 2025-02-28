const { response } = require('express');
const mongoose = require('mongoose');
const Rol = require('../modules/rol'); // Importar el modelo de Rol
const Permiso = require('../modules/permiso'); // Importar el modelo de Permiso

// Método GET para obtener los roles
const rolesGet = async (req, res = response) => {
    try {
        const roles = await Rol.find().populate('permisoRol'); // Populate para mostrar detalles de permisos

        if (roles.length === 0) {
            return res.status(404).json({
                msg: 'No se encontraron roles en la base de datos'
            });
        }

        res.json({ roles });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al obtener los roles'
        });
    }
};

// Método POST para crear un nuevo rol
const rolesPost = async (req, res = response) => {
    const { nombreRol, permisoRol, estadoRol } = req.body; // Extraer datos del cuerpo de la solicitud
    console.log('Datos recibidos en backend:', { nombreRol, permisoRol, estadoRol });

    // Asegúrate de que permisoRol sea un arreglo
    let permisosArray;
    if (typeof permisoRol === 'string') {
        permisosArray = [permisoRol];
    } else if (Array.isArray(permisoRol)) {
        permisosArray = permisoRol;
    } else {
        return res.status(400).json({
            msg: 'El campo permisoRol debe ser un ID de permiso o un arreglo de IDs de permisos.'
        });
    }

    // Verificar que los IDs de permisos sean válidos
    if (!permisosArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({
            msg: 'Lista de permisos inválida o IDs de permisos no válidos.'
        });
    }

    // Verificar que todos los permisos existan
    try {
        const permisosExistentes = await Permiso.find({ '_id': { $in: permisosArray } });
        if (permisosExistentes.length !== permisosArray.length) {
            return res.status(400).json({
                msg: 'Uno o más permisos no existen.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            msg: 'Error al verificar permisos.'
        });
    }

    // Determinar si es un rol admin
    const isAdmin = nombreRol.toLowerCase() === "admin"; // Compara con "admin" en minúsculas

    // Crear una nueva instancia del modelo Rol
    const rol = new Rol({ nombreRol, permisoRol: permisosArray, estadoRol, esAdmin: isAdmin });

    try {
        // Guardar el nuevo rol en la base de datos
        await rol.save();
        res.status(201).json({ msg: 'Rol asignado correctamente', rol });
    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            console.error(Object.values(error.errors).map(val => val.message));
            res.status(400).json({ msg: Object.values(error.errors).map(val => val.message).join(', ') });
        } else {
            res.status(500).json({ msg: 'Error al crear el rol' });
        }
    }
};

// Método PUT para actualizar un rol por su id
const rolesPut = async (req, res = response) => {
    const { id } = req.params;
    const { nombreRol, permisoRol, estadoRol } = req.body; // No necesitas esAdmin aquí, ya que se establece automáticamente

    try {
        // Verifica que el rol existe antes de actualizar
        const rolExistente = await Rol.findById(id);
        if (!rolExistente) {
            return res.status(404).json({
                msg: 'Rol no encontrado',
            });
        }

        // Actualiza los campos del rol
        rolExistente.nombreRol = nombreRol || rolExistente.nombreRol;
        rolExistente.permisoRol = permisoRol || rolExistente.permisoRol;
        rolExistente.estadoRol = estadoRol !== undefined ? estadoRol : rolExistente.estadoRol;

        // Determinar si es un rol admin al actualizar
        rolExistente.esAdmin = rolExistente.nombreRol.toLowerCase() === "admin";

        await rolExistente.save();

        res.json({
            msg: 'Rol actualizado exitosamente',
            rol: rolExistente,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al actualizar el rol',
        });
    }
};

// Método DELETE para eliminar un rol por su id
const rolesDelete = async (req, res = response) => {
    const { id } = req.params;

    // Verificar si el rol con el id proporcionado existe
    const rol = await Rol.findById(id);
    if (!rol) {
        return res.status(404).json({
            msg: 'Rol no encontrado'
        });
    }

    await Rol.findByIdAndDelete(id);

    res.json({
        msg: 'Rol eliminado'
    });
};

module.exports = {
    rolesGet,
    rolesPost,
    rolesPut,
    rolesDelete
};
