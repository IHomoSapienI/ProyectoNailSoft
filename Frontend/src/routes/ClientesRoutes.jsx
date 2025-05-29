// import React, { lazy, Suspense } from "react"
// import { Routes ,Route } from "react-router-dom"
// import PrivateRoute from "../components/PrivateRoute"
// import Layout from "../components/Layout"

// const Dashboard = lazy(() => import("../components/Dashboard/Dashboard"))
// const TablaCitas = lazy(() => import("../components/Citas_Agenda/TablaCitas"))
// const TablaVentas = lazy(() => import("../components/Venta/TablaVentas"))
// const TablaClientes = lazy(() => import("../components/Clientes/TablaClientes"))
// const ArticlesGrid = lazy(() => import("../components/Galeria/ArticlesGrid"))

// const ClienteRoutes = () => (
//   <Suspense fallback={<div>Cargando...</div>}>
//     <Routes>
//       <Route path="/dashboard" element={<PrivateRoute allowedRoles={["cliente"]}><Layout><Dashboard /></Layout></PrivateRoute>} />
//       <Route path="/citas" element={<PrivateRoute allowedRoles={["cliente"]}><Layout><TablaCitas /></Layout></PrivateRoute>} />
//       <Route path="/ventas" element={<PrivateRoute allowedRoles={["cliente"]}><Layout><TablaVentas /></Layout></PrivateRoute>} />
//       <Route path="/perfil" element={<PrivateRoute allowedRoles={["cliente"]}><Layout><TablaClientes /></Layout></PrivateRoute>} />
//       <Route path="/galeria" element={<PrivateRoute allowedRoles={["cliente"]}><Layout><ArticlesGrid /></Layout></PrivateRoute>} />
//     </Routes>
//   </Suspense>
// )

// export default ClienteRoutes
