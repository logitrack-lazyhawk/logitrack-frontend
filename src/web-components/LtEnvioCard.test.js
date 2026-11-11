import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTO_SELECCION_ENVIO, normalizarEnvio } from '../contracts/envioContract.js';

const HTMLElementOriginal = globalThis.HTMLElement;
globalThis.HTMLElement = class extends EventTarget {};
const { LtEnvioCard } = await import('./LtEnvioCard.js');
if (HTMLElementOriginal) globalThis.HTMLElement = HTMLElementOriginal;
else delete globalThis.HTMLElement;

for (const contexto of ['cliente', 'admin']) {
    test(`el Web Component conserva el evento compartido en contexto ${contexto}`, () => {
        const host = new EventTarget();
        host._envio = normalizarEnvio({ id: 'envio-1', codigoSeguimiento: 'LT-100', estado: 'EN_RUTA' });
        host.getAttribute = () => contexto;
        let recibido;
        host.addEventListener(EVENTO_SELECCION_ENVIO, evento => { recibido = evento; });
        LtEnvioCard.prototype.seleccionar.call(host);
        assert.deepEqual(recibido.detail, { id: 'envio-1', codigoSeguimiento: 'LT-100', contexto });
        assert.equal(recibido.bubbles, true);
        assert.equal(recibido.composed, true);
    });
}

test('no emite una selección si no tiene un envío', () => {
    const host = new EventTarget();
    let emitido = false;
    host.addEventListener(EVENTO_SELECCION_ENVIO, () => { emitido = true; });
    LtEnvioCard.prototype.seleccionar.call(host);
    assert.equal(emitido, false);
});
