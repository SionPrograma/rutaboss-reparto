# Guía: Visual Studio 2022 vs Visual Studio Code

Este proyecto fue estructurado nativamente utilizando **Vanilla JavaScript (HTML, CSS, JS)** sin un servidor *backend* pesado como ASP.NET o Node.js/Express en el mismo repositorio.

## Visual Studio 2022 (El IDE Completo)

Aunque Visual Studio 2022 es excelente para C# y ecosistemas completos, para este proyecto **Vanilla PWA** se presenta como una herramienta sobredimensionada:

### Cómo abrirlo (si realmente lo deseas):
1. Abre **Visual Studio 2022**.
2. No crees una nueva solución (Solution/Proyecto). Usa **"Open a local folder"** (Abrir una carpeta local).
3. Selecciona la raíz (`APP-Ceo`).
4. Para servir los archivos, Visual Studio no tiene un servidor web estático liviano integrado habilitado por defecto para carpetas sueltas. Necesitarás instalar una extensión de *Live Server* o depender de IIS Express configurando un archivo `web.config` (lo cual ensucia el proyecto).

### Limitaciones
- Carece de un servidor estático rápido sin depender de IIS Express.
- Pesado de inicializar para solo leer archivos .html, .css y .js.
- Generará un `.vs/` en la carpeta oculta que solo añade basura al repositorio.

## Visual Studio Code (La Opción Recomendada)

Para proyectos **Frontend / PWA Vanilla JS**, **VS Code** es el estándar de la industria.

### Beneficios:
- **Ligero:** Se abre al instante.
- **Live Server:** Puedes simular un entorno `localhost` con un solo clic.
- **Scripts:** Terminal integrada compatible con `npm` y PowerShell para ejecutar `build-v1.ps1`.
- **Debugging:** Tiene plantillas en `.vscode/launch.json` configuradas para atar Chrome directamente a tu código.

### Veredicto
**Utiliza Visual Studio Code** para editar y desarrollar RutaBoss. La carpeta `.vscode` pre-creada con sus configuraciones de depuración (*launch.json*) y sugerencias (*extensions.json*) te proveerá el ambiente más limpio y profesional posible.
