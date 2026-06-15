# Reporte de Sprint: Panel Operativo de Calle (Modo Rápido)

## Resumen
Se ha implementado el **"Modo Calle"** para optimizar la operativa de campo de los repartidores. El objetivo principal de este sprint ha sido reducir la fricción (cantidad de toques en pantalla) para generar un paquete y actualizar su estado, introduciendo un flujo ultrarrápido sin eliminar el flujo completo preexistente (que incluye OCR y formulario de cliente).

## Cambios Visuales (Mobile-First)
- **Botón "+ NUEVO PAQUETE" Gigante**: Incorporado en el panel principal del repartidor, fácil de pulsar con el pulgar.
- **Contadores Rápidos**: Ahora se muestra un resumen inmediato (Pendientes, Entregados, Fallidos) justo encima de los filtros.
- **Botones de Acción en Tarjeta**: Las tarjetas de paquetes en la lista ahora incluyen tres botones rápidos de 44px de altura mínima táctil: `[✓]` (Entregar), `[✗]` (Fallido) y `[📋]` (Copiar código).
- **Selector Tipo "Píldora" (Pill Buttons)**: Se abandonaron los selectores desplegables `<select>` tradicionales en el nuevo modo rápido por botones anchos ("Domicilio", "Tienda", "Cobro"), dejando los tipos menos comunes ("Pickup", "Devolución") en un menú secundario para no recargar la pantalla.

## Archivos Modificados
1. **`index.html`**:
   - Se añadió el botón gigante y los contadores en `tpl-panel-repartidor`.
   - Se modificó `tpl-paquete-card` añadiendo el contenedor `.paquete-actions` con los nuevos botones.
   - Se creó la nueva plantilla `tpl-crear-paquete-rapido` que presenta la interfaz simplificada.
2. **`styles.css`**:
   - Se añadieron las clases `.pill-group` y `.pill-btn` garantizando áreas táctiles cómodas para uso móvil con una mano (`min-height: 44px`).
3. **`ui.js`**:
   - Se implementó `renderCrearPaqueteRapido()`, manejando el estado activo visual de las píldoras de ruta y tipo sin requerir recargar la página.
   - Se actualizó el generador de tarjetas para enlazar los atributos `data-pkg-id` a los nuevos botones rápidos.
   - Se actualizó `renderSortedPackages()` para incluir una llamada a la nueva función de contadores `updateCounters()`.
4. **`app.js`**:
   - Se añadieron los nuevos delegadores de eventos (`action`): `open-crear-rapido`, `save-package-rapido`, `quick-deliver`, `quick-fail`, `quick-copy`, y `quick-copy-last`.
5. **`routes.js`**:
   - Se agregó la nueva ruta `crear-paquete-rapido` en el enrutador principal.

## Pruebas Móviles Realizadas (Exitosas)
- [x] **Creación Ultra Rápida**: Pulsar "+ Nuevo Paquete", tocar "R1", tocar "Tienda", pulsar "+ Agregar Rápido". Resultado: Paquete `1/1 tienda` creado instantáneamente.
- [x] **Persistencia de Selección**: Si se crea un paquete en R1, al volver a crear otro, R1 ya está preseleccionado.
- [x] **Copiado Inmediato**: El botón `[📋]` copia correctamente el texto visible de la etiqueta al portapapeles del dispositivo.
- [x] **Acciones directas (✓ / ✗)**: Pulsar los botones en la lista actualiza el estado, recalcula los contadores superiores y mueve el paquete al fondo de la lista ordenadamente (gracias al re-sort).
- [x] **Panel Encargado intacto**: Las lógicas no pisaron el renderizado del dashboard del administrador.

## Riesgos Pendientes
- **Cierre involuntario del fallback visual**: El fallback "Fallido rápido" asigna la nota `"Fallido rápido"` por defecto. Para ser más explícito, el repartidor deberá editarlo desde la vista "Ver Detalle" si el encargado necesita el motivo exacto (ej. "Dirección incorrecta"). Para este sprint, se priorizó la velocidad a un toque.

## Siguiente Mejora Recomendada
Con la interfaz probada y estabilizada en el entorno hostil de calle, la deuda técnica prioritaria es la **Refactorización Modular de UI**. El archivo `ui.js` ahora sobrepasa las 700 líneas y mezcla el renderizado del encargado, el del repartidor, y la gestión de Leaflet. Se debe crear la estructura de módulos antes de integrar la cámara nativa (Barcode Scanner).
