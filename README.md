# React + Vite

## Modo demostración del Portal del Cliente

Para probar el portal sin Keycloak ni microservicios, creá o editá `.env.local` en esta carpeta:

```dotenv
VITE_DEMO_MODE=true
```

Ejecutá `npm ci` si todavía no instalaste las dependencias y luego `npm run dev`.
Abrí la URL que indique Vite (normalmente `http://localhost:5173/login`) y elegí **Entrar en modo demostración**.
Si ya tenés una sesión real abierta, cerrala antes de entrar desde el login.

La demostración permite recorrer Inicio, Crear envío y Mis envíos. Incluye diez paquetes y paginación:

- `LT-DEMO-001`: pendiente.
- `LT-DEMO-002`: en ruta.
- `LT-DEMO-003`: entregado.
- `LT-DEMO-004`: cancelado.

Probá registrar un paquete, consultar el código generado y buscar un código inexistente para ver el error.
Los nuevos envíos aparecen primero en Mis envíos. Las tarifas y direcciones son ficticias y no representan cotizaciones reales.

Los datos y la entrada a DEMO se mantienen únicamente en memoria: al recargar volvés al login y se restaura el listado inicial.
**Salir de la demostración** tampoco altera tokens ni credenciales reales. No se generan JWT ni se guardan sesiones simuladas.
El Backoffice permanece fuera del modo DEMO.

Para desactivarlo, eliminá la variable o cambiala a `VITE_DEMO_MODE=false`, reiniciá Vite y recargá el navegador.
Se requieren ambas condiciones: `import.meta.env.DEV` y `VITE_DEMO_MODE=true`. Las compilaciones de producción y `npm run preview` no habilitan DEMO, aunque la variable esté en `true`; los mocks no se incluyen en el build de producción.

Validaciones: `npm run lint`, `npm run test:unit` y `npm run build`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
