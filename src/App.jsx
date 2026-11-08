import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./shell/Layout";
import Dashboard from "./pages/Dashboard";
import Envios from "./pages/Envios";
import Repartidores from "./pages/Repartidores";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Aquí definimos que TODAS las rutas usarán el Layout (el menú lateral) */}
          <Route path="/" element={<Layout />}>
            {/* El index es la página de inicio */}
            <Route index element={<Dashboard />} />
            <Route path="envios" element={<Envios />} />
            <Route path="repartidores" element={<Repartidores />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;