import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TablaBajaProductos = () => {
    const [bajas, setBajas] = useState([]);

    // Función para obtener las bajas de productos
    const obtenerBajasProductos = async () => {
        try {
            const response = await axios.get('/api/bajas'); // Cambia esta URL según tu configuración de API
            setBajas(response.data);
        } catch (error) {
            console.error('Error al obtener las bajas de productos', error);
        }
    };

    // Función para eliminar una baja de producto
    const eliminarBaja = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas anular esta baja de producto?')) {
            try {
                await axios.delete(`/api/bajas/${id}`); // Cambia esta URL según tu configuración de API
                obtenerBajasProductos(); // Refresca la lista después de eliminar
            } catch (error) {
                console.error('Error al eliminar la baja de producto', error);
            }
        }
    };

    useEffect(() => {
        obtenerBajasProductos();
    }, []);

    return (
        <div className="container mt-4">
            <h2>Bajas de Productos</h2>
            <table className="table table-bordered table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Fecha de Baja</th>
                        <th>Cantidad</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {bajas.map((baja) => (
                        <tr key={baja._id}>
                            <td>{baja._id}</td>
                            <td>{baja.producto}</td>
                            <td>{new Date(baja.fechaBaja).toLocaleDateString()}</td>
                            <td>{baja.cantidad}</td>
                            <td>{baja.observaciones}</td>
                            <td>
                                <button className="btn btn-danger" onClick={() => eliminarBaja(baja._id)}>
                                    Anular
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaBajaProductos;
