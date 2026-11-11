import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, loading, hasRole } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Cargando sesión...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">403</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Acceso Denegado</h2>
                <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
                    Tu rol actual no tiene los permisos necesarios para acceder a este módulo del sistema.
                </p>
            </div>
        );
    }

    return <Outlet />;
}
