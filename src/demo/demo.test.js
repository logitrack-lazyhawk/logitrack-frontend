import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_HABILITADO, permiteDemo } from './entorno.js';
import { crearControlDemo } from './controlDemo.js';
import { crearMockEnvios } from './enviosMock.js';

const datos = () => ({
    peso: 2.5, ancho: 20, alto: 15, largo: 30,
    origen: { calle: ' Ejemplo ', numero: '100', ciudad: 'Jujuy', provincia: 'Jujuy', codigoPostal: '4600' },
    destino: { calle: ' Demo ', numero: '200', ciudad: 'Salta', provincia: 'Salta', codigoPostal: '4400' },
});

test('DEMO exige desarrollo y el valor exacto true de la variable de Vite', () => {
    assert.equal(permiteDemo({ DEV: true, VITE_DEMO_MODE: 'true' }), true);
    for (const env of [undefined, {}, { DEV: false, VITE_DEMO_MODE: 'true' },
        { DEV: 'true', VITE_DEMO_MODE: 'true' }, { DEV: true },
        { DEV: true, VITE_DEMO_MODE: false }, { DEV: true, VITE_DEMO_MODE: 'false' },
        { DEV: true, VITE_DEMO_MODE: 'TRUE' }]) {
        assert.equal(permiteDemo(env), false);
    }
    assert.equal(DEMO_HABILITADO, false);
});

test('la entrada es explícita, notifica cambios y se puede salir sin una sesión autenticada', () => {
    const control = crearControlDemo(true);
    const estados = [];
    const cancelar = control.suscribir(() => estados.push(control.estaActivo()));
    assert.equal(control.estaActivo(), false);
    control.entrar();
    control.entrar();
    control.salir();
    assert.deepEqual(estados, [true, false]);
    cancelar();
    control.entrar();
    assert.deepEqual(estados, [true, false]);
});

test('un control deshabilitado no permite activar DEMO', () => {
    const control = crearControlDemo(false);
    control.entrar();
    assert.equal(control.estaActivo(), false);
});

test('los datos ficticios cubren todos los estados y permiten paginar', async () => {
    const mock = crearMockEnvios({ latencia: 0 });
    const primera = await mock.obtenerMisEnvios();
    const segunda = await mock.obtenerMisEnvios(1);
    assert.equal(primera.content.length, 8);
    assert.equal(segunda.content.length, 2);
    assert.equal(primera.totalPages, 2);
    assert.equal(primera.totalElements, 10);
    assert.deepEqual(new Set(primera.content.map(envio => envio.estado)), new Set(['PENDIENTE', 'EN_RUTA', 'ENTREGADO', 'CANCELADO']));
    assert.equal(segunda.last, true);
    assert.deepEqual((await mock.obtenerMisEnvios(3)).content, []);
});

test('un envío creado aparece en el listado y puede consultarse por su código', async () => {
    const mock = crearMockEnvios({ latencia: 0 });
    const creado = await mock.crearMiEnvio({ ...datos(), clienteId: 'no-admitido', estado: 'ENTREGADO' });
    assert.equal(creado.estado, 'PENDIENTE');
    assert.equal(creado.origen.calle, 'Ejemplo');
    assert.ok(Number.isFinite(creado.tarifa) && creado.tarifa > 0);
    assert.match(creado.codigoSeguimiento, /^LT-DEMO-/);
    assert.notEqual(creado.clienteId, 'no-admitido');
    assert.deepEqual(await mock.obtenerMiEnvioPorTracking(` ${creado.codigoSeguimiento} `), creado);
    const listado = await mock.obtenerMisEnvios();
    assert.equal(listado.totalElements, 11);
    assert.equal(listado.content[0].id, creado.id);
});

test('las creaciones consecutivas tienen códigos e identificadores distintos', async () => {
    const mock = crearMockEnvios({ latencia: 0 });
    const uno = await mock.crearMiEnvio(datos());
    const dos = await mock.crearMiEnvio(datos());
    assert.notEqual(uno.id, dos.id);
    assert.notEqual(uno.codigoSeguimiento, dos.codigoSeguimiento);
});

test('los errores simulados respetan el formato usado por la capa HTTP', async () => {
    const mock = crearMockEnvios({ latencia: 0 });
    await assert.rejects(mock.obtenerMiEnvioPorTracking('INEXISTENTE'), error => error.response.status === 404);
    await assert.rejects(mock.obtenerMiEnvioPorTracking(' '), error => error.response.status === 400);
    await assert.rejects(mock.obtenerMisEnvios(-1), error => error.response.status === 400);
    await assert.rejects(mock.crearMiEnvio({ ...datos(), peso: 0 }), error => {
        assert.equal(error.response.status, 400);
        assert.ok(error.response.data.fieldErrors.peso);
        return true;
    });
    assert.equal((await mock.obtenerMisEnvios()).totalElements, 10);
});

test('las respuestas son copias y los datos de cada demostración son independientes', async () => {
    const mock = crearMockEnvios({ latencia: 0 });
    const listado = await mock.obtenerMisEnvios();
    listado.content[0].destino.calle = 'Alteración externa';
    const envio = await mock.obtenerMiEnvioPorTracking('LT-DEMO-001');
    assert.notEqual(envio.destino.calle, 'Alteración externa');
    await mock.crearMiEnvio(datos());
    assert.equal((await crearMockEnvios({ latencia: 0 }).obtenerMisEnvios()).totalElements, 10);
});

test('las solicitudes abortadas no entregan resultados pendientes', async () => {
    const mock = crearMockEnvios({ latencia: 20 });
    const controller = new AbortController();
    const solicitud = mock.obtenerMisEnvios(0, 8, controller.signal);
    controller.abort();
    await assert.rejects(solicitud, { name: 'AbortError' });
    await assert.rejects(mock.obtenerMiEnvioPorTracking('LT-DEMO-001', controller.signal), { name: 'AbortError' });
});
