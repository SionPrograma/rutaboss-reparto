// routes.js

window.normalizeSectorPolygon = function(points) {
    if (!points || points.length < 3) return points;
    const centerLat = points.reduce((acc, p) => acc + p.lat, 0) / points.length;
    const centerLng = points.reduce((acc, p) => acc + p.lng, 0) / points.length;
    
    return [...points].sort((a, b) => {
        const angleA = Math.atan2(a.lat - centerLat, a.lng - centerLng);
        const angleB = Math.atan2(b.lat - centerLat, b.lng - centerLng);
        return angleA - angleB;
    });
};

window.smoothSectorPolygon = function(points) {
    if (!points || points.length < 3) return points;
    const smoothed = [];
    const len = points.length;
    for (let i = 0; i < len; i++) {
        const prev = points[(i - 1 + len) % len];
        const curr = points[i];
        const next = points[(i + 1) % len];
        smoothed.push({
            lat: curr.lat * 0.6 + prev.lat * 0.2 + next.lat * 0.2,
            lng: curr.lng * 0.6 + prev.lng * 0.2 + next.lng * 0.2
        });
    }
    return smoothed;
};

window.getStrokeBounds = function(points) {
    if (!points || points.length === 0) return null;
    let minLat = points[0].lat, maxLat = points[0].lat;
    let minLng = points[0].lng, maxLng = points[0].lng;
    points.forEach(p => {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
    });
    return { minLat, maxLat, minLng, maxLng };
};

window.fetchRoadsFromOpenStreetMap = function(bounds) {
    // TODO: usar Overpass API
    // buscar highways dentro del bounding box del trazo
    // comparar distancia entre trazo y líneas de calles
    // seleccionar calles más cercanas
    // usar esas calles como límites del sector
    return Promise.resolve([]);
};

window.detectNearbyRoadsFromStroke = function(freehandPoints) {
    return [
        { name: "Calle Norte Demo", type: "street", side: "north", points: [] },
        { name: "Calle Sur Demo", type: "street", side: "south", points: [] },
        { name: "Calle Este Demo", type: "street", side: "east", points: [] },
        { name: "Calle Oeste Demo", type: "street", side: "west", points: [] }
    ];
};

window.snapSectorToRoads = function(points) {
    // TODO: Futuro: conectar con Overpass/OpenStreetMap
    const normalized = window.normalizeSectorPolygon(points);
    return window.smoothSectorPolygon(normalized);
};

// Future Geometry Assignment Prep
window.isPointInsideRouteSector = function(point, route) {
    if (route.tipoGeometria === 'circle' && route.centro && route.radio) {
        const R = 6371e3;
        const φ1 = route.centro.lat * Math.PI/180;
        const φ2 = point.lat * Math.PI/180;
        const Δφ = (point.lat - route.centro.lat) * Math.PI/180;
        const Δλ = (point.lng - route.centro.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return distance <= route.radio;
    } else if (route.tipoGeometria === 'polygon') {
        const polygonPoints = route.geometryAdjusted || route.puntos;
        if (!polygonPoints || polygonPoints.length < 3) return false;
        
        // Point in Polygon algorithm (Ray-casting)
        const x = point.lng, y = point.lat;
        let inside = false;
        for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
            const xi = polygonPoints[i].lng, yi = polygonPoints[i].lat;
            const xj = polygonPoints[j].lng, yj = polygonPoints[j].lat;
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    } else if (route.tipoGeometria === 'freehand-road-bounds' && route.freehandPoints) {
        // Fallback: usar ray-casting sobre el trazo original mientras no tengamos geometría real de calles.
        const polygonPoints = route.freehandPoints;
        if (polygonPoints.length < 3) return false;
        
        const x = point.lng, y = point.lat;
        let inside = false;
        for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
            const xi = polygonPoints[i].lng, yi = polygonPoints[i].lat;
            const xj = polygonPoints[j].lng, yj = polygonPoints[j].lat;
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    return false;
};

// Mock OCR Function (Using local Tesseract.js stub)
window.scanLabelOCR = function(imageDataUrl) {
    return new Promise((resolve) => {
        // Todo: Usar Tesseract.js local para mantenerlo 100% gratis
        // Tesseract.recognize(imageDataUrl, 'spa').then(...)
        setTimeout(() => {
            resolve({
                cliente: "Juan Pérez (Tesseract local)",
                direccion: "Calle Larios 45",
                telefono: "600123456"
            });
        }, 1500);
    });
};

const Routes = {
    navigate(route, params = null) {
        window.State.setRoute(route, params);
        this.renderCurrent();
    },

    renderCurrent() {
        const { path, params } = window.State.getRoute();
        const user = window.State.getCurrentUser();

        if (!user || path === 'login') {
            window.UI.renderLogin();
            return;
        }

        if (path === 'inicio') {
            window.UI.navContainer.classList.remove('hidden');
            window.UI.updateNav('inicio');
        }

        switch (path) {
            case 'inicio':
                if (user.role === 'encargado') window.UI.renderDashboardEncargado();
                else if (!user.id) window.UI.renderSelectorRepartidor();
                else window.UI.renderPanelRepartidor(user.id);
                break;
            case 'crear-ruta':
                window.UI.renderCrearRuta();
                break;
            case 'crear-paquete':
                window.UI.renderCrearPaquete(params?.rutaId);
                break;
            case 'escribir-codigo':
                window.UI.renderEscribirCodigo(params?.paqueteId);
                break;
            case 'ruta-creada':
                window.UI.renderRutaCreada(params?.rutaId);
                break;
            case 'detalle-paquete':
                window.UI.renderDetallePaquete(params?.id);
                break;
            case 'reporte-jefe':
                window.UI.renderReporteJefe();
                break;
            case 'mapa':
                window.UI.renderPlaceholder('Mapa');
                break;
            case 'paquetes':
                window.UI.renderPlaceholder('Paquetes');
                break;
            case 'mas':
                window.UI.renderPlaceholder('Más');
                break;
            default:
                window.UI.renderLogin();
        }
    }
};

window.Routes = Routes;
