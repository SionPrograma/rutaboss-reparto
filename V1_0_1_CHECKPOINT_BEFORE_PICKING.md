# CHECKPOINT: Antes de Modo Picking (v1.0.1)
- **Fecha:** 15 de Junio, 2026
- **Estado:** PWA V1.0.0 Estable y Desplegada en Netlify.
- **Archivos de la aplicación protegidos:** `dist-rutaboss-v1/` y el archivo `rutaboss-v1.0.0-netlify.zip`.
- **Modificaciones a realizar:**
  - `state.js`: Añadir concepto de `status` a las rutas y `isLoaded` a los paquetes. Migración de datos viejos.
  - `index.html`: Nueva vista o panel "Modo Picking / Carga", actualización del dashboard con estados de ruta y botones rápidos.
  - `ui.js`: Renderizado del nuevo Modo Picking, botones rápidos de estados de rutas, visualización de estadísticas en el dashboard.
  - `app.js`: Lógica de acciones para iniciar carga, repartir, cerrar ruta y exportación de CSV ampliada.
  - `routes.js`: Registro de nuevas rutas de UI (ej: "picking").
- **Cómo volver atrás (Rollback):**
  Dado que utilizamos Vanilla JS estático en la raíz, revertir significa descartar los cambios en los archivos de la raíz o hacer un checkout desde el commit anterior. La versión `dist-rutaboss-v1` de Netlify sirve como respaldo seguro si la app se rompe.
