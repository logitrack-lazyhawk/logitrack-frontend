import test from 'node:test';
import assert from 'node:assert/strict';
import { nuevoFormulario, validarFormulario, crearPeticion } from './crearEnvio.js';

function formularioValido() {
    const direccion = { calle: ' San Martín ', numero: ' 100 ', ciudad: ' San Salvador de Jujuy ', provincia: ' Jujuy ', codigoPostal: '4600', localidad: '', descripcion: '' };
    return { peso: '2,5', ancho: '20', alto: '15', largo: '30', origen: { ...direccion }, destino: { ...direccion } };
}

test('exige las cuatro medidas y todos los campos obligatorios de ambas direcciones', () => {
    const errores = validarFormulario(nuevoFormulario());
    assert.equal(Object.keys(errores).length, 14);
    assert.ok(errores['destino.ciudad']);
    assert.equal(errores['origen.localidad'], undefined);
});

test('rechaza cero, negativos, valores no finitos, notación hexadecimal y separadores inválidos', () => {
    for (const peso of ['0', '-1', 'Infinity', 'NaN', '0x10', '1,2,3', 'abc', '1e999']) {
        assert.ok(validarFormulario({ ...formularioValido(), peso }).peso, peso);
    }
});

test('respeta límites del DTO y rechaza direcciones formadas por espacios', () => {
    const datos = formularioValido();
    datos.origen.calle = ' '.repeat(10);
    datos.destino.numero = '1'.repeat(21);
    datos.destino.descripcion = 'x'.repeat(256);
    const errores = validarFormulario(datos);
    assert.ok(errores['origen.calle']);
    assert.ok(errores['destino.numero']);
    assert.ok(errores['destino.descripcion']);
});

test('convierte decimales, limpia espacios y envía solo los atributos admitidos por CrearMiEnvioRequestDto', () => {
    const datos = { ...formularioValido(), clienteId: 'no-se-debe-enviar', tarifa: 123 };
    datos.origen.extra = 'no-se-debe-enviar';
    assert.deepEqual(validarFormulario(datos), {});
    const peticion = crearPeticion(datos);
    assert.equal(peticion.peso, 2.5);
    assert.equal(peticion.origen.calle, 'San Martín');
    assert.deepEqual(Object.keys(peticion), ['peso', 'ancho', 'alto', 'largo', 'origen', 'destino']);
    assert.equal(peticion.origen.extra, undefined);
    assert.notEqual(peticion.origen, peticion.destino);
});

test('cada formulario nuevo tiene direcciones independientes', () => {
    const datos = nuevoFormulario();
    datos.origen.calle = 'Otra calle';
    assert.equal(datos.destino.calle, '');
    assert.equal(nuevoFormulario().origen.calle, '');
});
