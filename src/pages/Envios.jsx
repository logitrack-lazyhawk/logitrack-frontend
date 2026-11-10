
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import EnvioCardWeb from "../components/EnvioCardWeb.jsx";

export default function Envios() {
    const [envios, setEnvios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);
    const [actualizacion, setActualizacion] = useState(0);

    useEffect(() => {
        let activo = true;

        axiosClient
            .get("/api/v1/envios")
            .then(({ data }) => {
                if (activo) {
                    setEnvios(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                if (activo) {
                    setError(
                        err.response?.data?.detail ||
                        "No se pudo obtener el listado de envíos."
                    );
                }
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, [actualizacion]);

    function actualizar() {
        setCargando(true);
        setError("");
        setSeleccionado(null);
        setActualizacion((valor) => valor + 1);
    }

    function seleccionarEnvio({ id }) {
        const encontrado = envios.find(
            (envio) => String(envio.id) === id
        );
        setSeleccionado(encontrado || null);
    }

    return (
        <section>
            <h2>Administración de envíos</h2>
            <p>Listado de paquetes registrados en LogiTrack.</p>

            <button type="button" onClick={actualizar}>
                Actualizar listado
            </button>

            {cargando && <p>Cargando envíos...</p>}

            {error && (
                <p role="alert" style={{ color: "#b91c1c" }}>
                    {error}
                </p>
            )}

            {!cargando && !error && envios.length === 0 && (
                <p>No hay envíos registrados.</p>
            )}

            {!cargando && !error && (
                <div style={{ marginTop: "20px" }}>
                    {envios.map((envio) => (
                        <EnvioCardWeb
                            key={envio.id}
                            envio={envio}
                            contexto="admin"
                            onSeleccionar={seleccionarEnvio}
                        />
                    ))}
                </div>
            )}

            {seleccionado && (
                <section
                    style={{
                        marginTop: "24px",
                        padding: "20px",
                        background: "white",
                        borderRadius: "12px",
                    }}
                >
                    <h3>Detalle del envío</h3>
                    <p>
                        <strong>Código:</strong>{" "}
                        {seleccionado.codigoSeguimiento}
                    </p>
                    <p>
                        <strong>Estado:</strong> {seleccionado.estado}
                    </p>
                    <p>
                        <strong>ID:</strong> {seleccionado.id}
                    </p>
                </section>
            )}
        </section>
    );
}
