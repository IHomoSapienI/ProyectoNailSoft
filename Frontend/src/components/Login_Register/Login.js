"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import "./Login.css"
import Swal from "sweetalert2"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const loginContainerRef = useRef(null)

  // Función para aplicar estilos forzados
  const applyForcedStyles = () => {
    // Forzar estilos en el body y html
    document.body.classList.add("login-page-active")
    document.documentElement.classList.add("login-page-active")

    // Forzar estilos en el contenedor de la aplicación
    const appContainer = document.getElementById("root") || document.getElementById("app")
    if (appContainer) {
      appContainer.classList.add("login-app-container")
    }

    // Forzar estilos en el contenedor de login
    if (loginContainerRef.current) {
      loginContainerRef.current.style.height = "100vh"
      loginContainerRef.current.style.width = "100%"
      loginContainerRef.current.style.display = "flex"
      loginContainerRef.current.style.alignItems = "center"
      loginContainerRef.current.style.justifyContent = "center"
      loginContainerRef.current.style.paddingTop = "4rem"
    }
  }

  // Aplicar estilos inmediatamente al montar y en intervalos regulares
  useEffect(() => {
    // Aplicar estilos inmediatamente
    applyForcedStyles()

    // Aplicar estilos después de un breve retraso para asegurar que se apliquen después de cualquier otro cambio
    const initialTimeout = setTimeout(applyForcedStyles, 100)

    // Aplicar estilos periódicamente para asegurar que se mantengan
    const intervalId = setInterval(applyForcedStyles, 500)

    // Limpiar al desmontar
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
      document.body.classList.remove("login-page-active")
      document.documentElement.classList.remove("login-page-active")

      const appContainer = document.getElementById("root") || document.getElementById("app")
      if (appContainer) {
        appContainer.classList.remove("login-app-container")
      }
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("https://gitbf.onrender.com/api/auth/login", { email, password })
      const { token, role, user } = response.data

      if (!token || !role || !user) {
        throw new Error("Token, role, or user missing from response")
      }

      login({ token, role, name: user.name, email: user.email })
      localStorage.setItem("token", token)
      localStorage.setItem("userRole", role.toLowerCase())
      localStorage.setItem("userId", user.id)

      // Redirigir según el rol del usuario
      if (role.toLowerCase() === "admin") {
        navigate("/dashboard")
      } else {
        navigate("/")
      }
    } catch (error) {
      console.error("Error de login:", error)

      // Verificar si el error es por cuenta inactiva
      if (error.response?.data?.cuentaInactiva) {
        Swal.fire({
          icon: "error",
          title: "Cuenta inactiva",
          text: "Tu cuenta ha sido desactivada. Por favor, contacta al administrador para reactivarla.",
          confirmButtonText: "Entendido",
        })
      }
      // Verificar si el error es por rol desactivado
      else if (error.response?.data?.rolDesactivado) {
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Tu rol ha sido desactivado. Contacta al administrador.",
          confirmButtonText: "Entendido",
        })
      } else {
        setError(error.response?.data?.message || "Credenciales inválidas. Por favor, intente de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container" ref={loginContainerRef}>
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="login-card"
      >
        <div className="login-content">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="logo-container"
          >
            <img src="https://gitbf.onrender.com/uploads/logo1.png" alt="NailsSoft Logo" className="logo-image" />
            <h1 className="logo-text">NailsSoft</h1>
          </motion.div>

          <div className="form-container">
            <h2 className="welcome-text">¡Bienvenido de nuevo!</h2>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="input-label">Correo electrónico</label>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="input-label">Contraseña</label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="loader">
                    <div className="loader-circle"></div>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </motion.button>
            </form>

            <div className="additional-options">
              <Link to="/forgot-password" whileHover={{ scale: 1.05 }} className="forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
              <motion.Link to="/register" whileHover={{ scale: 1.05 }} className="create-account">
                Crear cuenta
              </motion.Link>
            </div>
          </div>
        </div>

        <div className="login-decoration">
          <div className="decoration-content">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="decoration-title"
            >
              Belleza y Estilo
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="decoration-text"
            >
              Descubre un mundo de belleza y profesionalismo
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

