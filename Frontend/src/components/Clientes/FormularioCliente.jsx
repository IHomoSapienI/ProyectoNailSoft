import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const FormularioCliente = ({ cliente, onClose, onClienteActualizado = () => {} }) => {
    const [formData, setFormData] = useState({
        nombrecliente: '',
        apellidocliente: '',
        correocliente: '',
        celularcliente: '',
        estadocliente: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cliente) {
            setFormData({
                nombrecliente: cliente.nombrecliente || '',
                apellidocliente: cliente.apellidocliente || '',
                correocliente: cliente.correocliente || '',
                celularcliente: cliente.celularcliente || '',
                estadocliente: cliente.estadocliente !== undefined ? cliente.estadocliente : true
            });
        }
    }, [cliente]);

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
            const url = cliente
                ? `https://gitbf.onrender.com/api/clientes/${cliente._id}`
                : "https://gitbf.onrender.com/api/clientes";
            const method = cliente ? "PUT" : "POST";

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
                throw new Error(errorData.msg || "Error al guardar el cliente");
            }

            const data = await response.json();
            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: cliente
                    ? "Cliente actualizado correctamente"
                    : "Cliente creado correctamente",
                confirmButtonColor: "#db2777",
            });

            onClienteActualizado(data.cliente || data);
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
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center text-pink-600">
                {cliente ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={manejarSubmit} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="nombrecliente" className="form-label">
                        Nombre del Cliente
                    </label>
                    <input
                        type="text"
                        id="nombrecliente"
                        name="nombrecliente"
                        value={formData.nombrecliente}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="apellidocliente" className="form-label">
                        Apellido del Cliente
                    </label>
                    <input
                        type="text"
                        id="apellidocliente"
                        name="apellidocliente"
                        value={formData.apellidocliente}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="correocliente" className="form-label">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="correocliente"
                        name="correocliente"
                        value={formData.correocliente}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="celularcliente" className="form-label">
                        Número de Celular
                    </label>
                    <input
                        type="tel"
                        id="celularcliente"
                        name="celularcliente"
                        value={formData.celularcliente}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="estadocliente"
                            name="estadocliente"
                            checked={formData.estadocliente}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-pink-600"
                        />
                        <label htmlFor="estadocliente" className="ml-2 form-label">
                            Activo
                        </label>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 ml-7">
                        Desactiva esta opción para ocultar este cliente en el sistema.
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

export default FormularioCliente;