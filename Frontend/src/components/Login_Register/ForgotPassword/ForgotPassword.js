"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import Swal from "sweetalert2"
import "./ForgotPassword.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef(null)

  // Función para aplicar estilos forzados
  const applyForcedStyles = () => {
    // Forzar estilos en el body y html
    document.body.classList.add("forgot-page-active")
    document.documentElement.classList.add("forgot-page-active")

    // Forzar estilos en el contenedor de la aplicación
    const appContainer = document.getElementById("root") || document.getElementById("app")
    if (appContainer) {
      appContainer.classList.add("forgot-app-container")
    }

    // Forzar estilos en el contenedor
    if (containerRef.current) {
      containerRef.current.style.height = "100vh"
      containerRef.current.style.width = "100%"
      containerRef.current.style.display = "flex"
      containerRef.current.style.alignItems = "center"
      containerRef.current.style.justifyContent = "center"
      containerRef.current.style.paddingTop = "4rem"
    }
  }

  // Aplicar estilos inmediatamente al montar y en intervalos regulares
  useEffect(() => {
    // Aplicar estilos inmediatamente
    applyForcedStyles()

    // Aplicar estilos después de un breve retraso
    const initialTimeout = setTimeout(applyForcedStyles, 100)

    // Aplicar estilos periódicamente
    const intervalId = setInterval(applyForcedStyles, 500)

    // Limpiar al desmontar
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
      document.body.classList.remove("forgot-page-active")
      document.documentElement.classList.remove("forgot-page-active")

      const appContainer = document.getElementById("root") || document.getElementById("app")
      if (appContainer) {
        appContainer.classList.remove("forgot-app-container")
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("https://gitbf.onrender.com/api/auth/request-password-reset", { email })

      setSuccess(true)

      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Si el correo existe en nuestra base de datos, recibirás un código de verificación para restablecer tu contraseña.",
        confirmButtonText: "Entendido",
      })
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error)

      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", error.response.data)
        console.error("Error status:", error.response.status)
        console.error("Error headers:", error.response.headers)
        setError(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`)
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request)
        setError("No se recibió respuesta del servidor. Verifica tu conexión a internet.")
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message)
        setError(`Error al enviar la solicitud: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-container" ref={containerRef}>
      <div className="forgot-background">
        <div className="background-pattern"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="forgot-card"
      >
        <div className="forgot-content">
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
            <h2 className="welcome-text">Recupera tu contraseña</h2>

            {!success ? (
              <>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                    {error}
                  </motion.div>
                )}

                <p className="instruction-text">
                  Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu
                  contraseña.
                </p>

                <form onSubmit={handleSubmit} className="forgot-form">
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

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="forgot-button"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="loader">
                        <div className="loader-circle"></div>
                      </div>
                    ) : (
                      "Enviar código de verificación"
                    )}
                  </motion.button>
                </form>
              </>
            ) : (
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h3 className="success-title">Código enviado</h3>
                <p className="success-text">
                  Hemos enviado un código de verificación a tu correo electrónico. Por favor, revisa tu bandeja de
                  entrada.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="forgot-button"
                  onClick={() => navigate("/verify-token")}
                >
                  Verificar código
                </motion.button>
              </div>
            )}

            <div className="additional-options">
              <motion.Link to="/login" whileHover={{ scale: 1.05 }} className="back-to-login">
                Volver al inicio de sesión
              </motion.Link>
            </div>
          </div>
        </div>

        <div className="forgot-decoration">
          <div className="decoration-content">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="decoration-title"
            >
              Recupera tu acceso
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="decoration-text"
            >
              Estamos aquí para ayudarte a recuperar tu cuenta
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

