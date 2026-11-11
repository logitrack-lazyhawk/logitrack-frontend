import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { obtenerSesion, rutaPermitida } from '../auth/session';

export default function ProtectedRoute({ roles = [] }) {
    const [revision, setRevision] = useState(0);
    const location = useLocation();
    const sesion = obtenerSesion();
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
    if (!sesion) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    if (!rutaPermitida(sesion, roles)) return <Navigate to="/" replace />;
    return <Outlet />;
}
