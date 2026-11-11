import { crearPeticion, validarFormulario } from '../utils/crearEnvio.js';
import { enviosIniciales } from './enviosFixtures.js';

function errorHttp(status, detail, fieldErrors) {
    const error = new Error(detail);
    error.response = { status, data: { detail, ...(fieldErrors ? { fieldErrors } : {}) } };
    return error;
}

export function crearMockEnvios({ latencia = 250 } = {}) {
    const envios = enviosIniciales();
    let siguiente = envios.length + 1;

    function esperar(signal) {
        signal?.throwIfAborted();
        if (!latencia) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const cancelar = () => {
                clearTimeout(timer);
                reject(signal.reason);
            };
            const timer = setTimeout(() => {
                signal?.removeEventListener('abort', cancelar);
                resolve();
            }, latencia);
            signal?.addEventListener('abort', cancelar, { once: true });
        });
    }

    return {
        async obtenerMisEnvios(page = 0, size = 8, signal) {
            await esperar(signal);
            signal?.throwIfAborted();
            if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
                throw errorHttp(400, 'La página y el tamaño de la consulta deben ser válidos.');
            }
            return structuredClone({
                content: envios.slice(page * size, (page + 1) * size),
                number: page,
                size,
                totalElements: envios.length,
                totalPages: Math.ceil(envios.length / size),
                first: page === 0,
                last: (page + 1) * size >= envios.length,
                empty: page * size >= envios.length,
            });
        },
        async obtenerMiEnvioPorTracking(codigo, signal) {
            await esperar(signal);
            signal?.throwIfAborted();
            if (!codigo.trim()) throw errorHttp(400, 'Ingresá un código de seguimiento.');
            const envio = envios.find(item => item.codigoSeguimiento === codigo.trim());
            if (!envio) throw errorHttp(404, 'No encontramos un envío de demostración con ese código.');
            return structuredClone(envio);
        },
        async crearMiEnvio(datos) {
            await esperar();
            const fieldErrors = validarFormulario(datos);
            if (Object.keys(fieldErrors).length) {
                throw errorHttp(400, 'Revisá los campos señalados antes de registrar el envío.', fieldErrors);
            }
            const peticion = crearPeticion(datos);
            const envio = {
                ...peticion,
                id: crypto.randomUUID(),
                codigoSeguimiento: `LT-DEMO-${String(siguiente++).padStart(3, '0')}`,
                estado: 'PENDIENTE',
                tarifa: Math.round((1800 + peticion.peso * 350) * 100) / 100,
                repartidorId: null,
                clienteId: '00000000-0000-4000-8000-000000000100',
            };
            envios.unshift(envio);
            return structuredClone(envio);
        },
    };
}

export const enviosMock = crearMockEnvios();
