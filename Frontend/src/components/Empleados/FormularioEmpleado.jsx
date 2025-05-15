import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const FormularioEmpleado = ({ empleado, onClose, onEmpleadoActualizado = () => {} }) => {
    const [formData, setFormData] = useState({
        nombreempleado: '',
        apellidoempleado: '',
        correoempleado: '',
        telefonoempleado: '',
        estadoempleado: 'Activo'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (empleado) {
            setFormData({
                nombreempleado: empleado.nombreempleado || '',
                apellidoempleado: empleado.apellidoempleado || '',
                correoempleado: empleado.correoempleado || '',
                telefonoempleado: empleado.telefonoempleado || '',
                estadoempleado: empleado.estadoempleado || 'Activo'
            });
        }
    }, [empleado]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const url = empleado
                ? `https://gitbf.onrender.com/api/empleados/${empleado._id}`
                : "https://gitbf.onrender.com/api/empleados";
            const method = empleado ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Error al guardar el empleado");
            }

            const data = await response.json();
            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: empleado
                    ? "Empleado actualizado correctamente"
                    : "Empleado creado correctamente",
                confirmButtonColor: "#db2777",
            });

            onEmpleadoActualizado(data.empleado || data);
            onClose();
        } catch (error) {
            console.error("Error:", error);
            setError(error.message);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
                confirmButtonColor: "#db2777",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 w-full max-w-2xl mx-auto"> {/* Changed width here */}
            <h2 className="text-2xl font-semibold mb-6 text-center text-pink-600">
                {empleado ? "Editar Empleado" : "Nuevo Empleado"}
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={manejarSubmit} className="space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Added grid layout */}
                    <div className="form-group">
                        <label htmlFor="nombreempleado" className="form-label">
                            Nombre del Empleado
                        </label>
                        <input
                            type="text"
                            id="nombreempleado"
                            name="nombreempleado"
                            value={formData.nombreempleado}
                            onChange={handleInputChange}
                            className="form-input w-full"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="apellidoempleado" className="form-label">
                            Apellido del Empleado
                        </label>
                        <input
                            type="text"
                            id="apellidoempleado"
                            name="apellidoempleado"
                            value={formData.apellidoempleado}
                            onChange={handleInputChange}
                            className="form-input w-full"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="correoempleado" className="form-label">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="correoempleado"
                            name="correoempleado"
                            value={formData.correoempleado}
                            onChange={handleInputChange}
                            className="form-input w-full"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefonoempleado" className="form-label">
                            Número de Teléfono
                        </label>
                        <input
                            type="tel"
                            id="telefonoempleado"
                            name="telefonoempleado"
                            value={formData.telefonoempleado}
                            onChange={handleInputChange}
                            className="form-input w-full"
                            required
                        />
                    </div>

                    <div className="form-group md:col-span-2"> {/* Span full width on mobile */}
                        <label htmlFor="estadoempleado" className="form-label">
                            Estado
                        </label>
                        <select
                            id="estadoempleado"
                            name="estadoempleado"
                            value={formData.estadoempleado}
                            onChange={handleInputChange}
                            className="form-input w-full"
                            required
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="btn-secondary flex items-center" 
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary flex items-center" 
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                        ) : (
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                        )}
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioEmpleado;