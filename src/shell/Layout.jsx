import { Outlet, Link } from "react-router-dom";

export default function Layout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* BARRA LATERAL (Menú) */}
            <aside style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
                <h2>LogiTrack</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                    <Link to="/envios" style={{ color: 'white', textDecoration: 'none' }}>Envíos</Link>
                    <Link to="/repartidores" style={{ color: 'white', textDecoration: 'none' }}>Repartidores</Link>
                    <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginTop: '50px' }}>Cerrar Sesión</Link>
                </nav>
            </aside>

            {/* ÁREA PRINCIPAL (Donde se cargarán las pantallas) */}
            <main style={{ flex: 1, padding: '20px', backgroundColor: '#ecf0f1' }}>
                <header style={{ marginBottom: '20px', borderBottom: '2px solid #bdc3c7', paddingBottom: '10px' }}>
                    <h1>Panel de Control</h1>
                </header>

                {/* El "Outlet" es el espacio donde tus compañeros (o tú) pondrán sus pantallas */}
                <Outlet />
            </main>
        </div>
    );
}