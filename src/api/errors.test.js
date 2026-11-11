import test from 'node:test';
import assert from 'node:assert/strict';
import { obtenerMensajeError } from './errors.js';

for (const status of [400, 401, 403, 404, 422, 500, 503]) {
    test(`presenta un mensaje comprensible para HTTP ${status}`, () => {
        const mensaje = obtenerMensajeError({ response: { status, data: {} } });
        assert.ok(mensaje.length > 15);
        assert.ok(!mensaje.includes('undefined'));
    });
}

test('presenta detalles de negocio pero oculta errores internos de servidor', () => {
    const detail = 'No existe una ficha de cliente asociada al usuario autenticado.';
    assert.equal(obtenerMensajeError({ response: { status: 422, data: { detail } } }), detail);
    assert.ok(!obtenerMensajeError({ response: { status: 500, data: { detail: 'stack trace interno' } } }).includes('stack trace'));
});

test('maneja falta de conexión sin depender de una respuesta HTTP', () => {
    assert.match(obtenerMensajeError(new Error('Network Error')), /conexión/);
});
