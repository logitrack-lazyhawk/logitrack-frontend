import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'vite';

test('producción excluye el acceso DEMO y los mocks aun con VITE_DEMO_MODE=true', async () => {
    const entornoOriginal = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
        const resultado = await build({
            mode: 'production',
            define: { 'import.meta.env.VITE_DEMO_MODE': JSON.stringify('true') },
            build: { write: false },
            logLevel: 'silent',
        });
        const salidas = [resultado].flat().flatMap(bundle => bundle.output);
        const javascript = salidas.filter(salida => salida.type === 'chunk');
        const codigo = javascript.map(salida => salida.code).join('\n');
        for (const texto of ['LT-DEMO-', 'Avenida Demostración', 'Entrar en modo demostración']) {
            assert.ok(!codigo.includes(texto), `El build de producción incluye ${texto}`);
        }
        assert.ok(!javascript.some(salida => Object.keys(salida.modules).some(modulo => /envios(Mock|Fixtures)\.js$/.test(modulo))));
        assert.ok(codigo.includes('/api/v1/envios/mis-envios'));
    } finally {
        if (entornoOriginal === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = entornoOriginal;
    }
});
