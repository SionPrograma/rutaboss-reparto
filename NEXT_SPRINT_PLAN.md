# SPRINT — Numeración automática + rutas + tienda/cobro

## Objetivo
Implementar el flujo real de escaneo y clasificación de paquetes, incluyendo la nueva tipología (domicilio, pickup, PUDO, devolución), la generación automática del código físico para rotular con bolígrafo, y la vista de lista ordenable.

## Modelo de Datos (Actualización en `state.js`)
El objeto paquete evolucionará para coincidir con tu modelo conceptual:
```javascript
{
  idPaquete: "PAQ-N45", // ID interno
  numeroEscaneo: 45,    // scanOrder
  rutaAsignada: "ruta-123", // Referencia a la ruta
  tipo: "tienda",       // Reemplaza esTienda, esCobro, etc. Valores: tienda, cobro, domicilio, pickup, pudo, devolucion
  estado: "pendiente",  // pending, delivered, failed
  codigoFisico: "45/2 tienda", // code
  cliente: "",
  direccion: "",
  telefono: "",
  importeCobro: 0,
  lat: null,            // Preparado para futuro
  lng: null,            // Preparado para futuro
  nota: "",             // notes
  fechaEscaneo: "2026-06-15T...", // scannedAt
  fechaEntrega: null    // deliveredAt
}
```

## Cambios a Nivel de UI y CSS
1. **Filtros/Ordenamiento**: Agregar una barra de herramientas en la vista del repartidor para ordenar la lista de paquetes por: Número de Escaneo, Ruta, Tipo, Estado.
2. **Selector de Tipo**: En el formulario de "Cargar Paquete", reemplazar los checkboxes sueltos (Tienda, Cobro, Horaria) por un selector visual rápido (botones o un select estilizado) que defina el `tipo` del paquete.
3. **Tarjeta de Paquete**: Actualizar la UI de la tarjeta para destacar visualmente el `codigoFisico` (ej. **45/2 tienda**) en grande, ya que es la clave visual para el repartidor.

## Funciones Necesarias
- **`State.addPaquete()`**: Modificar para aceptar el nuevo campo `tipo`, generar la fecha actual en `fechaEscaneo`, y formatear correctamente el `codigoFisico`.
- **`UI.renderPanelRepartidor()`**: Añadir la lógica para ordenar el array de paquetes según el criterio seleccionado antes de renderizarlos.
- **`app.js`**: Nuevos manejadores de eventos (ej. `action='sort-packages'`) para actualizar el estado de ordenamiento y re-renderizar la vista.

## Archivos a Modificar
1. `index.html`: Actualizar `tpl-crear-paquete` y `tpl-panel-repartidor`.
2. `state.js`: Actualizar modelo de datos y lógica de `addPaquete`.
3. `ui.js`: Actualizar `handleSavePackage`, `renderPanelRepartidor`, y `createPaqueteCard`.
4. `app.js`: Agregar eventos para el sistema de ordenamiento.
5. `styles.css`: Clases adicionales para las etiquetas visuales (colores para pickup, PUDO, etc.).

## Archivos Nuevos
Ninguno. Nos mantenemos en la Opción A para este sprint.

## Pruebas Manuales
1. Crear una ruta (Ruta 2).
2. Escanear un paquete -> Asignar a Ruta 2 -> Marcar tipo "Tienda".
3. Verificar que el código generado sea "1/2 tienda".
4. Escanear otro paquete -> Asignar a Ruta 2 -> Marcar tipo "Cobro".
5. Verificar código "2/2 cobro".
6. Ir a la vista del repartidor y probar los botones de ordenamiento (por número, por tipo).

## Rollback / Checkpoint
**MANDATORIO ANTES DE EMPEZAR:**
Realizar una copia de seguridad local (zip) o un commit en Git (`git add . && git commit -m "Checkpoint pre-sprint numeracion"`) del estado actual.

## Criterios de Éxito
- Al crear un paquete, el código físico autogenerado coincide exactamente con la necesidad operativa (ej. "45/2 cobro").
- La interfaz permite ordenar la lista de paquetes instantáneamente sin recargar la página.
- No se ha roto la persistencia en `localStorage`.
- No se han borrado funcionalidades previas (OCR, dibujado en mapa).
