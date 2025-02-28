const { response } = require('express');
const Rol = require('../modules/rol'); // Asegúrate de tener el modelo de Rol
const Usuario = require('../modules/usuario'); // Asegúrate de tener el modelo de Usuario
const bcrypt = require('bcryptjs'); // Para encriptar contraseñas

// Obtener todos los usuarios (sin mostrar contraseñas)
const usuariosGet = async (req, res = response) => {
    try {
        const usuarios = await Usuario.find().select('-password'); // Eliminar el campo `password` de la respuesta

        res.json({
            usuarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al obtener usuarios',
            error
        });
    }
};

const usuariosPost = async (req, res = response) => {
    const { nombre, email, password, confirmPassword } = req.body;

    try {
        // Validar campos obligatorios
        if (!nombre || !email || !password || !confirmPassword) {
            return res.status(400).json({
                msg: 'Faltan campos obligatorios (nombre, email, password, confirmPassword)'
            });
        }

        // Verificar que la contraseña y la confirmación coincidan
        if (password !== confirmPassword) {
            return res.status(400).json({
                msg: 'Las contraseñas no coinciden'
            });
        }

        // Verificar si el usuario ya existe
        const existeEmail = await Usuario.findOne({ email });
        if (existeEmail) {
            return res.status(400).json({
                msg: 'El correo ya está en uso'
            });
        }

        // Verificar cuántos usuarios existen para asignar rol
        const usuarios = await Usuario.countDocuments();
        let rol;

        if (usuarios === 0) {
            // Asignar rol de Admin si es el primer usuario
            rol = await Rol.findOne({ nombreRol: 'Admin' });
        } else {
            // Asignar rol de usuario por defecto
            rol = await Rol.findOne({ nombreRol: 'Usuario' });
        }

        // Verificar si el rol fue encontrado
        if (!rol) {
            return res.status(400).json({ msg: 'El rol por defecto no existe.' });
        }

        // Encriptar la contraseña
        const salt = bcrypt.genSaltSync(10);
        const passwordEncriptada = bcrypt.hashSync(password, salt);

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password: passwordEncriptada,
            rol: rol._id, // Asignar el rol encontrado
            estado: true // Puedes ajustar este valor según tu lógica
        });

        // Guardar usuario en la base de datos
        await nuevoUsuario.save();

        // Eliminar el campo de la contraseña de la respuesta
        const { password: _, ...usuarioResponse } = nuevoUsuario.toObject(); // Excluye 'password'

        res.status(201).json({
            msg: 'Usuario registrado',
            usuario: usuarioResponse // Retorna el usuario sin la contraseña
        });
    } catch (error) {
        console.error(error);
        let msg = 'Error al registrar usuario';
        if (error.name === 'ValidationError') {
            msg = Object.values(error.errors).map(val => val.message);
        }
        res.status(500).json({
            msg
        });
    }
};
// Actualizar un usuario existente
const usuariosPut = async (req, res = response) => {
    const { id } = req.params;
    const { email, nombre, rol } = req.body;

    try {
        // Verificar si el rol existe
        const existeRol = await Rol.findById(rol);
        if (rol && !existeRol) {
            return res.status(400).json({
                msg: 'El rol especificado no es válido'
            });
        }

        // Actualizar el usuario
        const usuario = await Usuario.findByIdAndUpdate(id, { nombre, rol }, { new: true }).select('-password');

        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        res.json({
            msg: 'Usuario modificado correctamente',
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al modificar usuario',
            error
        });
    }
};

// Eliminar un usuario
const usuariosDelete = async (req, res = response) => {
    const { id } = req.params; // Obtener el ID del parámetro de la ruta

    try {
        if (!id) {
            return res.status(400).json({
                msg: 'El ID es necesario para eliminar el usuario'
            });
        }

        const usuario = await Usuario.findByIdAndDelete(id);

        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        res.json({
            msg: 'Usuario eliminado',
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al eliminar usuario',
            error
        });
    }
};

// Consultar usuarios con parámetros (PromGet)
const PromGet = async (req, res = response) => {
    const { q, nombre, page = 1, limit } = req.query;

    try {
        const usuarios = await Usuario.find(); // Consultar todos los documentos de una colección

        // Log para verificar los usuarios
        usuarios.forEach(usuario => console.log(usuario));

        res.json({
            msg: 'Prom API controlador',
            q,
            nombre,
            page,
            limit,
            usuarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al obtener usuarios',
            error
        });
    }
};

module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosDelete,
    PromGet
};
