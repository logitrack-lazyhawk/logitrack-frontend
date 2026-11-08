import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./shell/Layout";
import ProtectedRoute from "./shell/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Envios from "./pages/Envios";
import Repartidores from "./pages/Repartidores";
import Login from "./pages/Login";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública para el Login */}
                <Route path="/login" element={<Login />} />

                {/* Rutas Protegidas (El Guardia envuelve al Layout) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="envios" element={<Envios />} />
                        <Route path="repartidores" element={<Repartidores />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;