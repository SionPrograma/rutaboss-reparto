// app.js - Entrada de la aplicación

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar estado
    window.State.init();

    // Renderizar vista inicial
    window.Routes.renderCurrent();

    // Delegación de Eventos Global (Navegación y Botones)
    document.addEventListener('click', handleGlobalClick);

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .catch(err => console.error('Error registrando Service Worker', err));
    }
});

function handleGlobalClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    
    switch (action) {
        case 'nav':
            window.Routes.navigate(btn.dataset.target);
            break;
        case 'go-back':
            window.history.back();
            break;
        case 'logout':
            window.State.logout();
            break;
        case 'select-role':
            if (btn.dataset.role === 'encargado') {
                document.getElementById('encargado-login').classList.remove('hidden');
            } else {
                window.State.login('repartidor');
            }
            break;
        case 'login-encargado':
            const pass = document.getElementById('password').value;
            if (pass === '1234') window.State.login('encargado');
            else alert('Contraseña incorrecta');
            break;
        case 'open-create-route':
            window.Routes.navigate('crear-ruta');
            break;
        case 'open-map-route':
            alert('Visualización en mapa próximamente');
            break;
        case 'load-package':
            window.Routes.navigate('crear-paquete', { rutaId: btn.dataset.rutaId });
            break;
        case 'save-route':
            window.UI.handleSaveRoute();
            break;
        case 'load-package-current':
            window.Routes.navigate('crear-paquete', { rutaId: window.State.getRoute().params?.rutaId });
            break;
        case 'go-home':
            window.Routes.navigate('inicio');
            break;
        case 'continue-to-data':
            document.getElementById('form-paq-cliente').focus();
            break;
        case 'save-package':
            window.UI.handleSavePackage();
            break;
        case 'mark-codigo-escrito':
            const pkgId = window.State.getRoute().params?.paqueteId;
            if (pkgId) {
                window.State.updatePaquete(pkgId, { codigoEscrito: true });
                window.Routes.navigate('inicio');
            }
            break;
        case 'select-driver':
            window.State.login('repartidor', btn.dataset.driverId);
            break;
        case 'open-package-detail':
            window.Routes.navigate('detalle-paquete', { id: btn.dataset.pkgId });
            break;
        case 'call-client':
            window.UI.handleCallClient(btn.dataset.pkgId);
            break;
        case 'message-client':
            window.UI.handleMessageClient(btn.dataset.pkgId);
            break;
        case 'open-maps':
            window.UI.handleOpenMaps(btn.dataset.pkgId);
            break;
        case 'mark-delivered':
            window.UI.handleMarkDelivered(btn.dataset.pkgId);
            break;
        case 'show-incidencia-panel':
            document.getElementById('incidencia-panel').classList.remove('hidden');
            break;
        case 'confirm-failure':
            window.UI.handleConfirmFailure(btn.dataset.pkgId);
            break;
        case 'select-color':
            window.UI.handleColorSelect(btn);
            break;
    }
}
