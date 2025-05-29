import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import React, { lazy, Suspense } from "react"

// import "bootstrap/dist/css/bootstrap.min.css"
// import "./output.css"
import "./tailwind.css"
// import "./App.css"
import TablaBajaInsumo from "./components/BajaProducto/TablaBajaInsumo"
import MainLayout from "./components/Sidebar/MainLayout"
// const ClientDashboard = lazy(() => import("./components/Clientes/client-dashboard"))
import ClientDashboard from "./components/Clientes/client-dashboard"
import Sidebar from "./components/Sidebar/Sidebar"
import Navbar from "./components/NavBars/Navbar"
import NavbarAuth from "./components/NavBars/NavbarAuth"
import Footer from "./components/Footer/Footer"
const Index = lazy(() => import("./components/LandingI/Index"))
// import Index from "./components/LandingI/Index"
const TablaRoles = lazy(() => import("./components/Roles/TablaRoles"))
// import TablaRoles from "./components/Roles/TablaRoles"
const TablaServicios = lazy(() => import("./components/Servicios/TablaServicios"))
// import TablaServicios from "./components/Servicios/TablaServicios"
const TablaUsuarios = lazy(() => import("./components/Usuarios/TablaUsuarios"))
// import TablaUsuarios from "./components/Usuarios/TablaUsuarios"
const UserProfile = lazy(() => import("./components/PerfilUsuario/UserProfile"))
// import UserProfile from "./components/PerfilUsuario/UserProfile"
const TablaVentas = lazy(() => import("./components/Venta/TablaVentas"))
// import TablaVentas from "./components/Venta/TablaVentas"

// import TablaVentaServicios from "./components/VentaServicios/TablaVentaServicios"
const GestionVentaServicio = lazy(() => import("./components/VentaServicios/GestionVentaServicio"))
// import GestionVentaServicio from "./components/VentaServicios/GestionVentaServicio"
const CitasEnProgreso = lazy(() => import("./components/Citas_Agenda/CitasEnProgreso"))
// import CitasEnProgreso from "./components/Citas_Agenda/CitasEnProgreso"
const AgendaEmpleado = lazy(() => import("./components/Citas_Agenda/AgendaEmpleado"))
// import AgendaEmpleado from "./components/Citas_Agenda/AgendaEmpleado"
const ArticlesGrid = lazy(() => import("./components/Galeria/ArticlesGrid"))
// import ArticlesGrid from "./components/Galeria/ArticlesGrid"
const SeleccionarServicios = lazy(() => import("./components/Galeria/SeleccionarServicios"))
// import SeleccionarServicios from "./components/Galeria/SeleccionarServicios"
const TablaInsumos = lazy(() => import("./components/Insumos/TablaInsumos"))
// import TablaInsumos from "./components/Insumos/TablaInsumos"
const TablaEmpleados = lazy(() => import("./components/Empleados/TablaEmpleados"))
// import TablaEmpleados from "./components/Empleados/TablaEmpleados"
const TablaClientes = lazy(() => import("./components/Clientes/TablaClientes"))
// import TablaClientes from "./components/Clientes/TablaClientes"

const TablaCitas = lazy(() => import("./components/Citas_Agenda/TablaCitas"))
// import TablaCitas from "./components/Citas_Agenda/TablaCitas"
const TablaProveedores = lazy(() => import("./components/Proveedores/TablaProveedores"))
// import TablaProveedores from "./components/Proveedores/TablaProveedores"
const TablaCategorias = lazy(() => import("./components/CategoriaProducto/TablaCategorias"))
// import TablaCategorias from "./components/CategoriaProducto/TablaCategorias"
const TablaProductos = lazy(() => import("./components/Productos/TablaProductos"))
// import TablaProductos from "./components/Productos/TablaProductos"




// import TablaVentaProductos from "./components/VentaProductos/TablaVentaProductos"
const TablaCompras = lazy(() => import("./components/Compras/TablaCompras"))
// import TablaCompras from "./components/Compras/TablaCompras"

import Dashboard from "./components/Dashboard/Dashboard"


import Login from "./components/Login_Register/Login"
import Register from "./components/Login_Register/Register"
const Politicas = lazy(() => import("./components/Politicas/Politicas"))
// import Politicas from "./components/Politicas/Politicas"
import ForgotPassword from "./components/Login_Register/ForgotPassword/ForgotPassword"
import VerifyToken from "./components/Login_Register/VerifyToken/VerifyToken"
import ResetPassword from "./components/Login_Register/ResetPassword/ResetPassword"
const TablaTipoServicios = lazy(() => import("./components/Servicios/TablaTipoServicios"))
// import TablaTipoServicios from "./components/Servicios/TablaTipoServicios"
const TablaTipoServicioss = lazy(() => import("./components/TipoServicios/TablaTipoServicioss"))
// import TablaTipoServicioss from "./components/TipoServicios/TablaTipoServicioss"

