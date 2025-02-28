import React, { useReducer, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import FormularioServicio from './FormularioServicio';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

const ACTIONS = {
  FETCH_INIT: 'FETCH_INIT',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  ADD_SERVICIO: 'ADD_SERVICIO',
  UPDATE_SERVICIO: 'UPDATE_SERVICIO',
  DELETE_SERVICIO: 'DELETE_SERVICIO',
  SET_MODAL: 'SET_MODAL',
  SET_SELECTED_SERVICIO: 'SET_SELECTED_SERVICIO',
  SET_PAGE: 'SET_PAGE',
};

const serviciosReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_INIT:
      return { ...state, isLoading: true, error: null };
    case ACTIONS.FETCH_SUCCESS:
      return { ...state, isLoading: false, servicios: action.payload, error: null };
    case ACTIONS.FETCH_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case ACTIONS.ADD_SERVICIO:
      return { ...state, servicios: [...state.servicios, action.payload] };
    case ACTIONS.UPDATE_SERVICIO:
      return { ...state, servicios: state.servicios.map(s => s._id === action.payload._id ? action.payload : s) };
    case ACTIONS.DELETE_SERVICIO:
      return { ...state, servicios: state.servicios.filter(s => s._id !== action.payload) };
    case ACTIONS.SET_MODAL:
      return { ...state, modalIsOpen: action.payload };
    case ACTIONS.SET_SELECTED_SERVICIO:
      return { ...state, servicioSeleccionado: action.payload };
    case ACTIONS.SET_PAGE:
      return { ...state, paginaActual: action.payload };
    default:
      return state;
  }
};

const TablaServicios = () => {
  const [state, dispatch] = useReducer(serviciosReducer, {
    servicios: [],
    isLoading: true,
    error: null,
    modalIsOpen: false,
    servicioSeleccionado: null,
    paginaActual: 1,
  });

  const serviciosPorPagina = 5;

  const obtenerServicios = useCallback(async () => {
    dispatch({ type: ACTIONS.FETCH_INIT });
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        Swal.fire('Error', 'No tienes permiso para estar aquí. No se encontró un token válido.', 'error');
        dispatch({ type: ACTIONS.FETCH_FAILURE, payload: 'Token no encontrado.' });
        return;
      }

      const response = await fetch('https://gitbf.onrender.com/api/servicios', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: data.servicios || [] });
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      Swal.fire('Error', 'No tienes permiso para estar aqui :) post: tu token no es válido', 'error');
      dispatch({ type: ACTIONS.FETCH_FAILURE, payload: 'Error al cargar los servicios. Por favor, intente de nuevo.' });
    }
  }, []);

  useEffect(() => {
    obtenerServicios();
  }, [obtenerServicios]);

  const manejarAgregarNuevo = () => {
    dispatch({ type: ACTIONS.SET_SELECTED_SERVICIO, payload: null });
    dispatch({ type: ACTIONS.SET_MODAL, payload: true });
  };

  const manejarCerrarModal = () => {
    dispatch({ type: ACTIONS.SET_MODAL, payload: false });
  };

  const manejarServicioAgregadoOActualizado = async (nuevoServicio) => {
    if (state.servicioSeleccionado) {
      dispatch({ type: ACTIONS.UPDATE_SERVICIO, payload: nuevoServicio });
    } else {
      dispatch({ type: ACTIONS.ADD_SERVICIO, payload: nuevoServicio });
    }
    manejarCerrarModal();
    
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'El servicio ha sido guardado correctamente.',
    });

    // Actualizar la lista de servicios después de agregar o editar
    obtenerServicios();
  };

  const manejarEditar = (servicio) => {
    dispatch({ type: ACTIONS.SET_SELECTED_SERVICIO, payload: servicio });
    dispatch({ type: ACTIONS.SET_MODAL, payload: true });
  };

  const manejarEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`https://gitbf.onrender.com/api/servicios/${id}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        dispatch({ type: ACTIONS.DELETE_SERVICIO, payload: id });
        Swal.fire('Eliminado!', 'El servicio ha sido eliminado.', 'success');
        obtenerServicios(); // Actualizar la lista después de eliminar
      } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        Swal.fire('Error', 'No se pudo eliminar el servicio.', 'error');
      }
    }
  };

  const indiceUltimoServicio = state.paginaActual * serviciosPorPagina;
  const indicePrimerServicio = indiceUltimoServicio - serviciosPorPagina;
  const serviciosActuales = state.servicios.slice(indicePrimerServicio, indiceUltimoServicio);

  const cambiarPagina = (numeroPagina) => {
    dispatch({ type: ACTIONS.SET_PAGE, payload: numeroPagina });
  };

  const paginasTotales = Math.ceil(state.servicios.length / serviciosPorPagina);

  const paginaAnterior = () => {
    if (state.paginaActual > 1) dispatch({ type: ACTIONS.SET_PAGE, payload: state.paginaActual - 1 });
  };

  const paginaSiguiente = () => {
    if (state.paginaActual < paginasTotales) dispatch({ type: ACTIONS.SET_PAGE, payload: state.paginaActual + 1 });
  };

  if (state.isLoading) return <div>Cargando servicios...</div>;
  if (state.error) return <div>{state.error}</div>;

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-8">Gestión de Servicios</h2>
      <div className="flex justify-between mb-5 w-full h-7 max-w-4xl"> 
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300"
          onClick={manejarAgregarNuevo}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <input
          type="text"
          id="searchInput"
          className="border border-gray-300 rounded-md py-2 px-4 w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Buscar en la tabla"
        />
      </div>

      <div className="w-full overflow-x-auto">
        <table className="table min-w-full divide-y divide-gray-200 bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Servicio</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serviciosActuales.map((servicio) => (
              <tr key={servicio._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{servicio.nombreServicio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{servicio.tipoServicio?.nombreTs || 'No definido'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{servicio.tiempo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{servicio.precio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{servicio.estado ? 'Activo' : 'Inactivo'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => manejarEditar(servicio)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300"
                    onClick={() => manejarEliminar(servicio._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4">
        <nav className="flex justify-center">
          <ul className="inline-flex items-center">
            <li>
              <button
                onClick={paginaAnterior}
                disabled={state.paginaActual === 1}
                className={`px-3 py-1 mx-1 rounded ${state.paginaActual === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                &lt;
              </button>
            </li>
            {Array.from({ length: paginasTotales }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => cambiarPagina(index + 1)}
                  className={`px-3 py-1 mx-1 rounded ${state.paginaActual === index + 1 ? 'bg-gray-300 text-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={paginaSiguiente}
                disabled={state.paginaActual === paginasTotales}
                className={`px-3 py-1 mx-1 rounded ${state.paginaActual === paginasTotales ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                &gt;
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* El Modal */}
      <Modal
        isOpen={state.modalIsOpen}
        onRequestClose={manejarCerrarModal}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={manejarCerrarModal}
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4">{state.servicioSeleccionado ? '' : ''}</h2>
          <FormularioServicio
            servicioSeleccionado={state.servicioSeleccionado}
            onServicioActualizado={manejarServicioAgregadoOActualizado}
            onClose={manejarCerrarModal}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TablaServicios;