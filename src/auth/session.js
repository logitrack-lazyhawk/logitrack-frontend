export function leerSesion(token, ahora = Date.now()) {
    try {
        const partes = token.split('.');
        if (partes.length !== 3 || !partes[2]) return null;
        const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0))));
        if (!claims.sub || !Number.isFinite(claims.exp) || claims.exp * 1000 <= ahora) return null;
        const lista = valor => Array.isArray(valor) ? valor : typeof valor === 'string' ? [valor] : [];
        const roles = [...lista(claims.roles), ...lista(claims.realm_access?.roles),
            ...Object.values(claims.resource_access ?? {}).flatMap(client => lista(client?.roles))]
            .filter(rol => typeof rol === 'string').map(rol => rol.toUpperCase().replace(/^ROLE_/, ''));
        return { roles: [...new Set(roles)], nombre: claims.given_name || claims.name || claims.preferred_username || 'Mi cuenta', expira: claims.exp * 1000 };
    } catch {
        return null;
    }
}

export function obtenerSesion() {
    return leerSesion(localStorage.getItem('token') ?? '');
}

export function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.dispatchEvent(new Event('logitrack:sesion'));
}

export function rutaPermitida(sesion, roles = []) {
    return Boolean(sesion && (!roles.length || roles.some(rol => sesion.roles.includes(rol))));
}
