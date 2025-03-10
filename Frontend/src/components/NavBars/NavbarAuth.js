"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaSignInAlt, FaUserPlus } from "react-icons/fa"
import "../NavBars/navbarauth.css"

const NavbarAuth = () => {
  const container = {
    hidden: { opacity: 0, y: -50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.nav className="navbar-auth" initial="hidden" animate="show" variants={container}>
      <div className="navbar-auth-container">
        {/* Logo y nombre */}
        <motion.div
          className="navbar-auth-brand"
          variants={item}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="brand-link">
            <motion.img
              src="https://gitbf.onrender.com/uploads/logo1.png"
              alt="NailsSoft Logo"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.span
              className="brand-text"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              NailsSoft
            </motion.span>
          </Link>
        </motion.div>

        {/* Menú de autenticación */}
        <motion.div className="navbar-auth-menu" variants={item}>
          <motion.div
            className="auth-buttons"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/login" className="auth-button login-button">
              <motion.div className="button-content" whileHover={{ scale: 0.05 }} whileTap={{ scale: 0.95 }}>
                <FaSignInAlt className="button-icon" />
                <span className="button-text">Iniciar Sesión</span>
              </motion.div>
            </Link>

            <Link to="/register" className="auth-button register-button">
              <motion.div className="button-content" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FaUserPlus className="button-icon" />
                <span className="button-text">Registrarse</span>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="navbar-auth-decoration">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="decoration-bubble"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: i * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
          />
        ))}
      </div>
    </motion.nav>
  )
}

export default NavbarAuth

