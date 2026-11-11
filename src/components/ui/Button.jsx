export default function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    onClick,
    disabled = false,
    className = "",
    icon: Icon,
}) {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus:ring-blue-500",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs focus:ring-slate-400",
        danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500",
        outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
        success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500",
    };

    const sizes = {
        sm: "px-2.5 py-1.5 text-xs font-medium rounded-lg gap-1.5",
        md: "px-4 py-2 text-sm font-medium rounded-lg gap-2",
        lg: "px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center font-medium transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            {children}
        </button>
    );
}

