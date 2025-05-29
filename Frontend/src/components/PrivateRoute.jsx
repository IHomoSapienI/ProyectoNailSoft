// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const isAuthenticated = localStorage.getItem("token") !== null;
//   const userRole = localStorage.getItem("userRole");

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   if (allowedRoles && userRole) {
//     if (!allowedRoles.includes(userRole.toLowerCase())) {
//       return <Navigate to="/unauthorized" />;
//     }
//   } else if (allowedRoles) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// };

// export default PrivateRoute;
