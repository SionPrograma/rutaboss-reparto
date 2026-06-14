// routes.js
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
