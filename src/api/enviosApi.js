
import axiosClient from "./axiosClient";

const BASE_URL = "/api/v1/envios/mis-envios";

export async function obtenerMisEnvios(page = 0, size = 8) {
    const response = await axiosClient.get(BASE_URL, {
        params: { page, size },
    });

    return response.data;
}

export async function obtenerMiEnvioPorTracking(codigo) {
    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
        throw new Error("Ingresá un código de seguimiento.");
    }

    const response = await axiosClient.get(
        `${BASE_URL}/tracking/${encodeURIComponent(codigoLimpio)}`
    );

    return response.data;
}