import TablaPermisos from "./components/Permisos/TablaPermisos"
import axios from "axios"

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

const PrivateRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("token") !== null
  const userRole = localStorage.getItem("userRole")

  console.log("isAuthenticated:", isAuthenticated)
  console.log("userRole:", userRole)
  console.log("allowedRoles:", allowedRoles)

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && userRole) {
    if (!allowedRoles.includes(userRole.toLowerCase())) {
      return <Navigate to="/unauthorized" />
    }
  } else if (allowedRoles) {
    // If allowedRoles is specified but userRole is null or undefined
    return <Navigate to="/login" />
  }

  return children
}

// Layout modificado para usar MainLayout para admin y empleado
const Layout = ({ children }) => {
  const userRole = localStorage.getItem("userRole")
  const isAdmin = userRole === "admin"
  const isEmployee = userRole === "empleado"
  const showSidebar = isAdmin || isEmployee

  return (
    <div className="min-h-screen bg-gray-10">
      {showSidebar ? (
        <>
          <Sidebar />
          <MainLayout>{children}</MainLayout>
        </>
      ) : (
        <>
          <Navbar />
          <div className="content min-h-screen">{children}</div>
          <Footer />
        </>
      )}

      {/* Botones de redes sociales solo para la vista del cliente */}
      {!showSidebar && (
        <>
          <a
            href="https://wa.me/3015789978?text=Quisiera realizar una reserva y poner magia en mis uñas"
            className="fixed bottom-5 right-5 p-2 rounded-full shadow-lg transition duration-300 z-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              data-ripple-light="true"
              data-tooltip-target="tooltip"
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="w-12 h-12"
            />
          </a>
          <a
            href="https://www.instagram.com/belleza_spacol/"
            className="fixed bottom-5 left-5 p-2 rounded-full shadow-lg transition duration-300 z-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
              alt="Instagram"
              className="w-12 h-12"
            />
          </a>
        </>
      )}
    </div>
  )
}

const AuthLayout = ({ children }) => (
  <div className="App">
    <NavbarAuth />
    <div className="content">{children}</div>
  </div>
)

function App() {
  return (
    <Router>

      <Suspense fallback={<div>Loading...</div>}>
      <Routes>
    

        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-token" element={<VerifyToken />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <Layout>
              <Index />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/mi-cuenta"
          element={
            <PrivateRoute allowedRoles={["cliente"]}>
              <Layout>
                <ClientDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/politicas"
          element={
            <PrivateRoute allowedRoles={["cliente"]}>
              <Layout>
                <Politicas />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/insumos"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <TablaInsumos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/baja-producto"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <TablaBajaInsumo />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <TablaUsuarios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={["admin", "usuario", "cliente", "empleado"]}>
              <Layout>
                <UserProfile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaRoles />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaPermisos />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/ventas"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaVentaServicios />
              </Layout>
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/ventas-unificadas"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado", "cliente"]}>
              <Layout>
                <TablaVentas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios"
          element={
            <PrivateRoute allowedRoles={["admin", "cliente", "empleado"]}>
              <Layout>
                <TablaServicios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tiposervicios"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaTipoServicios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tiposervicioss"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaTipoServicioss />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <PrivateRoute allowedRoles={["admin", "cliente", "usuario"]}>
              <Layout>
                <ArticlesGrid />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/seleccionarservicios"
          element={
            <PrivateRoute allowedRoles={["admin", "cliente", "usuario"]}>
              <Layout>
                <SeleccionarServicios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/empleados"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaEmpleados />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaClientes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/citas"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado", "usuario", "cliente"]}>
              <Layout>
                <TablaCitas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/proveedores"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaProveedores />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categoriaProductos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaCategorias />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaProductos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/compras"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaCompras />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/ventasProductos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaVentaProductos />
              </Layout>
            </PrivateRoute>
          }
        /> */}

        {/* Nuevas rutas para la gestión de ventas y agenda de empleados */}
        <Route
          path="/citas-en-progreso"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <CitasEnProgreso />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/gestion-venta/:id"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <GestionVentaServicio />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/gestion-venta/new/:citaId"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <GestionVentaServicio />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/agenda-empleado"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado"]}>
              <Layout>
                <AgendaEmpleado />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={
            <Layout>
              <h1>No tienes permiso para acceder a esta página :3</h1>
            </Layout>
          }
        />
      </Routes>
      </Suspense>    



    </Router>
  )
}

export default App

