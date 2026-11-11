import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';

function renderPagina(Pagina, Layout) {
    return renderToStaticMarkup(createElement(MemoryRouter, null,
        Layout
            ? createElement(Routes, null, createElement(Route, { path: '/', element: createElement(Layout) },
                createElement(Route, { index: true, element: createElement(Pagina) })))
            : createElement(Pagina)));
}

function renderProtegida(Guard, roles) {
    return renderToStaticMarkup(createElement(MemoryRouter, null,
        createElement(Routes, null,
            createElement(Route, { element: createElement(Guard, { roles }) },
                createElement(Route, { path: '/', element: createElement('p', null, 'contenido permitido') })))));
}

test('el portal DEMO usa las pantallas reales y sus operaciones no alcanzan el transporte HTTP', async t => {
    const variableOriginal = process.env.VITE_DEMO_MODE;
    const storageOriginal = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    let lecturas = 0;
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
        getItem() { lecturas++; return null; },
        setItem() { assert.fail('DEMO no debe guardar credenciales ni sesiones'); },
        removeItem() { assert.fail('DEMO no debe borrar una sesión real'); },
    } });
    process.env.VITE_DEMO_MODE = 'true';
    let server;
    try {
        server = await createServer({
            server: { middlewareMode: true, hmr: false, ws: false, watch: null },
            optimizeDeps: { noDiscovery: true, include: [] },
        });
        const { DEMO_HABILITADO } = await server.ssrLoadModule('/src/demo/entorno.js');
        const runtime = await server.ssrLoadModule('/src/demo/runtime.js');
        const api = await server.ssrLoadModule('/src/api/enviosApi.js');
        const { default: clienteHttp } = await server.ssrLoadModule('/src/api/axiosClient.js');
        const { default: Login } = await server.ssrLoadModule('/src/pages/Login.jsx');
        const { default: Layout } = await server.ssrLoadModule('/src/shell/Layout.jsx');
        const { default: Guard } = await server.ssrLoadModule('/src/shell/ProtectedRoute.jsx');
        const peticiones = [];
        clienteHttp.defaults.adapter = async config => {
            peticiones.push(config.url);
            return { status: 200, statusText: 'OK', headers: {}, config, data: { content: [], totalPages: 0 } };
        };

        await t.test('muestra la entrada explícita, pero todavía usa la API real antes de entrar', async () => {
            assert.equal(DEMO_HABILITADO, true);
            assert.match(renderPagina(Login), /Entrar en modo demostración/);
            assert.equal(runtime.demoActiva(), false);
            await api.obtenerMisEnvios();
            assert.deepEqual(peticiones, ['/api/v1/envios/mis-envios']);
        });

        runtime.entrarDemo();
        const lecturasAntes = lecturas;

        await t.test('permite el portal y rechaza las pantallas de ADMIN y REPARTIDOR', () => {
            assert.match(renderProtegida(Guard, []), /contenido permitido/);
            assert.match(renderProtegida(Guard, ['CLIENTE']), /contenido permitido/);
            assert.equal(renderProtegida(Guard, ['ADMIN']), '');
            assert.equal(renderProtegida(Guard, ['REPARTIDOR']), '');
        });

        await t.test('renderiza Inicio, Crear envío y Mis envíos sin enlaces administrativos', async () => {
            for (const [archivo, texto] of [['InicioCliente', 'Conectamos destinos.'],
                ['CrearEnvio', 'Datos del paquete'], ['MisEnvios', 'Mis envíos']]) {
                const { default: Pagina } = await server.ssrLoadModule(`/src/pages/${archivo}.jsx`);
                const html = renderPagina(Pagina, Layout);
                assert.ok(html.includes(texto));
                assert.match(html, /Modo demostración/);
                assert.match(html, /Salir de la demostración/);
                assert.ok(!html.includes('href="/envios"'));
                assert.ok(!html.includes('href="/repartidores"'));
            }
        });

        await t.test('crea, lista y consulta por tracking mediante los mocks separados', async () => {
            const listado = await api.obtenerMisEnvios();
            assert.equal(listado.totalElements, 10);
            const direccion = { calle: 'Demo', numero: '10', ciudad: 'Jujuy', provincia: 'Jujuy', codigoPostal: '4600' };
            const creado = await api.crearMiEnvio({ peso: 2, ancho: 10, alto: 10, largo: 10, origen: direccion, destino: direccion });
            assert.equal((await api.obtenerMiEnvioPorTracking(creado.codigoSeguimiento)).id, creado.id);
            assert.equal((await api.obtenerMisEnvios()).content[0].id, creado.id);
            await assert.rejects(api.obtenerMiEnvioPorTracking('INEXISTENTE'), error => error.response.status === 404);
            assert.equal(peticiones.length, 1);
            assert.equal(lecturas, lecturasAntes);
        });

        await t.test('salir restaura el transporte normal sin modificar credenciales', async () => {
            runtime.salirDemo();
            assert.equal(runtime.demoActiva(), false);
            await api.obtenerMisEnvios();
            assert.deepEqual(peticiones, ['/api/v1/envios/mis-envios', '/api/v1/envios/mis-envios']);
        });
        await t.test('sin la variable habilitada no ofrece acceso DEMO ni permite activar los mocks', async () => {
            await server.close();
            process.env.VITE_DEMO_MODE = 'false';
            server = await createServer({
                server: { middlewareMode: true, hmr: false, ws: false, watch: null },
                optimizeDeps: { noDiscovery: true, include: [] },
            });
            const { default: LoginDeshabilitado } = await server.ssrLoadModule('/src/pages/Login.jsx');
            const control = await server.ssrLoadModule('/src/demo/runtime.js');
            assert.ok(!renderPagina(LoginDeshabilitado).includes('Entrar en modo demostración'));
            control.entrarDemo();
            assert.equal(control.demoActiva(), false);
            const { default: GuardDeshabilitado } = await server.ssrLoadModule('/src/shell/ProtectedRoute.jsx');
            assert.equal(renderProtegida(GuardDeshabilitado, ['CLIENTE']), '');
        });
    } finally {
        await server?.close();
        if (variableOriginal === undefined) delete process.env.VITE_DEMO_MODE;
        else process.env.VITE_DEMO_MODE = variableOriginal;
        if (storageOriginal) Object.defineProperty(globalThis, 'localStorage', storageOriginal);
        else delete globalThis.localStorage;
    }
});
