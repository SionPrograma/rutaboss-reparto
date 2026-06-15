# CONTRATO DE IMPLEMENTACIÓN: SUPABASE v1.1 (Backup Manual)

Este documento sirve como contrato técnico estricto para el desarrollo de RutaBoss v1.1. Define el alcance innegociable, la estructura de base de datos y la arquitectura frontend necesarias para implementar un "Backup Manual / Snapshot de Jornada" en Supabase.

---

## 1. Alcance Exacto y Aprobado
La versión 1.1 de RutaBoss introducirá un botón denominado **"Subir respaldo a Nube"** en el panel lateral o inferior. Su único propósito es extraer una fotografía completa del estado de la jornada actual (`localStorage`) y enviarlo íntegramente a una tabla plana en Supabase.

### 1.1 Lo que DEBE hacerse:
- Leer el estado (`State.data`) desde `localStorage`.
- Calcular la metadata local: `total de paquetes`, `entregados`, `fallidos`, `rutas activas`, `fecha de jornada`, y `app_version`.
- Construir un objeto `payload_json` con toda la data en bruto.
- Ejecutar un POST a Supabase para insertar una fila en `workday_backups`.
- Modificar el objeto de estado de la jornada local (`state.js`) para persistir:
  - `backupStatus`: "never" | "pending" | "uploading" | "uploaded" | "error"
  - `lastBackupAt`: string | null
  - `remoteBackupId`: string | null
  - `backupError`: string | null
- Renderizar un feedback visual ligero y claro (ej: icono verde, "Backup OK").

### 1.2 Prohibiciones Estrictas (Lo que NO debe implementarse):
- 🚫 **No Auth:** Nada de logins, tokens de usuario o esquemas multiusuario complejos.
- 🚫 **No Realtime:** Sin WebSockets, ni panel en vivo para encargados.
- 🚫 **No Auto-Sync:** Prohibido disparar sincronizaciones automáticas on-line u off-line.
- 🚫 **No RLS Avanzado:** No se ligarán registros a repartidores individuales (todavía).
- 🚫 **No Service_Role:** El frontend solo podrá usar `anon_key`.
- 🚫 **No Bloqueo:** La ausencia de red no debe impedir nunca crear/editar rutas o paquetes.
- 🚫 **No Modificar V1.0.1 Core:** La lógica de "Modo Calle", "Modo Picking", exportación CSV o el esquema base del `localStorage` no sufrirán alteraciones disruptivas.

---

## 2. Estructura de Datos e Infraestructura

### 2.1 Tabla Mínima en Supabase: `workday_backups`
La base de datos operará como un receptáculo pasivo de instantáneas (Snapshots).

*   `id`: uuid (Primary Key, default: `gen_random_uuid()`)
*   `created_at`: timestamptz (default: `now()`)
*   `device_id`: text (UUID generado por cliente en `localStorage` al iniciar la app)
*   `app_version`: text (ej: "v1.1")
*   `workday_date`: date (formato YYYY-MM-DD)
*   `package_count`: int
*   `delivered_count`: int
*   `failed_count`: int
*   `route_count`: int
*   `payload_json`: jsonb (Copia literal de los arrays de paquetes y rutas)

### 2.2 SQL Borrador (Ejecución controlada por el Dev)
```sql
-- ⚠️ ADVERTENCIA: Borrador de configuración. Revisar seguridad antes de pasar a Producción.

CREATE TABLE workday_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    device_id TEXT NOT NULL,
    app_version TEXT NOT NULL,
    workday_date DATE NOT NULL,
    package_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    route_count INT DEFAULT 0,
    payload_json JSONB NOT NULL
);

-- Habilitar Políticas de Seguridad por Filas
ALTER TABLE workday_backups ENABLE ROW LEVEL SECURITY;

-- Política TEMPORAL controlada para anon_key
-- Permite insertar, pero impide leer datos del servidor de otros dispositivos.
CREATE POLICY "Permitir solo INSERT a usuarios anónimos"
ON workday_backups
FOR INSERT
TO anon
WITH CHECK (true);
```

