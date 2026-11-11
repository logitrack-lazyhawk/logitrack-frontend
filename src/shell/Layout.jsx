import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    Truck,
    Users,
    ShoppingBag,
    PlayCircle,
    LogOut,
    Menu,
    X,
    UserCircle,
    ShieldAlert,
    Boxes
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import Badge from "../components/ui/Badge";

export default function Layout() {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "error" });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Estructura de navegación con control RBAC
    const navItems = [
        {
            to: "/",
            label: "Dashboard",
            icon: LayoutDashboard,
            roles: ["ADMIN", "REPARTIDOR", "CLIENTE", "VENDEDOR"],
            exact: true,
        },
        {
            to: "/envios",
            label: "Gestión de Envíos",
            icon: Package,
            roles: ["ADMIN"],
        },
        {
            to: "/mis-envios",
            label: "Mis Envíos",
            icon: Boxes,
            roles: ["CLIENTE", "ADMIN", "REPARTIDOR"],
        },
        {
            to: "/repartidores",
            label: "Flota de Repartidores",
            icon: Truck,
            roles: ["ADMIN"],
        },
        {
            to: "/clientes",
            label: "Directorio de Clientes",
            icon: Users,
            roles: ["ADMIN"],
            badge: "Híbrido",
        },
        {
            to: "/comercio",
            label: "Módulo Comercial",
            icon: ShoppingBag,
            roles: ["ADMIN", "VENDEDOR"],
        },
        {
            to: "/play",
            label: "LazyHawk Play",
            icon: PlayCircle,
            roles: ["ADMIN", "REPARTIDOR", "CLIENTE", "VENDEDOR"],
        },
    ];

    const allowedNavItems = navItems.filter((item) => hasRole(item.roles));

    // Determina el título actual en base a la ruta
    const currentItem = navItems.find((item) =>
        item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    const pageTitle = currentItem?.label || "Panel de Control";

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Componente Toast Global */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, message: "" })}
            />

            {/* Backdrop para dispositivos móviles */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar / Barra Lateral de Navegación */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-0 max-lg:-translate-x-full"
                }`}
            >
                <div>
                    {/* Brand / Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
                                L
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">
                                Logi<span className="text-blue-400">Track</span>
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Menú de navegación */}
                    <nav className="p-4 space-y-1">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Administración
                        </div>
                        {allowedNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.exact}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                                        }`
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-4 h-4 shrink-0 opacity-80" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Perfil en la base del sidebar */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
                    <div className="flex items-center gap-3 px-2 py-2 mb-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                                {user?.email || "Usuario"}
                            </p>
                            <div className="mt-0.5">
                                <Badge variant={user?.rol || "default"} size="sm">
                                    {user?.rol || "INVITADO"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Superior */}
                <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            {pageTitle}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Sistema Online</span>
                        </div>
                    </div>
                </header>

                {/* Área de Visualización */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet
                            context={{
                                showToast: (msg, type = "error") =>
                                    setToast({ message: msg, type }),
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
