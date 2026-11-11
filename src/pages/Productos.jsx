import { useState, useEffect } from "react";
import { productoServicio, carritoServicio } from "../services/api";

const USUARIO_ID = "5905b656-5cb5-4662-a33a-c1e7806ec309"; // ID de prueba

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const response = await productoServicio.listar();
                setProductos(response.data);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarProductos();
    }, []);

    const agregarAlCarrito = async (productoId) => {
        try {
            await carritoServicio.agregarItem(USUARIO_ID, productoId, 1);
            setMensaje("Producto agregado al carrito ✅");
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
            setMensaje("Error al agregar al carrito ❌");
        }
    };

    if (loading) return <p>Cargando catálogo...</p>;

    return (
        <div>
            <h2>Catálogo de Productos</h2>
            {mensaje && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '20px', borderRadius: '4px' }}>{mensaje}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {productos.map((prod) => (
                    <div key={prod.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: 'white' }}>
                        <img src={prod.imagenUrl || 'https://via.placeholder.com/150'} alt={prod.nombre} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                        <h3 style={{ margin: '10px 0' }}>{prod.nombre}</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>{prod.descripcion}</p>
                        <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#2c3e50' }}>${prod.precio}</p>
                        <p style={{ fontSize: '12px', color: '#999' }}>Stock: {prod.stock} | Cat: {prod.categoria}</p>
                        <button
                            onClick={() => agregarAlCarrito(prod.id)}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                        >
                            Agregar al Carrito
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}