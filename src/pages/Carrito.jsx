import { useState, useEffect } from "react";
import { carritoServicio, ordenServicio } from "../services/api";

const USUARIO_ID = "c4444444-4444-4444-4444-444444444444";

export default function Carrito() {
    const [carrito, setCarrito] = useState(null);
    const [direccion, setDireccion] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarCarrito = async () => {
            try {
                const response = await carritoServicio.obtener(USUARIO_ID);
                setCarrito(response.data);
            } catch (error) {
                console.error("Error al cargar carrito:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarCarrito();
    }, []);

    const eliminarItem = async (productoId) => {
        await carritoServicio.eliminarItem(USUARIO_ID, productoId);
        // Recargar carrito
        const response = await carritoServicio.obtener(USUARIO_ID);
        setCarrito(response.data);
    };

    const iniciarPago = async () => {
        if (!direccion) {
            alert("Por favor, ingresa una dirección de envío.");
            return;
        }

        try {
            // 1. Crear la orden
            const ordenResponse = await ordenServicio.crear(USUARIO_ID, direccion);
            const ordenId = ordenResponse.data.id;

            // 2. Generar la preferencia de pago
            const pagoResponse = await ordenServicio.pagar(ordenId);
            window.location.href = pagoResponse.data.initPoint;
        } catch (error) {
            console.error("Error al iniciar el pago:", error);
            alert("Error al procesar el pago. Revisa la consola.");
        }
    };

    if (loading) return <p>Cargando carrito...</p>;
    if (!carrito || carrito.items.length === 0) return <p>Tu carrito está vacío.</p>;

    return (
        <div>
            <h2>Tu Carrito</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {carrito.items.map((item) => (
                    <div key={item.productoId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
                        <div>
                            <h3>{item.nombreProducto}</h3>
                            <p>Cantidad: {item.cantidad} x ${item.precioUnitario}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 'bold' }}>Subtotal: ${item.subtotal}</p>
                            <button onClick={() => eliminarItem(item.productoId)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '24px', fontWeight: 'bold' }}>
                Total: ${carrito.total}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginLeft: 'auto' }}>
                <input
                    type="text"
                    placeholder="Dirección de envío (ej: Av. Siempre Viva 742)"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                    onClick={iniciarPago}
                    style={{ padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                >
                    Pagar con Mercado Pago
                </button>
            </div>
        </div>
    );
}