
# F29 — Integración de Web Components

## Objetivo

Compartir componentes visuales y contratos de comunicación
entre el Backoffice y el Portal Cliente de LogiTrack.

## Implementación

Se desarrolló el Custom Element nativo `lt-envio-card`,
registrado mediante Custom Elements API.

El componente utiliza Shadow DOM para encapsular estilos
y evitar conflictos con las pantallas React.

## Contrato de datos

Recibe un objeto basado en EnvioResponseDto,
devuelto por shipment-service.

Campos principales:
- id
- codigoSeguimiento
- estado
- peso
- origen
- destino
- repartidorId

## Contextos

- admin: Backoffice administrativo.
- cliente: Portal de consulta de envíos.

## Contrato de eventos

Nombre: logitrack:envio-seleccionado

Payload:
{
"id": "UUID",
"codigoSeguimiento": "LT-2026-001",
"contexto": "admin"
}

El evento utiliza bubbles y composed para permitir
la comunicación con aplicaciones contenedoras.

## Integración React

Ambos módulos utilizan EnvioCardWeb.jsx.

Backoffice: src/pages/Envios.jsx

Portal Cliente: src/pages/MisEnvios.jsx

## Pruebas

Ejecutar:

npm run test:unit
npm run lint
npm run build

Pruebas funcionales:
- Renderizado en ambos contextos.
- Emisión del evento de selección.
- Normalización del DTO.
- Manejo de campos ausentes.
- Registro único del Custom Element.

## Alcance

La integración visual no reemplaza la autorización
del backend ni la autenticación OIDC.

El API Gateway continúa siendo el punto de entrada
para las peticiones HTTP.

Issue: logitrack-lazyhawk/logitrack-infra#27
