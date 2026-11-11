import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    videosPlay,
    filtrarVideos,
} from "../data/playCatalog";

import "./Play.css";

export default function Play() {
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("Recomendados");
    const [seleccionado, setSeleccionado] = useState(null);

    const categorias = useMemo(
        () => [
            "Recomendados",
            ...new Set(
                videosPlay
                    .map((video) => video.categoria)
                    .filter(
                        (item) =>
                            item && item !== "Recomendados"
                    )
            ),
        ],
        []
    );
    const videosFiltrados = useMemo(() => {
        return filtrarVideos(
            videosPlay,
            busqueda,
            categoria === "Recomendados" ? "Todas" : categoria
        );
    }, [busqueda, categoria]);

    useEffect(() => {
        if (!seleccionado) return;

        function cerrarConEscape(event) {
            if (event.key === "Escape") {
                setSeleccionado(null);
            }
        }

        document.addEventListener("keydown", cerrarConEscape);

        return () => {
            document.removeEventListener(
                "keydown",
                cerrarConEscape
            );
        };
    }, [seleccionado]);

    return (
        <div className="play-app">
            <header className="play-header">
                <div className="play-header__left">
                    <Link to="/play" className="play-brand">
                        <span className="play-brand__icon">▶</span>

                        <span className="play-brand__text">
                            LazyHawk <b>Play</b>
                        </span>
                    </Link>
                </div>

                <div className="play-header__right">
                    <Link to="/" className="play-back">
                        ← Volver al portal
                    </Link>
                </div>
            </header>

            <main className="play-container">
                <section className="play-hero">
                    <div className="play-hero__content">
                        <span className="play-chip">
                            CONTENIDO GRATUITO
                        </span>

                        <h1>Explorá videos</h1>

                        <p>
                            Disfrutá una galería visual con la
                            identidad de LazyHawk. Contenido
                            opcional, moderno y separado del
                            checkout.
                        </p>
                    </div>
                </section>

                <section className="play-toolbar">
                    <div className="play-search">
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>

                        <input
                            type="search"
                            placeholder="¿Qué querés ver?"
                            aria-label="Buscar videos"
                            value={busqueda}
                            onChange={(event) =>
                                setBusqueda(event.target.value)
                            }
                        />
                    </div>
                </section>

                <nav
                    className="play-tabs"
                    aria-label="Categorías de videos"
                >
                    {categorias.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={
                                categoria === item
                                    ? "play-tab active"
                                    : "play-tab"
                            }
                            onClick={() => setCategoria(item)}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="play-list-heading">
                    <h2>
                        {categoria === "Recomendados"
                            ? "Recomendados"
                            : categoria}
                    </h2>

                    <span>
                        {videosFiltrados.length}{" "}
                        {videosFiltrados.length === 1
                            ? "video"
                            : "videos"}
                    </span>
                </div>

                {videosFiltrados.length === 0 ? (
                    <div className="play-empty">
                        <h3>No encontramos resultados</h3>
                        <p>
                            Probá con otro término o elegí otra
                            categoría.
                        </p>
                    </div>
                ) : (
                    <section className="play-grid">
                        {videosFiltrados.map((video) => (
                            <article
                                key={video.id}
                                className="play-card"
                            >
                                <button
                                    type="button"
                                    className="play-card-button"
                                    onClick={() =>
                                        setSeleccionado(video)
                                    }
                                    aria-label={`Reproducir ${video.titulo}`}
                                >
                                    <div className="play-cover">
                                        {video.poster ? (
                                            <img
                                                src={video.poster}
                                                alt=""
                                                loading="lazy"
                                            />
                                        ) : (
                                            <video
                                                src={video.url}
                                                muted
                                                playsInline
                                                preload="auto"
                                                onLoadedData={(event) => {
                                                    const reproductor = event.currentTarget;

                                                    if (reproductor.readyState >= 2) {
                                                        reproductor.currentTime = Math.min(
                                                            0.2,
                                                            reproductor.duration || 0.2
                                                        );
                                                    }
                                                }}
                                                aria-hidden="true"
                                            />
                                        )}

                                        <div className="play-cover__overlay" />

                                        <span className="play-hover-icon">
        ▶
    </span>
                                    </div>

                                    <div className="play-card-info">
                                        <h3>{video.titulo}</h3>

                                        <p>
                                            {video.categoria || "Video"}
                                            {" · "}
                                            {video.duracion || "Contenido"}
                                        </p>

                                        <span className="play-license">
                                            {video.licencia}
                                        </span>
                                    </div>
                                </button>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {seleccionado && (
                <div
                    className="play-overlay"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSeleccionado(null);
                        }
                    }}
                >
                    <section
                        className="play-player"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="play-player-title"
                    >
                        <div className="play-player-header">
                            <div>
                                <h2 id="play-player-title">
                                    {seleccionado.titulo}
                                </h2>
                                <small>
                                    {seleccionado.categoria || "Video"}
                                </small>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSeleccionado(null)
                                }
                                aria-label="Cerrar reproductor"
                            >
                                ✕
                            </button>
                        </div>

                        <video
                            key={seleccionado.id}
                            src={seleccionado.url}
                            poster={seleccionado.poster}
                            controls
                            autoPlay
                            playsInline
                        />

                        <div className="play-player-info">
                            <p>{seleccionado.descripcion}</p>

                            <small>
                                Fuente: {seleccionado.fuente}
                                {" · "}
                                Licencia: {seleccionado.licencia}
                            </small>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}