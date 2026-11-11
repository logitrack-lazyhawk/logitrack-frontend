import axios from 'axios';

// URL base del backend: prioriza la configuración de entorno o el API Gateway
const API_URL = import.meta.env.VITE_COMMERCE_API_URL || '/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Servicios para Productos
export const productoServicio = {
    listar: (categoria = null) => {
        const url = categoria ? `/productos?categoria=${categoria}` : '/productos';
        return api.get(url);
    },
    obtenerPorId: (id) => api.get(`/productos/${id}`),
};

// Servicios para Carrito
export const carritoServicio = {
    obtener: (usuarioId) => api.get(`/carritos/${usuarioId}`),
    agregarItem: (usuarioId, productoId, cantidad) =>
        api.post(`/carritos/${usuarioId}/items`, { productoId, cantidad }),
    eliminarItem: (usuarioId, productoId) =>
        api.delete(`/carritos/${usuarioId}/items/${productoId}`),
    vaciar: (usuarioId) => api.delete(`/carritos/${usuarioId}`),
};

// Servicios para Órdenes
export const ordenServicio = {
    crear: (usuarioId, direccionDestino) =>
        api.post(`/ordenes/${usuarioId}?direccionDestino=${encodeURIComponent(direccionDestino)}`),
    pagar: (ordenId) => api.patch(`/ordenes/${ordenId}/pagar`),
};