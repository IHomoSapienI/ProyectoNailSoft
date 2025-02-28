"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsers, faStar, faCalendar, faAward, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import './index.css'

const Index = () => {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)

  const images = [
    "http://gitbf.onrender.com/uploads/ImgFdo14.jpg",
    "http://gitbf.onrender.com/uploads/ImgFdo15.jpg",
    "http://gitbf.onrender.com/uploads/imgFdo3.jpg",
    "http://gitbf.onrender.com/uploads/ImgFdo5.jpeg",
    "http://gitbf.onrender.com/uploads/ImgFdo6.jpg",
    "http://gitbf.onrender.com/uploads/ImgFdo7.jpg",
  ]

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const handleAddAppointment = () => {
    navigate("/seleccionarservicios")
  }

  const stats = [
    { icon: faUsers, value: "500+", label: "Clientes Satisfechos" },
    { icon: faStar, value: "4.9", label: "Calificación Promedio" },
    { icon: faCalendar, value: "1000+", label: "Citas Realizadas" },
    { icon: faAward, value: "5+", label: "Años de Experiencia" },
  ]

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden">
      {/* Hero Section with Animated Background */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(45deg, #ff69b4, #da70d6)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-sm" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-sm"
              style={{
                width: Math.random() * 100 + 50 + "px",
                height: Math.random() * 100 + 50 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                transform: `translate(-50%, -50%) translateY(${scrollY * (Math.random() * 0.5)}px)`,
                transition: "transform 0.3s ease-out",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl text-white font-bold mb-6"
          >
            NailsSoft
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 mb-8"
          >
            Donde el arte se encuentra con la belleza
          </motion.p>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-pink-600 py-3 px-8 rounded-full font-semibold hover:bg-pink-50 transition-all shadow-lg flex items-center gap-2 mx-auto"
            onClick={handleAddAppointment}
          >
            Agenda tu Cita
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.header>

      {/* Stats Section */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-pink-50"
              >
                <FontAwesomeIcon icon={stat.icon} className="w-8 h-8 text-pink-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full py-20 bg-gradient-to-b from-pink-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-pink-700">Nuestra Galería</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explora nuestra colección de diseños únicos y déjate inspirar por nuestro trabajo artístico.
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {images.map((img, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="aspect-[6/3] relative">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-6 h-6 text-pink-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-6 h-6 text-pink-600" />
            </button>
            <div className="flex justify-center mt-4 gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === index ? "bg-pink-600" : "bg-pink-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-20 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">¿Lista para transformar tus uñas?</h2>
            <p className="text-xl mb-12 text-white/90">
              Únete a nuestra comunidad de clientes satisfechos y descubre por qué somos la mejor opción.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-pink-600 py-4 px-8 rounded-full font-bold text-lg shadow-lg hover:bg-pink-50 transition-all"
              onClick={handleAddAppointment}
            >
              Agenda tu Cita Ahora
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Index

