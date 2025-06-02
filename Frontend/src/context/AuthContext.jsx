import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al recargar la página, intenta obtener el usuario desde localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    if (token && role && userId && userName && userEmail) {
      setUser({
        token,
        role: role.toLowerCase(),
        _id: userId,
        nombre: userName,
        correo: userEmail,
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const { token, role, _id, nombre, correo } = userData;
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role.toLowerCase());
    localStorage.setItem("userId", _id);
    localStorage.setItem("userName", nombre);
    localStorage.setItem("userEmail", correo);

    setUser({
      token,
      role: role.toLowerCase(),
      _id,
      nombre,
      correo,
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
    }));

    // También actualizar localStorage para persistencia
    Object.entries(updatedUserData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);




// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Al recargar la página, intenta obtener el usuario desde localStorage
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("userRole");

//     if (token && role) {
//       setUser({ token, role });
//     }
//   }, []);

//   const login = (userData) => {
//     const { token, role } = userData;
//     localStorage.setItem("token", token);
//     localStorage.setItem("userRole", role.toLowerCase());

//     setUser({ token, role: role.toLowerCase() });
//   };

//   const logout = () => {
//     localStorage.clear();
//     setUser(null);
//   };

//   const updateUser = (updatedUserData) => {
//     setUser((prevUser) => ({
//       ...prevUser,
//       ...updatedUserData,
//     }));
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, updateUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);




 
// import React, { createContext, useContext, useState } from 'react';

// // Crear el contexto
// const AuthContext = createContext();

// // Proveedor del contexto
// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null); // Inicializa el usuario como null

//     // Función para iniciar sesión
//     const login = (userData) => {
//         setUser(userData); // Establece el usuario en el contexto
//         localStorage.setItem('token', userData.token); // Almacena el token en localStorage
//     };

//     // Función para cerrar sesión
//     const logout = () => {
//         setUser(null); // Limpia el usuario del contexto
//         localStorage.removeItem('token'); // Elimina el token de localStorage
//     };

//     // Función para actualizar el usuario
//     const updateUser = (updatedUserData) => {
//         setUser((prevUser) => ({
//             ...prevUser,
//             ...updatedUserData, // Mezcla los datos anteriores con los nuevos
//         }));
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, updateUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// // Hook para usar el contexto
// export const useAuth = () => {
//     return useContext(AuthContext);
// };
