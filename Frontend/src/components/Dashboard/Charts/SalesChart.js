"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm">
          <span className="font-medium text-primary">${new Intl.NumberFormat().format(payload[0].value)}</span>
        </p>
      </div>
    )
  }
  return null
}

const SalesChart = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("year") // 'year', 'month', 'week'

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No se encontró token de autenticación")
        }

        const headers = { Authorization: `Bearer ${token}` }

        // Obtener datos de ventas de servicios en lugar de citas
        const response = await axios.get("https://gitbf.onrender.com/api/ventaservicios", { headers })
        const ventas = response.data.ventaservicios || []

        // Filtrar solo ventas finalizadas (estado true)
        const ventasFinalizadas = ventas.filter((venta) => venta.estado === true)

        // Procesar datos según el rango de tiempo seleccionado
        let processedData

        if (timeRange === "year") {
          processedData = processYearlyData(ventasFinalizadas)
        } else if (timeRange === "month") {
          processedData = processMonthlyData(ventasFinalizadas)
        } else {
          processedData = processWeeklyData(ventasFinalizadas)
        }

        setData(processedData)
      } catch (error) {
        console.error("Error al obtener datos de ventas:", error)
        setError("No se pudieron cargar los datos de ventas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  // Procesar datos por año (mensualmente)
  const processYearlyData = (ventas) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    // Inicializar array con todos los meses
    const monthlyData = months.map((month) => ({
      month,
      sales: 0,
    }))

    // Sumar ventas por mes
    ventas.forEach((venta) => {
      const date = new Date(venta.fecha || venta.fechaventa || venta.fechacreacion)
      const monthIndex = date.getMonth()
      monthlyData[monthIndex].sales += venta.precioTotal || 0
    })

    return monthlyData
  }

  // Procesar datos por mes (semanalmente)
  const processMonthlyData = (ventas) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filtrar ventas del mes actual
    const ventasThisMonth = ventas.filter((venta) => {
      const date = new Date(venta.fecha || venta.fechaventa || venta.fechacreacion)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Agrupar por semana del mes
    const weeklyData = [
      { month: "Semana 1", sales: 0 },
      { month: "Semana 2", sales: 0 },
      { month: "Semana 3", sales: 0 },
      { month: "Semana 4", sales: 0 },
      { month: "Semana 5", sales: 0 },
    ]

    ventasThisMonth.forEach((venta) => {
      const date = new Date(venta.fecha || venta.fechaventa || venta.fechacreacion)
      const dayOfMonth = date.getDate()

      // Asignar a la semana correspondiente (aproximado)
      const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 4)
      weeklyData[weekIndex].sales += venta.precioTotal || 0
    })

    return weeklyData
  }

  // Procesar datos por semana (diariamente)
  const processWeeklyData = (ventas) => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    // Calcular fecha de inicio de la semana actual (lunes)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = domingo, 1 = lunes, ...
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Ajustar para que lunes sea el primer día

    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)

    // Inicializar array con todos los días
    const dailyData = days.map((day, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)

      return {
        month: day,
        date: date.toISOString().split("T")[0],
        sales: 0,
      }
    })

    // Sumar ventas por día
    ventas.forEach((venta) => {
      const ventaDate = new Date(venta.fecha || venta.fechaventa || venta.fechacreacion)
      const ventaDateStr = ventaDate.toISOString().split("T")[0]

      const dayData = dailyData.find((d) => d.date === ventaDateStr)
      if (dayData) {
        dayData.sales += venta.precioTotal || 0
      }
    })

    // Eliminar el campo date que ya no necesitamos
    return dailyData.map(({ month, sales }) => ({ month, sales }))
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTimeRangeChange("week")}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "week"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => handleTimeRangeChange("month")}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "month"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => handleTimeRangeChange("year")}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "year"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Año
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[250px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                paddingBottom: "20px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="sales"
              name="Ventas"
              fill="url(#salesGradient)"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default SalesChart

