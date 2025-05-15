"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import Swal from "sweetalert2"
import "./ResetPassword.css"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef(null)

  // Verificar si tenemos el token de autorización
  useEffect(() => {
    const resetAuthToken = localStorage.getItem("resetAuthToken")
    if (!resetAuthToken) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No tienes autorización para acceder a esta página. Por favor, solicita un restablecimiento de contraseña.",
        confirmButtonText: "Entendido",
      }).then(() => {
        navigate("/forgot-password")
      })
    }
  }, [navigate])

  // Función para aplicar estilos forzados
  const applyForcedStyles = () => {
    document.body.classList.add("reset-page-active")
    document.documentElement.classList.add("reset-page-active")

    const appContainer = document.getElementById("root") || document.getElementById("app")
    if (appContainer) {
      appContainer.classList.add("reset-app-container")
    }

    if (containerRef.current) {
      containerRef.current.style.height = "100vh"
      containerRef.current.style.width = "100%"
      containerRef.current.style.display = "flex"
      containerRef.current.style.alignItems = "center"
      containerRef.current.style.justifyContent = "center"
      containerRef.current.style.paddingTop = "4rem"
    }
  }

  useEffect(() => {
    applyForcedStyles()
    const initialTimeout = setTimeout(applyForcedStyles, 100)
    const intervalId = setInterval(applyForcedStyles, 500)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
      document.body.classList.remove("reset-page-active")
      document.documentElement.classList.remove("reset-page-active")

      const appContainer = document.getElementById("root") || document.getElementById("app")
      if (appContainer) {
        appContainer.classList.remove("reset-app-container")
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    // Validar complejidad de la contraseña
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    try {
      const resetAuthToken = localStorage.getItem("resetAuthToken")

      const response = await axios.post("https://gitbf.onrender.com/api/auth/reset-password", {
        resetAuthToken,
        password,
        confirmPassword,
      })

      // Limpiar el token de localStorage
      localStorage.removeItem("resetAuthToken")
      localStorage.removeItem("resetEmail")

      Swal.fire({
        icon: "success",
        title: "¡Contraseña restablecida!",
        text: "Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
        confirmButtonText: "Iniciar sesión",
      }).then(() => {
        navigate("/login")
      })
    } catch (error) {
      console.error("Error al restablecer contraseña:", error)
      setError(
        error.response?.data?.message || "Ocurrió un error al restablecer la contraseña. Por favor, intenta de nuevo.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-container" ref={containerRef}>
      <div className="reset-background">
        <div className="background-pattern"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="reset-card"
      >
        <div className="reset-content">
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
            <h2 className="welcome-text">Establece tu nueva contraseña</h2>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                {error}
              </motion.div>
            )}

            <p className="instruction-text">
              Crea una nueva contraseña segura para tu cuenta. Debe tener al menos 8 caracteres.
            </p>

            <form onSubmit={handleSubmit} className="reset-form">
              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="input-label">Nueva contraseña</label>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="input-label">Confirmar contraseña</label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="reset-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="loader">
                    <div className="loader-circle"></div>
                  </div>
                ) : (
                  "Restablecer contraseña"
                )}
              </motion.button>
            </form>

            <div className="additional-options">
              <motion.Link to="/login" whileHover={{ scale: 1.05 }} className="back-link">
                Volver al inicio de sesión
              </motion.Link>
            </div>
          </div>
        </div>

        <div className="reset-decoration">
          <div className="decoration-content">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="decoration-title"
            >
              Seguridad renovada
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="decoration-text"
            >
              Protege tu cuenta con una nueva contraseña
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

