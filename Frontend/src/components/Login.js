"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import "./Login.css"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.post("https://gitbf.onrender.com/api/auth/login", { email, password });
      const { token, role, user } = response.data;
  
      if (!token || !role || !user) {
        throw new Error("Token, role, or user missing from response");
      }
  
      login({ token, role, name: user.name, email: user.email });
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role.toLowerCase());
  
      // Redirigir según el rol del usuario
      if (role.toLowerCase() === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Credenciales inválidas. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-background">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="floating-bubble"
            style={{
              transform: `translate(
                ${Math.sin((mousePosition.x + i * 100) * 0.01) * 20}px,
                ${Math.cos((mousePosition.y + i * 100) * 0.01) * 20}px
              )`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card"
      >
        <div className="login-content">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
              <motion.a href="#" whileHover={{ scale: 1.05 }} className="forgot-password">
                ¿Olvidaste tu contraseña?
              </motion.a>
              <motion.a href="/register" whileHover={{ scale: 1.05 }} className="create-account">
                Crear cuenta
              </motion.a>
            </div>
          </div>
        </div>

        <div className="login-decoration">
          <div className="decoration-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="decoration-title"
            >
              Belleza y Estilo
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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

