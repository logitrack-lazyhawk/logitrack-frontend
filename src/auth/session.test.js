import test from 'node:test';
import assert from 'node:assert/strict';
import { leerSesion, rutaPermitida } from './session.js';

const ahora = 1700000000000;
const token = claims => `eyJhbGciOiJSUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: 'cliente@example.com', exp: ahora / 1000 + 60, ...claims })).toString('base64url')}.firma-de-prueba`;

test('rechaza el antiguo token simulado, tokens malformados y sesiones expiradas', () => {
    for (const valor of ['', 'token-falso-para-probar', 'a.b.c', token({ exp: ahora / 1000 }), token({ exp: undefined }), token({ sub: '' })]) {
        assert.equal(leerSesion(valor, ahora), null);
    }
});

test('lee roles del JWT clásico y de Keycloak sin recurrir al rol guardado localmente', () => {
    const sesion = leerSesion(token({ roles: 'ROLE_CLIENTE', given_name: 'María', realm_access: { roles: ['CLIENTE'] }, resource_access: { logitrack: { roles: ['role_repartidor'] } } }), ahora);
    assert.deepEqual(sesion.roles, ['CLIENTE', 'REPARTIDOR']);
    assert.equal(sesion.nombre, 'María');
});

test('un cliente no accede a las rutas administrativas y un repartidor no accede al portal', () => {
    const cliente = leerSesion(token({ roles: ['CLIENTE'] }), ahora);
    const admin = leerSesion(token({ roles: ['ADMIN'] }), ahora);
    const repartidor = leerSesion(token({ roles: ['REPARTIDOR'] }), ahora);
    assert.equal(rutaPermitida(cliente, ['ADMIN']), false);
    assert.equal(rutaPermitida(admin, ['ADMIN']), true);
    assert.equal(rutaPermitida(cliente, ['CLIENTE']), true);
    assert.equal(rutaPermitida(repartidor, ['CLIENTE']), false);
    assert.equal(rutaPermitida(null), false);
});

test('un token sin roles reconocidos no obtiene permisos por defecto', () => {
    const sesion = leerSesion(token({}), ahora);
    assert.equal(rutaPermitida(sesion, ['ADMIN', 'CLIENTE']), false);
});
