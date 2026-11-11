import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./shell/Layout";
import ProtectedRoute from "./shell/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Envios from "./pages/Envios";
import MisEnvios from "./pages/MisEnvios";
import Repartidores from "./pages/Repartidores";
import Clientes from "./pages/Clientes";
import Comercio from "./pages/Comercio";
import Login from "./pages/Login";
import Play from "./pages/Play";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/play" element={<Play />} />

                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="envios" element={<Envios />} />
                            <Route path="mis-envios" element={<MisEnvios />} />
                            <Route path="repartidores" element={<Repartidores />} />
                            <Route path="clientes" element={<Clientes />} />
                            <Route path="comercio" element={<Comercio />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
