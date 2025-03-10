"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaUsers,
  FaUserShield,
  FaShoppingCart,
  FaCalendarAlt,
  FaTachometerAlt,
  FaCashRegister,
  FaSignOutAlt,
  FaCamera,
  FaUserCircle,
  FaClipboardList,
  FaChevronDown,
} from "react-icons/fa"
import "../NavBars/navbar.css"

export default function Navbar() {
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role ? role.toLowerCase() : null)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    navigate("/login")
  }

  const MenuItem = ({ icon: Icon, label, items }) => (
    <motion.div
      className="menu-item"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setActiveDropdown(label)}
      onHoverEnd={() => setActiveDropdown(null)}
    >
      <motion.button className="menu-trigger" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Icon className="menu-icon" />
        <span>{label}</span>
        <motion.div
          className="menu-arrow"
          animate={{ rotate: activeDropdown === label ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {activeDropdown === label && (
          <motion.div
            className="menu-dropdown"
            initial={{ opacity: 0, y: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.95,
              transition: {
                duration: 0.15,
                ease: "easeIn",
              },
            }}
          >
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: {
                    delay: index * 0.05,
                  },
                }}
              >
                <Link to={item.path} className="menu-link" onClick={() => setActiveDropdown(null)}>
                  <item.icon className="menu-link-icon" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

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
        {
          icon: FaShoppingCart,
          label: "Mis Compras",
          items: [{ icon: FaShoppingCart, label: "Historial de Compras", path: "/mis-compras" }],
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

    return menuConfig[userRole]?.map((item, index) => <MenuItem key={index} {...item} />)
  }

  return (
    <motion.nav
      className={`navbar ${isScrolled ? "scrolled" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src="https://gitbf.onrender.com/uploads/logo1.png"
            alt="NailsSoft Logo"
          />
          <motion.span
            className="brand-name"
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 1, x: -20 }}
            animate={{ opacity: 1.5, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            NailsSoft
          </motion.span>
        </Link>

        <motion.div
          className="navbar-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {renderMenuItems()}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Cerrar sesión</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  )
}

