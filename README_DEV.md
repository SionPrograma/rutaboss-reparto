# RutaBoss - Entorno de Desarrollo Local

## Requisitos Previos
- Editor recomendado: **Visual Studio Code (VS Code)**
- Opcional: Node.js (si deseas usar `npm run start`).

## Abrir el Proyecto
1. Abre **Visual Studio Code**.
2. Ve a `File` -> `Open Folder...` y selecciona la carpeta raíz del proyecto (`APP-Ceo`).
3. VS Code detectará la carpeta `.vscode` y te recomendará instalar la extensión **Live Server**. Haz clic en "Instalar".

## Correr la App Localmente
Tienes dos formas de ejecutar la PWA en tu PC:

**Opción A: Live Server (Recomendado)**
- En VS Code, abre `index.html`.
- Haz clic derecho y selecciona **"Open with Live Server"** (o presiona el botón "Go Live" en la barra de estado inferior derecha).
- La app se abrirá en `http://localhost:5500`.

**Opción B: Vía npm**
- Abre una terminal en VS Code.
- Ejecuta `npm run start` (requiere Node.js instalado). Esto lanzará un servidor estático a través de `npx serve .`.

## Cámara y Escáner (HTTPS / Localhost)
Por motivos de seguridad en los navegadores modernos, **el acceso a la cámara solo funciona bajo HTTPS o en `localhost`**. 
- Si pruebas en tu PC usando `http://localhost:5500`, la cámara funcionará perfectamente para escanear.
- Si pruebas accediendo desde tu móvil a la IP local de tu PC (ej. `http://192.168.1.15:5500`), el navegador del móvil bloqueará la cámara. Para probar con el móvil, despliega a Netlify primero (que incluye HTTPS automático).

## Scripts de Construcción
La aplicación ya no requiere copia manual para crear la versión final. Puedes usar los scripts automatizados:

- **Build de Producción:** Ejecuta `./scripts/build-v1.ps1` en PowerShell o `npm run build:v1`. Esto limpiará la carpeta `dist-rutaboss-v1`, copiará solo los archivos necesarios y creará el archivo `rutaboss-v1.0.0-netlify.zip` listo para Netlify.
- **Limpieza del Entorno:** Ejecuta `./scripts/clean-dev.ps1` en PowerShell o `npm run clean`. Borra ZIPs temporales y carpetas de test.

## Archivos Críticos que NO debes tocar
- Carpeta `dist-rutaboss-v1/`: Se autogenera al compilar. Cualquier cambio aquí se perderá en el siguiente build.
- `rutaboss-v1.0.0-netlify.zip`: Archivo que se sube a Netlify, generado por el script.

## ¿Cómo hacer cambios para V1.0.1?
1. Edita el código directamente en la **raíz del proyecto** (ej. `app.js`, `ui.js`, `index.html`).
2. Comprueba tus cambios localmente con Live Server (`localhost:5500`).
3. Cuando estés seguro, modifica el número de versión en `VERSION.md`.
4. Ejecuta el script de compilación: `./scripts/build-v1.ps1`.
5. Sube el `.zip` generado a Netlify.
