import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DEMO_HABILITADO } from '../demo/entorno';
import { entrarDemo } from '../demo/runtime';
import { useDemo } from '../demo/useDemo';
import { obtenerSesion } from '../auth/session';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/portal/Icon';

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Ingresa un correo electrónico válido'),
    password: z
        .string()
        .min(1, 'La contraseña es obligatoria'),
});

export default function Login() {
    const navigate = useNavigate();
    const demo = useDemo();
    const authContext = useAuth();
    const [serverError, setServerError] = useState('');
    const [cargando, setCargando] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    if (demo || obtenerSesion()) return <Navigate to="/" replace />;

    const onSubmit = async (data) => {
        setServerError('');
        setCargando(true);
        if (authContext?.login) {
            const result = await authContext.login(data.email, data.password);
            setCargando(false);
            if (result.success) {
                navigate('/');
            } else {
                setServerError(result.error || 'No se pudo iniciar sesión.');
            }
        } else {
            setCargando(false);
            setServerError('El servicio de autenticación no está disponible.');
        }
    };

    const rellenarCredencial = (email, pass) => {
        setValue('email', email, { shouldValidate: true });
        setValue('password', pass, { shouldValidate: true });
        setServerError('');
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <span className="brand-mark"><Icon size={30} /></span>
                <p className="eyebrow">LOGITRACK · LAZYHAWK</p>
                <h1>Tu próximo envío empieza acá.</h1>
                <p>Creá tus envíos y acompañá cada paquete hasta su destino.</p>

                {serverError && (
                    <div className="notice" role="alert" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c', marginBottom: '16px' }}>
                        <strong>Error al ingresar:</strong>
                        <p>{serverError}</p>
                    </div>
                )}

                {/* Formulario de Login funcional con API Gateway / Keycloak */}
                <form onSubmit={handleSubmit(onSubmit)} style={{ textAlign: 'left', margin: '20px 0' }}>
                    <div style={{ marginBottom: '14px' }}>
                        <label htmlFor="login-email">Correo Electrónico</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="usuario@logitrack.com"
                            aria-invalid={errors.email ? 'true' : 'false'}
                            {...register('email')}
                        />
                        {errors.email && (
                            <span style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label htmlFor="login-password">Contraseña</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            aria-invalid={errors.password ? 'true' : 'false'}
                            {...register('password')}
                        />
                        {errors.password && (
                            <span style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.password.message}
                            </span>
                        )}
                    </div>

                    <button className="button" type="submit" disabled={cargando} style={{ width: '100%' }}>
                        {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Enlace para registro de nuevos clientes */}
                <div style={{ margin: '14px 0 18px', textAlign: 'center', fontSize: '0.9rem', color: '#475569' }}>
                    ¿Sos un nuevo cliente y no tenés cuenta?{' '}
                    <Link to="/registro" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}>
                        Registrate acá
                    </Link>
                </div>

                {/* Acceso rápido a credenciales del Realm */}
                <div style={{ margin: '18px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#475569' }}>Cuentas del Realm (Click para autocompletar):</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <button type="button" onClick={() => rellenarCredencial('admin@logitrack.com', 'admin123')} style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
                            <strong>Admin</strong><br/><span style={{ color: '#64748b' }}>admin@...</span>
                        </button>
                        <button type="button" onClick={() => rellenarCredencial('cliente@logitrack.com', 'cliente123')} style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
                            <strong>Cliente</strong><br/><span style={{ color: '#64748b' }}>cliente@...</span>
                        </button>
                        <button type="button" onClick={() => rellenarCredencial('repartidor@logitrack.com', 'repartidor123')} style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
                            <strong>Repartidor</strong><br/><span style={{ color: '#64748b' }}>repartidor@...</span>
                        </button>
                        <button type="button" onClick={() => rellenarCredencial('vendedor@logitrack.com', 'vendedor123')} style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
                            <strong>Vendedor</strong><br/><span style={{ color: '#64748b' }}>vendedor@...</span>
                        </button>
                    </div>
                </div>

                {DEMO_HABILITADO && (
                    <div className="demo-login">
                        <button className="button" type="button" onClick={() => {
                            entrarDemo();
                            navigate('/');
                        }}>Entrar en modo demostración<Icon name="arrow" /></button>
                        <p>Explorá el portal con envíos ficticios. No necesitás una cuenta ni se registran operaciones reales.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
