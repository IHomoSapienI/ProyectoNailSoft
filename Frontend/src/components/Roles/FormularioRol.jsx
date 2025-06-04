"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { useAuth } from "../../context/AuthContext"; // Ajusta la ruta según tu estructura
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa"
import "./formularioRol.css"

const FormularioRol = ({ rolSeleccionado, onRolActualizado, onClose }) => {
  const [nombreRol, setNombreRol] = useState("")
  const [permisos, setPermisos] = useState([])
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([])
  const [activo, setActivo] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [modoEdicion, setModoEdicion] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
  const [cargando, setCargando] = useState(false)
  const [enviando, setEnviando] = useState(false)
    const { user,refreshUser } = useAuth(); // Añade esto

  const categorias = [
    "bajaProductos",
    "categoriaProductos",
    "citas",
    "clientes",
    "compras",
    "configuración",
    "empleados",
    "insumos",
    "permisos",
    "productos",
    "proveedores",
    "reportes",
    "roles",
    "servicios",
    "usuarios",
    "ventas",
    "vistasSidebar"
  ]

  // Reemplaza tu useEffect de carga de permisos por esto:
useEffect(() => {
  const cargarPermisos = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      const response = await fetch("https://gitbf.onrender.com/api/permisos", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setPermisos(data.permisos || []);
      
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      setMensaje(error.message);
      
      if (error.message.includes("401")) {
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.",
          confirmButtonColor: "#db2777",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  cargarPermisos();
}, []);

  useEffect(() => {
    if (rolSeleccionado) {
      setNombreRol(rolSeleccionado.nombreRol || "")
      setPermisosSeleccionados(
        rolSeleccionado.permisoRol.map((permiso) => (typeof permiso === "object" ? permiso._id : permiso)),
      )
      setActivo(rolSeleccionado.estadoRol || true)
      setModoEdicion(true)
    } else {
      setNombreRol("")
      setPermisosSeleccionados([])
      setActivo(true)
      setModoEdicion(false)
    }
  }, [rolSeleccionado])

  const manejarCambioCheckbox = (permisoId) => {
    setPermisosSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(permisoId)
        ? prevSeleccionados.filter((id) => id !== permisoId)
        : [...prevSeleccionados, permisoId],
    )
  }

  // const manejarEnvio = async (e) => {
  //   e.preventDefault()
  //   setEnviando(true)

  //   //VAlidación en el frontend del nombre rol
  //   const regex = /^[a-zA-Z0-9\s]{5,30}$/


  //   if (!regex.test(nombreRol.trim())) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Nombre no válido",
  //       text: "El nombre del rol debe tener entre 5 y 20 caracteres y solo contener letras y espacios.",
  //       confirmButtonText: "Entendido",
  //       confirmButtonColor: "#db2777",
  //     })
  //     setEnviando(false)
  //     return
  //   }

  //   if (permisosSeleccionados.length === 0) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Advertencia",
  //       text: "Debes seleccionar al menos un permiso para el rol",
  //       confirmButtonText: "Entendido",
  //       confirmButtonColor: "#db2777",
  //     })
  //     setEnviando(false)
  //     return
  //   }

  //   const nuevoRol = { nombreRol, permisoRol: permisosSeleccionados, estadoRol: activo }

  //   try {
  //     const token = localStorage.getItem("token")
  //     if (!token) {
  //       throw new Error("No se encontró token de autenticación")
  //     }

  //     const url = modoEdicion
  //       ? `https://gitbf.onrender.com/api/roles/${rolSeleccionado._id}`
  //       : "https://gitbf.onrender.com/api/roles"

  //     const metodo = modoEdicion ? "PUT" : "POST"
  //     const response = await fetch(url, {
  //       method: metodo,
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(nuevoRol),
  //     })

  //     if (response.ok) {
  //       await refreshUser(); // 👈 Actualiza los permisos en toda la app
  //       Swal.fire({
  //         icon: "success",
  //         title: modoEdicion ? "Rol actualizado exitosamente" : "Rol creado exitosamente",
  //         confirmButtonText: "Ok",
  //         confirmButtonColor: "#db2777",
  //       })

  //       if (onRolActualizado) onRolActualizado()
  //       setNombreRol("")
  //       setPermisosSeleccionados([])
  //       setActivo(true)
  //       if (onClose) onClose()
  //     } else {
  //       const errorData = await response.json()
  //       const mensageError = Array.isArray(errorData.errors)
  //       ? errorData.errors.join("\n")
  //       : errorData.msg || errorData.message || errorData.statusText
        
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: mensageError,
  //         confirmButtonColor: "#db2777",
  //       })
  //     }
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error en la solicitud",
  //       text: error.message,
  //       confirmButtonColor: "#db2777",
  //     })
  //   } finally {
  //     setEnviando(false)
  //   }
  // }

// const manejarEnvio = async (e) => {
//   e.preventDefault();
//   setEnviando(true);

//   const regex = /^[a-zA-Z0-9\s]{5,30}$/;
//   if (!regex.test(nombreRol.trim())) {
//     Swal.fire({
//       icon: "warning",
//       title: "Nombre no válido",
//       text: "El nombre del rol debe tener entre 5 y 20 caracteres y solo contener letras y espacios.",
//       confirmButtonText: "Entendido",
//       confirmButtonColor: "#db2777",
//     });
//     setEnviando(false);
//     return;
//   }

//   if (permisosSeleccionados.length === 0) {
//     Swal.fire({
//       icon: "warning",
//       title: "Advertencia",
//       text: "Debes seleccionar al menos un permiso para el rol",
//       confirmButtonText: "Entendido",
//       confirmButtonColor: "#db2777",
//     });
//     setEnviando(false);
//     return;
//   }

//   const nuevoRol = {
//     nombreRol,
//     permisoRol: permisosSeleccionados,
//     estadoRol: activo,
//   };

//   try {
//     const token = localStorage.getItem("token");
//     if (!token) throw new Error("No se encontró token de autenticación");

//     const url = modoEdicion
//       ? `https://gitbf.onrender.com/api/roles/${rolSeleccionado._id}`
//       : "https://gitbf.onrender.com/api/roles";

//     const metodo = modoEdicion ? "PUT" : "POST";

//     const response = await fetch(url, {
//       method: metodo,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(nuevoRol),
//     });

//     if (response.ok) {

//       await refreshUser();

//       // ⚠️ Verificamos si editó su propio rol
//       const userRoleId = user?.role; // Asegúrate que esto sea el _id del rol
//       const editedRoleId = rolSeleccionado?._id;
//       const editoSuPropioRol = modoEdicion && userRoleId === editedRoleId;
// console.log(userRoleId, editedRoleId)
//       if (editoSuPropioRol) {
//         Swal.fire({
//           icon: "info",
//           title: "Sesión reiniciada",
//           text: "Has editado el rol asociado a tu cuenta. Por seguridad, es necesario volver a iniciar sesión.",
//           confirmButtonText: "Cerrar sesión",
//           confirmButtonColor: "#db2777",
//         }).then(() => {
//           localStorage.clear();
//           window.location.href = "/login";
//         });
//         return; // No continuar con el flujo normal
//       }

//       Swal.fire({
//         icon: "success",
//         title: modoEdicion
//           ? "Rol actualizado exitosamente"
//           : "Rol creado exitosamente",
//         confirmButtonText: "Ok",
//         confirmButtonColor: "#db2777",
//       });

//       if (onRolActualizado) onRolActualizado();
//       setNombreRol("");
//       setPermisosSeleccionados([]);
//       setActivo(true);
//       if (onClose) onClose();
//     } else {
//       const errorData = await response.json();
//       const mensageError = Array.isArray(errorData.errors)
//         ? errorData.errors.join("\n")
//         : errorData.msg || errorData.message || errorData.statusText;

//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: mensageError,
//         confirmButtonColor: "#db2777",
//       });
//     }
//   } catch (error) {
//     Swal.fire({
//       icon: "error",
//       title: "Error en la solicitud",
//       text: error.message,
//       confirmButtonColor: "#db2777",
//     });
//   } finally {
//     setEnviando(false);
//   }
// };
const manejarEnvio = async (e) => {
  e.preventDefault();
  setEnviando(true);

  const regex = /^[a-zA-Z0-9\s]{5,30}$/;
  if (!regex.test(nombreRol.trim())) {
    Swal.fire({
      icon: "warning",
      title: "Nombre no válido",
      text: "El nombre del rol debe tener entre 5 y 20 caracteres y solo contener letras y espacios.",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#db2777",
    });
    setEnviando(false);
    return;
  }

  if (permisosSeleccionados.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Advertencia",
      text: "Debes seleccionar al menos un permiso para el rol",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#db2777",
    });
    setEnviando(false);
    return;
  }

  const nuevoRol = {
    nombreRol,
    permisoRol: permisosSeleccionados,
    estadoRol: activo,
  };

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No se encontró token de autenticación");

    const url = modoEdicion
      ? `https://gitbf.onrender.com/api/roles/${rolSeleccionado._id}`
      : "https://gitbf.onrender.com/api/roles";

    const metodo = modoEdicion ? "PUT" : "POST";

    const response = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoRol),
    });

    if (response.ok) {
      // Aquí ponemos los logs para debuggear
      console.log("user?.role:", user?.role);
      console.log("rolSeleccionado?.nombre:", rolSeleccionado?.nombre);
      console.log("modoEdicion:", modoEdicion);
      console.log(
        "Comparación (user.role === rolSeleccionado.nombre.toLowerCase()):",
        user?.role === rolSeleccionado?.nombre?.toLowerCase()
      );

      const userRoleName = user?.role?.toLowerCase();
const editedRoleName = rolSeleccionado?.nombreRol?.toLowerCase();

const editoSuPropioRol = modoEdicion && userRoleName === editedRoleName;

      if (editoSuPropioRol) {
        return Swal.fire({
          icon: "info",
          title: "Sesión reiniciada",
          text: "Has editado el rol asociado a tu cuenta. Por seguridad, es necesario volver a iniciar sesión.",
          confirmButtonText: "Cerrar sesión",
          confirmButtonColor: "#db2777",
        }).then(() => {
          localStorage.clear();
          window.location.href = "/login";
        });
      }

      await refreshUser();

      await Swal.fire({
        icon: "success",
        title: modoEdicion
          ? "Rol actualizado exitosamente"
          : "Rol creado exitosamente",
        confirmButtonText: "Ok",
        confirmButtonColor: "#db2777",
      });

      if (onRolActualizado) onRolActualizado();
      setNombreRol("");
      setPermisosSeleccionados([]);
      setActivo(true);
      if (onClose) onClose();
    } else {
      const errorData = await response.json();
      const mensageError = Array.isArray(errorData.errors)
        ? errorData.errors.join("\n")
        : errorData.msg || errorData.message || errorData.statusText;

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensageError,
        confirmButtonColor: "#db2777",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error en la solicitud",
      text: error.message,
      confirmButtonColor: "#db2777",
    });
  } finally {
    setEnviando(false);
  }
};




  return (
    <div className="formulario-moderno max-h-[70vh] overflow-y-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-pink-600">
        {modoEdicion ? "Editar Rol" : "Agregar Rol"}
      </h2>

      <form onSubmit={manejarEnvio} className="space-y-4">
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">
            Nombre del Rol <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            value={nombreRol}
            onChange={(e) => setNombreRol(e.target.value)}
            required
            minLength={5}
            maxLength={20}
            className="form-input"
            placeholder="Ingrese nombre del rol"
          />
          <p className="text-xs text-gray-500 mt-1">Ejemplo: Administrador, Usuario, Empleado.</p>
        </div>

        <div className="form-group">
          <label htmlFor="categoria" className="form-label">
            Categoría de Permisos
          </label>
          <select
            id="categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="form-select"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Permisos</label>
          {cargando ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              <p className="ml-4 text-gray-600">Cargando permisos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              {permisos.length > 0 ? (
                permisos
                  .filter((permiso) => !categoriaSeleccionada || permiso.categoria === categoriaSeleccionada)
                  .map((permiso) => (
                    <div
                      key={permiso._id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={permiso._id}
                        value={permiso._id}
                        checked={permisosSeleccionados.includes(permiso._id)}
                        onChange={() => manejarCambioCheckbox(permiso._id)}
                        disabled={!permiso.activo}
                        className="form-checkbox h-4 w-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <label
                        htmlFor={permiso._id}
                        className={`text-sm ${!permiso.activo ? "text-gray-400" : "text-gray-700"} cursor-pointer`}
                      >
                        {permiso.nombrePermiso} {permiso.activo ? "" : "(Inactivo)"}
                      </label>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-4">{mensaje || "No hay permisos disponibles"}</p>
              )}
            </div>
          )}
        </div>

        <div className="form-group flex items-center">
          <label htmlFor="activo" className="form-label mr-4 mb-0">
            Estado del Rol
          </label>
          <div className="relative inline-block w-12 align-middle select-none">
            <input
              type="checkbox"
              id="activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="sr-only"
            />
            <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
            <div
              className={`absolute left-0 top-0 h-6 w-6 rounded-full transition-transform duration-200 ease-in-out transform ${
                activo ? "translate-x-6 bg-pink-600" : "bg-white"
              }`}
            >
              {activo ? (
                <FaCheck className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              ) : (
                <FaTimes className="h-3 w-3 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>
          <span className="ml-2 text-sm text-gray-700">{activo ? "Activo" : "Inactivo"}</span>
        </div>

        <div className="flex justify-between mt-6">
          <button type="submit" disabled={enviando} className="btn-primary">
            {enviando ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span>{modoEdicion ? "Actualizando..." : "Agregando..."}</span>
              </div>
            ) : modoEdicion ? (
              "Actualizar Rol"
            ) : (
              "Agregar Rol"
            )}
          </button>

          <button type="button" onClick={onClose} disabled={enviando} className="btn-secondary">
            Cancelar
          </button>
        </div>

        {mensaje && !cargando && (
          <div className="mt-4 p-3 text-red-600 text-sm bg-red-50 rounded-md border border-red-200">{mensaje}</div>
        )}
      </form>
    </div>
  )
}

export default FormularioRol

