// routes.js

// Future Geometry Assignment Prep
window.isPointInsideRouteSector = function(point, route) {
    if (route.tipoGeometria === 'circle' && route.centro && route.radio) {
        // Basic distance calculation using Haversine formula
        const R = 6371e3; // Earth radius in metres
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
    }
    return false; // Polygon support to be implemented
};

// Mock OCR Function
window.extractPackageDataFromLabel = function(imageFile) {
    // Simulando retraso
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                cliente: '',
                telefono: '',
                direccion: '',
                pisoPuerta: '',
                idPaquete: ''
            });
        }, 800);
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
