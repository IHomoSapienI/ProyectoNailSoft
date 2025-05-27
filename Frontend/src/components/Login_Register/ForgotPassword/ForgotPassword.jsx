"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import Swal from "sweetalert2"
import "./ForgotPassword.css"

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    general: ""
  })

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33',
      backdrop: `
        rgba(0,0,0,0.7)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `
    })
  }

  const applyForcedStyles = () => {
    document.body.classList.add("forgot-page-active")
    document.documentElement.classList.add("forgot-page-active")

    const appContainer = document.getElementById("root") || document.getElementById("app")
    if (appContainer) {
      appContainer.classList.add("forgot-app-container")
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
      document.body.classList.remove("forgot-page-active")
      document.documentElement.classList.remove("forgot-page-active")

      const appContainer = document.getElementById("root") || document.getElementById("app")
      if (appContainer) {
        appContainer.classList.remove("forgot-app-container")
      }
    }
  }, [])

 const validateField = (name, value) => {
  let error = ""
  
  switch(name) {
    case "email":
      if (!value.trim()) {
        error = "El email es obligatorio" // CEVN10
      } else if (value.length > 80) {
        error = "Máximo 80 caracteres permitidos" // CEVN11
      } else if (/\s/.test(value)) {
        error = "No se permiten espacios en el email" // CEVN9
      } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
        // Validaciones específicas para diferentes casos inválidos
        if (!value.includes('@')) {
          error = "Falta el símbolo @" // CEVN2
        } else if ((value.match(/@/g) || []).length > 1) {
          error = "Solo se permite un símbolo @" // CEVN3
        } else if (/[<>*]/.test(value)) {
          error = "Caracteres especiales inválidos" // CEVN4, CEVN6
        } else if (!value.includes('.')) {
          error = "Dominio incompleto (falta punto)" // CEVN5, CEVN7
        } else if (!value.split('@')[1].includes('.')) {
          error = "Dominio inválido" // CEVN5
        } else if (value.endsWith('@')) {
          error = "Falta el dominio después de @" // CEVN7
        } else {
          error = "Formato de email inválido" // CEVN1, CEVN8
        }
      }
      break
      
    default:
      break
  }
  
  return error
}

  const handleChange = (e) => {
    const { name, value } = e.target
    const processedValue = name === "email" ? value.toLowerCase() : value
    
    const error = validateField(name, processedValue)
    
    setErrors(prev => ({
      ...prev,
      [name]: error,
      general: ""
    }))
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }))
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {...errors}
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      newErrors[key] = error
      if (error) isValid = false
    })
    
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors(prev => ({...prev, general: ""}))
    
    if (!validateForm()) {
      setLoading(false)
      showErrorAlert("Por favor corrige los errores en el formulario")
      return
    }

    try {
      const response = await axios.post(
        "https://gitbf.onrender.com/api/auth/request-password-reset", 
        { email: formData.email.trim() }
      )

      Swal.fire({
        icon: "success",
        title: "Código enviado",
        text: "Hemos enviado un código de verificación a tu correo electrónico. Por favor revisa tu bandeja de entrada.",
        confirmButtonText: "Entendido",
      }).then(() => {
        navigate("/verify-token", { state: { email: formData.email } })
      })
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error)
      
      let errorMessage = "Error al solicitar restablecimiento. Por favor intente nuevamente."

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Datos inválidos"
        } else if (error.response.status === 404) {
          errorMessage = "El correo electrónico no está registrado"
        }
      } else if (error.request) {
        errorMessage = "No se pudo conectar al servidor. Verifique su conexión."
      }

      setErrors(prev => ({...prev, general: errorMessage}))
      showErrorAlert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-container" ref={containerRef}>
      <div className="forgot-background">
        <div className="background-pattern-forgot"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="forgot-card"
      >
        <div className="forgot-content">
          <div className="form-container-forgot">
            <h2 className="welcome-text-forgot">Recupera tu contraseña</h2>

            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                {errors.general}
              </motion.div>
            )}

            <p className="instruction-text-forgot">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="input-group-forgot">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`form-input-register ${errors.email ? 'input-error' : ''}`}
                  placeholder=" "
                  maxLength={80}
                />
                <label htmlFor="email" className="input-label-register">Correo electrónico *</label>
                {errors.email && <span className="field-error">{errors.email}</span>}
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
                  "Enviar enlace de recuperación"
                )}
              </motion.button>
            </form>

            <div className="additional-options-forgot">
              <Link to="/login" className="option-link-forgot">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>

        <div className="forgot-decoration">
          <div className="decoration-content-forgot">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="logo-container-forgot"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SPA%20Y%20BELLEZA%20MARCA%20DE%20AGUA%20BLANCA-VFG4JvBoS4w0THbQFEavbRqsd9HDxv.png"
                alt="SPA Y BELLEZA"
                className="logo-image-forgot"
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="decoration-title-forgot"
            >
              Recupera tu acceso
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="decoration-text-forgot"
            >
              Estamos aquí para ayudarte a recuperar tu cuenta
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}