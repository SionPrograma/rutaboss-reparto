# Release Notes: RutaBoss V1 (Release Candidate)

## ¿Qué trae RutaBoss V1?
RutaBoss V1 es la primera versión estable de producción de nuestra aplicación progresiva (PWA) de reparto. Transformamos el prototipo en una herramienta sólida y autónoma. Las novedades principales son:
- **Dashboard Central**: Una nueva pantalla principal que te da un resumen en vivo de toda tu jornada, los paquetes divididos por ruta, y accesos gigantes al modo operativo.
- **Scanner ZXing Operativo**: Lee códigos de barras y QR en milisegundos directamente desde la cámara del móvil.
- **Buscador y Filtros**: En tu lista de paquetes ahora puedes escribir "31" o el código de rastreo real para encontrar un paquete al instante, además de ocultar los entregados.
- **Normalización de Datos**: Todos los paquetes operan bajo un estándar profesional que guarda qué escáner usaste, cuándo lo escaneaste y cuándo lo entregaste.
- **Exportador**: Permite guardar un reporte CSV (Excel) o JSON de toda la jornada con un solo clic.
- **Limpiador Seguro**: Permite cerrar la jornada (borrando paquetes y reseteando los contadores) previa confirmación explícita.

## Cómo se usa
La app arranca siempre en el **Dashboard (Inicio)**.
1. Toca `MÓDULO CALLE` para escanear y cargar rápidamente cajas en la furgoneta.
2. Toca `VER RUTA` para ir a la vista de los paquetes, filtrarlos y marcarlos como entregados en la puerta del cliente.
3. Al finalizar tu día, toca `Exportar Jornada` y luego `Limpiar Jornada` para dejar la app lista para el día siguiente.

## Limitaciones Conocidas
- **Offline Total**: Si abres la aplicación por primerísima vez sin internet, el escáner (ZXing) y el motor Excel (SheetJS) no cargarán, forzándote al modo manual. Necesitan haber sido abiertos al menos una vez online para guardarse en la mochila del teléfono.
- **Cámara Default**: En teléfonos con múltiples lentes, se utilizará siempre la lente trasera estándar. Si tu lente principal es un macro o ultra gran angular en ciertos dispositivos chinos, el auto-focus podría ser lento.

## Pasos de Despliegue en Netlify
1. Verifica que no haya cambios sin guardar en los archivos JS/HTML/CSS locales.
2. Sube el contenido entero de la carpeta `APP-Ceo` (asegurando que `index.html` queda en la raíz) al panel de Netlify.
3. Asegúrate de que tu sitio de Netlify tenga el candado SSL (HTTPS).
4. Accede desde tu móvil, agrega a la pantalla de inicio (Instalar PWA) y comienza a trabajar.

## Checklist de Prueba Móvil
- [ ] Abrir en Android.
- [ ] Escanear un paquete real.
- [ ] Añadir uno manual (tienda).
- [ ] Filtrar por "Entregados".
- [ ] Exportar Excel de prueba.
- [ ] Cerrar y limpiar la jornada.
