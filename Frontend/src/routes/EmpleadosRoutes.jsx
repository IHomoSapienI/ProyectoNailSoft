// import React, { lazy, Suspense } from "react"
// import { Routes, Route } from "react-router-dom"
// import PrivateRoute from "../components/PrivateRoute"
// import Layout from "../components/Layout"

// const Dashboard = lazy(() => import("../components/Dashboard/Dashboard"))
// const TablaCitas = lazy(() => import("../components/Citas_Agenda/TablaCitas"))
// const AgendaEmpleado = lazy(() => import("../components/Citas_Agenda/AgendaEmpleado"))
// const CitasEnProgreso = lazy(() => import("../components/Citas_Agenda/CitasEnProgreso"))
// const TablaClientes = lazy(() => import("../components/Clientes/TablaClientes"))
// const GestionVentaServicio = lazy(() => import("../components/VentaServicios/GestionVentaServicio"))

// const EmpleadoRoutes = () => (
//   <Suspense fallback={<div>Cargando...</div>}>
//     <Routes>
//       <Route path="/dashboard" element={<PrivateRoute allowedRoles={["empleado"]}><Layout><Dashboard /></Layout></PrivateRoute>} />
//       <Route path="/citas" element={<PrivateRoute allowedRoles={["empleado"]}><Layout><TablaCitas /></Layout></PrivateRoute>} />
//       <Route path="/agenda" element={<PrivateRoute allowedRoles={["empleado"]}><Layout><AgendaEmpleado /></Layout></PrivateRoute>} />
//       <Route path="/citas-en-progreso" element={<PrivateRoute allowedRoles={["empleado"]}><Layout><CitasEnProgreso /></Layout></PrivateRoute>} />
//       <Route path="/clientes" element={<PrivateRoute allowedRoles={["empleado"]}><Layout><TablaClientes /></Layout></PrivateRoute>} />
//       <Route path="/gestion-venta/:id" element={<PrivateRoute allowedRoles={["empleado"]}><Layout><GestionVentaServicio /></Layout></PrivateRoute>} />
//       <Route path="/gestion-venta/new/:citaId" element={<PrivateRoute allowedRoles={["empleado"]}><Layout><GestionVentaServicio /></Layout></PrivateRoute>} />
//     </Routes>
//   </Suspense>
// )

// export default EmpleadoRoutes
