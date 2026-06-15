# Plan Arquitectónico: Backend Supabase para RutaBoss v1.1

Este documento detalla la estrategia para integrar Supabase como backend opcional y progresivo para RutaBoss, garantizando que la arquitectura base siga siendo **Offline-First**, apoyándose en `localStorage` y garantizando que la operatividad del repartidor nunca dependa de su conectividad a Internet.

## 1. Análisis de Viabilidad (¿Conviene usar Supabase?)
**Conclusión inicial:** SÍ, conviene estratégicamente para la Fase v1.1, siempre y cuando se implemente como capa secundaria (Sincronización Asíncrona) y no como capa primaria (Bloqueante).

### Ventajas
- **PostgreSQL escalable:** Estructura relacional robusta.
- **Autenticación (Auth):** Manejo de usuarios, sesiones y roles de forma nativa.
- **Row Level Security (RLS):** Seguridad granular de datos directamente en base de datos.
- **Realtime:** Suscripciones webSockets nativas para el futuro panel del encargado.
- **Capa gratuita generosa:** Ideal para validar el SaaS en su etapa inicial.

### Desventajas y Riesgos
- **Complejidad de Sync:** Sincronizar UUIDs remotos con IDs locales puede generar condiciones de carrera o conflictos.
- **Acoplamiento Frontend:** Obligará a importar el SDK de Supabase, aumentando ligeramente el tamaño del bundle.
- **Riesgo:** Romper la experiencia de "cero latencia" si se intenta hacer *await* a la base de datos al momento de crear un paquete en la calle.

### Mantenimiento del Modo Offline
El flujo de escritura principal siempre será **Síncrono contra `localStorage`**. Supabase operará en un *Web Worker* secundario o mediante llamadas asíncronas de fondo (Fire-and-forget), utilizando colas de operaciones.

---

## 2. Arquitectura Offline-First (Local-First Synchronization)

El flujo vital de la app se protegerá de la siguiente manera:
1. El usuario crea un paquete o actualiza el estado de una ruta.
2. El sistema guarda la entidad en `localStorage` asignándole un identificador temporal único (`localId = UUID-v4` o timestamp cifrado).
3. La entidad se marca en `localStorage` con la bandera `syncStatus: "pendingSync"`.
4. El sistema responde al usuario "Paquete Guardado" inmediatamente (Cero latencia).
5. En segundo plano (si hay `navigator.onLine`), un servicio `syncService.js` lee la cola y hace POST/PATCH a Supabase.
6. Si es exitoso, Supabase devuelve el `remoteId` y el campo `syncedAt`. `localStorage` se actualiza: `syncStatus: "synced"`.
7. Si falla o no hay red, la app sigue viva. Al recargar la app o recuperar red, el ciclo reintenta silenciosamente.

---

## 3. Modelo de Tablas Propuesto

### `profiles` (Usuarios)
- `id` (uuid, PK, refs auth.users)
- `role` (text: 'admin', 'encargado', 'repartidor')
- `full_name` (text)
- `created_at` (timestamptz)

### `workdays` (Jornadas)
- `id` (uuid, PK)
- `created_by` (uuid, FK profiles)
- `date` (date)
- `status` (text: 'open', 'closed')

### `routes` (Rutas)
- `id` (uuid, PK)
- `workday_id` (uuid, FK workdays)
- `number` (int)
- `name` (text)
- `driver_id` (uuid, FK profiles, nullable)
- `status` (text: 'not_active', 'picking', 'delivering', 'delivered')
- `local_id` (text, unique por workday)

### `packages` (Paquetes)
- `id` (uuid, PK)
- `route_id` (uuid, FK routes)
- `local_id` (text, idx)
- `barcode` (text, nullable)
- `physical_code` (text)
- `status` (text: 'pendiente', 'entregado', 'fallido')
- `is_loaded` (boolean)
- `client_name`, `address`, `phone`, `package_type` (text)
- `created_at`, `loaded_at`, `delivered_at` (timestamptz)
- *Índice en `local_id` y compuesto `(barcode, workday_id)` para evitar duplicados.*

### `incidents` (Eventos aislados)
- `id` (uuid, PK)
- `package_id` (uuid, FK packages)
- `type` (text)
- `description` (text)

*(La tabla `sync_queue` no será necesaria en BD, esta cola vive estrictamente en el `localStorage` del cliente).*

---

## 4. Diseño de Roles y Permisos (RBAC)

El acceso a la base de datos se rige por un Enum estricto en la tabla `profiles`:
- **`admin`**: Dios del sistema. Puede leer, borrar, y mutar todas las jornadas de todos los clientes.
- **`encargado`**: Lee y escribe jornadas de su sucursal/tenant asignado. Puede ver dónde están sus repartidores y editar el paquete remotamente.
- **`repartidor`**: Permisos mínimos. Solo puede INSERTAR y ACTUALIZAR paquetes que le han sido asignados, o leer las rutas de su jornada actual. No puede eliminar (DELETE) paquetes remotos, solo marcarlos como `fallido`.

