"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FaHeart, FaChevronLeft, FaChevronRight, FaBookmark, FaPen } from "react-icons/fa"
import "./SeleccionarServicios.css"

const HeartBurst = ({ x, y }) => {
  return (
    <div className="heart-burst" style={{ left: x, top: y }}>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="floating-heart"
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1.5, 1],
            x: Math.cos((i * 45 * Math.PI) / 180) * 50,
            y: Math.sin((i * 45 * Math.PI) / 180) * 50,
            opacity: [1, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        >
          <FaHeart />
        </motion.div>
      ))}
    </div>
  )
}

const SeleccionarServicios = () => {
  const [servicios, setServicios] = useState([])
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [heartBursts, setHeartBursts] = useState([])
  const navigate = useNavigate()

  const ITEMS_PER_PAGE = 4
  const totalPages = Math.ceil(servicios.length / ITEMS_PER_PAGE)

  useEffect(() => {
    const obtenerServicios = async () => {
      try {
        const response = await axios.get("https://gitbf.onrender.com/api/servicios")
        setServicios(response.data.servicios)
      } catch (error) {
        console.error("Error al obtener los servicios:", error)
      }
    }

    obtenerServicios()
  }, [])

  const manejarSeleccionServicio = (servicio, event) => {
    // Crear explosión de corazones en la posición del clic
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newBurst = {
      id: Date.now(),
      x,
      y,
    }

    setHeartBursts((prev) => [...prev, newBurst])
    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((burst) => burst.id !== newBurst.id))
    }, 1000)

    const yaSeleccionado = serviciosSeleccionados.find((s) => s._id === servicio._id)

    if (yaSeleccionado) {
      const nuevosServiciosSeleccionados = serviciosSeleccionados.filter((s) => s._id !== servicio._id)
      setServiciosSeleccionados(nuevosServiciosSeleccionados)
      setTotal(total - servicio.precio)
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, servicio])
      setTotal(total + servicio.precio)
    }
  }

  const manejarAgendarCita = () => {
    if (serviciosSeleccionados.length > 0) {
      navigate("/citas", { state: { serviciosSeleccionados, total } })
    } else {
      alert("Por favor, selecciona al menos un servicio.")
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setIsFlipping(true)
      setCurrentPage((prev) => prev + 1)
      setTimeout(() => setIsFlipping(false), 500)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setIsFlipping(true)
      setCurrentPage((prev) => prev - 1)
      setTimeout(() => setIsFlipping(false), 500)
    }
  }

  const getCurrentPageServices = () => {
    const start = currentPage * ITEMS_PER_PAGE
    return servicios.slice(start, start + ITEMS_PER_PAGE)
  }

  return (
    <div className="notebook-container">
      <div className="notebook">
        {/* Espiral de la libreta */}
        <div className="notebook-spiral">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="spiral-ring"></div>
          ))}
        </div>

        {/* Marcador */}
        <div className="bookmark">
          <FaBookmark />
        </div>

        {/* Botones de navegación */}
        <button
          className={`page-nav-button prev ${currentPage === 0 ? "disabled" : ""}`}
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          <FaChevronLeft />
        </button>

        <button
          className={`page-nav-button next ${currentPage === totalPages - 1 ? "disabled" : ""}`}
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
        >
          <FaChevronRight />
        </button>

        {/* Contenido de la libreta */}
        <div className="notebook-content">
          {/* Página izquierda - Servicios */}
          <motion.div
            className={`notebook-page left-page ${isFlipping ? "flipping" : ""}`}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: isFlipping ? -180 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="page-header">
              <h2>Servicios Disponibles</h2>
              <span className="page-number">Página {currentPage + 1}</span>
            </div>

            <div className="services-list custom-scrollbar">
              {getCurrentPageServices().map((servicio) => (
                <motion.div
                  key={servicio._id}
                  className={`service-item ${
                    serviciosSeleccionados.find((s) => s._id === servicio._id) ? "selected" : ""
                  }`}
                  whileHover={{ scale: 1.02 }}
                  onClick={(e) => manejarSeleccionServicio(servicio, e)}
                >
                  <div className="service-checkbox">
                    {serviciosSeleccionados.find((s) => s._id === servicio._id) ? (
                      <FaHeart className="heart-icon" />
                    ) : (
                      <div className="checkbox-empty" />
                    )}
                  </div>
                  <div className="service-details">
                    <h3>{servicio.nombreServicio}</h3>
                    <div className="service-price">${servicio.precio}</div>
                    <p className="service-description">{servicio.descripcion || "Sin descripción"}</p>
                    <div className="service-rating">⭐⭐⭐⭐⭐</div>
                  </div>

                  {/* Animación de explosión de corazones */}
                  <AnimatePresence>
                    {heartBursts.map((burst) => (
                      <HeartBurst key={burst.id} x={burst.x} y={burst.y} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Página derecha - Selecciones */}
          <div className="notebook-page right-page">
            <div className="page-header">
              <h2>Mi Selección</h2>
              <FaPen className="pen-icon" />
            </div>

            <div className="selected-services custom-scrollbar">
              {serviciosSeleccionados.length === 0 ? (
                <div className="empty-selection">
                  <p>No has seleccionado ningún servicio aún.</p>
                  <p className="hint">Haz clic en los servicios de la izquierda para agregarlos.</p>
                </div>
              ) : (
                <div className="selection-list">
                  {serviciosSeleccionados.map((servicio) => (
                    <motion.div
                      key={servicio._id}
                      className="selected-item"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                    >
                      <span className="item-name">{servicio.nombreServicio}</span>
                      <span className="item-price">${servicio.precio}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="total-section">
              <div className="total-line">
                <span>Total:</span>
                <span className="total-amount">${total}</span>
              </div>

              <motion.button
                className="schedule-button"
                onClick={manejarAgendarCita}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={serviciosSeleccionados.length === 0}
              >
                Agendar Cita
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeleccionarServicios

