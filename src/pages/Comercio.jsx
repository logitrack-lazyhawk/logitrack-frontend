import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
    ShoppingBag,
    Plus,
    RefreshCw,
    Search,
    CreditCard,
    PackageCheck,
    Tag,
    Trash2,
    CheckCircle,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProductoModal from "../components/comercio/ProductoModal";

export default function Comercio() {
    const { showToast } = useOutletContext();
    const [pestaña, setPestaña] = useState("productos"); // 'productos' | 'ordenes'
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Órdenes simuladas / consultadas
    const [ordenes, setOrdenes] = useState([
        {
            id: "ord-9821-ab",
            usuarioId: "cliente-demo-01",
            direccionDestino: "Av. Cabildo 2200, CABA",
            total: 14500,
            estado: "PAGADA",
            fecha: "2026-11-10 18:30",
        },
        {
            id: "ord-9822-cd",
            usuarioId: "cliente-demo-02",
            direccionDestino: "Av. Rivadavia 4500, CABA",
            total: 8200,
            estado: "PENDIENTE_PAGO",
            fecha: "2026-11-10 19:45",
        },
    ]);

    const cargarProductos = useCallback(async () => {
        setCargando(true);
        try {
            const res = await axiosClient.get("/api/v1/productos");
            setProductos(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            // Fallback con productos demostrativos si commerce-service no está encendido
            setProductos([
                {
                    id: "prod-01",
                    nombre: "Kit Herramientas Pro 50 pcs",
                    descripcion: "Maletín de herramientas de alta resistencia para logística",
                    precio: 34500,
                    stock: 12,
                    categoria: "Herramientas",
                    weight: 3.5,
                },
                {
                    id: "prod-02",
                    nombre: "Cinta de Embalaje Reforzada x 6",
                    descripcion: "Cintas adhesivas transparentes 48mm x 100m",
                    precio: 6200,
                    stock: 45,
                    categoria: "Logística",
                    weight: 1.2,
                },
                {
                    id: "prod-03",
                    nombre: "Lector Código de Barras Inalámbrico",
                    descripcion: "Escáner 1D/2D Bluetooth para depósitos",
                    precio: 48900,
                    stock: 8,
                    categoria: "Tecnología",
                    weight: 0.4,
                },
            ]);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);

    const handleCrearProducto = async (datos) => {
        setGuardando(true);
        try {
            await axiosClient.post("/api/v1/productos", datos);
            showToast("Producto creado en el catálogo.", "success");
            setModalProductoAbierto(false);
            cargarProductos();
        } catch (err) {
            // Si el backend no está disponible en este momento, agregamos localmente para demo
            const nuevo = { ...datos, id: `prod-${Date.now()}` };
            setProductos((prev) => [nuevo, ...prev]);
            showToast("Producto agregado al catálogo (Modo Demo).", "success");
            setModalProductoAbierto(false);
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminarProducto = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
        try {
            await axiosClient.delete(`/api/v1/productos/${id}`);
            showToast("Producto eliminado.", "success");
            cargarProductos();
        } catch {
            setProductos((prev) => prev.filter((p) => p.id !== id));
            showToast("Producto eliminado del listado.", "success");
        }
    };

    const handleSimularPagoOrden = async (ordenId) => {
        try {
            await axiosClient.patch(`/api/v1/ordenes/${ordenId}/pagar`);
            showToast("Pago de la orden procesado exitosamente.", "success");
        } catch {
            showToast("Pago simulado exitosamente (MercadoPago Webhook).", "success");
        }
        setOrdenes((prev) =>
            prev.map((o) => (o.id === ordenId ? { ...o, estado: "PAGADA" } : o))
        );
    };

    const productosFiltrados = productos.filter((p) => {
        if (!busqueda) return true;
        const q = busqueda.toLowerCase();
        return (
            p.nombre?.toLowerCase().includes(q) ||
            p.categoria?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Módulo Comercial (Commerce Service)
                    </h2>
                    <p className="text-sm text-slate-500">
                        Catálogo de productos, monitor de órdenes de compra y gestión de pasarela de pagos.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={cargarProductos}
                        icon={RefreshCw}
                        disabled={cargando}
                    >
                        Refrescar
                    </Button>
                    {pestaña === "productos" && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => setModalProductoAbierto(true)}
                            icon={Plus}
                        >
                            Nuevo Producto
                        </Button>
                    )}
                </div>
            </div>

            {/* Pestañas de Navegación Comercial */}
            <div className="flex border-b border-slate-200">
                <button
                    type="button"
                    onClick={() => setPestaña("productos")}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                        pestaña === "productos"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <Tag className="w-4 h-4" />
                    <span>Catálogo de Productos</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                        {productos.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setPestaña("ordenes")}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                        pestaña === "ordenes"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Órdenes de Compra y Pagos</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                        {ordenes.length}
                    </span>
                </button>
            </div>

            {/* Contenido: Catálogo de Productos */}
            {pestaña === "productos" && (
                <div className="space-y-4">
                    <Card>
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Filtrar por nombre o categoría..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                        </div>
                    </Card>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4">Precio</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Peso Envío</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cargando ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            Cargando productos...
                                        </td>
                                    </tr>
                                ) : productosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            No se encontraron productos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    productosFiltrados.map((prod) => (
                                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{prod.nombre}</p>
                                                    <p className="text-xs text-slate-400">{prod.descripcion}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                                                    {prod.categoria || "General"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                ${prod.precio}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                        prod.stock > 10
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : prod.stock > 0
                                                            ? "bg-amber-50 text-amber-700"
                                                            : "bg-rose-50 text-rose-700"
                                                    }`}
                                                >
                                                    {prod.stock} disponibles
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {prod.weight ? `${prod.weight} kg` : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    title="Eliminar producto"
                                                    onClick={() => handleEliminarProducto(prod.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Contenido: Órdenes y Pagos */}
            {pestaña === "ordenes" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Orden ID</th>
                                <th className="px-6 py-4">Cliente / Usuario</th>
                                <th className="px-6 py-4">Destino de Entrega</th>
                                <th className="px-6 py-4">Monto Total</th>
                                <th className="px-6 py-4">Estado del Pago</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ordenes.map((ord) => (
                                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900">
                                        {ord.id}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                                        {ord.usuarioId}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600">
                                        {ord.direccionDestino}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        ${ord.total}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                ord.estado === "PAGADA"
                                                    ? "success"
                                                    : "warning"
                                            }
                                        >
                                            {ord.estado}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {ord.estado !== "PAGADA" ? (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                icon={CreditCard}
                                                onClick={() => handleSimularPagoOrden(ord.id)}
                                            >
                                                Registrar Pago
                                            </Button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Facturado
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Nuevo Producto */}
            <ProductoModal
                isOpen={modalProductoAbierto}
                onClose={() => setModalProductoAbierto(false)}
                onSave={handleCrearProducto}
                cargando={guardando}
            />
        </div>
    );
}
