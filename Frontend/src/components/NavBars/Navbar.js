"use client"

import { useState, useEffect } from "react"
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
  FaDashcube
} from "react-icons/fa"

// Actualizamos la importación para usar una ruta relativa
import { Navbar, NavbarLogo, NavbarDropdownMenu, NavbarLogoutButton } from "../ui/navbar"

export default function MainNavbar() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role ? role.toLowerCase() : null)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    navigate("/login")
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
        <NavbarLogoutButton onClick={handleLogout} />
      </div>
    </Navbar>
  )
}

