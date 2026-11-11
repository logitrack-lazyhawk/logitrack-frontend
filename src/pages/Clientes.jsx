import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
    Users,
    Plus,
    Search,
    RefreshCw,
    Edit2,
    Trash2,
    Copy,
    Check,
    Key,
    ShieldCheck,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ClienteModal from "../components/clientes/ClienteModal";

export default function Clientes() {
    const { showToast } = useOutletContext();
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [copiadoId, setCopiadoId] = useState(null);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const cargarClientes = useCallback(async () => {
        setCargando(true);
        try {
            const response = await axiosClient.get("/api/v1/clientes", {
                params: { page: pagina, size: 10 },
            });
            const data = response.data;
            if (data?.content) {
                setClientes(data.content);
                setTotalPaginas(data.totalPages || 1);
            } else if (Array.isArray(data)) {
                setClientes(data);
                setTotalPaginas(1);
            } else {
                setClientes([]);
            }
        } catch (error) {
            console.error("Error al cargar clientes:", error);
            showToast("No se pudo obtener el listado de clientes.", "error");
        } finally {
            setCargando(false);
        }
    }, [pagina, showToast]);

    useEffect(() => {
        cargarClientes();
    }, [cargarClientes]);

    const handleGuardar = async (datos, id) => {
        setGuardando(true);
        try {
            if (id) {
                await axiosClient.put(`/api/v1/clientes/${id}`, datos);
                showToast("Cliente actualizado exitosamente.", "success");
            } else {
                await axiosClient.post("/api/v1/clientes", datos);
                showToast("Cliente registrado en el sistema.", "success");
            }
            setModalAbierto(false);
            setClienteSeleccionado(null);
            cargarClientes();
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Error al procesar el cliente.";
            showToast(msg, "error");
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Seguro que deseas dar de baja este cliente?")) return;

        try {
            await axiosClient.delete(`/api/v1/clientes/${id}`);
            showToast("Cliente dado de baja.", "success");
            cargarClientes();
        } catch (error) {
            showToast("No se pudo dar de baja al cliente.", "error");
        }
    };

    const handleCopiarId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiadoId(id);
        showToast("UUID copiado al portapapeles", "success");
        setTimeout(() => setCopiadoId(null), 2000);
    };

    const clientesFiltrados = clientes.filter((c) => {
        if (!busqueda) return true;
        const texto = busqueda.toLowerCase();
        return (
            c.nombre?.toLowerCase().includes(texto) ||
            c.dni?.includes(texto) ||
            c.email?.toLowerCase().includes(texto) ||
            c.telefono?.includes(texto)
        );
    });

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Directorio de Clientes
                    </h2>
                    <p className="text-sm text-slate-500">
                        Administración híbrida de perfiles de clientes vinculados con Keycloak IAM.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={cargarClientes}
                        icon={RefreshCw}
                        disabled={cargando}
                    >
                        Refrescar
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                            setClienteSeleccionado(null);
                            setModalAbierto(true);
                        }}
                        icon={Plus}
                    >
                        Nuevo Cliente
                    </Button>
                </div>
            </div>

            {/* Banner de Modelo Híbrido */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600 text-white">
                        <Key className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                            Modelo Híbrido: Identidad & Negocio Desacoplados
                        </h4>
                        <p className="text-xs text-slate-600">
                            Keycloak administra el inicio de sesión y credenciales. Este catálogo gestiona la información logística y de despacho de cada cliente.
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-blue-700 border border-blue-200 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Keycloak Synced
                </span>
            </div>

            {/* Buscador */}
            <Card>
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre, DNI o email..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                </div>
            </Card>

            {/* Tabla de Clientes */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Cliente / Razón Social</th>
                                <th className="px-6 py-4">DNI / CUIT</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">UUID Sistema</th>
                                <th className="px-6 py-4">Identidad</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargando ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Consultando directorio de clientes...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron clientes registrados.
                                    </td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                    {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : "C"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{cliente.nombre}</p>
                                                    <p className="text-xs text-slate-400">{cliente.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-700">{cliente.dni}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-800">{cliente.telefono}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                    {cliente.id?.slice(0, 8)}...
                                                </span>
                                                <button
                                                    type="button"
                                                    title="Copiar UUID del cliente"
                                                    onClick={() => handleCopiarId(cliente.id)}
                                                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                                >
                                                    {copiadoId === cliente.id ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="CLIENTE" size="sm">
                                                Keycloak Link
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    title="Editar cliente"
                                                    onClick={() => {
                                                        setClienteSeleccionado(cliente);
                                                        setModalAbierto(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Eliminar cliente"
                                                    onClick={() => handleEliminar(cliente.id)}
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

            {/* Modal de Cliente */}
            <ClienteModal
                isOpen={modalAbierto}
                onClose={() => {
                    setModalAbierto(false);
                    setClienteSeleccionado(null);
                }}
                onSave={handleGuardar}
                clienteActual={clienteSeleccionado}
                cargando={guardando}
            />
        </div>
    );
}
