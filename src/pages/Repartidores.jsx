import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
    Truck,
    Plus,
    Search,
    RefreshCw,
    Edit2,
    Trash2,
    Power,
    CheckCircle2,
    XCircle,
    UserCheck,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import RepartidorModal from "../components/repartidores/RepartidorModal";

export default function Repartidores() {
    const { showToast } = useOutletContext();
    const [repartidores, setRepartidores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [busqueda, setBusqueda] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [repartidorSeleccionado, setRepartidorSeleccionado] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const cargarRepartidores = useCallback(async () => {
        setCargando(true);
        try {
            const params = { page: pagina, size: 10 };
            if (filtroEstado !== "TODOS") {
                params.estado = filtroEstado;
            }

            const response = await axiosClient.get("/api/v1/repartidores", { params });
            const data = response.data;

            // Soporta tanto Page como List directo
            if (data?.content) {
                setRepartidores(data.content);
                setTotalPaginas(data.totalPages || 1);
            } else if (Array.isArray(data)) {
                setRepartidores(data);
                setTotalPaginas(1);
            } else {
                setRepartidores([]);
            }
        } catch (error) {
            console.error("Error al cargar repartidores:", error);
            showToast("No se pudo cargar la flota de repartidores.", "error");
        } finally {
            setCargando(false);
        }
    }, [pagina, filtroEstado, showToast]);

    useEffect(() => {
        cargarRepartidores();
    }, [cargarRepartidores]);

    const handleGuardar = async (datos, id) => {
        setGuardando(true);
        try {
            if (id) {
                await axiosClient.put(`/api/v1/repartidores/${id}`, datos);
                showToast("Repartidor actualizado exitosamente.", "success");
            } else {
                await axiosClient.post("/api/v1/repartidores", datos);
                showToast("Repartidor registrado con éxito.", "success");
            }
            setModalAbierto(false);
            setRepartidorSeleccionado(null);
            cargarRepartidores();
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Error al procesar el repartidor.";
            showToast(msg, "error");
        } finally {
            setGuardando(false);
        }
    };

    const handleCambiarEstado = async (repartidor) => {
        const nuevoEstado = repartidor.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        try {
            await axiosClient.patch(`/api/v1/repartidores/${repartidor.id}/estado`, null, {
                params: { estado: nuevoEstado },
            });
            showToast(`Estado cambiado a ${nuevoEstado}.`, "success");
            cargarRepartidores();
        } catch (error) {
            showToast("No se pudo cambiar el estado del repartidor.", "error");
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Seguro que deseas dar de baja este repartidor?")) return;

        try {
            await axiosClient.delete(`/api/v1/repartidores/${id}`);
            showToast("Repartidor dado de baja.", "success");
            cargarRepartidores();
        } catch (error) {
            showToast("Error al eliminar repartidor.", "error");
        }
    };

    const repartidoresFiltrados = repartidores.filter((rep) => {
        if (!busqueda) return true;
        const texto = busqueda.toLowerCase();
        return (
            rep.nombre?.toLowerCase().includes(texto) ||
            rep.dni?.includes(texto) ||
            rep.email?.toLowerCase().includes(texto) ||
            rep.tipoVehiculo?.toLowerCase().includes(texto)
        );
    });

    return (
        <div className="space-y-6">
            {/* Encabezado y Acciones Principales */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Gestión de Flota y Repartidores
                    </h2>
                    <p className="text-sm text-slate-500">
                        Administración de conductores, vehículos y disponibilidad operativa.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={cargarRepartidores}
                        icon={RefreshCw}
                        disabled={cargando}
                    >
                        Refrescar
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                            setRepartidorSeleccionado(null);
                            setModalAbierto(true);
                        }}
                        icon={Plus}
                    >
                        Nuevo Repartidor
                    </Button>
                </div>
            </div>

            {/* Filtros y Buscador */}
            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI, email..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Estado:
                        </span>
                        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                            {["TODOS", "ACTIVO", "INACTIVO"].map((est) => (
                                <button
                                    key={est}
                                    type="button"
                                    onClick={() => {
                                        setFiltroEstado(est);
                                        setPagina(0);
                                    }}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                                        filtroEstado === est
                                            ? "bg-white text-slate-900 shadow-xs font-semibold"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    {est === "TODOS" ? "Todos" : est}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tabla de Repartidores */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Repartidor</th>
                                <th className="px-6 py-4">DNI</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Vehículo</th>
                                <th className="px-6 py-4">Estado Operativo</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargando ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Consultando repartidores...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : repartidoresFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron repartidores con los filtros actuales.
                                    </td>
                                </tr>
                            ) : (
                                repartidoresFiltrados.map((rep) => (
                                    <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {rep.nombre ? rep.nombre.charAt(0).toUpperCase() : "R"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{rep.nombre}</p>
                                                    <p className="text-xs text-slate-400 font-mono">
                                                        ID: {rep.id?.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-700">{rep.dni}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-800">{rep.telefono}</p>
                                            <p className="text-xs text-slate-400">{rep.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                                                <Truck className="w-3.5 h-3.5 text-slate-500" />
                                                {rep.tipoVehiculo || "No especificado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={rep.estado || "INACTIVO"}>
                                                {rep.estado || "INACTIVO"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    title={rep.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                                                    onClick={() => handleCambiarEstado(rep)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                                >
                                                    <Power className={`w-4 h-4 ${rep.estado === "ACTIVO" ? "text-emerald-600" : "text-slate-400"}`} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Editar repartidor"
                                                    onClick={() => {
                                                        setRepartidorSeleccionado(rep);
                                                        setModalAbierto(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Eliminar repartidor"
                                                    onClick={() => handleEliminar(rep.id)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                            Página {pagina + 1} de {totalPaginas}
                        </span>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pagina === 0}
                                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                            >
                                Anterior
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pagina >= totalPaginas - 1}
                                onClick={() => setPagina((p) => p + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Alta / Edición de Repartidor */}
            <RepartidorModal
                isOpen={modalAbierto}
                onClose={() => {
                    setModalAbierto(false);
                    setRepartidorSeleccionado(null);
                }}
                onSave={handleGuardar}
                repartidorActual={repartidorSeleccionado}
                cargando={guardando}
            />
        </div>
    );
}
