"use client"

// Modificar el componente MainLayout para incluir el Footer
import { useState, useEffect } from "react"
import { useSidebar } from "./Sidebar"
import DashboardNavbar from "../NavBars/DashboardNavbar"
import Footer from "../Footer/Footer" // Importar el componente Footer
import '../../App.css'

// Componente de layout principal que se ajusta al estado del sidebar
const MainLayout = ({ children }) => {
  const { isCollapsed, isSidebarOpen } = useSidebar()
  const [contentStyle, setContentStyle] = useState({
    marginLeft: "280px",
    width: "calc(100% - 280px)",
    transition: "all 0.3s ease-in-out",
  })
  const userRole = localStorage.getItem("userRole")
  const isAdmin = userRole === "admin"
  const isEmployee = userRole === "empleado"
  const showDashboardNavbar = isAdmin || isEmployee

  useEffect(() => {
    // Ajustar el margen basado en el estado del sidebar
    if (window.innerWidth >= 768) {
      if (isCollapsed) {
        setContentStyle({
          marginLeft: "70px",
          width: "calc(100% - 70px)",
          transition: "all 0.3s ease-in-out",
        })
      } else {
        setContentStyle({
          marginLeft: "280px",
          width: "calc(100% - 280px)",
          transition: "all 0.3s ease-in-out",
        })
      }
    } else {
      setContentStyle({
        marginLeft: "0px",
        width: "100%",
        transition: "all 0.3s ease-in-out",
      })
    }

    // Escuchar cambios de tamaño de ventana
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setContentStyle({
          marginLeft: "0px",
          width: "100%",
          transition: "all 0.3s ease-in-out",
        })
      } else {
        setContentStyle({
          marginLeft: isCollapsed ? "70px" : "280px",
          width: isCollapsed ? "calc(100% - 70px)" : "calc(100% - 280px)",
          transition: "all 0.3s ease-in-out",
        })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isCollapsed, isSidebarOpen])

  return (
    <div
      className="main-content"
      style={{
        ...contentStyle,
        padding: "0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showDashboardNavbar && <DashboardNavbar />}
      <div className="content-wrapper" style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
        {children}
      </div>
      <Footer /> {/* Añadir el componente Footer */}
    </div>
  )
}

export default MainLayout

