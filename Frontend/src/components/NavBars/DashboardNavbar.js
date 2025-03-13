"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, ChevronDown, Heart, LogOut, Search, Settings, User } from "lucide-react"

import { cn } from "../../libs/util"
import { useSidebar } from ".././Sidebar/Sidebar"

const DashboardNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isCollapsed } = useSidebar()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)

    // Obtener el nombre de usuario del localStorage o usar iniciales por defecto
    const storedName = localStorage.getItem("userName") || ""
    setUserName(storedName)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    navigate("/login")
  }

  // Obtener el título de la página basado en la ruta actual
  const getPageTitle = () => {
    if (location.pathname === "/dashboard") return "Dashboard"

    // Extraer el nombre de la ruta y formatearlo
    const path = location.pathname.split("/").pop()
    if (!path) return "Dashboard"

    // Convertir guiones a espacios y capitalizar cada palabra
    return path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center border-b border-pink-100/10 bg-white/95 backdrop-blur-md transition-all duration-300",
        isScrolled && "shadow-md shadow-pink-600/10",
        isCollapsed ? "ml-[70px] w-[calc(100%-70px)]" : "ml-[280px] w-[calc(100%-280px)]",
      )}
    >
      <div className="flex w-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6.5 }}>
            <Heart className="h-8 w-8 text-pink-600" />
          </motion.div>
          <h1 className="hidden text-lg font-medium text-gray-800 md:block">Desarrollamos tus Sueños</h1>
          <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6.5 }}>
            <Heart className="h-8 w-8 text-black-600" />
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              placeholder="Buscar..."
              className="h-9 w-64 rounded-full bg-pink-50/50 pl-10 pr-4 text-sm outline-none ring-pink-200 transition-all focus:ring-2"
            />
          </div>

          <div className="relative">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-200/20 transition-colors hover:bg-pink-50/50">
              <Bell className="h-4 w-4 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[10px] font-medium text-white">
                  {notifications}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button className="flex items-center gap-2" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-600">
                <span>{userName.substring(0, 2).toUpperCase() || "US"}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 opacity-50" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-pink-100 bg-white p-1 shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-pink-50"
                    onClick={() => {
                      navigate("/profile")
                      setShowUserMenu(false)
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-pink-50"
                    onClick={() => {
                      navigate("/usuarios")
                      setShowUserMenu(false)
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </button>

                  <div className="my-1 h-px bg-pink-100"></div>

                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardNavbar

