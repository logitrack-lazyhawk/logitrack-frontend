import axiosClient from './axiosClient';

const BASE_URL = '/api/v1/envios/mis-envios';

export async function crearMiEnvio(datos) {
    const response = await axiosClient.post(BASE_URL, datos);
    return response.data;
}

export async function obtenerMisEnvios(page = 0, size = 8, signal) {
    const response = await axiosClient.get(BASE_URL, { params: { page, size }, signal });
    return response.data;
}

export async function obtenerMiEnvioPorTracking(codigo, signal) {
    const limpio = codigo.trim();
    if (!limpio) throw new Error('Ingresá un código de seguimiento.');
    const response = await axiosClient.get(`${BASE_URL}/tracking/${encodeURIComponent(limpio)}`, { signal });
    return response.data;
}
