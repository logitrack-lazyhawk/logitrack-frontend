export default function Card({ children, className = "", title, subtitle, action }) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200/80 shadow-xs transition-shadow hover:shadow-sm ${className}`}>
            {(title || subtitle || action) && (
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}

