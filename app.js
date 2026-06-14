// app.js - Entrada de la aplicación

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar estado
    window.State.init();

    // Configurar navegación
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;
            window.Routes.navigate(target);
        });
    });

    // Renderizar vista inicial
    window.Routes.renderCurrent();

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registrado', reg))
            .catch(err => console.error('Error registrando Service Worker', err));
    }
});
