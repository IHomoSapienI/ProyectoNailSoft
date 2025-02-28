import React, { createContext, useContext, useState } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Inicializa el usuario como null

    // Función para iniciar sesión
    const login = (userData) => {
        setUser(userData); // Establece el usuario en el contexto
        localStorage.setItem('token', userData.token); // Almacena el token en localStorage
    };

    // Función para cerrar sesión
    const logout = () => {
        setUser(null); // Limpia el usuario del contexto
        localStorage.removeItem('token'); // Elimina el token de localStorage
    };

    // Función para actualizar el usuario
    const updateUser = (updatedUserData) => {
        setUser((prevUser) => ({
            ...prevUser,
            ...updatedUserData, // Mezcla los datos anteriores con los nuevos
        }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};
