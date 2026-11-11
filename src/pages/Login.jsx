import { Navigate } from 'react-router-dom';
import { obtenerSesion } from '../auth/session';
import Icon from '../components/portal/Icon';

export default function Login() {
    if (obtenerSesion()) return <Navigate to="/" replace />;
    return (
        <main className="login-page">
            <section className="login-card">
                <span className="brand-mark"><Icon size={30} /></span>
                <p className="eyebrow">LOGITRACK · LAZYHAWK</p>
                <h1>Tu próximo envío empieza acá.</h1>
                <p>Creá tus envíos y acompañá cada paquete hasta su destino.</p>
                <div className="notice" role="status">
                    <strong>Acceso en integración</strong>
                    <p>El inicio de sesión con Keycloak todavía no está conectado a esta interfaz. Necesitás una sesión real para ingresar. Consultá al equipo para habilitar tu acceso.</p>
                </div>
            </section>
        </main>
    );
}
