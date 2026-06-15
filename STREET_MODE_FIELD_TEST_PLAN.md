# Plan de Prueba de Campo: Modo Calle

## Objetivo
Ejecutar una prueba de estrés ("Stress Test") simulando el flujo de una jornada completa de reparto (30+ paquetes) en un entorno controlado para identificar cuellos de botella en la UI, caídas de rendimiento o desincronizaciones en el contador o `localStorage`.

## Protocolo de Prueba

### FASE 1: Preparación (Carga Masiva)
1. Abrir la aplicación y entrar como un Repartidor en "Mi Ruta".
2. Ubicar el botón "⚙️ DEV: Generar 30 paquetes demo" (ubicado temporalmente en la parte inferior de la vista).
3. Presionar el botón. Validar que la interfaz responde instantáneamente.
4. **Criterios de Éxito**: Los 30 paquetes deben aparecer. El contador de "Pendientes" debe mostrar 30. El número global de escaneo debió haber avanzado consecuentemente.

### FASE 2: Operativa y Manipulación
1. **Ordenamiento por Ruta**: Cambiar el filtro a "Ruta" y verificar que los 10 primeros pertenecen a Ruta 1, los 10 siguientes a Ruta 2, etc.
2. **Ordenamiento por Tipo**: Cambiar el filtro a "Tipo de Paquete" y asegurar la agrupación visual (Cobros juntos, domicilios juntos).
3. **Copiado al Portapapeles**: Usar el botón `[📋]` en tres paquetes al azar. Pegar en otra app para verificar que se copió correctamente.
4. **Criterios de Éxito**: La lista no debe trabarse ni presentar "lag" insoportable al cambiar de filtro (gracias al `DocumentFragment`).

### FASE 3: Estados y Contador
1. **Entregas**: Pulsar `[✓]` en 5 paquetes de diferentes tipos.
2. **Fallidos**: Pulsar `[✗]` en 2 paquetes.
3. **Validación de UI**: Los 7 paquetes procesados deben empujarse visualmente hacia abajo (o separarse).
4. **Validación de Contadores**: "Entregados" debe marcar 5, "Fallidos" debe marcar 2, "Pendientes" debe haber bajado a 23.
5. **Criterios de Éxito**: Sin bloqueos. Contadores 100% matemáticamente correctos.

### FASE 4: Persistencia y Continuidad
1. **Recargar Aplicación**: Actualizar la página web (`F5` o Pull to Refresh).
2. **Volver al Panel**: Los 30 paquetes deben seguir ahí. Los 5 entregados y 2 fallidos deben mantener sus estados intactos en la lista.
3. **Nuevo Paquete (Límite)**: Entrar a "+ NUEVO PAQUETE" y crear manualmente un paquete tipo "Domicilio" para Ruta 3.
4. **Criterios de Éxito**: El nuevo paquete se guarda. El "Código Físico" autogenerado no choca y respeta el incremento secuencial (si el último demo fue el 30, este debe ser el 31).

---
*Fin del plan. Los resultados deben volcarse en STREET_MODE_FIELD_TEST_REPORT.md.*
