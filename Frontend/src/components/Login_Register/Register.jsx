"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import "./Register.css"

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    password: "",
    confirmPassword: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === "password") {
      let strength = 0
      if (value.length >= 8) strength += 25
      if (/[A-Z]/.test(value)) strength += 25
      if (/[0-9]/.test(value)) strength += 25
      if (/[^A-Za-z0-9]/.test(value)) strength += 25
      setPasswordStrength(strength)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
  
    // Validaciones
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Todos los campos marcados con * son obligatorios")
      setLoading(false)
      return
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }
  
    if (passwordStrength < 50) {
      setError("La contraseña debe contener al menos 8 caracteres, una mayúscula y un número")
      setLoading(false)
      return
    }
  
    try {
      const response = await axios.post(
        "https://gitbf.onrender.com/api/auth/register",
        {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          celular: formData.celular.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
  
      const { token, role, user } = response.data
      localStorage.setItem("token", token)
      localStorage.setItem("userRole", role.toLowerCase()) // Almacenar en minúsculas
      if (user?.id) {
        localStorage.setItem("userId", user.id)
      }
      
      // Redirigir según el rol (comparando en minúsculas)
      if (role.toLowerCase() === "admin") {
        navigate("/dashboard")
      } else {
        navigate("/") // Redirige a la página principal para clientes
      }
  
    } catch (error) {
      console.error("Registration error:", error)
      
      let errorMessage = "Error al registrar. Por favor intente nuevamente."
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.msg || "Datos inválidos"
        } else if (error.response.status === 409) {
          errorMessage = "El correo electrónico ya está registrado"
        }
      } else if (error.request) {
        errorMessage = "No se pudo conectar al servidor. Verifique su conexión."
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-background">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="floating-bubble"
            style={{
              transform: `translate(
                ${Math.sin((mousePosition.x + i * 100) * 0.01) * 20}px,
                ${Math.cos((mousePosition.y + i * 100) * 0.01) * 20}px
              )`
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="register-card"
      >
        <div className="register-content">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="logo-container"
          >
            <img 
              src="https://gitbf.onrender.com/uploads/logo1.png" 
              alt="NailsSoft Logo" 
              className="logo-image" 
              onError={(e) => {
                e.target.src = '/default-logo.png'
              }}
            />
            <h1 className="logo-text">NailsSoft</h1>
          </motion.div>

          <div className="form-container">
            <h2 className="welcome-text">Crear una cuenta</h2>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="error-message"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="register-form">
              <div className="input-group">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder=" "
                  maxLength={50}
                />
                <label className="input-label">Nombre *</label>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="form-input"
                  placeholder=" "
                  maxLength={50}
                />
                <label className="input-label">Apellido</label>
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder=" "
                  maxLength={100}
                />
                <label className="input-label">Correo electrónico *</label>
              </div>

              <div className="input-group">
                <input
                  type="tel"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className="form-input"
                  placeholder=" "
                  maxLength={15}
                />
                <label className="input-label">Celular</label>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder=" "
                  minLength={8}
                />
                <label className="input-label">Contraseña *</label>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: `hsl(${passwordStrength}, 70%, 45%)`
                        }}
                      />
                    </div>
                    <span className="strength-text">
                      {passwordStrength <= 25 && "Débil"}
                      {passwordStrength > 25 && passwordStrength <= 50 && "Regular"}
                      {passwordStrength > 50 && passwordStrength <= 75 && "Buena"}
                      {passwordStrength > 75 && "Fuerte"}
                    </span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder=" "
                  minLength={8}
                />
                <label className="input-label">Confirmar contraseña *</label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="register-button"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <div className="loader">
                    <div className="loader-circle"></div>
                  </div>
                ) : (
                  "Crear cuenta"
                )}
              </motion.button>
            </form>

            <div className="terms-privacy">
              <p>
                Al registrarte, aceptas nuestros{" "}
                <motion.a 
                  whileHover={{ scale: 1.05 }} 
                  href="/terminos" 
                  className="terms-link"
                >
                  Términos de servicio
                </motion.a>{" "}
                y{" "}
                <motion.a 
                  whileHover={{ scale: 1.05 }} 
                  href="/privacidad" 
                  className="terms-link"
                >
                  Política de privacidad
                </motion.a>
              </p>
            </div>

            <div className="login-option">
              <p>
                ¿Ya tienes una cuenta?{" "}
                <motion.a 
                  whileHover={{ scale: 1.05 }} 
                  href="/login" 
                  className="login-link"
                >
                  Iniciar sesión
                </motion.a>
              </p>
            </div>
          </div>
        </div>

        <div className="register-decoration">
          <div className="decoration-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="decoration-title"
            >
              Únete a Nuestra Comunidad
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="decoration-text"
            >
              Descubre un mundo de belleza y profesionalismo con nosotros
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}