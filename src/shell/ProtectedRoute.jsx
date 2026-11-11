import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { obtenerSesion, rutaPermitida } from '../auth/session';
import { useDemo } from '../demo/useDemo';

export default function ProtectedRoute({ roles = [] }) {
    const [revision, setRevision] = useState(0);
    const location = useLocation();
    const demo = useDemo();
    const sesion = demo ? null : obtenerSesion();
    const expira = sesion?.expira;
    useEffect(() => {
        const revisar = () => setRevision(valor => valor + 1);
        window.addEventListener('storage', revisar);
        window.addEventListener('logitrack:sesion', revisar);
        const timer = expira ? setTimeout(revisar, Math.min(Math.max(expira - Date.now(), 0) + 25, 2147483647)) : null;
        return () => {
            window.removeEventListener('storage', revisar);
            window.removeEventListener('logitrack:sesion', revisar);
            clearTimeout(timer);
        };
    }, [expira, revision]);
    if (demo) {
        return !roles.length || roles.includes('CLIENTE') ? <Outlet context={useOutletContext()} /> : <Navigate to="/" replace />;
    }
    if (!sesion) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    if (!rutaPermitida(sesion, roles)) return <Navigate to="/" replace />;
    return <Outlet context={useOutletContext()} />;
}
