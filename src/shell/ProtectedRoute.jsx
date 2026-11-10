import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    // Verificamos si existe un token en el navegador
    const isAuthenticated = !!localStorage.getItem("token");

    // Si NO está autenticado, lo redirigimos al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, mostramos la ruta que quería ver (Outlet)
    return <Outlet />;
}