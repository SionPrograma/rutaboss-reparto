# Auditoría Técnica: RutaBoss V1

## Arquitectura
La PWA opera con un marco de *Single Page Application (SPA)* sin depender de frameworks mayores (React/Vue), lo que le da una ventaja radical en velocidad de arranque y peso para redes intermitentes (3G/H+). 
El modelo de capas se compone de:
1. **Vista (`ui.js` / `index.html`)**: Manipulación de fragmentos de DOM.
2. **Eventos (`app.js`)**: `Delegation` central a nivel global para captura de botones.
3. **Controlador (`routes.js`)**: Manejo de estado visual ficticio.
4. **Estado (`state.js`)**: Gestor de caché asíncrona hacia `localStorage`.

## Archivos Tocados en el Sprint Final
- `index.html`: Eliminación del login inicial (se asume PWA personal), refactorización del `tpl-dashboard-encargado` a `tpl-dashboard-v1`, e inyección de filtros y barra de búsqueda en Mi Ruta.
- `ui.js`: Incorporación de `renderDashboardV1`, lógica de filtros `searchStr` / `filterEstado` antes del repintado de lista de tarjetas, y ajuste visual para acción `quick-reset`.
- `app.js`: Nuevos manejadores para el Switch central (`export-jornada`, `clear-jornada`, `quick-reset`). Remoción del sistema de autenticación inerte (login).
- `state.js`: Estandarización final del modelo a diccionario anglosajón (`status`, `scannedAt`, `deliveredAt`) con alias latinos (`estado`, `tipo`) para compatibilidad. Función `clearJornada`.

## Modelo de Datos (Data Dictionary)
El core de persistencia graba objetos como:
```json
{
  "id": "PAQ-N31",
  "scanOrder": 31,
  "routeNo": 1,
  "tipo": "tienda",
  "mode": "tienda",
  "status": "pending",
  "codigoFisico": "31/1 tienda",
  "barcode": "123456789",
  "scannerSource": "zxing",
  "address": "Calle Falsa 123",
  "notes": "",
  "scannedAt": "2026-06-15T12:00:00.000Z",
  "deliveredAt": null
}
```

## Dependencias (External CDNs)
- `Leaflet` (Mapas v1.9.4)
- `ZXing Browser` (Scanner v0.20.0)
- `SheetJS` (XLSX Exporting)

## Riesgos Técnicos y Deuda
1. **`ui.js` y `index.html` gigantes**: Tienen un volumen de líneas al borde del límite cognitivo para un solo archivo. La modularización (Separación de Controladores de Vista) no se realizó para priorizar estabilidad de Release, pero es mandatoria para V2.
2. **SheetJS Bloqueante**: La exportación bloquea el hilo principal. Para jornadas de >2,000 paquetes se experimentará un "congelamiento" de UI durante medio segundo, lo cual es tolerable en el escenario actual.

## Rollback
Si alguna normalización falla silenciosamente en ciertos navegadores viejos de repartidores, o la ausencia de Login desestabiliza los reportes previos, se puede retroceder a la versión `pre-v1` consultando el `RELEASE_CANDIDATE_CHECKPOINT.md` para extraer los archivos JS de ayer.
