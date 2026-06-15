# Insights desde APK hacia RutaBoss

Este documento explica de forma teórica qué conceptos operativos extraídos del análisis funcional de una APK de logística de terceros hemos decidido implementar y adaptar a nuestra arquitectura propia (RutaBoss), y qué descartamos por completo.

## Conceptos Operativos Adaptados
1. **Flujo de Vida de una Ruta (Route Status):**
   - *De la APK:* `not_active` -> `waiting_for_picking` -> `picking` -> `delivering` -> `delivered`.
   - *En RutaBoss:* Implementamos una versión traducida al español para una fácil lectura del operador: Sin Iniciar, Esperando Carga, Cargando, En Reparto, Cerrada. Añade gran valor para que el jefe de ruta sepa en qué fase del día está cada repartidor.
2. **Concepto de "Carga/Picking" vs "Pendiente":**
   - *De la APK:* `scan_orders`, `pickup`.
   - *En RutaBoss:* Separamos el acto de "cargar en la furgoneta" (Picking) del acto de "estar pendiente de entrega". Añadimos el campo `isLoaded` a cada paquete. Un paquete puede ser creado (pendiente), pero no estar cargado físicamente. El Modo Picking acelera la transición a `isLoaded: true`.
3. **Flujo de Fallos y Retornos:**
   - *De la APK:* `failed_pickup`, `redirected_to_pudo`, `return`.
   - *En RutaBoss:* Estos conceptos ya estaban pre-esbozados como estados de paquete (`fallido`, `pickup`, `pudo`, `devolucion`). Ahora ganan más sentido al tener un "Estado de Ruta".

## Lo que NO se copia
1. **Código fuente ni assets visuales:** Toda la UI de RutaBoss (Modo Calle, botones, CSS) se mantiene con nuestro diseño *mobile-first* original Vanilla JS. No extraemos íconos ni logotipos de la competencia.
2. **Endpoints ni APIs cerradas:** RutaBoss sigue operando 100% *Offline First* apoyándose en `localStorage`. Ninguna llamada a red hacia servidores propietarios será replicada.
3. **Gestión de Sesión:** No se importan tokens JWT complejos ni analíticas de rastreo propietario.

## Futuras Mejoras
- **PUDO Dinámicos:** Mapeo de Puntos de Conveniencia reales.
- **Ruteo y Optimización ESP:** Calcular la ruta más corta (Traveling Salesperson Problem) una vez que la ruta pasa a estado "En Reparto".
