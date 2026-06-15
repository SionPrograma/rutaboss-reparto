# DEV SETUP REPORT: Entorno Profesional Configurado

## Estado
El repositorio de RutaBoss ha sido estructurado exitosamente para desarrollo profesional utilizando **Visual Studio Code**, manteniendo la versión compilada `dist-rutaboss-v1` intacta y aislada.

## Archivos Creados
1. **Configuraciones de Editor (.vscode/)**
   - `.vscode/extensions.json`: Recomendaciones para instalar Live Server.
   - `.vscode/settings.json`: Configura el puerto 5500 por defecto.
   - `.vscode/launch.json`: Habilita depuración directa Chrome-to-VSCode.
2. **Scripts de Automatización (scripts/)**
   - `scripts/build-v1.ps1`: Motor de construcción. Extrae código fuente y genera `dist-rutaboss-v1` y el `.zip` automáticamente.
   - `scripts/clean-dev.ps1`: Limpiador de basura temporal sin afectar el core.
3. **Punto de Entrada (Raíz)**
   - `package.json`: Permite el uso de comandos simplificados `npm run start` o `npm run build:v1`.
4. **Documentación de Desarrollo**
   - `README_DEV.md`: Guía de arquitectura y uso de Live Server / PowerShell.
   - `VISUAL_STUDIO_GUIDE.md`: Justificación técnica para preferir VS Code sobre VS 2022 Clásico.
   - `DEV_SETUP_REPORT.md`: Este archivo.

## Rutina de Trabajo Recomendada (Local)
1. Abrir carpeta en **VS Code**.
2. Click derecho sobre `index.html` -> **Open with Live Server**.
3. Realizar y probar los cambios sobre la **raíz** (`ui.js`, `app.js`). La cámara de escaneo responderá gracias al uso de `localhost`.
4. En la terminal de VS Code, ejecutar `npm run build:v1` (o correr el archivo PowerShell manual) para reconstruir el paquete final.

## Riesgos y Mitigaciones
- **Sandbox Exec Limit:** No debes intentar compilar en PowerShell sin permisos. Si un script de compilación falla, utiliza `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` o lanza la terminal como Administrador temporalmente.
- **Cámara en Red Local:** El test del código en el propio móvil mediante IP privada no autorizará la cámara si no va por HTTPS. Probar estas funciones mediante el `localhost` del PC es lo recomendable.

**Conclusión:** La app ahora soporta flujos de trabajo locales estandarizados. Puedes empezar a codificar la `V1.0.1` inmediatamente.
