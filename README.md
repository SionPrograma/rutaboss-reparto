# RutaBoss

App mobile-first para control de reparto. PWA sin backend, usando `localStorage`, preparada para despliegue estático (Netlify).

## Sprint 1
- Pantalla de Login con selección de rol.
- Rol "Encargado" protegido por contraseña (demo: 1234).
- Dashboard de Encargado con indicadores de prioridad horaria, tiendas, bloques y cobros.
- Lista de repartidores demo (Bidal, Nico, Ayman).
- Lista de paquetes con sus etiquetas (Horaria, Tienda, Bloque, Cobro).
- Interfaz gráfica limpia, móvil y lista con marcas de agua sutiles.
- Enrutamiento básico e inicialización PWA (manifest y service-worker).

## Despliegue
Cualquier servidor estático o Netlify Free. Simplemente subir la carpeta.

## Stack 100% Free y Open-Source
RutaBoss funciona con tecnologías gratuitas/open-source (Leaflet, Nominatim, Tesseract.js, SheetJS, LocalStorage, Netlify). Las integraciones pagas (como APIs de Google o WhatsApp Business) quedan como módulos opcionales futuros para que la app base siempre sea libre de costos de mantenimiento.