---

## 3. Flujo de Software

### 3.1 Flujo del Usuario
1. Finaliza su jornada o quiere prevenir pérdida de datos a media jornada.
2. Toca el botón "Subir Respaldo".
3. Ve un icono de "Cargando..." (`backupStatus: "uploading"`).
4. Un segundo después, el icono cambia a "Subido a las 18:30" (`backupStatus: "uploaded"`).
5. (Opcional) Si la cobertura es nula, ve un icono de error y la advertencia: "Sin red. Respaldo fallido. Exporta tu CSV o intenta más tarde".

### 3.2 Flujo Técnico Interno
- `ui.js` captura el clic de `btn-backup` -> delega en `app.js` -> dispara `BackupService.upload()`.
- `BackupService` invoca `State.getData()` para extraer información, suma los contadores estadísticos y envía la petición vía `SupabaseClient.from('workday_backups').insert()`.
- Supabase retorna la fila insertada (`data[0].id`).
- Se invoca `State.updateBackupInfo(id, status, error)`.
- `ui.js` actualiza el DOM del indicador de red.

---

## 4. Archivos Modificados (Roadmap)
No se crearán lógicas espagueti. Toda la lógica irá a archivos dedicados de nueva creación.

**Archivos Nuevos:**
- `supabaseClient.js`: Exporta el cliente instanciado globalmente de `@supabase/supabase-js`.
- `backupService.js`: Agrupa toda la lógica de ensamblado JSON y comunicación con DB.
- `config.supabase.example.js`: Plantilla de variables (`url`, `anonKey`).

**Archivos Existentes que se Alterarán:**
- `index.html`: Agregar `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`, e insertar el botón de respaldo.
- `ui.js`: Renderizado condicional del botón basado en el campo `backupStatus`.
- `state.js`: Ampliación del esquema para soportar el nodo `backupInfo`.
- `app.js`: Switch `case: 'upload-backup'`.
- `.gitignore`: Asegurar exclusión de `config.supabase.js`.
- `README_DEV.md`: Documentar paso obligatorio de inyectar variables Supabase en el nuevo clon.
- `RELEASE_NOTES_V1_1.md`: Para documentar los cambios ante QA.

---

## 5. Variables y Entorno
El sistema utilizará inyección estática (o constantes de `window`) para configuración.
**Ejemplo de archivo público `config.supabase.example.js`:**
```javascript
window.RUTABOSS_SUPABASE_CONFIG = {
    url: "https://<TU-PROYECTO-ID>.supabase.co",
    anonKey: "<TU_ANON_KEY_PUBLICA>"
};
```
*(Es obligatorio crear y popular localmente `config.supabase.js` durante el desarrollo, que estará ignorado en Git).*

---

## 6. Pruebas y Criterios de Aceptación

### Batería de Pruebas
1. **Sin Red:** El botón falla elegante, guarda `error` local y no corrompe la UI.
2. **Con Datos Ficticios (Dummy):** La inserción JSON genera exactamente 1 fila en Supabase.
3. **Credenciales Inválidas:** Retorna un HTTP 403 o error en consola pero el PWA sigue funcionando sin inmutarse.
4. **Integridad Histórica:** La funcionalidad exportar CSV/JSON existente sigue operando exactamente como antes y la limpieza de jornada blanquea los contadores del backup pero puede conservar el historial de `lastBackupAt`.

### Criterios de Éxito / Aprobación para Paso a Producción
*   ✅ RutaBoss sigue siendo 100% capaz de arrancar, crear rutas, leer escáneres y funcionar offline.
*   ✅ No se expone la `service_role_key` de Supabase en el código cliente.
*   ✅ La V1.0.1 (su interfaz, performance, templates) no sufre roturas.
*   ✅ El botón de subir backup ofrece un alivio psicológico real al repartidor.
