import axios from 'axios';

// URL base del backend (directo al commerce-service por ahora)
const API_URL = 'http://localhost:8084/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
// Servicio para LazyHawk Play
export const playServicio = {
    listar: (categoria = null) => {
        const url = categoria ? `/play?categoria=${categoria}` : '/play';
        return api.get(url);
    },
    seed: () => api.post('/play/seed'),
};