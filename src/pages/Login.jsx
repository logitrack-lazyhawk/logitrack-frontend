import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Truck, ArrowRight, ShieldCheck, AlertCircle, KeyRound, User, Lock } from "lucide-react";
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
        .min(1, "La contraseña es obligatoria"),
});

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [serverError, setServerError] = useState("");
    const [cargando, setCargando] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
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
            setServerError(result.error || "No se pudo iniciar sesión.");
        }
    };

    const rellenarCredencial = (email, pass) => {
        setValue("email", email, { shouldValidate: true });
        setValue("password", pass, { shouldValidate: true });
        setServerError("");
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

                {/* Tarjeta del Formulario */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800 mb-2">Iniciar Sesión</h2>
                    <p className="text-xs text-slate-500 mb-6">
                        Ingresa tus credenciales autorizadas para acceder al panel.
                    </p>

                    {serverError && (
                        <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{serverError}</span>
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
                                {cargando ? "Verificando credenciales..." : "Ingresar al Panel"}
                            </Button>
                        </div>
                    </form>

                    {/* Guía de Cuentas Autorizadas */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 justify-center mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Cuentas Autorizadas (Click para autocompletar)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => rellenarCredencial("admin@logitrack.com", "admin123")}
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer group"
                            >
                                <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-600">
                                    Administrador
                                </span>
                                <span className="block text-[11px] text-slate-500 truncate">
                                    admin@logitrack.com
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => rellenarCredencial("repartidor@logitrack.com", "repartidor123")}
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer group"
                            >
                                <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-600">
                                    Repartidor
                                </span>
                                <span className="block text-[11px] text-slate-500 truncate">
                                    repartidor@logitrack.com
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => rellenarCredencial("cliente@logitrack.com", "cliente123")}
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer group"
                            >
                                <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-600">
                                    Cliente
                                </span>
                                <span className="block text-[11px] text-slate-500 truncate">
                                    cliente@logitrack.com
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => rellenarCredencial("vendedor@logitrack.com", "vendedor123")}
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer group"
                            >
                                <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-600">
                                    Vendedor
                                </span>
                                <span className="block text-[11px] text-slate-500 truncate">
                                    vendedor@logitrack.com
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
