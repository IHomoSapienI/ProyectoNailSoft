"use client"

import { useState, useEffect, use } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaUsers,
  FaUserShield,
  FaShoppingCart,
  FaCalendarAlt,
  FaTachometerAlt,
  FaCashRegister,
  FaCamera,
  FaUserCircle,
  FaClipboardList,
  FaAsymmetrik,
  FaFileAlt,
} from "react-icons/fa"
import { useAuth } from "../../context/AuthContext" // Importamos el contexto de autenticación
// Actualizamos la importación para usar una ruta relativa
import { Navbar, NavbarLogo, NavbarDropdownMenu, AvatarMenu } from "../ui/navbar"

export default function MainNavbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth(); // Obtenemos el usuario desde el contexto de autenticación
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    
    const role = user?.role;// Aseguramos que userRole sea una cadena vacía si no hay usuario
    setUserRole(role ? role.toLowerCase() : null)
  }, [user])

  
  // const {logout}= useAuth(); // Obtenemos la función de logout desde el contexto de autenticación
  const handleLogout = () => {
    logout(); // Llamamos a la función de logout del contexto
    navigate("/login") // Redirigimos al usuario a la página de login
  }

  const renderMenuItems = () => {
    const menuConfig = {
      admin: [
        {
          icon: FaTachometerAlt,
          label: "Dashboard",
          items: [{ icon: FaUserShield, label: "Reportes", path: "/dashboard" }],
        },
        {
          icon: FaUserShield,
          label: "Configuración",
          items: [
            { icon: FaUserShield, label: "Gestión de roles", path: "/roles" },
            { icon: FaUsers, label: "Gestión de usuarios", path: "/usuarios" },
          ],
        },
        {
          icon: FaShoppingCart,
          label: "Compra",
          items: [
            { icon: FaShoppingCart, label: "Gestión insumos", path: "/insumos" },
            { icon: FaShoppingCart, label: "Gestión productos", path: "/productos" },
            { icon: FaShoppingCart, label: "Gestión de proveedores", path: "/proveedores" },
            { icon: FaShoppingCart, label: "Gestión de compra", path: "/compras" },
          ],
        },
        {
          icon: FaCalendarAlt,
          label: "Agendamiento",
          items: [
            { icon: FaCamera, label: "Portafolio de Servicios", path: "/articles" },
            { icon: FaCalendarAlt, label: "Gestión de servicios", path: "/servicios" },
            { icon: FaCalendarAlt, label: "Empleados", path: "/empleados" },
            { icon: FaCalendarAlt, label: "Programación de agenda", path: "/agenda" },
            { icon: FaCalendarAlt, label: "Citas", path: "/citas" },
          ],
        },
        {
          icon: FaCashRegister,
          label: "Ventas",
          items: [
            { icon: FaCashRegister, label: "Gestión de clientes", path: "/clientes" },
            { icon: FaCashRegister, label: "Gestión de ventas de servicios", path: "/ventas" },
            { icon: FaCashRegister, label: "Venta de productos", path: "/ventasproductos" },
          ],
        },
      ],
      usuario: [
        {
          icon: FaUserCircle,
          label: "Mi Perfil",
          items: [
            { icon: FaUserCircle, label: "Ver Perfil", path: "/profile" },
            { icon: FaUserCircle, label: "Editar Perfil", path: "/editar-perfil" },
          ],
        },
        {
          icon: FaCalendarAlt,
          label: "Servicios",
          items: [
            { icon: FaCamera, label: "Portafolio de Servicios", path: "/articles" },
            { icon: FaCalendarAlt, label: "Agendar Cita", path: "/citas" },
          ],
        },
      ],
      cliente: [
        {
          icon: FaTachometerAlt,
          label: "Dashboard",
          items: [{ icon: FaShoppingCart, label: "Historial de Compras", path: "/mi-cuenta" }],
        },
        {
          icon: FaCalendarAlt,
          label: "Servicios",
          items: [
            { icon: FaAsymmetrik, label: "Agendar Cita", path: "/seleccionarservicios" },
            { icon: FaCamera, label: "Portafolio de Servicios", path: "/articles" },
          ],
        },
        {
          icon: FaFileAlt,
          label: "Políticas",
          items: [{ icon: FaFileAlt, label: "Políticas del Salón", path: "/politicas" }],
        },
      ],
      empleado: [
        {
          icon: FaUserCircle,
          label: "Mi Perfil",
          items: [
            { icon: FaUserCircle, label: "Ver Perfil", path: "/profile" },
            { icon: FaUserCircle, label: "Editar Perfil", path: "/editar-perfil" },
          ],
        },
        {
          icon: FaCalendarAlt,
          label: "Mi Agenda",
          items: [{ icon: FaCalendarAlt, label: "Ver Agenda", path: "/mi-agenda" }],
        },
        {
          icon: FaClipboardList,
          label: "Servicios",
          items: [{ icon: FaClipboardList, label: "Servicios Asignados", path: "/servicios-asignados" }],
        },
      ],
    }

    return menuConfig[userRole]?.map((item, index) => <NavbarDropdownMenu key={index} {...item} />)
  }

  return (
    <Navbar variant="main">
      <NavbarLogo />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">{renderMenuItems()}</div>
        {/* Añadir ThemeToggle si lo tienes */}
        {/* <ThemeToggle /> */}
        <AvatarMenu userName={localStorage.getItem("userName") || ""} onLogout={handleLogout} />

      </div>
    </Navbar>
  )
}
