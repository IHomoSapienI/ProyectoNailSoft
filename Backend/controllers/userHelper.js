const bcrypt = require('bcryptjs');
const User = require('../modules/usuario');

const createUser = async ({ nombre, email, password, rol, estado }) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Contraseña encriptada antes de guardar:', hashedPassword);

        const newUser = new User({
            nombre,
            email,
            password: hashedPassword,
            rol,
            estado
        });

        await newUser.save();
        console.log('Usuario creado exitosamente:', JSON.stringify(newUser, null, 2));

        return newUser;
    } catch (error) {
        throw new Error('Error al crear el usuario: ' + error.message);
    }
};

module.exports = { createUser };
