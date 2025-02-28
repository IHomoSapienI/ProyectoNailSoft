"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaUsers,
  FaUserShield,
  FaShoppingCart,
  FaHome,
  FaCalendarAlt,
  FaClipboardList,
  FaUserCog,
  FaTachometerAlt,
  FaBoxes,
  FaMoneyBillWave,
  FaCashRegister,
  FaTags,
  FaCube,
  FaTruck,
  FaSignOutAlt,
  FaChevronDown,
  FaBars,
} from "react-icons/fa"
import { MdOutlineSpa } from "react-icons/md"
import "./sidebar.css"

const MenuItem = ({ icon: Icon, children, to, isActive, onClick }) => (
  <Link to={to} className={`menu-item group ${isActive ? "active" : ""}`} onClick={onClick}>
    <Icon className="menu-icon" />
    <span className="menu-text">{children}</span>
  </Link>
)

const MenuGroup = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="menu-group">
      <button className="menu-group-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h5>{title}</h5>
        <FaChevronDown className={`menu-group-icon ${isExpanded ? "expanded" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="menu-group-content"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role ? role.toLowerCase() : null)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    navigate("/login")
  }

  if (userRole !== "admin") {
    return null
  }

  return (
    <>
      {isMobile && (
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          <FaBars />
        </button>
      )}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? "280px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
        className="sidebar-container"
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            <Link to="/dashboard" className="logo-container">
              <img src="http://gitbf.onrender.com/uploads/logo1.png" alt="NailsSoft Logo" className="logo-image" />
              <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="logo-text">
                NailsSoft
              </motion.h1>
            </Link>
          </div>

          <div className="menu-container">
            <MenuGroup title="Principal" defaultExpanded={true}>
              <MenuItem icon={FaTachometerAlt} to="/dashboard" isActive={location.pathname === "/dashboard"}>
                Dashboard
              </MenuItem>
              {/* <MenuItem icon={FaHome} to="/" isActive={location.pathname === "/"}>
                Inicio
              </MenuItem> */}
            </MenuGroup>

            <MenuGroup title="Gestión de Ventas">
              <MenuItem icon={FaShoppingCart} to="/ventas" isActive={location.pathname === "/ventas"}>
                Ventas de servicios
              </MenuItem>
              <MenuItem icon={FaCashRegister} to="/ventasproductos" isActive={location.pathname === "/ventasproductos"}>
                Ventas de Productos
              </MenuItem>
            </MenuGroup>

            <MenuGroup title="Gestión de Servicios">
              <MenuItem icon={MdOutlineSpa} to="/servicios" isActive={location.pathname === "/servicios"}>
                Servicios
              </MenuItem>
              <MenuItem icon={FaTags} to="/articles" isActive={location.pathname === "/articles"}>
                Catálogo de Servicios
              </MenuItem>
              <MenuItem icon={FaClipboardList} to="/clientes" isActive={location.pathname === "/clientes"}>
                Clientes
              </MenuItem>
              <MenuItem icon={FaUserCog} to="/empleados" isActive={location.pathname === "/empleados"}>
                Empleados
              </MenuItem>
              <MenuItem icon={FaCalendarAlt} to="/citas" isActive={location.pathname === "/citas"}>
                Citas
              </MenuItem>
            </MenuGroup>

            <MenuGroup title="Gestión de Compras">
              <MenuItem icon={FaMoneyBillWave} to="/compras" isActive={location.pathname === "/compras"}>
                Compras
              </MenuItem>
              <MenuItem icon={FaCube} to="/productos" isActive={location.pathname === "/productos"}>
                Productos
              </MenuItem>
              <MenuItem icon={FaBoxes} to="/insumos" isActive={location.pathname === "/insumos"}>
                Insumos
              </MenuItem>
              <MenuItem icon={FaTruck} to="/proveedores" isActive={location.pathname === "/proveedores"}>
                Proveedores
              </MenuItem>
              <MenuItem icon={FaTags} to="/categoriaProductos" isActive={location.pathname === "/categoriaProductos"}>
                Categoría Productos
              </MenuItem>
            </MenuGroup>

            <MenuGroup title="Configuración">
              <MenuItem icon={FaUserShield} to="/roles" isActive={location.pathname === "/roles"}>
                Roles
              </MenuItem>
              <MenuItem icon={FaUsers} to="/usuarios" isActive={location.pathname === "/usuarios"}>
                Usuarios
              </MenuItem>
            </MenuGroup>
          </div>

          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar

