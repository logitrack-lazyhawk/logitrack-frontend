import * as z from 'zod';

export const clienteRegistroSchema = z.object({
    nombre: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'Máximo 100 caracteres'),
    dni: z
        .string()
        .regex(/^\d{7,8}$/, 'El DNI debe contener 7 u 8 dígitos numéricos sin puntos'),
    telefono: z
        .string()
        .regex(
            /^\+54\d{8,11}$/,
            'Formato internacional E.164 requerido (ej: +5491123456789)'
        ),
    email: z
        .string()
        .email('Debe ser un correo electrónico válido')
        .max(150, 'Máximo 150 caracteres'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z
        .string()
        .min(6, 'Debes confirmar la contraseña'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export function sanitizarDatosRegistro(datos) {
    return {
        nombre: String(datos.nombre || '').trim(),
        dni: String(datos.dni || '').trim().replace(/\D/g, ''),
        telefono: String(datos.telefono || '').trim(),
        email: String(datos.email || '').trim().toLowerCase(),
        password: String(datos.password || '').trim(),
    };
}

