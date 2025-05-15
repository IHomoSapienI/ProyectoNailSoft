"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FaClock, FaTags, FaStar, FaHeart, FaCalendarPlus, FaTimes, FaCheck } from "react-icons/fa"
import "./articlesgrid.css"
import { obtenerServiciosConDescuento } from "../Servicios/obtenerServicios"

const ArticlesGrid = () => {
  const [servicios, setServicios] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setLoading(true)
        const serviciosConDescuento = await obtenerServiciosConDescuento()
        console.log("Servicios obtenidos con descuentos aplicados:", serviciosConDescuento)
        setServicios(serviciosConDescuento)
        setLoading(false)
      } catch (error) {
        console.error("Error al obtener los servicios:", error)
        setLoading(false)
      }
    }

    cargarServicios()
  }, [])

  const baseUrl = "https://gitbf.onrender.com/uploads"

  const manejarClickServicio = (servicio) => {
    setSelectedService(servicio)
  }

  const manejarAgregarCita = () => {
    navigate("/seleccionarservicios")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="services-container">
      {/* Header Section */}
      <motion.div
        className="services-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="services-title">Descubre la Magia en Tus Manos</h1>
        <p className="services-subtitle">Servicios exclusivos diseñados para realzar tu belleza natural</p>

        <motion.button
          className="schedule-button primary"
          onClick={manejarAgregarCita}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaCalendarPlus className="button-icon" />
          <span className="span">Agenda tu Cita Ahora</span>
        </motion.button>
      </motion.div>

      {/* Services Grid */}
      <motion.div className="services-grid" variants={container} initial="hidden" animate="show">
        {loading
          ? // Loading skeleton
            [...Array(6)].map((_, index) => (
              <motion.div key={index} className="service-card skeleton" variants={item}>
                <div className="skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton-title" />
                  <div className="skeleton-text" />
                </div>
              </motion.div>
            ))
          : servicios.map((servicio) => (
              <motion.article
                key={servicio._id}
                className="service-card"
                variants={item}
                whileHover={{ y: -10 }}
                onClick={() => manejarClickServicio(servicio)}
              >
                <div className="card-image-container">
                  <img src={`${baseUrl}/${servicio.imagenUrl}`} alt={servicio.nombreServicio} className="card-image" />
                  <div className="card-overlay">
                    <motion.div className="overlay-content" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                      <FaHeart className="heart-icon" />
                      <span>Ver Detalles</span>
                    </motion.div>
                  </div>
                  {servicio.tipoServicio?.descuento > 0 && (
                    <div className="discount-badge">{servicio.tipoServicio.descuento}% OFF</div>
                  )}
                </div>

                <div className="card-content">
                  <div className="card-header">
                    <h2 className="card-title">{servicio.nombreServicio}</h2>
                    <div className="price-tag">
                      {servicio.tieneDescuento ? (
                        <>
                          <span className="original-price">${servicio.precioOriginal.toFixed(2)}</span>
                          <span className="discounted-price">${servicio.precioConDescuento.toFixed(2)}</span>
                        </>
                      ) : (
                        <span>${Number.parseFloat(servicio.precio).toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <p className="card-description">{servicio.descripcion || "Descripción no disponible"}</p>

                  <div className="card-footer">
                    <div className="service-meta">
                      <div className="meta-item">
                        <FaTags className="meta-icon" />
                        <span>
                          {servicio.tipoServicio?.nombreTs || "General"}
                          {servicio.tipoServicio?.esPromocional && <span className="promo-badge">Promo</span>}
                        </span>
                      </div>
                      <div className="meta-item">
                        <FaClock className="meta-icon" />
                        <span>{servicio.tiempo} mins</span>
                      </div>
                    </div>
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="star-icon" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
      </motion.div>

      {/* Call to Action Section */}
      <motion.div className="cta-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div className="cta-content">
          <h2 className="cta-title">¿Lista para Transformar tu Estilo?</h2>
          <p className="cta-text">Déjanos crear la obra maestra que tus manos merecen</p>
          <motion.button
            className="schedule-button secondary"
            onClick={manejarAgregarCita}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaCalendarPlus className="button-icon" />
            <span>Reserva tu Experiencia</span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedService(null)}>
                <FaTimes />
              </button>

              <div className="modal-grid">
                <div className="modal-image-section">
                  <div className="image-wrapper">
                    <img
                      src={`${baseUrl}/${selectedService.imagenUrl}`}
                      alt={selectedService.nombreServicio}
                      className="modal-main-image"
                    />
                    <div className="image-overlay">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="service-rating"
                      >
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="star-icon" />
                          ))}
                        </div>
                        <span>4.9</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="modal-details">
                  <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-title">
                    {selectedService.nombreServicio}
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="modal-meta"
                  >
                    <div className="meta-tag">
                      <FaTags className="meta-icon" />
                      <span>{selectedService.tipoServicio?.nombreTs || "General"}</span>
                    </div>
                    <div className="meta-tag">
                      <FaClock className="meta-icon" />
                      <span>{selectedService.tiempo} minutos</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="modal-price"
                  >
                    <span className="price-label">Precio del Servicio</span>
                    {selectedService.tieneDescuento ? (
                      <div className="modal-price-with-discount">
                        <span className="modal-original-price">${selectedService.precioOriginal.toFixed(2)}</span>
                        <span className="modal-discounted-price">${selectedService.precioConDescuento.toFixed(2)}</span>
                        <span className="modal-discount-badge">{selectedService.porcentajeDescuento}% OFF</span>
                      </div>
                    ) : (
                      <span className="price-amount">${Number.parseFloat(selectedService.precio).toFixed(2)}</span>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="modal-description"
                  >
                    <h3>Descripción</h3>
                    <p>{selectedService.descripcion || "Descripción no disponible"}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="modal-features"
                  >
                    <h3>Características</h3>
                    <ul>
                      <li>
                        <FaCheck className="feature-icon" />
                        <span>Servicio personalizado</span>
                      </li>
                      <li>
                        <FaCheck className="feature-icon" />
                        <span>Productos premium</span>
                      </li>
                      <li>
                        <FaCheck className="feature-icon" />
                        <span>Personal capacitado</span>
                      </li>
                      <li>
                        <FaCheck className="feature-icon" />
                        <span>Garantía de satisfacción</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="modal-actions"
                  >
                    <motion.button
                      className="modal-button schedule"
                      onClick={() => {
                        const total = selectedService.precio
                        navigate("/seleccionarservicios", { state: { total } })
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaCalendarPlus className="button-icon" />
                      <span>Agendar Cita</span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ArticlesGrid

