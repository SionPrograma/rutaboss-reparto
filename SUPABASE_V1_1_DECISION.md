# SUPABASE V1.1 DECISION Y HOJA DE RUTA MÍNIMA

## 1. Análisis Crítico del Plan Supabase
Tras revisar el `SUPABASE_BACKEND_PLAN.md`, se concluye lo siguiente:

* **¿Conviene Supabase para RutaBoss?** Sí, es la opción ideal por su simplicidad de integración en frontend estático y su potente API REST nativa, pero debe introducirse con extrema cautela.
* **¿Qué problema resuelve primero?** La vulnerabilidad de depender 100% del dispositivo físico del repartidor. Un teléfono roto o caché borrado implica pérdida total de la jornada. Supabase ofrecerá un "salvavidas" centralizado.
* **¿Qué NO debe resolver todavía?** No debe intentar gestionar sesiones complejas, roles de usuarios ni sincronización bi-direccional en tiempo real. 
* **¿Qué riesgos tiene meterlo pronto?** Introducir lógica de autenticación o WebSockets prematuramente puede desestabilizar la V1.0.1 que ya es sólida, introducir "estados de carga" molestos y romper el principio Offline-First.
* **¿Qué partes del plan son imprescindibles?** Usar Supabase estrictamente como almacén pasivo (backup as a service) con una política de solo inserción controlada.
* **¿Qué partes son demasiado avanzadas para v1.1?** Tablas relacionales complejas (`profiles`, `routes`, `packages` separados), Login (Auth JWT completo), RLS avanzado, y el Panel del Encargado en tiempo real.

## 2. Alcance Recomendado para RutaBoss v1.1
El alcance para la v1.1 debe reducirse exclusivamente a la **Opción A: Backup Manual de Jornada**.
No se implementará autenticación, multiusuario ni panel de control en tiempo real. Se tratará a Supabase como un "disco duro externo en la nube" donde se vuelca un JSON completo al final de la jornada o bajo demanda.

## 3. Diseño de la Fase v1.1 Mínima
Se agregará un nuevo botón en la interfaz: **"Subir respaldo"** (o "Sincronizar Jornada").
El flujo será el siguiente:
1. El usuario pulsa el botón.
2. La app empaqueta toda la jornada actual desde `localStorage` en un payload JSON gigante.
3. Se envía a Supabase vía POST (usando Fetch simple o el cliente ligero) si hay conexión a internet.
4. Supabase devuelve un UUID remoto.
5. Se actualiza la UI mostrando estados progresivos: `pendiente` -> `subiendo` -> `subido` (o `error` si falla la red).
6. Si ocurre un fallo, la app local no se bloquea y el usuario puede seguir trabajando.

## 4. Cambios en Estructura de Datos Local
Se añadirá al objeto principal de la jornada en `state.js` (sin alterar los paquetes individuales):
```javascript
{
  backupStatus: "never" | "pending" | "uploading" | "uploaded" | "error",
  lastBackupAt: string | null,
  remoteBackupId: string | null,
  backupError: string | null
}
```

## 5. Tablas Mínimas Supabase para v1.1
En lugar de una estructura hiper-relacional (que asume multiusuario), la Fase 1 usará **una única tabla plana** que guarde instantáneas.

**Tabla: `workday_backups`**
* `id` (uuid, primary key)
* `created_at` (timestamptz, por defecto NOW())
* `device_id` (text, un UUID generado en localStorage para identificar el teléfono)
* `app_version` (text, ej: "v1.1")
* `workday_date` (date)
* `payload_json` (jsonb, almacena el estado completo)
* `package_count` (int, metadato para búsquedas rápidas)
* `delivered_count` (int)
* `failed_count` (int)

## 6. Esquema de Seguridad
* **No usar `service_role key`:** El código del cliente solo utilizará el `anon_key`.
* **RLS (Row Level Security):** Se configurará una política simple que permita `INSERT` a usuarios anónimos (o se usará un flujo de autenticación anónima nativo de Supabase) pero que bloquee los `SELECT`, `UPDATE` y `DELETE` para evitar extracción de datos públicos.
* **Datos Sensibles:** Durante el desarrollo y validación, no se subirán clientes reales. Se probará exclusivamente con datos ficticios.

## 7. Checklist antes de la Implementación
- [ ] Crear proyecto en Supabase (Tier Gratuito).
- [ ] Obtener URL pública y `anon_key`.
- [ ] Crear la tabla `workday_backups` con el esquema sugerido.
- [ ] Configurar RLS: `ENABLE ROW LEVEL SECURITY` + Política de solo INSERT.
- [ ] Probar una inserción manual directamente desde el Editor SQL de Supabase.
- [ ] Escribir un pequeño script en RutaBoss para probar un insert con *dummy data*.

## 8. Recomendación Final
**Se aprueba firmemente la Opción A: Backup manual solamente.**
Justificación: Introducir una sincronización asíncrona por entidades (paquetes sueltos) o intentar implementar un login de usuarios obligaría a reescribir drásticamente el `state.js` y las vistas, poniendo en riesgo la estabilidad operativa de la PWA. El backup manual mediante JSON (Snapshot approach) añade un valor inmenso (seguridad antidaños) con un riesgo arquitectónico prácticamente nulo, al no alterar la lógica interna de creación ni gestión de rutas. Una vez este "puente" con la base de datos se demuestre estable bajo estrés, la v1.2 podrá dar el paso hacia la partición relacional de la información.
