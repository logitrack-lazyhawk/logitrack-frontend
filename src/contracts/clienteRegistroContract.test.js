import test from 'node:test';
import assert from 'node:assert/strict';
import { clienteRegistroSchema, sanitizarDatosRegistro } from './clienteRegistroContract.js';

test('valida un registro de cliente correcto', () => {
    const datosValidos = {
        nombre: 'Carlos Tevez',
        dni: '32123456',
        telefono: '+5491133445566',
        email: 'carlos.tevez@logitrack.com',
        password: 'password123',
        confirmPassword: 'password123',
    };

    const parsed = clienteRegistroSchema.safeParse(datosValidos);
    assert.equal(parsed.success, true);
});

test('rechaza contraseñas que no coinciden', () => {
    const datosInvalidos = {
        nombre: 'Carlos Tevez',
        dni: '32123456',
        telefono: '+5491133445566',
        email: 'carlos.tevez@logitrack.com',
        password: 'password123',
        confirmPassword: 'otraPassword',
    };

    const parsed = clienteRegistroSchema.safeParse(datosInvalidos);
    assert.equal(parsed.success, false);
    const issue = parsed.error.issues.find(i => i.path.includes('confirmPassword'));
    assert.equal(issue?.message, 'Las contraseñas no coinciden');
});

test('rechaza teléfono que no cumple formato E.164 +54', () => {
    const datos = {
        nombre: 'Carlos Tevez',
        dni: '32123456',
        telefono: '1133445566',
        email: 'carlos@logitrack.com',
        password: 'password123',
        confirmPassword: 'password123',
    };

    const parsed = clienteRegistroSchema.safeParse(datos);
    assert.equal(parsed.success, false);
    const issue = parsed.error.issues.find(i => i.path.includes('telefono'));
    assert.match(issue?.message, /E\.164/);
});

test('rechaza DNI con formato inválido o caracteres no numéricos', () => {
    const datos = {
        nombre: 'Carlos Tevez',
        dni: '32.123.456',
        telefono: '+5491133445566',
        email: 'carlos@logitrack.com',
        password: 'password123',
        confirmPassword: 'password123',
    };

    const parsed = clienteRegistroSchema.safeParse(datos);
    assert.equal(parsed.success, false);
    const issue = parsed.error.issues.find(i => i.path.includes('dni'));
    assert.match(issue?.message, /DNI/);
});

test('sanitizarDatosRegistro limpia espacios, formatea email y remueve caracteres no numéricos del DNI', () => {
    const resultado = sanitizarDatosRegistro({
        nombre: '  Juan Pérez  ',
        dni: ' 35.123.456 ',
        telefono: ' +5491122334455 ',
        email: '  JUAN@LOGITRACK.COM  ',
        password: ' miPassword ',
    });

    assert.equal(resultado.nombre, 'Juan Pérez');
    assert.equal(resultado.dni, '35123456');
    assert.equal(resultado.telefono, '+5491122334455');
    assert.equal(resultado.email, 'juan@logitrack.com');
    assert.equal(resultado.password, 'miPassword');
});

