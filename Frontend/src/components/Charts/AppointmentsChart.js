"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"
import "./Charts.css"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">
          {payload[0].value} {payload[0].value === 1 ? "cita" : "citas"}
        </p>
      </div>
    )
  }
  return null
}

const AppointmentsChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="chart-container"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#da70d6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#4a5568", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tick={{ fill: "#4a5568", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
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
          <Line
            type="monotone"
            dataKey="appointments"
            name="Citas"
            stroke="url(#appointmentGradient)"
            strokeWidth={3}
            dot={{
              stroke: "#ff69b4",
              strokeWidth: 2,
              r: 4,
              fill: "#fff",
            }}
            activeDot={{
              stroke: "#ff69b4",
              strokeWidth: 2,
              r: 6,
              fill: "#fff",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default AppointmentsChart

