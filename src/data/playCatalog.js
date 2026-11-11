
export const videosPlay = [
    {
        id: "demo-cc0-01",
        titulo: "Demostración de LazyHawk Play",
        descripcion:
            "Video libre de prueba para validar la galería. Se reemplazará por contenido del catálogo F39.",
        categoria: "Recomendados",
        duracion: "0:05",
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        tipo: "video/mp4",
        licencia: "CC0",
        fuente: "MDN Web Docs",
    },
];

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function filtrarVideos(
    videos,
    busqueda = "",
    categoria = "Todas"
) {
    const texto = normalizar(busqueda.trim());

    return videos.filter((video) => {
        const coincideCategoria =
            categoria === "Todas" ||
            video.categoria === categoria;

        const contenido = normalizar(
            `${video.titulo} ${video.descripcion}`
        );

        return (
            coincideCategoria &&
            contenido.includes(texto)
        );
    });
}
