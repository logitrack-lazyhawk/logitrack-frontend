import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
    Package,
    Plus,
    Search,
    RefreshCw,
    Truck,
    CheckCircle2,
    XCircle,
    ArrowRight,
    MapPin,
    AlertCircle,
    Ban,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EnvioFormModal from "../components/envios/EnvioFormModal";
import AsignarRepartidorModal from "../components/envios/AsignarRepartidorModal";
import EnvioCardWeb from "../components/EnvioCardWeb.jsx";

export default function Envios() {
    const { showToast } = useOutletContext();
    const [envios, setEnvios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [busquedaTracking, setBusquedaTracking] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);

    // Modales
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
    const [envioParaAsignar, setEnvioParaAsignar] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const cargarEnvios = useCallback(async () => {
        setCargando(true);
        try {
            const params = {};
            if (filtroEstado !== "TODOS") {
                params.estado = filtroEstado;
            }

            const response = await axiosClient.get("/api/v1/envios", { params });
            const data = response.data;
            setEnvios(Array.isArray(data) ? data : data?.content || []);
        } catch (error) {
            console.error("Error al cargar envíos:", error);
            showToast("No se pudo obtener el listado de envíos.", "error");
        } finally {
            setCargando(false);
        }
    }, [filtroEstado, showToast]);

    useEffect(() => {
        cargarEnvios();
    }, [cargarEnvios]);

    const handleCrearEnvio = async (datos) => {
        setGuardando(true);
        try {
            const response = await axiosClient.post("/api/v1/envios", datos);
            showToast(
                `Envío creado exitosamente. Tracking: ${
                    response.data.codigoSeguimiento || response.data.id
                }`,
                "success"
            );
            setModalCrearAbierto(false);
            cargarEnvios();
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Error al registrar el envío.";
            showToast(msg, "error");
        } finally {
            setGuardando(false);
        }
    };

    const handleAsignarRepartidor = async (envioId, repartidorId) => {
        setGuardando(true);
        try {
            await axiosClient.post(`/api/v1/envios/${envioId}/asignar-repartidor`, {
                repartidorId,
            });
            showToast("Repartidor asignado correctamente al paquete.", "success");
            setModalAsignarAbierto(false);
            setEnvioParaAsignar(null);
            cargarEnvios();
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "No se pudo asignar el repartidor.";
            showToast(msg, "error");
        } finally {
            setGuardando(false);
        }
    };

    const handleCambiarEstado = async (envioId, nuevoEstado) => {
        try {
            await axiosClient.patch(`/api/v1/envios/${envioId}/estado`, {
                nuevoEstado,
            });
            showToast(`Estado del envío actualizado a ${nuevoEstado}.`, "success");
            cargarEnvios();
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Error al cambiar el estado del envío.";
            showToast(msg, "error");
        }
    };

    const handleCancelarEnvio = async (envioId) => {
        if (!window.confirm("¿Seguro que deseas cancelar este envío? (Solo aplica en estado PENDIENTE)"))
            return;

        try {
            await axiosClient.patch(`/api/v1/envios/${envioId}/cancelar`);
            showToast("Envío cancelado exitosamente.", "success");
            cargarEnvios();
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "No se pudo cancelar el envío.";
            showToast(msg, "error");
        }
    };

    const enviosFiltrados = envios.filter((item) => {
        if (!busquedaTracking) return true;
        const texto = busquedaTracking.toLowerCase();
        const code = (item.codigoSeguimiento || item.trackingCode || item.id || "").toLowerCase();
        return code.includes(texto);
    });

    return (
        <div className="space-y-6">
            {/* Cabecera y Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Administración Operativa de Envíos
                    </h2>
                    <p className="text-sm text-slate-500">
                        Control del ciclo de vida, trazabilidad, ruteo y asignación de despachos.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={cargarEnvios}
                        icon={RefreshCw}
                        disabled={cargando}
                    >
                        Refrescar
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => setModalCrearAbierto(true)}
                        icon={Plus}
                    >
                        Nuevo Envío
                    </Button>
                </div>
            </div>

            {/* Filtros de Estado y Buscador */}
            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por código de tracking o UUID..."
                            value={busquedaTracking}
                            onChange={(e) => setBusquedaTracking(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                            Estado:
                        </span>
                        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                            {["TODOS", "PENDIENTE", "EN_TRANSITO", "ENTREGADO", "CANCELADO"].map(
                                (est) => (
                                    <button
                                        key={est}
                                        type="button"
                                        onClick={() => setFiltroEstado(est)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0 ${
                                            filtroEstado === est
                                                ? "bg-white text-slate-900 shadow-xs font-semibold"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        {est === "TODOS" ? "Todos" : est}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tabla de Envíos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Tracking Code / ID</th>
                                <th className="px-6 py-4">Ruta (Origen &rarr; Destino)</th>
                                <th className="px-6 py-4">Dimensiones / Tarifa</th>
                                <th className="px-6 py-4">Repartidor Asignado</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargando ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Consultando envíos registrados...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : enviosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron envíos con los criterios especificados.
                                    </td>
                                </tr>
                            ) : (
                                enviosFiltrados.map((item) => {
                                    const code =
                                        item.codigoSeguimiento ||
                                        item.trackingCode ||
                                        item.id?.slice(0, 8);
                                    const origenTexto = item.origen
                                        ? `${item.origen.ciudad || ""} (${item.origen.calle || ""} ${item.origen.numero || ""})`
                                        : "Origen central";
                                    const destinoTexto = item.destino
                                        ? `${item.destino.ciudad || ""} (${item.destino.calle || ""} ${item.destino.numero || ""})`
                                        : "Destino sin especificar";

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <div>
                                                        <span className="font-mono font-bold text-slate-900 text-xs">
                                                            {code}
                                                        </span>
                                                        <p className="text-[11px] text-slate-400 font-mono">
                                                            ID: {item.id?.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5 text-xs">
                                                    <p className="text-slate-700 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        <span className="font-medium">{origenTexto}</span>
                                                    </p>
                                                    <p className="text-slate-900 flex items-center gap-1 font-semibold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                        <span>{destinoTexto}</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <p className="text-slate-800 font-medium">
                                                    {item.peso ? `${item.peso} kg` : "-"}
                                                </p>
                                                <p className="text-slate-500">
                                                    Tarifa:{" "}
                                                    <span className="font-semibold text-slate-900">
                                                        ${item.tarifa || item.costoEnvio || 0}
                                                    </span>
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {item.repartidorId ? (
                                                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                                                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                                                        <span className="font-mono">
                                                            {String(item.repartidorId).slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Sin asignar
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={item.estado || "PENDIENTE"}>
                                                    {item.estado || "PENDIENTE"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Botón de Asignación si está PENDIENTE */}
                                                    {item.estado === "PENDIENTE" && (
                                                        <button
                                                            type="button"
                                                            title="Asignar repartidor"
                                                            onClick={() => {
                                                                setEnvioParaAsignar(item);
                                                                setModalAsignarAbierto(true);
                                                            }}
                                                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Truck className="w-3.5 h-3.5" />
                                                            <span>Asignar</span>
                                                        </button>
                                                    )}

                                                    {/* Cambio de Estado Rápido */}
                                                    {item.estado === "PENDIENTE" && (
                                                        <button
                                                            type="button"
                                                            title="Marcar En Tránsito"
                                                            onClick={() => handleCambiarEstado(item.id, "EN_TRANSITO")}
                                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                            <span>Despachar</span>
                                                        </button>
                                                    )}

                                                    {item.estado === "EN_TRANSITO" && (
                                                        <button
                                                            type="button"
                                                            title="Marcar como Entregado"
                                                            onClick={() => handleCambiarEstado(item.id, "ENTREGADO")}
                                                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Entregado</span>
                                                        </button>
                                                    )}

                                                    {/* Cancelación si está PENDIENTE */}
                                                    {item.estado === "PENDIENTE" && (
                                                        <button
                                                            type="button"
                                                            title="Cancelar envío"
                                                            onClick={() => handleCancelarEnvio(item.id)}
                                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para Registrar Envío */}
            <EnvioFormModal
                isOpen={modalCrearAbierto}
                onClose={() => setModalCrearAbierto(false)}
                onSave={handleCrearEnvio}
                cargando={guardando}
            />

            {/* Modal para Asignar Repartidor */}
            <AsignarRepartidorModal
                isOpen={modalAsignarAbierto}
                onClose={() => {
                    setModalAsignarAbierto(false);
                    setEnvioParaAsignar(null);
                }}
                envio={envioParaAsignar}
                onAsignar={handleAsignarRepartidor}
                cargando={guardando}
            />
        </div>
    );
}
