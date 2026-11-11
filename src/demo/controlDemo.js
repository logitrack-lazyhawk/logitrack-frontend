export function crearControlDemo(habilitado) {
    let activo = false;
    const listeners = new Set();

    function actualizar(valor) {
        if (!habilitado || activo === valor) return;
        activo = valor;
        listeners.forEach(listener => listener());
    }

    return {
        estaActivo: () => habilitado === true && activo,
        entrar: () => actualizar(true),
        salir: () => actualizar(false),
        suscribir(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
