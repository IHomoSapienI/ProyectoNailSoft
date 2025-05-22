"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Heart, LogOut, Settings, User } from "lucide-react"

import { cn } from "../../libs/util"
import { useSidebar } from "../Sidebar/Sidebar"
import ThemeToggle from "../ThemeToggle" // Importar el componente ThemeToggle
import "./dashboardNavBar.css"

// Opciones de avatares predefinidos
const avatarOptions = [
  {
    id: "avatar1",
    url: "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light",
    gender: "female",
  },
  {
    id: "avatar2",
    url: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortRound&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Pink&graphicType=Bat&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Light",
    gender: "female",
  },
  {
    id: "avatar3",
    url: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads01&accessoriesType=Blank&hairColor=Black&facialHairType=BeardLight&facialHairColor=Black&clotheType=Hoodie&clotheColor=Blue03&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Brown",
    gender: "male",
  },
  {
    id: "avatar4",
    url: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Prescription02&hairColor=BlondeGolden&facialHairType=MoustacheFancy&facialHairColor=BrownDark&clotheType=BlazerSweater&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Default&skinColor=Pale",
    gender: "male",
  },
  {
    id: "avatar5",
    url: "https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Blank&hairColor=Red&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=PastelRed&eyeType=Surprised&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Tanned",
    gender: "female",
  },
  {
    id: "avatar6",
    url: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesar&accessoriesType=Sunglasses&hairColor=Black&facialHairType=BeardMedium&facialHairColor=Black&clotheType=ShirtScoopNeck&clotheColor=Gray01&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Brown",
    gender: "male",
  },
]

const DashboardNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isCollapsed } = useSidebar()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [userName, setUserName] = useState("")
  const [userAvatar, setUserAvatar] = useState("avatar1")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)

    // Obtener el nombre de usuario del localStorage o usar iniciales por defecto
    const storedName = localStorage.getItem("userName") || ""
    setUserName(storedName)

    // Obtener el avatar del usuario del localStorage
    const userId = localStorage.getItem("userId")
    const savedAvatar = localStorage.getItem(`userAvatar_${userId}`)
    if (savedAvatar) {
      setUserAvatar(savedAvatar)
    }

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("clienteId")
    navigate("/login")
  }

  // Obtener la URL del avatar actual
  const currentAvatarUrl = avatarOptions.find((a) => a.id === userAvatar)?.url || avatarOptions[0].url

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
        " top-0 z-30 flex h-16 items-center border-b border-pink-100/100 bg-white/95 backdrop-blur-md transition-all duration-300 dark:card-gradient-4 dark:border-pink-900/20",
        isScrolled && "shadow-md shadow-pink-600/10 dark:shadow-pink-600/5",
        isCollapsed ? "ml-[70px] w-[calc(100%-70px)]" : "m-[auto] w-[calc(100%-0vh)]",
      )}
    >
      <div className=" flex w-full items-center justify-between px-16">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -50, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6.5 }}
          >
            <Heart className="h-8 w-8 text-pink-600" />
          </motion.div>
          <h1 className="hidden text-lg font-medium text-gray-800 dark:text-gray-200 md:block">
            Desarrollamos tus Sueños
          </h1>
          <motion.div animate={{ rotate: [0, 50, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6.5 }}>
            <Heart className="h-8 w-8 text-black-600 dark:text-white" />
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          {/* <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="search"
              placeholder="Buscar..."
              className="h-9 w-64 rounded-full bg-pink-50/50 pl-10 pr-4 text-sm outline-none ring-pink-200 transition-all focus:ring-2 dark:bg-gray-800 dark:text-gray-200 dark:ring-pink-800"
            />
          </div> */}

          {/* <div className="relative">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-200/20 transition-colors hover:bg-pink-50/50 dark:border-pink-800/20 dark:hover:bg-pink-900/20">
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[10px] font-medium text-white">
                  {notifications}
                </span>
              )}
            </button>
          </div> */}

          {/* Añadir el botón de cambio de tema */}
          <ThemeToggle />
          <div className="relative">
            <button className="flex items-center gap-2" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="avatar-container h-8 w-8 overflow-hidden rounded-full border-2 border-pink-200 dark:border-pink-800">
                <img
                  src={currentAvatarUrl || "/placeholder.svg"}
                  alt="Avatar de usuario"
                  className="h-full w-full object-cover"
                />
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 opacity-50 dark:text-gray-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-pink-100 bg-white p-1 shadow-lg dark:border-pink-900 dark:bg-gray-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-2 flex items-center gap-3 border-b border-pink-100 p-2 dark:border-pink-900">
                    <div className="avatar-container h-10 w-10 overflow-hidden rounded-full border-2 border-pink-200 dark:border-pink-800">
                      <img
                        src={currentAvatarUrl || "/placeholder.svg"}
                        alt="Avatar de usuario"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {userName || "Usuario"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {localStorage.getItem("userRole") || "Admin"}
                      </span>
                    </div>
                  </div>

                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-pink-50 dark:text-gray-200 dark:hover:bg-pink-900/20"
                    onClick={() => {
                      navigate("/profile")
                      setShowUserMenu(false)
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-pink-50 dark:text-gray-200 dark:hover:bg-pink-900/20"
                    onClick={() => {
                      navigate("/usuarios")
                      setShowUserMenu(false)
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </button>

                  <div className="my-1 h-px bg-pink-100 dark:bg-pink-900"></div>

                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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
