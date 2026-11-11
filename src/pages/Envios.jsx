import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useOutletContext } from "react-router-dom";

export default function Envios() {
    const { showToast } = useOutletContext();
    const [loading, setLoading] = useState(false);

    const testError = async () => {
        setLoading(true);
        try {
            // Intentamos llamar al gateway (va a fallar porque no está enrutado aún)
            await axiosClient.get("/api/v1/envios");
            showToast("Éxito al conectar", "success");
        } catch {
            // El interceptor ya maneja el alert, pero podemos usar el Toast
            showToast("Error de prueba: El backend no responde aún", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Listado de Envíos (Aquí trabajará Leandro)</h2>
            <button onClick={testError} disabled={loading} style={{ marginTop: "20px", padding: "10px" }}>
                {loading ? "Cargando..." : "Probar Interceptor HTTP"}
            </button>
        </div>
    );
}