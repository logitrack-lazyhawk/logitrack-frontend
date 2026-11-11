import { forwardRef } from "react";

const Input = forwardRef(function Input(
    { label, error, helperText, className = "", id, ...props },
    ref
) {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                ref={ref}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-offset-1 ${
                    error
                        ? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200"
                        : "border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-blue-100"
                } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
            {helperText && !error && (
                <p className="mt-1 text-xs text-slate-500">{helperText}</p>
            )}
        </div>
    );
});

export default Input;
