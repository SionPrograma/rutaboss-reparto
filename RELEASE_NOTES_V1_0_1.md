# RutaBoss v1.0.1 - Release Notes

## Nuevas Características (Sprint Picking)
- **Modo Carga (Picking):** Permite cargar paquetes rápidamente a la furgoneta. Todos los paquetes escaneados/cargados manuales a través de esta vía incluyen el estado de `isLoaded: true`.
- **Escáner Independiente:** Separado lógicamente del Modo Calle, para evitar colisiones y asegurar su cierre oportuno.
- **Ciclo de Vida de Rutas:** Las rutas ahora poseen estados: `not_active`, `waiting_for_picking`, `picking`, `delivering`, `delivered`.
- **Dashboard Operativo Inteligente:** Incorpora botones contextuales por ruta que evolucionan conforme progresa la jornada operativa, permitiendo cambiar el estado fácilmente (Iniciar carga -> Marcar en reparto -> Cerrar ruta).

## Mejoras de Trazabilidad y Datos
- **Migración de Datos Transparente:** La versión 1.0.1 migra todos los objetos previos de la versión 1.0.0 añadiendo los campos faltantes, sin comprometer ni corromper los esquemas de localStorage existentes.
- **Exportación Robusta:** Las columnas CSV y la salida JSON ahora incluyen las métricas del picking (`isLoaded`, `loadedAt`) y el estado de progreso general de su ruta matriz (`routeStatus`).

## Correcciones
- Solucionados posibles solapamientos lógicos con el *Service Worker* durante el desarrollo manteniendo la versión estable en `dist-rutaboss-v1`.
- Bloqueada la posibilidad de exportar *undefined* en campos opcionales recién añadidos.
