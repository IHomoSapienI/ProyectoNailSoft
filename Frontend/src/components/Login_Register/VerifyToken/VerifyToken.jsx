"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import Swal from "sweetalert2"
import "./VerifyToken.css"

export default function VerifyToken() {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef(null)

  // Función para aplicar estilos forzados
  const applyForcedStyles = () => {
    document.body.classList.add("verify-page-active")
    document.documentElement.classList.add("verify-page-active")

    const appContainer = document.getElementById("root") || document.getElementById("app")
    if (appContainer) {
      appContainer.classList.add("verify-app-container")
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
      document.body.classList.remove("verify-page-active")
      document.documentElement.classList.remove("verify-page-active")

      const appContainer = document.getElementById("root") || document.getElementById("app")
      if (appContainer) {
        appContainer.classList.remove("verify-app-container")
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("https://gitbf.onrender.com/api/auth/verify-reset-token", { token })

      // Guardar el token de autorización para el restablecimiento
      localStorage.setItem("resetAuthToken", response.data.resetAuthToken)
      localStorage.setItem("resetEmail", response.data.email)

      Swal.fire({
        icon: "success",
        title: "Código verificado",
        text: "Tu código ha sido verificado correctamente. Ahora puedes establecer una nueva contraseña.",
        confirmButtonText: "Continuar",
      }).then(() => {
        navigate("/reset-password")
      })
    } catch (error) {
      console.error("Error al verificar token:", error)
      setError(error.response?.data?.message || "Código inválido o expirado. Por favor, solicita un nuevo código.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-container" ref={containerRef}>
      <div className="verify-background">
        <div className="background-pattern"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="verify-card"
      >
        <div className="verify-content">
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
            <h2 className="welcome-text">Verificar código</h2>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                {error}
              </motion.div>
            )}

            <p className="instruction-text">
              Ingresa el código de verificación que hemos enviado a tu correo electrónico.
            </p>

            <form onSubmit={handleSubmit} className="verify-form">
              <div className="input-group">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="input-label">Código de verificación</label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="verify-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="loader">
                    <div className="loader-circle"></div>
                  </div>
                ) : (
                  "Verificar código"
                )}
              </motion.button>
            </form>

            <div className="additional-options">
              <motion.Link to="/forgot-password" whileHover={{ scale: 1.05 }} className="back-link">
                Solicitar nuevo código
              </motion.Link>
              <motion.Link to="/login" whileHover={{ scale: 1.05 }} className="back-link">
                Volver al inicio de sesión
              </motion.Link>
            </div>
          </div>
        </div>

        <div className="verify-decoration">
          <div className="decoration-content">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="decoration-title"
            >
              Verificación
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="decoration-text"
            >
              Estamos a un paso de recuperar tu acceso
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

