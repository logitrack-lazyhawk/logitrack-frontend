
import { useEffect, useState } from "react";
import {
    obtenerMisEnvios,
    obtenerMiEnvioPorTracking,
} from "../api/enviosApi";
import "./MisEnvios.css";

const PAGE_SIZE = 8;

const ESTADOS = [
    { key: "PENDIENTE", label: "Pendiente" },
    { key: "EN_RUTA", label: "En ruta" },
    { key: "ENTREGADO", label: "Entregado" },
];

function formatearEstado(estado) {
    const etiquetas = {
        PENDIENTE: "Pendiente",
        EN_RUTA: "En ruta",
        ENTREGADO: "Entregado",
        CANCELADO: "Cancelado",
    };

    return etiquetas[estado] || estado || "Desconocido";
}

function formatearDireccion(direccion) {
    if (!direccion) return "Sin dirección registrada";

    return [
        [direccion.calle, direccion.numero]
            .filter(Boolean)
            .join(" "),
        direccion.localidad || direccion.ciudad,
        direccion.provincia,
    ]
        .filter(Boolean)
        .join(", ") || "Sin dirección registrada";
}

function obtenerMensajeError(error) {
    if (!error.response) {
        return error.message === "Network Error"
            ? "No se pudo conectar con el API Gateway."
            : error.message || "Error de conexión.";
    }

    if (error.response.status === 401) {
        return "Tu sesión expiró. Volvé a iniciar sesión.";
    }

    if (error.response.status === 403) {
        return "No tenés permisos para consultar estos envíos.";
    }

    if (error.response.status === 404) {
        return "No encontramos un envío tuyo con ese código.";
    }

    return (
        error.response.data?.detail ||
        error.response.data?.message ||
        "Ocurrió un error al consultar los envíos."
    );
}

function EstadoBadge({ estado }) {
    const clase = (estado || "DESCONOCIDO").toLowerCase();

    return (
        <span className={`lt-estado lt-estado--${clase}`}>
      {formatearEstado(estado)}
    </span>
    );
}

function Seguimiento({ estado }) {
    if (estado === "CANCELADO") {
        return (
            <div className="lt-cancelado" role="status">
                Este envío fue cancelado.
            </div>
        );
    }

    const indice = ESTADOS.findIndex(
        (item) => item.key === estado
    );

    return (
        <ol className="lt-timeline" aria-label="Progreso del envío">
            {ESTADOS.map((item, index) => (
                <li
                    key={item.key}
                    className={
                        index <= indice
                            ? "lt-timeline__step active"
                            : "lt-timeline__step"
                    }
                    aria-current={
                        item.key === estado ? "step" : undefined
                    }
                >
                    <span className="lt-timeline__dot" />
                    <span>{item.label}</span>
                </li>
            ))}
        </ol>
    );
}

function DetalleEnvio({ envio }) {
    if (!envio) return null;

    return (
        <article className="lt-detalle">
            <div className="lt-detalle__header">
                <div>
                    <p className="lt-label">Código de seguimiento</p>
                    <h3>{envio.codigoSeguimiento}</h3>
                </div>
                <EstadoBadge estado={envio.estado} />
            </div>

            <Seguimiento estado={envio.estado} />

            <div className="lt-direcciones">
                <div>
                    <p className="lt-label">Origen</p>
                    <p>{formatearDireccion(envio.origen)}</p>
                </div>
                <div>
                    <p className="lt-label">Destino</p>
                    <p>{formatearDireccion(envio.destino)}</p>
                </div>
            </div>

            <div className="lt-resumen">
                <span>Peso: {envio.peso ?? "—"} kg</span>
                <span>
          Repartidor:{" "}
                    {envio.repartidorId ? "Asignado" : "Sin asignar"}
        </span>
            </div>
        </article>
    );
}

