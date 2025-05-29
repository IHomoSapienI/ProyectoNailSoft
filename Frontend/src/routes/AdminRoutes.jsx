// import React, { lazy, Suspense } from "react"
// import { Routes ,Route } from "react-router-dom"
// import PrivateRoute from "../components/PrivateRoute"
// import Layout from "../components/Layout"

// const Dashboard = lazy(() => import("../components/Dashboard/Dashboard"))
// const TablaCitas = lazy(() => import("../components/Citas_Agenda/TablaCitas"))
// const TablaVentas = lazy(() => import("../components/Venta/TablaVentas"))
// const TablaClientes = lazy(() => import("../components/Clientes/TablaClientes"))
// const TablaServicios = lazy(() => import("../components/Servicios/TablaServicios"))
// const TablaProductos = lazy(() => import("../components/Productos/TablaProductos"))
// const TablaUsuarios = lazy(() => import("../components/Usuarios/TablaUsuarios"))
// // const TablaHistorial = lazy(() => import("../components/Historial/TablaHistorial"))
// const ArticlesGrid = lazy(() => import("../components/Galeria/ArticlesGrid"))

// const AdminRoutes = () => (
//   <Suspense fallback={<div>Cargando...</div>}>
//     <Routes>
//       <Route path="dashboard" element={<PrivateRoute allowedRoles={["admin"]}><Layout><Dashboard /></Layout></PrivateRoute>} />
//       <Route path="citas" element={<PrivateRoute allowedRoles={["admin"]}><Layout><TablaCitas /></Layout></PrivateRoute>} />
//       <Route path="ventas" element={<PrivateRoute allowedRoles={["admin"]}><Layout><TablaVentas /></Layout></PrivateRoute>} />
//       <Route path="clientes" element={<PrivateRoute allowedRoles={["admin"]}><Layout><TablaClientes /></Layout></PrivateRoute>} />
//       <Route path="servicios" element={<PrivateRoute allowedRoles={["admin"]}><Layout><TablaServicios /></Layout></PrivateRoute>} />
//       <Route path="productos" element={<PrivateRoute allowedRoles={["admin"]}><Layout><TablaProductos /></Layout></PrivateRoute>} />
//       <Route path="usuarios" element={<PrivateRoute allowedRoles={["admin"]}><Layout><TablaUsuarios /></Layout></PrivateRoute>} />
//       {/* <Route path="historial" element={<PrivateRoute allowedRoles={["admin"]}><Layout><TablaHistorial /></Layout></PrivateRoute>} /> */}
//       <Route path="galeria" element={<PrivateRoute allowedRoles={["admin"]}><Layout><ArticlesGrid /></Layout></PrivateRoute>} />
//     </Routes>
//   </Suspense>
// )

// export default AdminRoutes
