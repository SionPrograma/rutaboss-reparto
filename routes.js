// routes.js - Enrutador simple

const Routes = {
    navigate(route, params = null) {
        window.State.setRoute(route, params);
        this.renderCurrent();
    },

    renderCurrent() {
        const routeData = window.State.getRoute();
        const route = routeData.path;
        const params = routeData.params;
        const user = window.State.getCurrentUser();

        if (!user || route === 'login') {
            window.UI.renderLogin();
            return;
        }

        // Header Navigation updates
        if (route === 'inicio') {
            window.UI.navContainer.classList.remove('hidden');
            window.UI.updateNav('inicio');
        } else {
            // Some specific screens might hide bottom nav, but let's keep it simple
        }

        switch (route) {
            case 'inicio':
                if (user.role === 'encargado') {
                    window.UI.renderDashboardEncargado();
                } else {
                    // Repartidor sin ID seleccionado -> selector de repartidor
                    if (!user.id) {
                        window.UI.renderSelectorRepartidor();
                    } else {
                        window.UI.renderPanelRepartidor(user.id);
                    }
                }
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