export default function MisEnvios() {
    const [envios, setEnvios] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);

    const [codigo, setCodigo] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);

    const [cargando, setCargando] = useState(true);
    const [buscando, setBuscando] = useState(false);
    const [error, setError] = useState("");
    const [errorBusqueda, setErrorBusqueda] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarEnvios() {
            setCargando(true);
            setError("");

            try {
                const datos = await obtenerMisEnvios(
                    pagina,
                    PAGE_SIZE
                );

                if (!activo) return;

                setEnvios(datos.content ?? []);
                setTotalPaginas(datos.totalPages ?? 0);
            } catch (err) {
                if (!activo) return;

                setEnvios([]);
                setError(obtenerMensajeError(err));
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarEnvios();

        return () => {
            activo = false;
        };
    }, [pagina]);

    async function buscarTracking(event) {
        event.preventDefault();

        if (!codigo.trim()) {
            setErrorBusqueda("Ingresá un código de seguimiento.");
            return;
        }

        setBuscando(true);
        setErrorBusqueda("");
        setSeleccionado(null);

        try {
            const envio = await obtenerMiEnvioPorTracking(codigo);
            setSeleccionado(envio);
        } catch (err) {
            setErrorBusqueda(obtenerMensajeError(err));
        } finally {
            setBuscando(false);
        }
    }

    return (
        <section className="lt-mis-envios">
            <div className="lt-heading">
                <div>
                    <p className="lt-eyebrow">PORTAL DE CLIENTES</p>
                    <h2>Mis envíos</h2>
                    <p>
                        Consultá tus paquetes y conocé su estado
                        de entrega.
                    </p>
                </div>
                <span className="lt-heading__icon" aria-hidden="true">
          📦
        </span>
            </div>

            <section className="lt-card">
                <h3>Buscar por código de seguimiento</h3>
                <p>
                    Ingresá el código de uno de tus envíos.
                </p>

                <form
                    className="lt-buscador"
                    onSubmit={buscarTracking}
                >
                    <label htmlFor="codigo-tracking" className="lt-sr-only">
                        Código de seguimiento
                    </label>

                    <input
                        id="codigo-tracking"
                        type="text"
                        placeholder="Ej. LT-458921-A3F9B"
                        value={codigo}
                        onChange={(event) =>
                            setCodigo(event.target.value)
                        }
                        maxLength={50}
                    />

                    <button type="submit" disabled={buscando}>
                        {buscando ? "Buscando..." : "Buscar"}
                    </button>
                </form>

                {errorBusqueda && (
                    <p className="lt-error" role="alert">
                        {errorBusqueda}
                    </p>
                )}

                {seleccionado && (
                    <DetalleEnvio envio={seleccionado} />
                )}
            </section>

            <section className="lt-card">
                <div className="lt-list-header">
                    <h3>Todos mis envíos</h3>
                    <button
                        type="button"
                        className="lt-secondary-btn"
                        onClick={() => {
                            setPagina(0);
                            if (pagina === 0) {
                                window.location.reload();
                            }
                        }}
                    >
                        Actualizar
                    </button>
                </div>

                {cargando && (
                    <p role="status">Cargando tus envíos...</p>
                )}

                {error && (
                    <p className="lt-error" role="alert">
                        {error}
                    </p>
                )}

                {!cargando && !error && envios.length === 0 && (
                    <div className="lt-vacio">
                        <span aria-hidden="true">📭</span>
                        <h4>Todavía no tenés envíos</h4>
                        <p>
                            Cuando registres un paquete,
                            aparecerá en esta sección.
                        </p>
                    </div>
                )}

                {!cargando && !error && envios.length > 0 && (
                    <>
                        <div className="lt-lista">
                            {envios.map((envio) => (
                                <article
                                    key={envio.id}
                                    className="lt-envio-item"
                                >
                                    <div>
                                        <strong>
                                            {envio.codigoSeguimiento}
                                        </strong>
                                        <p>
                                            {formatearDireccion(envio.destino)}
                                        </p>
                                    </div>

                                    <EstadoBadge estado={envio.estado} />

                                    <button
                                        type="button"
                                        className="lt-secondary-btn"
                                        onClick={() => {
                                            setSeleccionado(envio);
                                            setCodigo(envio.codigoSeguimiento);
                                        }}
                                    >
                                        Ver detalle
                                    </button>
                                </article>
                            ))}
                        </div>

                        <div className="lt-paginacion">
                            <button
                                type="button"
                                disabled={pagina === 0}
                                onClick={() => setPagina(pagina - 1)}
                            >
                                Anterior
                            </button>

                            <span>
                Página {pagina + 1} de {totalPaginas}
              </span>

                            <button
                                type="button"
                                disabled={pagina + 1 >= totalPaginas}
                                onClick={() => setPagina(pagina + 1)}
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                )}
            </section>

            {seleccionado && (
                <section className="lt-card">
                    <h3>Detalle del seguimiento</h3>
                    <DetalleEnvio envio={seleccionado} />
                </section>
            )}
        </section>
    );
}
