import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Toast from '../components/Toast';
import Icon from '../components/portal/Icon';
import { cerrarSesion, obtenerSesion } from '../auth/session';
import { useDemo } from '../demo/useDemo';
import { salirDemo } from '../demo/runtime';

export default function Layout() {
    const navigate = useNavigate();
    const [toast, setToast] = useState({ message: '', type: 'error' });
    const demo = useDemo();
    const sesion = demo ? null : obtenerSesion();
    const admin = !demo && sesion.roles.includes('ADMIN');
    const cliente = demo || (!admin && sesion.roles.includes('CLIENTE'));
    const links = admin
        ? [['/', 'Inicio', 'home'], ['/envios', 'Envíos', 'box'], ['/repartidores', 'Repartidores', 'truck']]
        : cliente
            ? [['/', 'Inicio', 'home'], ['/mis-envios', 'Mis envíos', 'box'], ['/crear-envio', 'Crear envío', 'plus']]
            : [['/', 'Inicio', 'home']];

    function salir() {
        if (demo) salirDemo();
        else cerrarSesion();
        navigate('/login');
    }

    return (
        <div className={admin ? 'app-shell backoffice' : 'app-shell portal'}>
            <a className="skip-link" href="#contenido">Ir al contenido</a>
            <Toast message={toast.message} type={toast.type}
                onClose={() => setToast({ ...toast, message: '' })} />
            <header className="site-header">
                <NavLink to="/" className="brand" aria-label="LogiTrack, inicio">
                    <span className="brand-mark"><Icon name="box" size={25} /></span>
                    <span>Logi<span className="brand-accent">Track</span><small>BY LAZYHAWK</small></span>
                </NavLink>
                <nav className="site-nav" aria-label="Navegación principal">
                    {links.map(([to, label, icon]) => (
                        <NavLink key={to} to={to} end={to === '/'}>
                            <Icon name={icon} />{label}
                        </NavLink>
                    ))}
                </nav>
                <button className="logout-button" onClick={salir} aria-label={demo ? 'Salir de la demostración' : 'Cerrar sesión'}>
                    <Icon name="logout" /><span>{demo ? 'Salir de la demostración' : 'Cerrar sesión'}</span>
                </button>
            </header>
            {demo && (
                <aside className="demo-banner" aria-label="Modo demostración">
                    <strong>Modo demostración</strong>
                    <span>Datos ficticios. Tus cambios se conservan hasta recargar la página.</span>
                </aside>
            )}
            <div className="context-bar">
                <span>{admin ? 'Backoffice' : 'Tu portal de envíos'}</span>
                <span>{demo ? 'Cliente de demostración' : sesion.nombre}</span>
            </div>
            <main id="contenido" className="site-main" tabIndex={-1}>
                <Outlet context={{ showToast: (message, type = 'error') => setToast({ message, type }) }} />
            </main>
            <footer className="site-footer">
                <span>LogiTrack <strong>·</strong> LazyHawk</span>
                <span>{admin ? 'Administración de operaciones' : 'Cada envío, más cerca.'}</span>
            </footer>
        </div>
    );
}