---

## 5. Diseño RLS de Supabase (Políticas Conceptuales)

- **Packages (Select):** `auth.uid() = packages.driver_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'encargado')`
- **Packages (Insert/Update):** Permitir si el usuario está autenticado y si inserta con su `auth.uid()` como autor.
- **No se expondrá `service_role_key`**: El frontend usará estrictamente el `anon_key` y dependerá de las reglas RLS para bloquear modificaciones fraudulentas.

---

## 6. Flujo Lógico de Sincronización y Resolución de Conflictos

1. **Alta:** `Paquete A` creado sin red -> `localId: '1234'`, `syncStatus: 'pendingSync'`.
2. **Conexión:** Red restaurada. `syncService` intenta un `UPSERT` en Supabase matcheando `local_id = 1234`.
3. **Respuesta DB:** Supabase crea la fila y retorna el UUID `remoteId: 'uuid-x'`.
4. **Actualización Local:** En `localStorage`, `Paquete A` pasa a `syncStatus: 'synced'` y almacena `remoteId: 'uuid-x'`.
5. **Prevención Duplicados:** Si se desinstala la app o se borra el caché, y el backend intenta devolver un paquete ya existente, se hace una fusión (*merge*) donde **la versión local (si es más nueva por `updatedAt`) gana**.

---

## 7. Mapa de Futuros Cambios Arquitectónicos

Para integrar esto sin romper la V1.0.1, se utilizará una arquitectura aditiva:

*   **`supabaseClient.js` (NUEVO):** Módulo puro que expone la instancia inicializada de Supabase.
*   **`syncService.js` (NUEVO):** Demonio de fondo que vigila `state.data` e intercepta el evento `window.addEventListener('online', ...)`.
*   **`authService.js` (NUEVO):** UI/Lógica para la capa del login y el manejo de JWT tokens en sesión.
*   **`state.js`:** Se añadirá una llamada `SyncService.notify()` al final de `save()`. El esquema de datos no cambiará, solo se le añadirán subnodos `sync: {}`.
*   **`app.js`:** Invocará `AuthService.init()` al arranque.
*   **`ui.js`:** Pequeños hooks de UI (un icono de "nube verde" o "nube naranja" indicando estados pendientes de sincronización).

---

## 8. Fases de Despliegue Propuestas

*   **Fase 1: Backup Manual ("Sincronización Botón").** Se crea un botón de "Subir Jornada a la Nube". Si hay error, el operario exporta en CSV como siempre. Esto asegura estabilidad total mientras se pule la integración DB.
*   **Fase 2: Sync Transparente.** El backup se vuelve automático (background sync).
*   **Fase 3: Autenticación & Roles.** El acceso a la PWA exige Login.
*   **Fase 4: Panel del Encargado.** Utilizar WebSockets nativos de Supabase para ver cómo cambian los contadores en vivo.

---

## 9. Prompt SQL de Inicialización (Borrador Conceptual)

```sql
-- ⚠️ ATENCIÓN: BORRADOR. NO EJECUTAR EN PRODUCCIÓN SIN REVISIÓN DE ÍNDICES Y RLS.

CREATE TYPE user_role AS ENUM ('admin', 'encargado', 'repartidor');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  role user_role DEFAULT 'repartidor',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workdays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id),
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'open'
);

CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workday_id UUID REFERENCES workdays(id),
  number INT,
  name TEXT,
  status TEXT DEFAULT 'not_active',
  local_id TEXT UNIQUE
);

CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id),
  local_id TEXT NOT NULL,
  barcode TEXT,
  physical_code TEXT,
  status TEXT DEFAULT 'pendiente',
  is_loaded BOOLEAN DEFAULT FALSE,
  client_name TEXT,
  address TEXT,
  phone TEXT,
  package_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  loaded_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  UNIQUE (local_id)
);

-- Ejemplo de RLS Activación
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repartidores insertan paquetes de su jornada" 
ON packages FOR INSERT 
TO authenticated 
WITH CHECK (true); -- (Refinar en prod con verificación de rol y permisos asignados)
```

---

## 10. Recomendación Final
**Aprobado para la V1.1**. Supabase es el "backend perfecto" para aplicaciones frontend modernas por su PWA friendly SDK. La clave del éxito es **mantener a toda costa el motor actual (`localStorage`) como fuente de la verdad para la interfaz local**. Supabase debe ser tratado exclusivamente como un espejo de backup secundario y un router para conectar jefes con repartidores, pero nunca como un candado que impida escanear paquetes en zonas rurales sin cobertura.
