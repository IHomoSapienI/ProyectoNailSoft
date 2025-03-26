"use client"

// src/App.js
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { useEffect } from "react"
import axios from "axios"
import "bootstrap/dist/css/bootstrap.min.css"
import "./output.css"
import "./tailwind.css"
import "./App.css"
import MainLayout from "./components/Sidebar/MainLayout"
import { getTheme, setTheme } from "./util/theme-util" // Importar funciones de tema

import Sidebar from "./components/Sidebar/Sidebar"
import Navbar from "./components/NavBars/Navbar"
import NavbarAuth from "./components/NavBars/NavbarAuth"
import Footer from "./components/Footer/Footer"
import Index from "./components/LandingI/Index"
import TablaRoles from "./components/Roles/TablaRoles"
import TablaServicios from "./components/Servicios/TablaServicios"
import TablaUsuarios from "./components/Usuarios/TablaUsuarios"
import UserProfile from "./components/PerfilUsuario/UserProfile"
import TablaBajaInsumo from "./components/BajaProducto/TablaBajaInsumo"
import TablaVentaServicios from "./components/VentaServicios/TablaVentaServicios"
import GestionVentaServicio from "./components/VentaServicios/GestionVentaServicio"
import CitasEnProgreso from "./components/Citas_Agenda/CitasEnProgreso"
import AgendaEmpleado from "./components/Citas_Agenda/AgendaEmpleado"
import ArticlesGrid from "./components/Galeria/ArticlesGrid"
import SeleccionarServicios from "./components/Galeria/SeleccionarServicios"
import TablaInsumos from "./components/Insumos/TablaInsumos"
import TablaEmpleados from "./components/Empleados/TablaEmpleados"
import TablaClientes from "./components/Clientes/TablaClientes"
import TablaCitas from "./components/Citas_Agenda/TablaCitas"
import TablaProveedores from "./components/Proveedores/TablaProveedores"
import TablaCategorias from "./components/CategoriaProducto/TablaCategorias"
import TablaProductos from "./components/Productos/TablaProductos"
import TablaVentaProductos from "./components/VentaProductos/TablaVentaProductos"
import TablaCompras from "./components/Compras/TablaCompras"
import Dashboard from "./components/Dashboard/Dashboard"
import Login from "./components/Login_Register/Login"
import Register from "./components/Login_Register/Register"
import TablaPermisos from "./components/Permisos/TablaPermisos"
import TablaVentas from "./components/Venta/TablaVentas"
import ClientDashboard from "./components/Clientes/client-dashboard" // Importar el nuevo componente

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
    <div className="min-h-screen bg-gray-10 dark:bg-gray-900">
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
  <div className="App dark:bg-gray-900 dark:text-white">
    <NavbarAuth />
    <div className="content">{children}</div>
  </div>
)

function App() {
  useEffect(() => {
    // Inicializar el tema cuando carga la aplicación
    const currentTheme = getTheme()
    setTheme(currentTheme)
  }, [])

  return (
    <Router>
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
        {/* Nueva ruta para el dashboard del cliente */}
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
        <Route
          path="/ventas"
          element={
            <PrivateRoute allowedRoles={["admin", "empleado", "cliente"]}>
              <Layout>
                <TablaVentaServicios />
              </Layout>
            </PrivateRoute>
          }
        />

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
          path="/ventasProductos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout>
                <TablaVentaProductos />
              </Layout>
            </PrivateRoute>
          }
        />

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
              <h1 className="dark:text-white">No tienes permiso para acceder a esta página :3</h1>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

