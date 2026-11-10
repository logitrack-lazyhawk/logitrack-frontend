import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./shell/Layout";
import ProtectedRoute from "./shell/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Envios from "./pages/Envios";
import MisEnvios from "./pages/MisEnvios";
import Repartidores from "./pages/Repartidores";
import Login from "./pages/Login";
import Play from "./pages/Play";

function App() {
    return (
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
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;