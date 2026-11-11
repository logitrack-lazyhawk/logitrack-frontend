export function obtenerMensajeError(error) {
    if (!error.response) return 'No pudimos conectar con LogiTrack. Revisá tu conexión e intentá nuevamente.';
    const { status, data } = error.response;
    const mensajes = {
        400: 'Revisá los datos ingresados antes de continuar.',
        401: 'Tu sesión expiró. Volvé a iniciar sesión.',
        403: 'No tenés permisos para realizar esta consulta.',
        404: 'No encontramos un envío tuyo con ese código.',
        422: 'No se pudo registrar el envío. Revisá tus datos o consultá si tu cuenta tiene una ficha de cliente asociada.',
    };
    if (status >= 500) return 'LogiTrack no pudo completar la operación. Intentá nuevamente en unos minutos.';
    if ([400, 422].includes(status) && typeof data?.detail === 'string') return data.detail;
    return mensajes[status] || 'No pudimos completar la operación. Intentá nuevamente.';
}
