import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteRegistroSchema, sanitizarDatosRegistro } from '../contracts/clienteRegistroContract';
import { DEMO_HABILITADO } from '../demo/entorno';
import { entrarDemo } from '../demo/runtime';
import { useDemo } from '../demo/useDemo';
import { obtenerSesion } from '../auth/session';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/portal/Icon';

export default function RegistroCliente() {
    const navigate = useNavigate();
    const demo = useDemo();
    const authContext = useAuth();
    const [serverError, setServerError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [exito, setExito] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(clienteRegistroSchema),
        defaultValues: {
            nombre: '',
            dni: '',
            telefono: '+54',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    if (demo || obtenerSesion()) return <Navigate to="/" replace />;

    const onSubmit = async (data) => {
        setServerError('');
        setCargando(true);

        const datosLimpios = sanitizarDatosRegistro(data);

        if (authContext?.registerClient) {
            const result = await authContext.registerClient(datosLimpios);
            setCargando(false);
            if (result.success) {
                setExito(true);
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setServerError(result.error || 'Ocurrió un error al procesar el registro del cliente.');
            }
        } else {
            setCargando(false);
            setServerError('El servicio de registro y autenticación no está disponible.');
        }
    };

    return (
        <main className="login-page">
            <section className="login-card" style={{ maxWidth: '620px' }}>
                <span className="brand-mark"><Icon size={30} /></span>
                <p className="eyebrow">LOGITRACK · PORTAL DE CLIENTES</p>
                <h1>Registro de Nuevos Clientes</h1>
                <p>Creá tu cuenta para gestionar tus paquetes, calcular tarifas y seguir envíos en tiempo real.</p>

                {exito && (
                    <div
                        className="notice"
                        role="status"
                        style={{
                            background: '#f0fdf4',
                            borderColor: '#86efac',
                            color: '#166534',
                            marginBottom: '16px',
                            padding: '14px',
                            borderRadius: '8px',
                            border: '1px solid #86efac'
                        }}
                    >
                        <strong>¡Registro completado con éxito!</strong>
                        <p style={{ margin: '4px 0 0' }}>Iniciando tu sesión de cliente...</p>
                    </div>
                )}

                {serverError && (
                    <div
                        className="notice"
                        role="alert"
                        style={{
                            background: '#fef2f2',
                            borderColor: '#fca5a5',
                            color: '#b91c1c',
                            marginBottom: '16px',
                            padding: '14px',
                            borderRadius: '8px',
                            border: '1px solid #fca5a5'
                        }}
                    >
                        <strong>Error en el registro:</strong>
                        <p style={{ margin: '4px 0 0' }}>{serverError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} style={{ textAlign: 'left', margin: '20px 0' }}>
                    <div style={{ marginBottom: '14px' }}>
                        <label htmlFor="reg-nombre">Nombre Completo o Razón Social *</label>
                        <input
                            id="reg-nombre"
                            type="text"
                            placeholder="Ej. Distribuidora Gómez o Martín Rodríguez"
                            aria-invalid={errors.nombre ? 'true' : 'false'}
                            {...register('nombre')}
                        />
                        {errors.nombre && (
                            <span style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.nombre.message}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div>
                            <label htmlFor="reg-dni">DNI / Documento *</label>
                            <input
                                id="reg-dni"
                                type="text"
                                placeholder="Ej. 35123456"
                                maxLength={8}
                                aria-invalid={errors.dni ? 'true' : 'false'}
                                {...register('dni')}
                            />
                            {errors.dni ? (
                                <span style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                    {errors.dni.message}
                                </span>
                            ) : (
                                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                                    7 u 8 dígitos numéricos sin puntos
                                </small>
                            )}
                        </div>

                        <div>
                            <label htmlFor="reg-telefono">Teléfono de Contacto (E.164) *</label>
                            <input
                                id="reg-telefono"
                                type="tel"
                                placeholder="+5491123456789"
                                aria-invalid={errors.telefono ? 'true' : 'false'}
                                {...register('telefono')}
                            />
                            {errors.telefono ? (
                                <span style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                    {errors.telefono.message}
                                </span>
                            ) : (
                                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                                    Incluir prefijo +54 (Argentina)
                                </small>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                        <label htmlFor="reg-email">Correo Electrónico *</label>
                        <input
                            id="reg-email"
                            type="email"
                            placeholder="cliente@correo.com"
                            aria-invalid={errors.email ? 'true' : 'false'}
                            {...register('email')}
                        />
                        {errors.email ? (
                            <span style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.email.message}
                            </span>
                        ) : (
                            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                                Este email será tu usuario de acceso y vínculo de perfil
                            </small>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                        <div>
                            <label htmlFor="reg-password">Contraseña *</label>
                            <input
                                id="reg-password"
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

                        <div>
                            <label htmlFor="reg-confirmPassword">Confirmar Contraseña *</label>
                            <input
                                id="reg-confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                                {...register('confirmPassword')}
                            />
                            {errors.confirmPassword && (
                                <span style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        className="button"
                        type="submit"
                        disabled={cargando || exito}
                        style={{ width: '100%', padding: '12px 18px', fontSize: '1rem' }}
                    >
                        {cargando ? 'Registrando cuenta de cliente...' : 'Crear Cuenta de Cliente'}
                    </button>
                </form>

                <div style={{ margin: '20px 0 0', textAlign: 'center', fontSize: '0.9rem', color: '#475569' }}>
                    ¿Ya tenés una cuenta en LogiTrack?{' '}
                    <Link to="/login" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}>
                        Iniciá sesión acá
                    </Link>
                </div>

                {DEMO_HABILITADO && (
                    <div className="demo-login" style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                            className="button"
                            type="button"
                            onClick={() => {
                                entrarDemo();
                                navigate('/');
                            }}
                        >
                            Entrar en modo demostración<Icon name="arrow" />
                        </button>
                        <p>Explorá el portal sin registrar datos reales.</p>
                    </div>
                )}
            </section>
        </main>
    );
}

