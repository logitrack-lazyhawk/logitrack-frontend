import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Truck, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo electrónico es obligatorio")
        .email("Ingresa un correo electrónico válido"),
    password: z
        .string()
        .min(4, "La contraseña debe tener al menos 4 caracteres"),
});

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [serverError, setServerError] = useState("");
    const [cargando, setCargando] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "admin@logitrack.com",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        setServerError("");
        setCargando(true);
        const result = await login(data.email, data.password);
        setCargando(false);

        if (result.success) {
            navigate("/");
        } else {
            setServerError(result.error);
        }
    };

    const handleDemoLogin = async (rol) => {
        setServerError("");
        setCargando(true);
        const result = await login(`${rol.toLowerCase()}@logitrack.com`, "demo123", rol);
        setCargando(false);
        if (result.success) {
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md">
                {/* Logo y Encabezado */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4">
                        <Truck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Logi<span className="text-blue-500">Track</span> Backoffice
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Plataforma de Operaciones y Logística Integral
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">Iniciar Sesión</h2>

                    {serverError && (
                        <div className="p-3 mb-5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            placeholder="usuario@logitrack.com"
                            error={errors.email?.message}
                            {...register("email")}
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register("password")}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={cargando}
                                className="w-full"
                                icon={ArrowRight}
                            >
                                {cargando ? "Iniciando sesión..." : "Ingresar al Panel"}
                            </Button>
                        </div>
                    </form>

                    {/* Acceso Rápido / Roles Demo para Desarrollo y Pruebas */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
                            Acceso Rápido de Prueba (Demo RBAC)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleDemoLogin("ADMIN")}
                                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                Como Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin("REPARTIDOR")}
                                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                                <Truck className="w-3.5 h-3.5 text-cyan-600" />
                                Como Repartidor
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin("CLIENTE")}
                                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Como Cliente
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin("VENDEDOR")}
                                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                                <Mail className="w-3.5 h-3.5 text-purple-600" />
                                Como Vendedor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
