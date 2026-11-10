
## F40 — LazyHawk Play

LazyHawk Play es una galería multimedia gratuita,
opcional e integrada al portal LogiTrack.

### Características
- Galería responsive de videos.
- Búsqueda por título y descripción.
- Filtro por categoría.
- Reproductor HTML5.
- Contenido con licencia identificada.
- Funcionamiento independiente del checkout.

### Arquitectura
El módulo está implementado con React y utiliza
el enrutamiento existente de React Router.

No requiere nuevos microservicios ni modificaciones
a las bases de datos.

### Catálogo
Ubicación: src/data/playCatalog.js

El video CC0 inicial sirve como demostración.
El catálogo definitivo se coordina con F39.

### Pruebas
npm run test:unit
npm run lint
npm run build

### Acceso
Ruta: /play

### Issue
logitrack-lazyhawk/logitrack-infra#36
