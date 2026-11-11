import axiosClient from '../api/axiosClient';

// En el frontend, el API Gateway (puerto 8066) o el proxy de Vite (/api)
// enrutan todas las peticiones bajo /api/v1 al microservicio correspondiente.
const BASE_URL = '/api/v1';

// Servicios para Productos
export const productoServicio = {
    listar: (categoria = null) => {
        const url = categoria ? `${BASE_URL}/productos?categoria=${encodeURIComponent(categoria)}` : `${BASE_URL}/productos`;
        return axiosClient.get(url);
    },
    obtenerPorId: (id) => axiosClient.get(`${BASE_URL}/productos/${id}`),
};

// Servicios para Carrito
export const carritoServicio = {
    obtener: (usuarioId) => axiosClient.get(`${BASE_URL}/carritos/${usuarioId}`),
    agregarItem: (usuarioId, productoId, cantidad) =>
        axiosClient.post(`${BASE_URL}/carritos/${usuarioId}/items`, { productoId, cantidad }),
    eliminarItem: (usuarioId, productoId) =>
        axiosClient.delete(`${BASE_URL}/carritos/${usuarioId}/items/${productoId}`),
    vaciar: (usuarioId) => axiosClient.delete(`${BASE_URL}/carritos/${usuarioId}`),
};

// Servicios para Órdenes
export const ordenServicio = {
    crear: (usuarioId, direccionDestino) =>
        axiosClient.post(`${BASE_URL}/ordenes/${usuarioId}?direccionDestino=${encodeURIComponent(direccionDestino)}`),
    pagar: (ordenId) => axiosClient.patch(`${BASE_URL}/ordenes/${ordenId}/pagar`),
};

// Servicio para LazyHawk Play
export const playServicio = {
    listar: (categoria = null) => {
        const url = categoria ? `${BASE_URL}/play?categoria=${encodeURIComponent(categoria)}` : `${BASE_URL}/play`;
        return axiosClient.get(url);
    },
    seed: () => axiosClient.post(`${BASE_URL}/play/seed`),
};

export const api = axiosClient;