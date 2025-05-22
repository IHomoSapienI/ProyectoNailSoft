import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import FormularioProveedor from "./FormularioProveedor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faFileExcel,
  faSearch,
  faSync,
  faPrint,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./tablaProveedor.css"; // Importamos el mismo CSS que usa TablaInsumos

// Configura el contenedor del modal
Modal.setAppElement("#root");

const TablaProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [formModalIsOpen, setFormModalIsOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const proveedoresPorPagina = 5;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        await Swal.fire({
          title: "Error",
          text: "No se encontró el token de autenticación. Por favor, inicia sesión.",
          icon: "error",
          confirmButtonColor: "#db2777",
        });
        return;
      }

      const respuesta = await axios.get(
        "https://gitbf.onrender.com/api/proveedores",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProveedores(respuesta.data || []);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
      setError(
        "No se pudieron cargar los proveedores. Por favor, intenta de nuevo."
      );
      Swal.fire({
        title: "Error",
        text: "No tienes permiso para estar aquí o tu token no es válido.",
        icon: "error",
        confirmButtonColor: "#db2777",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const abrirFormulario = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setFormModalIsOpen(true);
  };

  const cerrarFormulario = () => {
    setFormModalIsOpen(false);
    setProveedorSeleccionado(null);
  };

  const manejarProveedorActualizado = () => {
    obtenerProveedores();
    cerrarFormulario();
  };

  const manejarEliminarProveedor = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminarlo!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          await Swal.fire({
            title: "Error",
            text: "No se encontró el token de autenticación. Por favor, inicia sesión.",
            icon: "error",
            confirmButtonColor: "#db2777",
          });
          return;
        }

        await axios.delete(`https://gitbf.onrender.com/api/proveedores/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        obtenerProveedores();
        Swal.fire({
          title: "Eliminado!",
          text: "El proveedor ha sido eliminado.",
          icon: "success",
          confirmButtonColor: "#db2777",
        });
      } catch (error) {
        console.error("Error al eliminar el proveedor:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el proveedor.",
          icon: "error",
          confirmButtonColor: "#db2777",
        });
      }
    }
  };

  const manejarToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? "activar" : "desactivar";

    const result = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${accion} este proveedor?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sí, ${accion}!`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          await Swal.fire({
            title: "Error",
            text: "No se encontró el token de autenticación. Por favor, inicia sesión.",
            icon: "error",
            confirmButtonColor: "#db2777",
          });
          return;
        }

        const proveedorActualizado = {
          ...proveedores.find((proveedor) => proveedor._id === id),
          estado: nuevoEstado,
        };

        await axios.put(
          `https://gitbf.onrender.com/api/proveedores/${id}`,
          proveedorActualizado,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Actualizar el estado local
        setProveedores(
          proveedores.map((proveedor) =>
            proveedor._id === id
              ? { ...proveedor, estado: nuevoEstado }
              : proveedor
          )
        );

        Swal.fire({
          icon: "success",
          title: `${nuevoEstado ? "Activado" : "Desactivado"}!`,
          text: `El proveedor ha sido ${
            nuevoEstado ? "activado" : "desactivado"
          }.`,
          confirmButtonColor: "#db2777",
        });
      } catch (error) {
        console.error(`Error al ${accion} el proveedor:`, error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `No se pudo ${accion} el proveedor`,
          confirmButtonColor: "#db2777",
        });
      }
    }
  };

  // Funciones de búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const proveedoresFiltrados = proveedores.filter((proveedor) =>
    proveedor.nombreProveedor.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Funciones de paginación
  const indiceUltimoProveedor = paginaActual * proveedoresPorPagina;
  const indicePrimerProveedor = indiceUltimoProveedor - proveedoresPorPagina;
  const proveedoresActuales = proveedoresFiltrados.slice(
    indicePrimerProveedor,
    indiceUltimoProveedor
  );

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const paginasTotales = Math.ceil(
    proveedoresFiltrados.length / proveedoresPorPagina
  );

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const paginaSiguiente = () => {
    if (paginaActual < paginasTotales) setPaginaActual(paginaActual + 1);
  };

  // Función para exportar a Excel
  const exportarExcel = async () => {
    try {
      setExportando(true);

      // Mostrar notificación de inicio de descarga
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      toast.fire({
        icon: "info",
        title: "Preparando la descarga...",
      });

      const datosExportar = proveedores.map((proveedor) => ({
        "Nombre del Proveedor": proveedor.nombreProveedor,
        Contacto: proveedor.contacto,
        "Número de Contacto": proveedor.numeroContacto,
        Estado: proveedor.estado ? "Activo" : "Inactivo",
      }));

      const ws = XLSX.utils.json_to_sheet(datosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Proveedores");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(data, "Proveedores.xlsx");

      // Mostrar notificación de éxito
      toast.fire({
        icon: "success",
        title: "Archivo descargado correctamente",
      });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo exportar a Excel",
        icon: "error",
        confirmButtonColor: "#db2777",
      });
    } finally {
      setExportando(false);
    }
  };

  // Función para imprimir
  const imprimirTabla = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Listado de Proveedores</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              color: #db2777;
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              color: #374151;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .estado {
              padding: 3px 8px;
              border-radius: 12px;
              font-weight: bold;
              font-size: 12px;
              display: inline-block;
            }
            .activo {
              background-color: #d1fae5;
              color: #065f46;
            }
            .inactivo {
              background-color: #fee2e2;
              color: #991b1b;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <h1>Listado de Proveedores</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre del Proveedor</th>
                <th>Contacto</th>
                <th>Número de Contacto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${proveedores
                .map(
                  (proveedor) => `
                <tr>
                  <td>${proveedor.nombreProveedor}</td>
                  <td>${proveedor.contacto}</td>
                  <td>${proveedor.numeroContacto}</td>
                  <td>
                    <span class="estado ${
                      proveedor.estado ? "activo" : "inactivo"
                    }">
                      ${proveedor.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            <p>Fecha de impresión: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <p>Sistema de Gestión - Belleza Spa</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Esperar a que los estilos se carguen
    setTimeout(() => {
      printWindow.print();
      // printWindow.close()
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[64vh] ">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-foreground">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded flex items-center"
          onClick={() => obtenerProveedores()}
        >
          <FontAwesomeIcon icon={faSync} className="mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    // Eliminado transition-all duration-500 para evitar transiciones globales
    <div className="tabla-container dark:bg-primary">
      <h2 className="text-3xl font-semibold mb-6 text-foreground px-4 pt-4">
        Gestión de Proveedores
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-4">
        <div className="flex space-x-2">
          <button
            className="btn-add"
            onClick={() => {
              setFormModalIsOpen(true);
              setProveedorSeleccionado(null);
            }}
            title="Agregar nuevo proveedor"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nuevo Proveedor
          </button>
          <button
            className="btn-export"
            onClick={exportarExcel}
            disabled={exportando || proveedores.length === 0}
            title="Exportar a Excel"
          >
            {exportando ? (
              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
            ) : (
              <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
            )}
            Exportar
          </button>
          <button
            className="btn-secondary"
            onClick={imprimirTabla}
            disabled={proveedores.length === 0}
            title="Imprimir listado"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-2" />
            Imprimir
          </button>
        </div>

        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            value={busqueda}
            onChange={handleBusquedaChange}
            className="search-input dark:card-gradient-4"
            placeholder="Buscar proveedores..."
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow mx-4 mx-auto">
        <table className="proveedores-tabla-moderna w-full">
          <thead className="bg-pink-200 text-black dark:card-gradient-4">
            <tr className="text-foreground">
              {/* Cambiado dark:hover:bg-gray-500/50 por dark:bg-gray-500/50 para evitar efectos hover */}
              <th className="dark:bg-gray-500/50" style={{ width: "20%" }}>
                Nombre del Proveedor
              </th>
              <th className="dark:bg-gray-500/50" style={{ width: "20%" }}>
                Contacto
              </th>
              <th className="dark:bg-gray-500/50" style={{ width: "20%" }}>
                Número de Contacto
              </th>
              <th className="dark:bg-gray-500/50" style={{ width: "20%" }}>
                Estado
              </th>
              <th className="dark:bg-gray-500/50" style={{ width: "20%" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="dark:bg-zinc-900/80">
            {proveedoresActuales.length > 0 ? (
              proveedoresActuales.map((proveedor) => (
                <tr key={proveedor._id} className="text-foreground">
                  <td className="font-medium">{proveedor.nombreProveedor}</td>
                  <td>{proveedor.contacto}</td>
                  <td>{proveedor.numeroContacto}</td>
                  <td>
                    <span
                      className={`usuario-estado-badge ${
                        proveedor.estado 
                        ? "activo bg-emerald-300/70 dark:bg-emerald-500"
                          : "inactivo bg-red-500/80"
                      }`}
                    >
                      {proveedor.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    {/* Modificado para usar clases similares a TablaPermisos */}
                    <div className="flex justify-center space-x-2">
                      <button
                        className="btn-edit-1 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/90"
                        onClick={() => abrirFormulario(proveedor)}
                        title="Editar proveedor"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn-delete-1 dark:bg-rose-950/100 dark:hover:bg-rose-800/90"
                        onClick={() => manejarEliminarProveedor(proveedor._id)}
                        title="Eliminar proveedor"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <button
                        className={`usuario btn-toggle-1 transition-all duration-200 ease-in-out
                                              ${
                                                proveedor.estado
                                                  ? "bg-emerald-400/70  dark:bg-emerald-700 "
                                                  : "bg-amber-400/70 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500"
                                              }`}
                        onClick={() =>
                          manejarToggleEstado(proveedor._id, proveedor.estado)
                        }
                        title={
                          proveedor.estado
                            ? "Desactivar usuario"
                            : "Activar usuario"
                        }
                      >
                        <FontAwesomeIcon
                          icon={proveedor.estado ? faToggleOn : faToggleOff}
                          className="text-white text-xl"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No se encontraron proveedores con ese criterio de búsqueda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {proveedores.length > 0 && (
        <div className="pagination-container mt-6">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className={`pagination-btn ${paginaActual === 1 ? "disabled" : ""}`}
          >
            &lt;
          </button>

          <div className="pagination-pages">
            {Array.from({ length: paginasTotales }, (_, index) => (
              <button
                key={index}
                onClick={() => cambiarPagina(index + 1)}
                className={`pagination-number ${
                  paginaActual === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={paginaSiguiente}
            disabled={paginaActual === paginasTotales}
            className={`pagination-btn ${
              paginaActual === paginasTotales ? "disabled" : ""
            }`}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Modal para agregar/editar proveedor */}
      <Modal
        isOpen={formModalIsOpen}
        onRequestClose={cerrarFormulario}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            onClick={cerrarFormulario}
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-4 text-center text-pink-600">
            {proveedorSeleccionado ? "Actualizar Proveedor" : "Nuevo Proveedor"}
          </h2>
          <FormularioProveedor
            proveedor={proveedorSeleccionado}
            onClose={cerrarFormulario}
            onProveedorActualizado={manejarProveedorActualizado}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TablaProveedores;
