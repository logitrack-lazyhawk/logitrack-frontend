
import test from "node:test";
import assert from "node:assert/strict";

import {
    videosPlay,
    filtrarVideos,
} from "../data/playCatalog.js";

test("el catálogo tiene identificadores únicos", () => {
    const ids = videosPlay.map((video) => video.id);

    assert.equal(
        new Set(ids).size,
        videosPlay.length
    );
});

test("los videos usan licencias permitidas", () => {
    const licenciasPermitidas = [
        "CC0",
        "PROPIO",
        "DOMINIO_PUBLICO",
        "EMBED_AUTORIZADO",
    ];

    for (const video of videosPlay) {
        assert.ok(
            licenciasPermitidas.includes(video.licencia)
        );
    }
});

test("los videos tienen una URL válida", () => {
    for (const video of videosPlay) {
        assert.ok(
            video.url.startsWith("https://") ||
            video.url.startsWith("/")
        );
    }
});

test("permite buscar por título", () => {
    const resultado = filtrarVideos(
        videosPlay,
        "Demostración"
    );

    assert.equal(resultado.length, 1);
});

test("permite filtrar por categoría", () => {
    const resultado = filtrarVideos(
        videosPlay,
        "",
        "Recomendados"
    );

    assert.equal(resultado.length, 1);
});

test("devuelve vacío cuando no hay coincidencias", () => {
    const resultado = filtrarVideos(
        videosPlay,
        "contenido inexistente"
    );

    assert.equal(resultado.length, 0);
});

test("no requiere información de checkout", () => {
    for (const video of videosPlay) {
        assert.equal(video.checkout, undefined);
        assert.equal(video.paymentId, undefined);
        assert.equal(video.orderId, undefined);
    }
});
