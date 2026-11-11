export const DIMENSIONES = [
    { name: 'peso', label: 'Peso', unit: 'kg' },
    { name: 'ancho', label: 'Ancho', unit: 'cm' },
    { name: 'alto', label: 'Alto', unit: 'cm' },
    { name: 'largo', label: 'Largo', unit: 'cm' },
];

export const CAMPOS_DIRECCION = [
    { name: 'calle', label: 'Calle', required: true, max: 100 },
    { name: 'numero', label: 'Número', required: true, max: 20 },
    { name: 'ciudad', label: 'Ciudad', required: true, max: 100 },
    { name: 'provincia', label: 'Provincia', required: true, max: 100 },
    { name: 'codigoPostal', label: 'Código postal', required: true, max: 20 },
    { name: 'localidad', label: 'Localidad', max: 100 },
    { name: 'descripcion', label: 'Referencia adicional', max: 255 },
];

export function nuevoFormulario() {
    const direccion = () => Object.fromEntries(CAMPOS_DIRECCION.map(({ name }) => [name, '']));
    return { peso: '', ancho: '', alto: '', largo: '', origen: direccion(), destino: direccion() };
}

export function convertirNumero(valor) {
    return Number(String(valor).trim().replace(',', '.'));
}

export function validarFormulario(datos) {
    const errores = {};
    for (const { name } of DIMENSIONES) {
        const valor = String(datos[name] ?? '').trim();
        if (!valor) errores[name] = 'Completá este campo.';
        else if (!/^\d+(?:[.,]\d+)?$/.test(valor) || !Number.isFinite(convertirNumero(valor)) || convertirNumero(valor) <= 0) {
            errores[name] = 'Ingresá un número mayor que cero.';
        }
    }
    for (const seccion of ['origen', 'destino']) {
        for (const campo of CAMPOS_DIRECCION) {
            const valor = String(datos[seccion]?.[campo.name] ?? '').trim();
            if (campo.required && !valor) errores[`${seccion}.${campo.name}`] = 'Completá este campo.';
            else if (valor.length > campo.max) errores[`${seccion}.${campo.name}`] = `Usá hasta ${campo.max} caracteres.`;
        }
    }
    return errores;
}

export function crearPeticion(datos) {
    return {
        ...Object.fromEntries(DIMENSIONES.map(({ name }) => [name, convertirNumero(datos[name])])),
        ...Object.fromEntries(['origen', 'destino'].map(seccion => [seccion,
            Object.fromEntries(CAMPOS_DIRECCION.map(({ name }) => [name, String(datos[seccion][name] ?? '').trim()])),
        ])),
    };
}
