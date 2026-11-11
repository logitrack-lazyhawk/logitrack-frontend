const DESTINOS = [
    ['San Salvador de Jujuy', 'Jujuy', '4600'],
    ['Salta', 'Salta', '4400'],
    ['San Miguel de Tucumán', 'Tucumán', '4000'],
    ['Córdoba', 'Córdoba', '5000'],
    ['Tilcara', 'Jujuy', '4624'],
    ['Humahuaca', 'Jujuy', '4630'],
    ['Rosario', 'Santa Fe', '2000'],
    ['Mendoza', 'Mendoza', '5500'],
    ['La Quiaca', 'Jujuy', '4650'],
    ['Buenos Aires', 'Ciudad de Buenos Aires', '1000'],
];
const ESTADOS = ['PENDIENTE', 'EN_RUTA', 'ENTREGADO', 'CANCELADO'];

export function enviosIniciales() {
    return DESTINOS.map(([ciudad, provincia, codigoPostal], indice) => ({
        id: `00000000-0000-4000-8000-${String(indice + 1).padStart(12, '0')}`,
        codigoSeguimiento: `LT-DEMO-${String(indice + 1).padStart(3, '0')}`,
        estado: ESTADOS[indice % ESTADOS.length],
        peso: indice === 8 ? null : (indice + 1) * 0.5,
        ancho: 20,
        alto: 15,
        largo: 30,
        tarifa: 1975 + indice * 175,
        origen: {
            calle: 'Calle del Ejemplo', numero: '100', ciudad: 'San Salvador de Jujuy',
            provincia: 'Jujuy', codigoPostal: '4600', localidad: '', descripcion: 'Dirección ficticia',
        },
        destino: {
            calle: 'Avenida Demostración', numero: String(200 + indice * 10), ciudad,
            provincia, codigoPostal, localidad: '', descripcion: 'Dirección ficticia',
        },
        repartidorId: null,
        clienteId: '00000000-0000-4000-8000-000000000100',
    }));
}
