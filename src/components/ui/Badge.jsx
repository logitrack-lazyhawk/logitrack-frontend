export default function Badge({ children, variant = "default", size = "md" }) {
    const variants = {
        default: "bg-slate-100 text-slate-800 border-slate-200",
        primary: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-rose-50 text-rose-700 border-rose-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        // Estados específicos de negocio
        PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
        EN_TRANSITO: "bg-blue-50 text-blue-700 border-blue-200",
        ENTREGADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
        CANCELADO: "bg-rose-50 text-rose-700 border-rose-200",
        ACTIVO: "bg-emerald-50 text-emerald-700 border-emerald-200",
        INACTIVO: "bg-slate-100 text-slate-600 border-slate-200",
        ADMIN: "bg-indigo-50 text-indigo-700 border-indigo-200",
        REPARTIDOR: "bg-cyan-50 text-cyan-700 border-cyan-200",
        CLIENTE: "bg-emerald-50 text-emerald-700 border-emerald-200",
        VENDEDOR: "bg-purple-50 text-purple-700 border-purple-200",
    };

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs font-medium",
        lg: "px-3 py-1.5 text-sm font-semibold",
    };

    const appliedVariant = variants[variant] || variants.default;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${appliedVariant} ${sizeClasses[size]}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
            {children}
        </span>
    );
}
