"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import Swal from "sweetalert2"
import "./VerifyToken.css"

export default function VerifyToken() {
  const location = useLocation()
  const [token, setToken] = useState("")
  const [email, setEmail] = useState(location.state?.email || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef(null)

  // Verificar email al cargar
  useEffect(() => {
    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "Falta información necesaria para verificar tu código.",
        confirmButtonText: "Entendido"
      }).then(() => {
        navigate("/forgot-password");
      });
    }
  }, [email, navigate]);

  // Función para validar el token
  const validateToken = (token) => {
    if (!token) {
      return "El código es obligatorio"; // CEVN6
    }
    if (token.length !== 6) {
      return "El código debe tener exactamente 6 dígitos"; // CEVN1, CEVN2
    }
    if (!/^\d+$/.test(token)) {
      if (/\s/.test(token)) {
        return "No se permiten espacios en el código"; // CEVN7
      }
      if (/[a-zA-Z]/.test(token)) {
        return "El código solo debe contener números"; // CEVN3
      }
      if (/[^0-9\s]/.test(token)) {
        return "No se permiten caracteres especiales"; // CEVN4
      }
    }
    return "";
  }

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
  
    // Validaciones frontend
    if (!email) {
      setError("Falta el correo electrónico");
      setLoading(false);
      return;
    }
  
    const tokenError = validateToken(token);
    if (tokenError) {
      setError(tokenError);
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(
        "https://gitbf.onrender.com/api/auth/verify-reset-token", 
        { token, email },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000
        }
      )
  
      if (!response.data.resetToken) {
        throw new Error("No se recibió token de restablecimiento");
      }
  
      navigate("/reset-password", { 
        state: { 
          resetToken: response.data.resetToken,
          email: email
        } 
      })
  
    } catch (error) {
      let errorMessage = "Error al verificar el código";
      
      if (error.response) {
        // CEVN5 - Código no coincide con el enviado al correo
        if (error.response.status === 400 || error.response.status === 401) {
          errorMessage = "El código es incorrecto o ha expirado";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión a internet.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  const handleTokenChange = (e) => {
    const inputValue = e.target.value;
    // Solo permitir números y limitar a 6 caracteres
    const sanitizedValue = inputValue.replace(/[^0-9]/g, '').substring(0, 6);
    setToken(sanitizedValue);
    
    // Validación en tiempo real
    if (sanitizedValue.length === 6) {
      const error = validateToken(sanitizedValue);
      setError(error);
    } else {
      setError("");
    }
  }
  
  return (
    <div className="verify-container" ref={containerRef}>
      <div className="verify-background">
        <div className="background-pattern-verify"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="verify-card"
      >
        <div className="verify-content">
          <div className="form-container-verify">
            <h2 className="welcome-text-verify">Verificar código</h2>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                {error}
              </motion.div>
            )}

            <p className="instruction-text-verify">
              Ingresa el código de 6 dígitos que hemos enviado a tu correo electrónico.
            </p>

            <form onSubmit={handleSubmit} className="verify-form">
              <div className="input-group-verify">
                <input
                  type="text"
                  value={token}
                  onChange={handleTokenChange}
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  className="form-input-verify"
                  placeholder=" "
                  inputMode="numeric"
                />
                <label className="input-label-verify">Código de verificación *</label>
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

            <div className="additional-options-verify">
              <motion.button 
                onClick={() => navigate("/forgot-password")} 
                whileHover={{ scale: 1.05 }} 
                className="option-link-verify"
              >
                Solicitar nuevo código
              </motion.button>
              <motion.button 
                onClick={() => navigate("/login")} 
                whileHover={{ scale: 1.05 }} 
                className="option-link-verify"
              >
                Volver al inicio de sesión
              </motion.button>
            </div>
          </div>
        </div>

        <div className="verify-decoration">
          <div className="decoration-content-verify">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="logo-container-verify"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SPA%20Y%20BELLEZA%20MARCA%20DE%20AGUA%20BLANCA-VFG4JvBoS4w0THbQFEavbRqsd9HDxv.png"
                alt="SPA Y BELLEZA"
                className="logo-image-verify"
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="decoration-title-verify"
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