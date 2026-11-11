import test from "node:test";
import assert from "node:assert/strict";

import {
    EVENTO_SELECCION_ENVIO,
    normalizarEnvio,
    crearDetalleSeleccion,
    formatearDireccion,
} from "./envioContract.js";

const envio = {
    id: "11111111-1111-1111-1111-111111111111",
    codigoSeguimiento: " LT-100 ",
    estado: "EN_RUTA",
    peso: 2.5,
    origen: {
        calle: "San Martín",
        numero: "30",
        ciudad: "Jujuy",
        provincia: "Jujuy",
    },
    destino: {
        calle: "Belgrano",
        numero: "45",
        ciudad: "Palpalá",
    },
    repartidorId: null,
};

test("normaliza el DTO real de shipment-service", () => {
    const result = normalizarEnvio(envio);

    assert.equal(result.codigoSeguimiento, "LT-100");
    assert.equal(result.estado, "EN_RUTA");
    assert.equal(
        result.origen,
        "San Martín 30, Jujuy, Jujuy"
    );
    assert.equal(result.destino, "Belgrano 45, Palpalá");
    assert.equal(result.repartidorAsignado, false);
});

test("valida que exista un identificador", () => {
    assert.throws(
        () => normalizarEnvio({ estado: "PENDIENTE" }),
        TypeError
    );
});

test("maneja direcciones ausentes y estados desconocidos", () => {
    assert.equal(
        formatearDireccion(null),
        "Sin dirección registrada"
    );

    const result = normalizarEnvio({
        id: "abc",
        estado: "OTRO",
        peso: null,
    });

    assert.equal(result.estado, "DESCONOCIDO");
    assert.equal(result.peso, null);
});

test("emite el mismo contrato para ambos equipos", () => {
    assert.equal(
        EVENTO_SELECCION_ENVIO,
        "logitrack:envio-seleccionado"
    );

    const admin = crearDetalleSeleccion(envio, "admin");
    const cliente = crearDetalleSeleccion(envio, "cliente");

    assert.equal(admin.id, cliente.id);
    assert.equal(
        admin.codigoSeguimiento,
        cliente.codigoSeguimiento
    );
    assert.equal(admin.contexto, "admin");
    assert.equal(cliente.contexto, "cliente");
});

test('la normalización conserva los datos al reutilizar un envío normalizado', () => {
    const normalizado = normalizarEnvio({ ...envio, repartidorId: 'repartidor-1' });
    assert.deepEqual(normalizarEnvio(normalizado), normalizado);
});

test('reconoce los cuatro estados del ciclo de vida sin ocultar cancelaciones', () => {
    for (const estado of ['PENDIENTE', 'EN_RUTA', 'ENTREGADO', 'CANCELADO']) {
        assert.equal(normalizarEnvio({ ...envio, estado }).estado, estado);
    }
});
