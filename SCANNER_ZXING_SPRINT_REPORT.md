# Reporte de Sprint: Scanner Real ZXing + Fallback Manual

## Resumen
Se ha integrado la librería `@zxing/library` para la lectura real de códigos de barras (y QR) directamente desde la cámara del móvil en el "Modo Calle". Se ha mantenido una filosofía de desarrollo no destructiva (Vía Híbrida): la creación manual sin cámara sigue siendo el pilar base de la aplicación y sirve como fallback perfecto en caso de denegación de permisos o fallo de hardware.

## Librería Usada
- **Nombre:** ZXing Browser Library (Zebra Crossing)
- **Versión:** 0.20.0
- **Integración:** Vía CDN Seguro (`unpkg.com`) para evitar problemas con Netlify y mantener el despliegue puramente estático.

## Funciones Agregadas
1. **`UI.startScanner()`**: Inicia el objeto `ZXing.BrowserMultiFormatReader`, solicita el stream de cámara (`getUserMedia`) al dispositivo y lo adjunta al elemento `<video>`. Si captura un código de barras, guarda el texto y llama a `stopScanner`.
2. **`UI.stopScanner()`**: Finaliza el flujo de la cámara (apagando el hardware) y oculta el contenedor, evitando drenaje de batería.
3. **Manejadores de Eventos (app.js)**: 
   - `start-scanner`: Inicia el flujo visual.
   - `stop-scanner`: Cancela el escaneo voluntariamente.
   - `save-package-rapido`: Actualizado para inyectar el código leído si existiese temporalmente en el DOM.

## Modelo de Datos Ampliado
Cada paquete nuevo ahora incluye:
- `barcode`: `string` (El código literal extraído, ej. `1234567890123`) o `null`.
- `scannerSource`: `"zxing"` o `"manual"`.
*Nota: El sistema sigue generando y utilizando su código físico interno correlativo (ej. `31/2 tienda`) sin importar el código de rastreo real. Esto mantiene la consistencia visual y de campo solicitada.*

## Archivos Modificados
- **`index.html`**: Se agregó el script de ZXing en el `<head>/<body>`. Se ocultó definitivamente el botón DEV. Se agregó un `<video>` y botones de control dentro del `tpl-crear-paquete-rapido`.
- **`ui.js`**: Se introdujeron las funciones de control de hardware de ZXing. Se programaron fallbacks para mostrar errores en caso de falta de HTTPS, permisos de cámara o problemas de internet.
- **`app.js`**: Se añadieron los listeners. Se interceptó la acción de guardado rápido para recoger el `barcode` del DOM.
- **`state.js`**: Se actualizó `addPaquete` para aceptar y guardar las propiedades `barcode` y `scannerSource`.

## Cómo Probar en Móvil
1. Entrar en la aplicación mediante **HTTPS** (Netlify). (El navegador exige HTTPS para encender la cámara).
2. Entrar a "Mi Ruta" y tocar "+ NUEVO PAQUETE".
3. Tocar **"📷 Escanear Código"**.
4. Autorizar el permiso de la cámara al navegador.
5. Apuntar a cualquier código de barras o código QR.
6. El escáner detectará el código, emitirá el resultado en pantalla y apagará la cámara.
7. Pulsar "+ AGREGAR RÁPIDO".
8. El paquete guardado ahora tiene el `barcode` atado a su objeto.

## Fallback y Errores Manejados
- **Sin Internet al cargar la app**: Si el CDN de ZXing no descarga, el botón informará `La librería ZXing no cargó o no hay internet. Usá la carga manual.` pero la aplicación nunca se colgará.
- **Permisos Denegados**: Si el usuario niega la cámara, se mostrará un texto rojo `Error al abrir la cámara. Verifica permisos o usa carga manual.` pero se permitirá seguir operando con el botón "+ AGREGAR RÁPIDO".

## Riesgos Pendientes
- **Cámara por Defecto**: La librería `decodeFromVideoDevice(null)` elige la cámara trasera por defecto en el 90% de los teléfonos. En tablets muy específicos o configuraciones raras, podría abrir la frontal. Si esto es un problema operativo en campo en el futuro, se deberá programar un selector explícito de cámaras recorriendo los dispositivos de video del hardware (se requieren ~20 líneas de código extra). Para este sprint de mínima fricción, se dejó la opción automática de la librería que es estándar industrial.
