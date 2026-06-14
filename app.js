// app.js - Entrada de la aplicación

window.__rutabossInitialized = false;
window.__rutabossEventsBound = false;

function initApp() {
    if (window.__rutabossInitialized) return;
    window.__rutabossInitialized = true;

    window.State.init();
    window.Routes.renderCurrent();

    if (!window.__rutabossEventsBound) {
        document.addEventListener('click', handleGlobalClick);
        window.__rutabossEventsBound = true;
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => {
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New update available. Refreshing...');
                            window.location.reload();
                        }
                    };
                };
            })
            .catch(err => console.error('Error registrando Service Worker', err));
    }
}

document.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('load', initApp);

let currentSelectedRole = null;

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
            window.Routes.renderCurrent();
            break;
        case 'select-role':
            currentSelectedRole = btn.dataset.role;
            // Feedback visual
            document.querySelectorAll('.role-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            if (currentSelectedRole === 'encargado') {
                document.getElementById('encargado-login').classList.remove('hidden');
            } else {
                document.getElementById('encargado-login').classList.add('hidden');
            }
            document.getElementById('login-error').classList.add('hidden');
            break;
        case 'login-submit':
            if (!currentSelectedRole) {
                alert('Por favor, selecciona un perfil (Repartidor o Encargado)');
                return;
            }
            if (currentSelectedRole === 'encargado') {
                const pass = document.getElementById('password').value;
                if (pass === '1234') {
                    document.getElementById('login-error').classList.add('hidden');
                    window.State.login('encargado');
                    window.Routes.renderCurrent();
                } else {
                    document.getElementById('login-error').classList.remove('hidden');
                }
            } else if (currentSelectedRole === 'repartidor') {
                window.State.login('repartidor');
                window.Routes.renderCurrent();
            }
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
            window.Routes.renderCurrent();
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
