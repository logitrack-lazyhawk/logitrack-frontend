import { useEffect, useState } from "react";
import { Truck, Check, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import axiosClient from "../../api/axiosClient";

export default function AsignarRepartidorModal({
    isOpen,
    onClose,
    envio,
    onAsignar,
    cargando = false,
}) {
    const [repartidores, setRepartidores] = useState([]);
    const [cargandoLista, setCargandoLista] = useState(false);
    const [seleccionado, setSeleccionado] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        let activo = true;
        setCargandoLista(true);
        setError("");
        setSeleccionado("");

        axiosClient
            .get("/api/v1/repartidores", { params: { estado: "ACTIVO", size: 50 } })
            .then(({ data }) => {
                if (activo) {
                    const listado = data?.content || (Array.isArray(data) ? data : []);
                    setRepartidores(listado);
                    if (listado.length > 0) {
                        setSeleccionado(listado[0].id);
                    }
                }
            })
            .catch((err) => {
                if (activo) {
                    setError("No se pudo cargar la lista de repartidores activos.");
                }
            })
            .finally(() => {
                if (activo) setCargandoLista(false);
            });

        return () => {
            activo = false;
        };
    }, [isOpen]);

    const handleConfirmar = () => {
        if (!seleccionado) {
            setError("Debes seleccionar un repartidor.");
            return;
        }
        onAsignar(envio.id, seleccionado);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Asignar Repartidor a Paquete"
            maxWidth="max-w-lg"
        >
            <div className="space-y-4">
                {envio && (
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-900 uppercase">
                                Código de Seguimiento
                            </p>
                            <p className="text-sm font-mono font-bold text-blue-800">
                                {envio.codigoSeguimiento || envio.trackingCode || envio.id}
                            </p>
                        </div>
                        <Badge variant={envio.estado || "PENDIENTE"}>
                            {envio.estado || "PENDIENTE"}
                        </Badge>
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Selecciona un repartidor disponible:
                    </label>

                    {cargandoLista ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Cargando conductores activos...
                        </div>
                    ) : repartidores.length === 0 ? (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
                            No hay repartidores activos disponibles en este momento. Registra o activa uno en el módulo de Repartidores.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {repartidores.map((rep) => {
                                const isChecked = seleccionado === rep.id;
                                return (
                                    <div
                                        key={rep.id}
                                        onClick={() => setSeleccionado(rep.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                            isChecked
                                                ? "border-blue-500 bg-blue-50/50 shadow-xs"
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    isChecked
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {rep.nombre ? rep.nombre.charAt(0).toUpperCase() : "R"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {rep.nombre}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {rep.tipoVehiculo || "Vehículo"} • {rep.telefono}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant="ACTIVO" size="sm">Disponible</Badge>
                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                    isChecked
                                                        ? "border-blue-600 bg-blue-600 text-white"
                                                        : "border-slate-300"
                                                }`}
                                            >
                                                {isChecked && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        disabled={cargando || !seleccionado || repartidores.length === 0}
                        onClick={handleConfirmar}
                    >
                        {cargando ? "Asignando..." : "Confirmar Asignación"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

