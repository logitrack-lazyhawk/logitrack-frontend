export function permiteDemo(env) {
    return env?.DEV === true && env?.VITE_DEMO_MODE === 'true';
}

export const DEMO_HABILITADO = import.meta.env?.DEV === true && permiteDemo(import.meta.env);
