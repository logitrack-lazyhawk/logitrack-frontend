import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playServicio } from "../services/api"; // <-- Importamos el servicio
import "./Play.css";

// Mapeo de categorías para el filtro (puedes ajustarlo según lo que devuelva el backend)
const CATEGORIAS = ["Recomendados", "Educativo", "Cortos", "Documental"];

export default function Play() {
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("Recomendados");
    const [seleccionado, setSeleccionado] = useState(null);

    // Estados para los datos del backend
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar datos del backend al montar el componente
    useEffect(() => {
        const cargarPlay = async () => {
            try {
                // 1. Intentamos obtener el contenido
                let response = await playServicio.listar();

                // 2. Si está vacío, hacemos el seed (cargar datos de prueba)
                if (response.data.length === 0) {
                    console.log("Contenido vacío, insertando datos de prueba...");
                    response = await playServicio.seed();
                }

                // 3. Adaptamos los datos del backend al formato que espera tu UI
                const videosAdaptados = response.data.map(item => ({
                    id: item.id,
                    titulo: item.titulo,
                    descripcion: item.descripcion,
                    categoria: item.categoria,
                    url: item.urlVideo, // URL del video (embed o directo)
                    poster: item.miniaturaUrl,
                    duracion: "Video", // Campo opcional que tenías
                    licencia: "Creative Commons", // Campo opcional
                    fuente: "LazyHawk Play"
                }));

                setVideos(videosAdaptados);
            } catch (err) {
                console.error("Error al cargar Play:", err);
                setError("No se pudo cargar el contenido de LazyHawk Play.");
            } finally {
                setLoading(false);
            }
        };
        cargarPlay();
    }, []);

    // Lógica de filtrado (adaptada a los datos del backend)
    const videosFiltrados = useMemo(() => {
        return videos.filter((video) => {
            const coincideBusqueda = video.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                video.descripcion.toLowerCase().includes(busqueda.toLowerCase());

            const coincideCategoria = categoria === "Recomendados" || video.categoria === categoria;

            return coincideBusqueda && coincideCategoria;
        });
    }, [busqueda, categoria, videos]);

    // Cerrar modal con Escape
    useEffect(() => {
        if (!seleccionado) return;
        function cerrarConEscape(event) {
            if (event.key === "Escape") setSeleccionado(null);
        }
        document.addEventListener("keydown", cerrarConEscape);
        return () => document.removeEventListener("keydown", cerrarConEscape);
    }, [seleccionado]);

    if (loading) return <p style={{ padding: '20px' }}>Cargando LazyHawk Play...</p>;
    if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

    return (
        <div className="play-app">
            {/* ... (Mantén tu header igual) ... */}
            <header className="play-header">
                <div className="play-header__left">
                    <Link to="/play" className="play-brand">
                        <span className="play-brand__icon">▶</span>
                        <span className="play-brand__text">LazyHawk <b>Play</b></span>
                    </Link>
                </div>
                <div className="play-header__right">
                    <Link to="/" className="play-back">← Volver al portal</Link>
                </div>
            </header>

            <main className="play-container">
                <section className="play-hero">
                    <div className="play-hero__content">
                        <span className="play-chip">CONTENIDO GRATUITO</span>
                        <h1>Explorá videos</h1>
                        <p>Disfrutá una galería visual con la identidad de LazyHawk. Contenido opcional, moderno y separado del checkout.</p>
                    </div>
                </section>

                <section className="play-toolbar">
                    <div className="play-search">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="search"
                            placeholder="¿Qué querés ver?"
                            aria-label="Buscar videos"
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                        />
                    </div>
                </section>

                <nav className="play-tabs" aria-label="Categorías de videos">
                    {CATEGORIAS.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={categoria === item ? "play-tab active" : "play-tab"}
                            onClick={() => setCategoria(item)}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="play-list-heading">
                    <h2>{categoria === "Recomendados" ? "Recomendados" : categoria}</h2>
                    <span>{videosFiltrados.length} {videosFiltrados.length === 1 ? "video" : "videos"}</span>
                </div>

                {videosFiltrados.length === 0 ? (
                    <div className="play-empty">
                        <h3>No encontramos resultados</h3>
                        <p>Probá con otro término o elegí otra categoría.</p>
                    </div>
                ) : (
                    <section className="play-grid">
                        {videosFiltrados.map((video) => (
                            <article key={video.id} className="play-card">
                                <button
                                    type="button"
                                    className="play-card-button"
                                    onClick={() => setSeleccionado(video)}
                                    aria-label={`Reproducir ${video.titulo}`}
                                >
                                    <div className="play-cover">
                                        {video.poster ? (
                                            <img src={video.poster} alt="" loading="lazy" />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', backgroundColor: '#333' }} />
                                        )}
                                        <div className="play-cover__overlay" />
                                        <span className="play-hover-icon">▶</span>
                                    </div>

                                    <div className="play-card-info">
                                        <h3>{video.titulo}</h3>
                                        <p>{video.categoria || "Video"} · {video.duracion || "Contenido"}</p>
                                        <span className="play-license">{video.licencia}</span>
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
                        if (event.target === event.currentTarget) setSeleccionado(null);
                    }}
                >
                    <section className="play-player" role="dialog" aria-modal="true" aria-labelledby="play-player-title">
                        <div className="play-player-header">
                            <div>
                                <h2 id="play-player-title">{seleccionado.titulo}</h2>
                                <small>{seleccionado.categoria || "Video"}</small>
                            </div>
                            <button type="button" onClick={() => setSeleccionado(null)} aria-label="Cerrar reproductor">✕</button>
                        </div>

                        {/* Usamos un iframe para videos de YouTube o un <video> si es un archivo directo */}
                        {seleccionado.url.includes('youtube.com') || seleccionado.url.includes('youtu.be') ? (
                            <iframe
                                width="100%"
                                height="400"
                                src={seleccionado.url}
                                title={seleccionado.titulo}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                key={seleccionado.id}
                                src={seleccionado.url}
                                poster={seleccionado.poster}
                                controls
                                autoPlay
                                playsInline
                            />
                        )}

                        <div className="play-player-info">
                            <p>{seleccionado.descripcion}</p>
                            <small>Fuente: {seleccionado.fuente} · Licencia: {seleccionado.licencia}</small>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}