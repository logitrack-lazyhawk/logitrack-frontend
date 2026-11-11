import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Package,
    Truck,
    Users,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Plus,
    ShoppingBag,
    TrendingUp,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user } = useAuth();
    const [cargando, setCargando] = useState(true);
    const [metricas, setMetricas] = useState({
        totalEnvios: 0,
        pendientes: 0,
        enTransito: 0,
        entregados: 0,
        cancelados: 0,
        totalRepartidores: 0,
        repartidoresActivos: 0,
        totalClientes: 0,
        ultimosEnvios: [],
    });

    useEffect(() => {
        let isMounted = true;

        async function cargarDatosDashboard() {
            setCargando(true);
            try {
                // Ejecutamos consultas en paralelo
                const [resEnvios, resRepartidores, resClientes] = await Promise.allSettled([
                    axiosClient.get("/api/v1/envios"),
                    axiosClient.get("/api/v1/repartidores"),
                    axiosClient.get("/api/v1/clientes"),
                ]);

                if (!isMounted) return;

                // Procesamiento de Envíos
                let envios = [];
                if (resEnvios.status === "fulfilled") {
                    const data = resEnvios.value.data;
                    envios = Array.isArray(data) ? data : data?.content || [];
                }

                // Procesamiento de Repartidores
                let repartidores = [];
                if (resRepartidores.status === "fulfilled") {
                    const data = resRepartidores.value.data;
                    repartidores = Array.isArray(data) ? data : data?.content || [];
                }

                // Procesamiento de Clientes
                let clientes = [];
                if (resClientes.status === "fulfilled") {
                    const data = resClientes.value.data;
                    clientes = Array.isArray(data) ? data : data?.content || [];
                }

                const pendientes = envios.filter((e) => e.estado === "PENDIENTE").length;
                const enTransito = envios.filter((e) => e.estado === "EN_TRANSITO").length;
                const entregados = envios.filter((e) => e.estado === "ENTREGADO").length;
                const cancelados = envios.filter((e) => e.estado === "CANCELADO").length;
                const activos = repartidores.filter((r) => r.estado === "ACTIVO").length;

                setMetricas({
                    totalEnvios: envios.length,
                    pendientes,
                    enTransito,
                    entregados,
                    cancelados,
                    totalRepartidores: repartidores.length,
                    repartidoresActivos: activos,
                    totalClientes: clientes.length,
                    ultimosEnvios: envios.slice(0, 5),
                });
            } catch (err) {
                console.error("Error al cargar métricas del Dashboard:", err);
            } finally {
                if (isMounted) setCargando(false);
            }
        }

        cargarDatosDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    const porcentajeCompletado = metricas.totalEnvios > 0
        ? Math.round((metricas.entregados / metricas.totalEnvios) * 100)
        : 0;

    return (
        <div className="space-y-8">
            {/* Bienvenida y Resumen Ejecutivo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Panel de Control Operativo
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Bienvenido de nuevo, <span className="font-semibold text-slate-700">{user?.email}</span>. Estado del sistema en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/envios">
                        <Button variant="primary" icon={Plus}>
                            Gestionar Envíos
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Fila de Tarjetas de Métricas Principales (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Envíos */}
                <Card className="border-l-4 border-l-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Total Envíos
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {cargando ? "..." : metricas.totalEnvios}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                                <span>Volumen total registrado</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                {/* Pendientes de Asignación */}
                <Card className="border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Pendientes
                            </p>
                            <h3 className="text-2xl font-bold text-amber-600 mt-1">
                                {cargando ? "..." : metricas.pendientes}
                            </h3>
                            <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Requieren repartidor</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                {/* En Tránsito */}
                <Card className="border-l-4 border-l-cyan-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                En Tránsito
                            </p>
                            <h3 className="text-2xl font-bold text-cyan-700 mt-1">
                                {cargando ? "..." : metricas.enTransito}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-cyan-500" />
                                <span>En curso hacia destino</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                            <Truck className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                {/* Flota Activa */}
                <Card className="border-l-4 border-l-emerald-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Flota Disponible
                            </p>
                            <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                                {cargando ? "..." : `${metricas.repartidoresActivos} / ${metricas.totalRepartidores}`}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Repartidores activos
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Barra de Distribución y Resumen Operativo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card
                    title="Distribución Operativa del Flujo Logístico"
                    subtitle="Estado actual de los paquetes en la plataforma"
                    className="lg:col-span-2"
                >
                    <div className="space-y-4">
                        {/* Barra compuesta */}
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            {metricas.totalEnvios > 0 ? (
                                <>
                                    <div
                                        style={{ width: `${(metricas.entregados / metricas.totalEnvios) * 100}%` }}
                                        className="bg-emerald-500 transition-all duration-500"
                                        title={`Entregados: ${metricas.entregados}`}
                                    />
                                    <div
                                        style={{ width: `${(metricas.enTransito / metricas.totalEnvios) * 100}%` }}
                                        className="bg-cyan-500 transition-all duration-500"
                                        title={`En Tránsito: ${metricas.enTransito}`}
                                    />
                                    <div
                                        style={{ width: `${(metricas.pendientes / metricas.totalEnvios) * 100}%` }}
                                        className="bg-amber-400 transition-all duration-500"
                                        title={`Pendientes: ${metricas.pendientes}`}
                                    />
                                    <div
                                        style={{ width: `${(metricas.cancelados / metricas.totalEnvios) * 100}%` }}
                                        className="bg-rose-400 transition-all duration-500"
                                        title={`Cancelados: ${metricas.cancelados}`}
                                    />
                                </>
                            ) : (
                                <div className="w-full bg-slate-200" />
                            )}
                        </div>

                        {/* Leyenda */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                                <span className="text-xs text-slate-600">
                                    Entregados ({metricas.entregados})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                                <span className="text-xs text-slate-600">
                                    En Tránsito ({metricas.enTransito})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                                <span className="text-xs text-slate-600">
                                    Pendientes ({metricas.pendientes})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-400 shrink-0" />
                                <span className="text-xs text-slate-600">
                                    Cancelados ({metricas.cancelados})
                                </span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mt-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">
                                    Efectividad de Entrega
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Porcentaje de paquetes finalizados exitosamente.
                                </p>
                            </div>
                            <span className="text-xl font-black text-emerald-600">
                                {porcentajeCompletado}%
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Accesos Rápidos */}
                <Card title="Accesos Rápidos" subtitle="Acciones operativas frecuentes">
                    <div className="space-y-3">
                        <Link
                            to="/envios"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Asignar Paquetes
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Revisar envíos pendientes
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            to="/repartidores"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                    <Truck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Flota de Repartidores
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Ver disponibilidad y choferes
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            to="/clientes"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Directorio Clientes
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Modelo Híbrido Keycloak
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            to="/comercio"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Módulo Comercial
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Órdenes, pagos y productos
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Tabla de Envíos Recientes */}
            <Card
                title="Últimos Envíos Registrados"
                subtitle="Monitoreo de los paquetes más recientes"
                action={
                    <Link to="/envios" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                        Ver todos los envíos &rarr;
                    </Link>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Tracking</th>
                                <th className="px-4 py-3">Destino</th>
                                <th className="px-4 py-3">Peso</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargando ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                                        Cargando envíos recientes...
                                    </td>
                                </tr>
                            ) : metricas.ultimosEnvios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                                        No hay envíos registrados recientemente.
                                    </td>
                                </tr>
                            ) : (
                                metricas.ultimosEnvios.map((env) => (
                                    <tr key={env.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900">
                                            {env.codigoSeguimiento || env.id?.slice(0, 8)}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {env.destino ? `${env.destino.ciudad || ""} (${env.destino.calle || ""})` : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-xs">{env.peso ? `${env.peso} kg` : "-"}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={env.estado || "PENDIENTE"} size="sm">
                                                {env.estado || "PENDIENTE"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                to="/envios"
                                                className="text-xs font-medium text-blue-600 hover:underline"
                                            >
                                                Detalles
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
