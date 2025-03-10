"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FaChartLine, FaShoppingCart, FaUsers, FaCalendar } from "react-icons/fa"
import AppointmentsChart from "./Charts/AppointmentsChart"
import SalesChart from "./Charts/SalesChart"
import ServicesChart from "./Charts/ServicesChart"
import AppointmentsTable from "../Dashboard/Charts/AppointmentsChart"
import "../Dashboard/Dashboard.css"

const Dashboard = () => {
  const [appointmentsData, setAppointmentsData] = useState([])
  const [salesData, setSalesData] = useState([])
  const [servicesData, setServicesData] = useState([])
  const [todayAppointments, setTodayAppointments] = useState([])

  useEffect(() => {
    // Fetch data for appointments, sales, services, and today's appointments
    const fetchDashboardData = async () => {
      try {
        // Replace with your actual API endpoints or data fetching logic
        const appointmentsResponse = await fetch("/api/appointments")
        const appointments = await appointmentsResponse.json()
        setAppointmentsData(appointments)

        const salesResponse = await fetch("/api/sales")
        const sales = await salesResponse.json()
        setSalesData(sales)

        const servicesResponse = await fetch("/api/services")
        const services = await servicesResponse.json()
        setServicesData(services)

        const todayAppointmentsResponse = await fetch("/api/todayAppointments")
        const todayAppointments = await todayAppointmentsResponse.json()
        setTodayAppointments(todayAppointments)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    fetchDashboardData()
  }, [])

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
    <div className="dashboard-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Resumen general del negocio</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="dashboard-grid">
        {/* Tarjeta de Citas */}
        <motion.div variants={item} className="dashboard-card appointments-card">
          <div className="card-header">
            <div className="card-icon">
              <FaChartLine />
            </div>
            <h2>Comportamiento de Citas</h2>
          </div>
          <div className="card-content">
            <AppointmentsChart data={appointmentsData} />
          </div>
        </motion.div>

        {/* Tarjeta de Ventas */}
        <motion.div variants={item} className="dashboard-card sales-card">
          <div className="card-header">
            <div className="card-icon">
              <FaShoppingCart />
            </div>
            <h2>Ventas Mensuales</h2>
          </div>
          <div className="card-content">
            <SalesChart data={salesData} />
          </div>
        </motion.div>

        {/* Tarjeta de Servicios */}
        <motion.div variants={item} className="dashboard-card services-card">
          <div className="card-header">
            <div className="card-icon">
              <FaUsers />
            </div>
            <h2>Servicios por Empleado</h2>
          </div>
          <div className="card-content">
            <ServicesChart data={servicesData} />
          </div>
        </motion.div>

        {/* Tarjeta de Citas del Día */}
        <motion.div variants={item} className="dashboard-card today-card">
          <div className="card-header">
            <div className="card-icon">
              <FaCalendar />
            </div>
            <h2>Citas del Día</h2>
          </div>
          <div className="card-content">
            <AppointmentsTable data={todayAppointments} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Dashboard

