# Flujo de Desarrollo a Producción (RutaBoss V1)

Este documento define el estándar de trabajo profesional para evolucionar, probar y desplegar RutaBoss, asegurando que la versión estable de producción nunca se rompa accidentalmente.

## 1. Abrir en Visual Studio Code
Para evitar que el editor añada configuraciones ocultas incompatibles o bloquee archivos:
1. Abre **Visual Studio Code**.
2. Ve a `File -> Open Folder...` y selecciona la carpeta principal `APP-Ceo`.
3. Esto cargará automáticamente las configuraciones de la carpeta `.vscode/`, recomendando extensiones como Live Server.

## 2. Correr con Live Server (Desarrollo Local)
RutaBoss requiere simular un entorno de servidor estático para que funcionen la cámara y los Service Workers.
1. Haz clic derecho sobre el archivo **`index.html`** (en la carpeta raíz, **no** en `dist-rutaboss-v1/`).
2. Selecciona **"Open with Live Server"**.
3. El navegador abrirá automáticamente `http://localhost:5500`.

*Nota:* Al usar `localhost`, el navegador web omite la exigencia de HTTPS, por lo que podrás probar el escáner ZXing directamente con la cámara de tu PC sin necesidad de certificados SSL.

## 3. Probar y Ejecutar Cambios
1. Realiza todas tus modificaciones directamente en los archivos de la **carpeta raíz** (ej. `ui.js`, `app.js`, `styles.css`).
2. Guarda el archivo (`Ctrl + S`).
3. Si Live Server está corriendo, tu navegador se actualizará automáticamente.
4. Realiza pruebas funcionales.

## 4. Crear un parche o nueva versión (Ej: v1.0.1)
1. Antes de empaquetar, abre `VERSION.md`.
2. Actualiza la línea de versión: `- **Versión**: 1.0.1`.
3. Edita la fecha y añade a "Resumen Corto" qué corrigió este parche.
4. Si añadiste instrucciones de uso, actualiza `V1_MANUAL_USUARIO.md`.

## 5. Hacer Build y Generar ZIP (Paso a Producción)
Cuando tus pruebas locales sean exitosas y el código de la raíz esté estable, debes empaquetar la app.
1. Abre la Terminal de VS Code (`Terminal -> New Terminal`).
2. Ejecuta el comando:
   ```bash
   npm run build:v1
   ```
   *(Alternativa si no tienes Node instalado: Corre `./scripts/build-v1.ps1` en PowerShell).*

**¿Qué hace el build?**
- Elimina completamente la carpeta `dist-rutaboss-v1/` antigua.
- Crea una carpeta `dist-rutaboss-v1/` limpia.
- Toma *únicamente* los 13 archivos críticos de la PWA (bloqueando datos crudos o reportes).
- Toma el contenido de esta nueva carpeta estricta y crea en la raíz el archivo `rutaboss-v1.0.0-netlify.zip`.
- Asegura que `index.html` se ubique directamente en la base del ZIP, sin carpetas intermedias.

## 6. Subir a Netlify
1. Ve a [app.netlify.com](https://app.netlify.com) e inicia sesión.
2. Si ya tienes un sitio creado, ve a **Deploys**.
3. Arrastra el archivo **`rutaboss-v1.0.0-netlify.zip`** (o `rutaboss-vX.X.X-netlify.zip`) al cuadro de subida "Drag and drop your site output folder here".
4. ¡Listo! Netlify extraerá los archivos e inmediatamente la nueva versión estará publicada en HTTPS y lista para el reparto.

## ⚠️ LO QUE NO DEBES TOCAR MANUALMENTE ⚠️
- **Carpeta `dist-rutaboss-v1/`**: Su contenido se borra y reescribe con cada build. No trabajes dentro de esta carpeta.
- **`rutaboss-v1.0.0-netlify.zip`**: Se genera automáticamente; si intentas editar el zip manualmente corres riesgo de introducir ruido o romper rutas.
- **`service-worker.js`**: Si no has cambiado profundamente las rutas o si no dominas PWA. Altera el almacenamiento en caché agresivo.
- **El nombre del script en `package.json`**: Los comandos están afinados para PowerShell con evasión de políticas y paths explícitos (`.\\scripts\\`).
