# Opciones de Evolución (Roadmap)

## OPCIÓN A — Evolución simple sobre la PWA actual
**Estrategia**: Continuar agregando lógica sobre `state.js`, `app.js` y `ui.js` tal como están.
- **Puntos fuertes**: Desarrollo extremadamente rápido. No requiere aprender nuevas estructuras.
- **Desventajas**: `ui.js` superará las 1000 líneas pronto. El mantenimiento a mediano plazo será complejo.
- **Dificultad**: Baja.
- **Riesgo**: Bajo a corto plazo, alto a largo plazo (código espagueti).
- **Tiempo estimado relativo**: 1x (El más rápido).
- **Archivos afectados**: `index.html`, `state.js`, `ui.js`, `app.js`.
- **Archivos NO afectados**: `manifest.json`, Service Workers.
- **Impacto en Netlify**: Nulo.
- **Impacto en uso real**: Inmediato, pero podría ralentizarse con cientos de paquetes si no se optimiza el renderizado de listas.

## OPCIÓN B — Refactor modular controlado
**Estrategia**: Mantener Vanilla JS y el patrón de templates, pero dividir `ui.js` y `app.js` en módulos específicos (`ui-scanner.js`, `ui-paquetes.js`, `ui-mapa.js`, `geo-utils.js`).
- **Puntos fuertes**: Prepara la app para crecer. Facilita la lectura y el aislamiento de errores (concepto de "fusibles" o módulos independientes).
- **Desventajas**: Requiere reestructurar cómo se llaman las funciones entre sí (posiblemente usando módulos ES6 `import/export` o un namespace más limpio).
- **Dificultad**: Media.
- **Riesgo**: Medio (podemos romper la navegación si no se prueba bien).
- **Tiempo estimado relativo**: 2.5x.
- **Archivos afectados**: Se crearían múltiples archivos nuevos. Se vaciaría gran parte de `ui.js` y `routes.js`.
- **Impacto en Netlify**: Nulo (Netlify soporta módulos ES6 nativos sin problema).
- **Impacto en uso real**: Mejor rendimiento a largo plazo, sin cambios visuales inmediatos.

## OPCIÓN C — Reinicio limpio inspirado en lo aprendido
**Estrategia**: Reescribir la app usando una herramienta moderna como Vite + Web Components o un micro-framework reactivo (Preact/Alpine.js).
- **Puntos fuertes**: Máximo rendimiento en listas, arquitectura profesional estandarizada.
- **Desventajas**: Desecha el trabajo funcional actual. Requiere un proceso de compilación (build step).
- **Dificultad**: Alta.
- **Riesgo**: Muy alto (retraso en la entrega, posibles bugs de reescritura).
- **Tiempo estimado relativo**: 5x.
- **Archivos afectados**: Todos.
- **Impacto en Netlify**: Requiere configurar comandos de build (`npm run build`).

---

## Recomendación: La Vía Híbrida (Opción A transicionando a B)
Dadas tus restricciones (*"necesito usar esto trabajando en calle", "no podemos romper lo que ya funciona", "avanzar por checkpoints"*):

**No recomiendo la Opción C.**

Propongo **ejecutar el próximo Sprint utilizando la Opción A**, ya que los cambios solicitados (numeración, tipos de paquete y ordenamiento) encajan perfectamente en la arquitectura actual y nos dan valor inmediato para salir a la calle a probar.

Sin embargo, como **Checkpoint posterior**, estableceremos un "Sprint Técnico" para aplicar la **Opción B**, separando la lógica de UI antes de agregar funcionalidades más complejas (como navegación giro a giro o sincronización en la nube).
