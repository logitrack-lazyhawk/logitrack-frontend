export const EVENTO_SELECCION_ENVIO = "logitrack:envio-seleccionado";

export const ETIQUETAS_ESTADO = Object.freeze({
    PENDIENTE: "Pendiente",
    EN_RUTA: "En ruta",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
    DESCONOCIDO: "Desconocido",
});

export function formatearDireccion(direccion) {
    if (typeof direccion === "string") {
        return direccion.trim() || "Sin dirección registrada";
    }

    if (!direccion || typeof direccion !== "object") {
        return "Sin dirección registrada";
    }

    const calleYNumero = [direccion.calle, direccion.numero]
        .filter(
            (valor) =>
                valor !== null &&
                valor !== undefined &&
                String(valor).trim()
        )
        .join(" ");

    return [
        calleYNumero,
        direccion.localidad || direccion.ciudad,
        direccion.provincia,
    ]
        .filter(Boolean)
        .join(", ") || "Sin dirección registrada";
}

export function normalizarEnvio(dto) {
    if (
        !dto ||
        typeof dto !== "object" ||
        !String(dto.id ?? "").trim()
    ) {
        throw new TypeError("El envío debe incluir un id válido.");
    }

    const estado = String(dto.estado ?? "").toUpperCase();

    const peso =
        dto.peso === null ||
        dto.peso === undefined ||
        dto.peso === ""
            ? null
            : Number(dto.peso);

    return {
        id: String(dto.id),
        codigoSeguimiento:
            String(dto.codigoSeguimiento ?? "").trim() || "Sin código",
        estado: Object.hasOwn(ETIQUETAS_ESTADO, estado)
            ? estado
            : "DESCONOCIDO",
        peso: Number.isFinite(peso) ? peso : null,
        origen: formatearDireccion(dto.origen),
        destino: formatearDireccion(dto.destino),
        repartidorAsignado: Boolean(dto.repartidorId ?? dto.repartidorAsignado),
    };
}

export function crearDetalleSeleccion(envio, contexto = "cliente") {
    const normalizado = normalizarEnvio(envio);

    return {
        id: normalizado.id,
        codigoSeguimiento: normalizado.codigoSeguimiento,
        contexto: contexto === "admin" ? "admin" : "cliente",
    };
}
