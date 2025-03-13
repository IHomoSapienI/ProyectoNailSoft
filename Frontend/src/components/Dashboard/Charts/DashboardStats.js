"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { DollarSign, Calendar, Users, ShoppingBag } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card"
import { Badge } from "../../ui/badge"

const DashboardStats = () => {
  const [stats, setStats] = useState({
    ingresosTotales: { valor: 0, cambio: 0 },
    citasTotales: { valor: 0, cambio: 0 },
    clientesNuevos: { valor: 0, cambio: 0 },
    serviciosVendidos: { valor: 0, cambio: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No se encontró token de autenticación")
        }

        const headers = { Authorization: `Bearer ${token}` }

        // Obtener datos de citas (solo para contar citas)
        const citasResponse = await axios.get("https://gitbf.onrender.com/api/citas", { headers })
        const citas = citasResponse.data.citas || []

        // Obtener datos de ventas de servicios (para ingresos y servicios vendidos)
        const ventasResponse = await axios.get("https://gitbf.onrender.com/api/ventaservicios", { headers })
        const ventas = ventasResponse.data.ventaservicios || []

        // Obtener datos de clientes
        const clientesResponse = await axios.get("https://gitbf.onrender.com/api/clientes", { headers })
        const clientes = clientesResponse.data || []

        // Calcular estadísticas
        const ahora = new Date()
        const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
        const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)

        // Filtrar citas por mes actual y anterior (solo para contar citas)
        const citasMesActual = citas.filter((cita) => new Date(cita.fechacita) >= inicioMesActual)
        const citasMesAnterior = citas.filter(
          (cita) => new Date(cita.fechacita) >= inicioMesAnterior && new Date(cita.fechacita) < inicioMesActual,
        )

        // Filtrar ventas por mes actual y anterior
        // Solo considerar ventas finalizadas para los ingresos
        const ventasMesActual = ventas.filter((venta) => {
          // Verificar si la venta está finalizada (estado true)
          if (!venta.estado) return false

          // Usar fecha de venta o fecha de creación
          const ventaDate = new Date(venta.fecha || venta.fechaventa || venta.fechacreacion)
          return ventaDate >= inicioMesActual
        })

        const ventasMesAnterior = ventas.filter((venta) => {
          // Verificar si la venta está finalizada (estado true)
          if (!venta.estado) return false

          // Usar fecha de venta o fecha de creación
          const ventaDate = new Date(venta.fecha || venta.fechaventa || venta.fechacreacion)
          return ventaDate >= inicioMesAnterior && ventaDate < inicioMesActual
        })

        // Calcular ingresos basados en ventas finalizadas, no en citas agendadas
        const ingresosMesActual = ventasMesActual.reduce((total, venta) => total + (venta.precioTotal || 0), 0)
        const ingresosMesAnterior = ventasMesAnterior.reduce((total, venta) => total + (venta.precioTotal || 0), 0)

        const cambioPorcentajeIngresos =
          ingresosMesAnterior === 0 ? 100 : ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100

        // Calcular número de citas
        const numCitasMesActual = citasMesActual.length
        const numCitasMesAnterior = citasMesAnterior.length
        const cambioPorcentajeCitas =
          numCitasMesAnterior === 0 ? 100 : ((numCitasMesActual - numCitasMesAnterior) / numCitasMesAnterior) * 100

        // Calcular clientes nuevos
        // Filtrar clientes creados en el mes actual
        const clientesNuevosMesActual = clientes.filter((cliente) => {
          const fechaCreacion = new Date(cliente.fechacreacion || cliente.createdAt)
          return fechaCreacion >= inicioMesActual
        }).length

        // Filtrar clientes creados en el mes anterior
        const clientesNuevosMesAnterior = clientes.filter((cliente) => {
          const fechaCreacion = new Date(cliente.fechacreacion || cliente.createdAt)
          return fechaCreacion >= inicioMesAnterior && fechaCreacion < inicioMesActual
        }).length

        const cambioPorcentajeClientes =
          clientesNuevosMesAnterior === 0
            ? 100
            : ((clientesNuevosMesActual - clientesNuevosMesAnterior) / clientesNuevosMesAnterior) * 100

        // Calcular servicios vendidos (de ventas finalizadas, no de citas agendadas)
        const serviciosVendidosMesActual = ventasMesActual.reduce((total, venta) => {
          // Verificar si la venta tiene servicios y es un array
          if (!venta.servicios || !Array.isArray(venta.servicios)) return total
          return total + venta.servicios.length
        }, 0)

        const serviciosVendidosMesAnterior = ventasMesAnterior.reduce((total, venta) => {
          // Verificar si la venta tiene servicios y es un array
          if (!venta.servicios || !Array.isArray(venta.servicios)) return total
          return total + venta.servicios.length
        }, 0)

        const cambioPorcentajeServicios =
          serviciosVendidosMesAnterior === 0
            ? 100
            : ((serviciosVendidosMesActual - serviciosVendidosMesAnterior) / serviciosVendidosMesAnterior) * 100

        // Actualizar estado con las estadísticas calculadas
        setStats({
          ingresosTotales: {
            valor: ingresosMesActual,
            cambio: cambioPorcentajeIngresos.toFixed(1),
          },
          citasTotales: {
            valor: numCitasMesActual,
            cambio: cambioPorcentajeCitas.toFixed(1),
          },
          clientesNuevos: {
            valor: clientesNuevosMesActual,
            cambio: cambioPorcentajeClientes.toFixed(1),
          },
          serviciosVendidos: {
            valor: serviciosVendidosMesActual,
            cambio: cambioPorcentajeServicios.toFixed(1),
          },
        })
      } catch (error) {
        console.error("Error al obtener estadísticas:", error)
        setError("No se pudieron cargar las estadísticas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Actualizar cada 5 minutos
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden border-none shadow-md animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-5 w-12 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
  }

  const statsData = [
    {
      title: "Ingresos Totales",
      value: `$${stats.ingresosTotales.valor.toLocaleString()}`,
      change: `${stats.ingresosTotales.cambio}%`,
      icon: <DollarSign className="h-4 w-4" />,
      trend: Number.parseFloat(stats.ingresosTotales.cambio) >= 0 ? "up" : "down",
      className: "card-gradient-1",
    },
    {
      title: "Citas Totales",
      value: stats.citasTotales.valor.toString(),
      change: `${stats.citasTotales.cambio}%`,
      icon: <Calendar className="h-4 w-4" />,
      trend: Number.parseFloat(stats.citasTotales.cambio) >= 0 ? "up" : "down",
      className: "card-gradient-2",
    },
    {
      title: "Clientes Nuevos",
      value: stats.clientesNuevos.valor.toString(),
      change: `${stats.clientesNuevos.cambio}%`,
      icon: <Users className="h-4 w-4" />,
      trend: Number.parseFloat(stats.clientesNuevos.cambio) >= 0 ? "up" : "down",
      className: "card-gradient-3",
    },
    {
      title: "Servicios Vendidos",
      value: stats.serviciosVendidos.valor.toString(),
      change: `${stats.serviciosVendidos.cambio}%`,
      icon: <ShoppingBag className="h-4 w-4" />,
      trend: Number.parseFloat(stats.serviciosVendidos.cambio) >= 0 ? "up" : "down",
      className: "card-gradient-1",
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {statsData.map((stat, index) => (
        <motion.div key={index} variants={item}>
          <Card className={`overflow-hidden border-none shadow-md ${stat.className} hover-glow`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="rounded-full bg-primary/20 p-1.5 text-primary">{stat.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                <Badge variant={stat.trend === "up" ? "success" : "destructive"} className="text-xs">
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default DashboardStats

