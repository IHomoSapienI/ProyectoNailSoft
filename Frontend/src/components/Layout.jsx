// import React from 'react';
// import Sidebar from './Sidebar/Sidebar'; // Ajusta rutas según corresponda
// import MainLayout from './Sidebar/MainLayout';
// import Navbar from './NavBars/Navbar';
// import Footer from './Footer/Footer';

// const Layout = ({ children }) => {
//   const userRole = localStorage.getItem("userRole");
//   const isAdmin = userRole === "admin";
//   const isEmployee = userRole === "empleado";
//   const showSidebar = isAdmin || isEmployee;

//   return (
//     <div className="App min-h-screen bg-gray-10">
//       {showSidebar ? (
//         <div className="flex min-h-screen">
//           <Sidebar />
//           <MainLayout>{children}</MainLayout>
//         </div>
//       ) : (
//         <>
//           <Navbar />
//           <div className="content min-h-screen">{children}</div>
//           <Footer />
//         </>
//       )}
//     </div>
//   );
// };


// export default Layout;
