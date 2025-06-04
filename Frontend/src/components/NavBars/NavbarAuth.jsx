// "use client"

// import { FaSignInAlt, FaUserPlus } from "react-icons/fa"
// import { Link } from "react-router-dom"
// import { motion } from "framer-motion"
// import { Heart } from "lucide-react"

// const NavbarAuth = () => {
//   const container = {
//     hidden: { opacity: 0, y: -50 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         staggerChildren: 0.1,
//       },
//     },
//   }

//   return (
//     <motion.nav
//       className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-pink-100/10 bg-white/95 px-6 backdrop-blur-md transition-all duration-300"
//       initial="hidden"
//       animate="show"
//       variants={container}
//     >
//       <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
//         {/* Logo y nombre */}
//         <motion.div
//           className="flex items-center gap-3"
//           variants={container}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <Link to="/" className="flex items-center gap-3">
//             <motion.div
//               animate={{ rotate: [0, 10, 0] }}
//               transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6.5 }}
//             >
//               <Heart className="h-8 w-8 text-pink-600" />
//             </motion.div>
//             <motion.img
//               src="https://gitbf.onrender.com/uploads/logo1.png"
//               alt="NailsSoft Logo"
//               className="h-10 w-10 rounded-full object-cover"
//               initial={{ rotate: -180, opacity: 0 }}
//               animate={{ rotate: 0, opacity: 1 }}
//               transition={{ duration: 0.5 }}
//             />
//             <motion.span
//               className="text-lg font-bold"
//               style={{
//                 background: "linear-gradient(135deg, #ff69b4, #da70d6)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//               initial={{ x: -20, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               transition={{ delay: 0.2 }}
//             >
//               NailsSoft
//             </motion.span>
//           </Link>
//         </motion.div>

//         {/* Menú de autenticación */}
//         <motion.div className="flex items-center gap-4" variants={container}>
//           <motion.div
//             className="flex items-center gap-4"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             <Link
//               to="/login"
//               className="flex items-center gap-2 rounded-lg bg-pink-50 px-4 py-2 font-medium text-pink-600 transition-all hover:bg-pink-100"
//             >
//               <FaSignInAlt className="h-4 w-4" />
//               <span>Iniciar Sesión</span>
//             </Link>

//             <Link
//               to="/register"
//               className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
//             >
//               <FaUserPlus className="h-4 w-4" />
//               <span>Registrarse</span>
//             </Link>
//           </motion.div>
//         </motion.div>
//       </div>

//       {/* Decorative elements */}
//       {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {[...Array(5)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="decoration-bubble absolute w-24 h-24 rounded-full"
//             style={{
//               background: "linear-gradient(135deg, rgba(255, 105, 180, 0.1), rgba(218, 112, 214, 0.1))",
//               backdropFilter: "blur(5px)",
//               top: `${Math.random() * 100}%`,
//               left: `${Math.random() * 100}%`,
//             }}
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{
//               delay: i * 0.1,
//               duration: 0.5,
//               type: "spring",
//               stiffness: 200,
//             }}
//           />
//         ))}
//       </div> */}
//     </motion.nav>
//   )
// }

// export default NavbarAuth

"use client"

import { FaSignInAlt, FaUserPlus } from "react-icons/fa"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

const NavbarAuth = () => {
  const container = {
    hidden: { opacity: 0, y: -50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.nav
      className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-pink-100/10 bg-white/95 px-6 backdrop-blur-md transition-all duration-300"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        {/* Logo y nombre */}
        <motion.div
          className="flex items-center gap-3"
          variants={container}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6.5 }}
            >
              <Heart className="h-8 w-8 text-pink-600" />
            </motion.div>
            <motion.img
              src="https://gitbf.onrender.com/uploads/logo1.png"
              alt="NailsSoft Logo"
              className="h-10 w-10 rounded-full object-cover"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.span
              className="text-lg font-bold"
              style={{
                background: "linear-gradient(135deg, #ff69b4, #da70d6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              NailsSoft
            </motion.span>
          </Link>
        </motion.div>

        {/* Menú de autenticación */}
        <motion.div className="flex items-center gap-4" variants={container}>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-pink-50 px-4 py-2 font-medium text-pink-600 transition-all hover:bg-pink-100"
            >
              <FaSignInAlt className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <FaUserPlus className="h-4 w-4" />
              <span>Registrarse</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

export default NavbarAuth
