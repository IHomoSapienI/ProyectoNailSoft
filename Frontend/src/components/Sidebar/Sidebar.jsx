"use client"

import React from "react"

import { useState, useEffect, useRef, createContext, useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { HeartHandshake, Download, Heart, Copyright } from "lucide-react"
import { BiSolidDiscount } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion"
import {
  FaUsers,
  FaUserShield,
  FaShoppingCart,
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
  FaCalendarCheck,
  FaUserLock,
  FaCalendarWeek,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa"
import { Md10K, MdAdUnits, MdAirlineSeatLegroomReduced, MdOutlineSpa, MdOutlineVrpano,MdOutlineRoomPreferences,MdOutlineMonetizationOn } from "react-icons/md"
import "./sidebar.css"

// Crear contexto para el estado del sidebar
export const SidebarContext = createContext({
  isCollapsed: false,
  isSidebarOpen: true,
})

export const useSidebar = () => useContext(SidebarContext)

const MenuItem = ({ icon: Icon, children, to, isActive, onClick, collapsed }) => (
  <Link
    to={to}
    className={`menu-item group  ${isActive ? "active" : ""}`}
    onClick={onClick}
    title={collapsed ? children : ""}
  >
    <Icon className="menu-icon" />
    {!collapsed && <span className="menu-text">{children}</span>}
  </Link>
)

const MenuGroup = ({ title, children, defaultExpanded = false, collapsed }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Si el sidebar está colapsado, no mostramos el contenido del grupo
  if (collapsed) {
    return (
      <div className="menu-group collapsed">
        
        <div className="menu-group-header-collapsed">
        
          <h5>{title}</h5>
        </div>
        <div className="menu-group-content-collapsed">
          {React.Children.map(children, (child) => React.cloneElement(child, { collapsed }))}
        </div>
      </div>
    )
  }

  return (
    <div className="menu-group">
      
      <button className="menu-group-header dark:text-foreground" onClick={() => setIsExpanded(!isExpanded)}>
        <h5>{title}</h5>
        <FaChevronDown className={`menu-group-icon ${isExpanded ? "expanded" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const sidebarRef = useRef(null)

  // Recuperar el estado del sidebar del localStorage al cargar
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem("sidebarCollapsed")
    if (savedCollapsedState !== null) {
      setIsCollapsed(savedCollapsedState === "true")
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)

      // En móvil, cerramos el sidebar por defecto
      if (newIsMobile) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Cerrar el sidebar al hacer clic fuera de él (solo en móvil)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Verificar que no se hizo clic en el botón de toggle
        const toggleButton = document.querySelector(".mobile-toggle, .sidebar-toggle")
        if (!toggleButton || !toggleButton.contains(event.target)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile, isOpen])

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role ? role.toLowerCase() : null)
  }, [])

  // Actualizar la clase del body cuando cambia el estado del sidebar
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", isCollapsed)
    document.body.classList.toggle("sidebar-expanded", !isCollapsed)

    // Disparar un evento personalizado para que otros componentes puedan reaccionar
    window.dispatchEvent(
      new CustomEvent("sidebarStateChanged", {
        detail: { isCollapsed, isOpen },
      }),
    )

    // Ajustar el ancho del contenido principal
    const mainContent = document.querySelector(".main-content")
    if (mainContent) {
      if (window.innerWidth >= 768) {
        if (isCollapsed) {
          mainContent.style.marginLeft = "70px"
          mainContent.style.width = "calc(100% - 70px)"
          mainContent.style.transition = "all 0.3s ease-in-out" // Transición más suave
        } else {
          mainContent.style.marginLeft = "280px"
          mainContent.style.width = "calc(100% - 280px)"
          mainContent.style.transition = "all 0.3s ease-in-out" // Transición más suave
        }
      } else {
        mainContent.style.marginLeft = "0"
        mainContent.style.width = "100%"
      }
    }

    // Forzar un reflow para asegurar que los cambios se apliquen inmediatamente
    void document.body.offsetHeight
  }, [isCollapsed, isOpen])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    navigate("/login")
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    // Guardar el estado en localStorage
    localStorage.setItem("sidebarCollapsed", newCollapsedState.toString())
  }

  // If not admin or employee, don't render the sidebar
  if (userRole !== "admin" && userRole !== "empleado") {
    return null
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, isSidebarOpen: isOpen }}>
      {/* Botón de toggle para móvil */}
      {isMobile && (
        <button className="mobile-toggle " onClick={() => setIsOpen(!isOpen)}>
          <FaBars />
        </button>
      )}

      {/* Botón de toggle para colapsar (visible solo en desktop) */}
      {!isMobile && isOpen && (
        <motion.button
          className="sidebar-toggle"
          onClick={toggleCollapse}
          initial={false}
          animate={{
            left: isCollapsed ? "60px" : "260px",
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.05, // Pequeño retraso para que el botón se mueva después del sidebar
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{
            position: "fixed",
            top: "50%",
            zIndex: 1002,
            transform: "translateY(-50%)",
            background: "white",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            border: "1px solid #f0f0f0",
            cursor: "pointer",
          }}
        >
          {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </motion.button>
      )}

      <motion.div
        ref={sidebarRef}
        initial={false}
        animate={{
          width: !isOpen ? "0px" : isCollapsed ? "70px" : "280px",
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.3, // Reducir la duración para que sea más suave
          ease: [0.25, 0.1, 0.25, 1], // Curva de bezier más suave
          opacity: { duration: 0.2 },
        }}
        className={`sidebar-container dark:bg-primary ${isCollapsed ? "collapsed" : ""}`}
      >
        <div className="sidebar-content dark:bg-primary">
          <div className="sidebar-header">

            <Link to={userRole === "admin" ? "/dashboard" : "/agenda-empleado"} className="logo-container">
            
              <div className="logo-wrapper">
                <img src="http://gitbf.onrender.com/uploads/logo1.png" alt="NailsSoft Logo" className="logo-image" />
              </div>
              {!isCollapsed && (
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="logo-text"
                >
                  NailsSoft
                </motion.h1>
              )}
            </Link>
            
          </div>

          <div className="menu-container">
            {/* Menú para administradores */}
            {userRole === "admin" && (
              <>
              <MenuItem
                  
                  icon={FaTachometerAlt}
                  to="/dashboard"
                  isActive={location.pathname === "/dashboard"}
                  collapsed={isCollapsed}
                >
                  Dashboard
                </MenuItem>
                {/* <MenuGroup title="Principal" defaultExpanded={true} collapsed={isCollapsed}>
                  
                </MenuGroup> */}

                <MenuGroup title="Gestión de Ventas" collapsed={isCollapsed}>
                  {/* <MenuItem
                    icon={FaShoppingCart}
                    to="/ventas"
                    isActive={location.pathname === "/ventas"}
                    collapsed={isCollapsed}
                  >
                    Ventas de servicios
                  </MenuItem> */}
                  <MenuItem
                  icon={MdOutlineMonetizationOn }
                  to="/ventas-unificadas"
                  isActive={location.pathname === "/ventas"}
                  collapsed={isCollapsed}
                >
                  Ventas Unificadas
                </MenuItem>
                  {/* <MenuItem
                    icon={FaCashRegister}
                    to="/ventasproductos"
                    isActive={location.pathname === "/ventasproductos"}
                    collapsed={isCollapsed}
                  >
                    Ventas de Productos
                  </MenuItem> */}
                </MenuGroup>

                <MenuGroup title="Gestión de Servicios" collapsed={isCollapsed}>
                  <MenuItem
                    icon={MdOutlineSpa}
                    to="/servicios"
                    isActive={location.pathname === "/servicios"}
                    collapsed={isCollapsed}
                  >
                    Servicios
                  </MenuItem>
                  <MenuItem
                    icon={BiSolidDiscount}
                    to="/tiposervicios"
                    isActive={location.pathname === "/tiposervicios"}
                    collapsed={isCollapsed}
                  >
                    Tipo De Descuentos
                  </MenuItem>
                  <MenuItem
                    icon={MdOutlineVrpano}
                    to="/articles"
                    isActive={location.pathname === "/articles"}
                    collapsed={isCollapsed}
                  >
                    Catálogo de Servicios
                  </MenuItem>
                  <MenuItem
                    icon={FaClipboardList}
                    to="/clientes"
                    isActive={location.pathname === "/clientes"}
                    collapsed={isCollapsed}
                  >
                    Clientes
                  </MenuItem>
                  <MenuItem
                    icon={FaUserCog}
                    to="/empleados"
                    isActive={location.pathname === "/empleados"}
                    collapsed={isCollapsed}
                  >
                    Empleados
                  </MenuItem>
                  <MenuItem
                    icon={FaCalendarAlt}
                    to="/citas"
                    isActive={location.pathname === "/citas"}
                    collapsed={isCollapsed}
                  >
                    Citas
                  </MenuItem>
                  <MenuItem
                    icon={FaCalendarCheck}
                    to="/citas-en-progreso"
                    isActive={location.pathname === "/citas-en-progreso"}
                    collapsed={isCollapsed}
                  >
                    Citas en Progreso
                  </MenuItem>
                  <MenuItem
                    icon={FaCalendarWeek}
                    to="/agenda-empleado"
                    isActive={location.pathname === "/agenda-empleado"}
                    collapsed={isCollapsed}
                  >
                    Agenda de Empleados
                  </MenuItem>
                </MenuGroup>

                <MenuGroup title="Gestión de Compras" collapsed={isCollapsed}>
                  <MenuItem
                    icon={FaMoneyBillWave}
                    to="/compras"
                    isActive={location.pathname === "/compras"}
                    collapsed={isCollapsed}
                  >
                    Compras
                  </MenuItem>
                  <MenuItem
                    icon={FaCube}
                    to="/productos"
                    isActive={location.pathname === "/productos"}
                    collapsed={isCollapsed}
                  >
                    Productos
                  </MenuItem>
                  <MenuItem
                    icon={FaBoxes}
                    to="/insumos"
                    isActive={location.pathname === "/insumos"}
                    collapsed={isCollapsed}
                  >
                    Insumos
                  </MenuItem>
                  <MenuItem
                    icon={FaTruck}
                    to="/proveedores"
                    isActive={location.pathname === "/proveedores"}
                    collapsed={isCollapsed}
                  >
                    Proveedores
                  </MenuItem>
                  <MenuItem
                    icon={FaTags}
                    to="/categoriaProductos"
                    isActive={location.pathname === "/categoriaProductos"}
                    collapsed={isCollapsed}
                  >
                    Categoría Productos
                  </MenuItem>
                  <MenuItem icon={FaClipboardList} to="/baja-producto" isActive={location.pathname === "/baja-producto"}>
                      Baja de Productos
                    </MenuItem>

                </MenuGroup>
                

                <MenuGroup title="Configuración" collapsed={isCollapsed}>
                  <MenuItem
                    icon={FaUserShield}
                    to="/roles"
                    isActive={location.pathname === "/roles"}
                    collapsed={isCollapsed}
                  >
                    Roles
                  </MenuItem>
                  <MenuItem
                    icon={FaUserLock}
                    to="/permisos"
                    isActive={location.pathname === "/permisos"}
                    collapsed={isCollapsed}
                  >
                    Permisos
                  </MenuItem>
                  <MenuItem
                    icon={FaUsers}
                    to="/usuarios"
                    isActive={location.pathname === "/usuarios"}
                    collapsed={isCollapsed}
                  >
                    Usuarios
                  </MenuItem>
                </MenuGroup>
              </>
            )}

            {/* Menú para empleados */}
            {userRole === "empleado" && (
              <>
                <MenuGroup title="Mi Agenda" defaultExpanded={true} collapsed={isCollapsed}>
                  <MenuItem
                    icon={FaCalendarWeek}
                    to="/agenda-empleado"
                    isActive={location.pathname === "/agenda-empleado"}
                    collapsed={isCollapsed}
                  >
                    Mi Agenda
                  </MenuItem>
                  <MenuItem
                    icon={FaCalendarCheck}
                    to="/citas-en-progreso"
                    isActive={location.pathname === "/citas-en-progreso"}
                    collapsed={isCollapsed}
                  >
                    Citas en Progreso
                  </MenuItem>
                  <MenuItem
                    icon={FaCalendarAlt}
                    to="/citas"
                    isActive={location.pathname === "/citas"}
                    collapsed={isCollapsed}
                  >
                    Todas las Citas
                  </MenuItem>
                </MenuGroup>

                <MenuGroup title="Servicios" collapsed={isCollapsed}>
                  <MenuItem
                    icon={MdOutlineSpa}
                    to="/servicios"
                    isActive={location.pathname === "/servicios"}
                    collapsed={isCollapsed}
                  >
                    Catálogo de Servicios
                  </MenuItem>
                  <MenuItem
                    icon={FaTags}
                    to="/articles"
                    isActive={location.pathname === "/articles"}
                    collapsed={isCollapsed}
                  >
                    Galería de Servicios
                  </MenuItem>
                </MenuGroup>

                <MenuGroup title="Ventas" collapsed={isCollapsed}>
                  <MenuItem
                    icon={FaShoppingCart}
                    to="/ventas"
                    isActive={location.pathname === "/ventas"}
                    collapsed={isCollapsed}
                  >
                    Registrar Venta
                  </MenuItem>
                  <MenuItem
                    icon={FaShoppingCart}
                    to="/gestion-venta/new"
                    isActive={location.pathname.includes("/gestion-venta")}
                    collapsed={isCollapsed}
                  >
                    Gestionar Venta
                  </MenuItem>
                </MenuGroup>

                <MenuGroup title="Mi Perfil" collapsed={isCollapsed}>
                  <MenuItem
                    icon={FaUserCircle}
                    to="/profile"
                    isActive={location.pathname === "/profile"}
                    collapsed={isCollapsed}
                  >
                    Ver Perfil
                  </MenuItem>
                </MenuGroup>

                <MenuGroup title="Configuración" collapsed={isCollapsed}>
                  <MenuItem
                    icon={FaUsers}
                    to="/usuarios"
                    isActive={location.pathname === "/usuarios"}
                    collapsed={isCollapsed}
                  >
                    Usuarios
                  </MenuItem>
                </MenuGroup>
              </>
            )}
          </div>

         
        </div>
      </motion.div>
    </SidebarContext.Provider>
  )
}

export default Sidebar

