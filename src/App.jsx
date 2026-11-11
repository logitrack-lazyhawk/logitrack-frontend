import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Layout from './shell/Layout';
import ProtectedRoute from './shell/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Envios from './pages/Envios';
import MisEnvios from './pages/MisEnvios';
import CrearEnvio from './pages/CrearEnvio';
import InicioCliente from './pages/InicioCliente';
import Repartidores from './pages/Repartidores';
import Login from './pages/Login';
import Play from './pages/Play';
import { obtenerSesion } from './auth/session';
import { useDemo } from './demo/useDemo';

function Inicio() {
    const demo = useDemo();
    if (demo) return <InicioCliente />;
    const { roles } = obtenerSesion();
    if (roles.includes('ADMIN')) return <Dashboard />;
    if (roles.includes('CLIENTE')) return <InicioCliente />;
    return (
        <section className="portal-panel">
            <h1>Tu cuenta LogiTrack</h1>
            <p>Las herramientas para tu rol todavía no están disponibles en esta interfaz.</p>
        </section>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/play" element={<Play />} />
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Inicio />} />
                        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                            <Route path="envios" element={<Envios />} />
                            <Route path="repartidores" element={<Repartidores />} />
                        </Route>
                        <Route element={<ProtectedRoute roles={['CLIENTE']} />}>
                            <Route path="mis-envios" element={<MisEnvios />} />
                            <Route path="crear-envio" element={<CrearEnvio />} />
                        </Route>
                        <Route path="*" element={
                            <section className="portal-panel">
                                <h1>No encontramos esta página</h1>
                                <Link to="/">Volver al inicio</Link>
                            </section>
                        } />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
