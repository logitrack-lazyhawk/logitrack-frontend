import { Navigate, useNavigate } from 'react-router-dom';
import { DEMO_HABILITADO } from '../demo/entorno';
import { entrarDemo } from '../demo/runtime';
import { useDemo } from '../demo/useDemo';
import { obtenerSesion } from '../auth/session';
import Icon from '../components/portal/Icon';

export default function Login() {
    const navigate = useNavigate();
    const demo = useDemo();
    if (demo || obtenerSesion()) return <Navigate to="/" replace />;
    return (
        <main className="login-page">
            <section className="login-card">
                <span className="brand-mark"><Icon size={30} /></span>
                <p className="eyebrow">LOGITRACK · LAZYHAWK</p>
                <h1>Tu próximo envío empieza acá.</h1>
                <p>Creá tus envíos y acompañá cada paquete hasta su destino.</p>
                {DEMO_HABILITADO && (
                    <div className="demo-login">
                        <button className="button" type="button" onClick={() => {
                            entrarDemo();
                            navigate('/');
                        }}>Entrar en modo demostración<Icon name="arrow" /></button>
                        <p>Explorá el portal con envíos ficticios. No necesitás una cuenta ni se registran operaciones reales.</p>
                    </div>
                )}
                <div className="notice" role="status">
                    <strong>Acceso en integración</strong>
                    <p>El inicio de sesión con Keycloak todavía no está conectado a esta interfaz. Necesitás una sesión real para ingresar. Consultá al equipo para habilitar tu acceso.</p>
                </div>
            </section>
        </main>
    );
}
