"use client"

import { useState, useEffect } from "react"
import { useSidebar } from "./Sidebar"

// Componente de layout principal que se ajusta al estado del sidebar
const MainLayout = ({ children }) => {
  const { isCollapsed, isSidebarOpen } = useSidebar()
  const [contentStyle, setContentStyle] = useState({
    marginLeft: "280px",
    width: "calc(100% - 280px)",
  })

  useEffect(() => {
    // Ajustar el margen basado en el estado del sidebar
    if (window.innerWidth >= 768) {
      if (isCollapsed) {
        setContentStyle({
          marginLeft: "70px",
          width: "calc(100% - 70px)",
        })
      } else {
        setContentStyle({
          marginLeft: "280px",
          width: "calc(100% - 280px)",
        })
      }
    } else {
      setContentStyle({
        marginLeft: "0px",
        width: "100%",
      })
    }

    // Escuchar cambios de tamaño de ventana
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setContentStyle({
          marginLeft: "0px",
          width: "100%",
        })
      } else {
        setContentStyle({
          marginLeft: isCollapsed ? "70px" : "280px",
          width: isCollapsed ? "calc(100% - 70px)" : "calc(100% - 280px)",
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
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  )
}

export default MainLayout

