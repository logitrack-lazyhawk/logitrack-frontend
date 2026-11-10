import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Toast from "../components/Toast";

export default function Layout() {
    const navigate = useNavigate();
    const [toast, setToast] = useState({ message: "", type: "error" });

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        navigate("/login");
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Componente Toast Global */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, message: "" })}
            />

            <aside style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
                <h2>LogiTrack</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to="/envios" style={{ color: 'white', textDecoration: 'none' }}>Envíos</Link>
                    <Link to="/mis-envios" style={{ color: 'white', textDecoration: 'none' }}>
                        Mis envíos
                    </Link>
                    <Link to="/repartidores" style={{ color: 'white', textDecoration: 'none' }}>Repartidores</Link>
                    <Link
                        to="/play"
                        style={{
                            color: "white",
                            textDecoration: "none"
                        }}
                    >
                        ▶ LazyHawk Play
                    </Link>
                    <button onClick={handleLogout} style={{ marginTop: '50px', padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            <main style={{ flex: 1, padding: '20px', backgroundColor: '#ecf0f1' }}>
                <header style={{ marginBottom: '20px', borderBottom: '2px solid #bdc3c7', paddingBottom: '10px' }}>
                    <h1>Panel de Control</h1>
                </header>

                {/* Pasamos el setToast a las páginas para que puedan mostrar errores */}
                <Outlet context={{ showToast: (msg, type = "error") => setToast({ message: msg, type }) }} />
            </main>
        </div>
    );
}