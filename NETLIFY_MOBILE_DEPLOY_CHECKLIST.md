# Checklist Final de Despliegue en Netlify (Prueba en Móvil Real)

## 1. Verificación de Archivos Críticos
Antes de arrastrar la carpeta `APP-Ceo` a Netlify o empujar a tu repositorio (GitHub), confirma que todos estos archivos existen en la raíz (`/`) del proyecto:
- [ ] `index.html`
- [ ] `styles.css`
- [ ] `app.js`
- [ ] `state.js`
- [ ] `ui.js`
- [ ] `routes.js`
- [ ] `data.js`
- [ ] `manifest.json`
- [ ] `service-worker.js`
- [ ] `ocr-reader.js` (si se usa localmente)

## 2. Pre-Check Técnico (Sanity Check)
Asegúrate localmente de lo siguiente antes de hacer el deploy definitivo:
- [ ] El botón DEV (`Generar 30 paquetes demo`) está oculto visualmente (tiene clase `.hidden` y `display: none`).
- [ ] No hay APIs keys privadas, backends enlazados, o contraseñas quemadas en el código base.
- [ ] El CDN de `ZXing` está llamado correctamente (`@zxing/library`).
- [ ] El navegador de escritorio (Localhost) inicializa el `service-worker` sin errores graves.
- [ ] La aplicación puede "Crear Ruta" y "Crear Paquete" puramente basada en `localStorage`.

## 3. Protocolo de Prueba en Móvil Real (HTTPS / Netlify)
Una vez la URL de Netlify esté online (ej. `https://rutaboss-app.netlify.app`), realiza exactamente esta secuencia desde un teléfono Android/iOS:
1. **Entrar:** Abrir la URL en el navegador (Chrome/Safari).
2. **Cámara:** Ir a "Mi Ruta" -> "+ NUEVO PAQUETE" -> tocar "📷 Escanear Código". Aceptar el permiso de la cámara emergente.
3. **Escaneo:** Apuntar a un código de barras cualquiera (ej. botella de agua).
4. **Verificación Visual:** El visor se debe detener, y en verde debe salir el "Código leído".
5. **Completar:** Pulsar "+ AGREGAR RÁPIDO" en la ruta 1 tipo "Tienda".
6. **Verificar Etiqueta:** En la lista, el código de "arriba" (grande) debe ser el físico: `1/1 tienda` o el número que toque, y al abrir en "Ver Detalle", no debe crashear.
7. **Acciones Rápidas:** Pulsar el botón `[📋]` y verificar que pega bien. Pulsar `[✓]` para marcar Entregado, luego `[✗]` para marcar Fallido.
8. **Persistencia:** Recargar la página del móvil. Los paquetes y sus estados deben seguir intactos.

## 4. Prueba Offline (Modo Avión)
1. **Cacheo:** Abre la app con WiFi. Asegúrate de tocar el botón de "Escanear" al menos una vez para que el CDN se guarde en la memoria del Service Worker.
2. **Desconexión:** Cierra la pestaña y pon el móvil en Modo Avión (corta Datos y WiFi).
3. **Apertura:** Vuelve a abrir la app desde la pantalla de inicio o el historial.
4. **Validación:** El Modo Manual ("+ NUEVO PAQUETE" clásico) debe funcionar sin demoras.
5. **Cámara Offline:** Si tocas "Escanear Código", el componente `ZXing` debería arrancar. Si no arranca (por políticas estrictas de Service Worker de algunos navegadores), aparecerá el mensaje rojo *"Error al abrir cámara o falta internet"*, pero **la creación manual no se bloqueará**.

## 5. Casos de Fallo Comunes en la Vía Pública
- **La cámara no abre:** Es estrictamente necesario que la URL contenga `https://`. Los navegadores modernos bloquean el acceso al hardware si la red no es segura.
- **Service Worker Viejo (App no se actualiza):** Si cambias el código en tu PC y resubes a Netlify, el móvil puede mostrar la versión vieja.
- **Netlify CDN Delay:** Netlify usa una potente caché global; tras hacer un *deploy*, la URL puede tardar 2-3 minutos en purgar la memoria en todas las antenas mundiales.

## 6. Instrucciones de Troubleshooting (Solución Rápida)
Si un repartidor reporta que "la app se volvió loca" o "no carga lo nuevo":
1. Ir a `Configuración -> Aplicaciones -> Chrome/Safari -> Borrar Caché / Borrar Almacenamiento Web`.
2. Si la app fue "Instalada" en el escritorio (PWA nativa), desinstalar el ícono y volverlo a agregar.
3. Si denegaron la cámara sin querer: En Chrome, tocar el candado (🔒) a la izquierda de la barra de URL -> "Permisos" -> Permitir Cámara.

## 7. Meta Esperada
La app operará sin problemas al menos en su Modo de Carga Rápida Manual, asegurando un **"Zero Downtime"** para la empresa, usando el scanner ZXing como un mero acelerador (y no una barrera paralizante) de la ruta real.
