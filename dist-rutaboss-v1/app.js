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
            break;
        case 'export-jornada':
            const pkgs = window.State.getPaquetes();
            if (pkgs.length === 0) return alert('No hay paquetes para exportar');
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pkgs, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "rutaboss-jornada-" + new Date().toISOString().split('T')[0] + ".json");
            document.body.appendChild(downloadAnchorNode); 
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            if (window.XLSX) {
                const csvData = pkgs.map(p => ({
                    scanOrder: p.scanOrder || '',
                    routeNo: p.routeNo || '',
                    tipo: p.tipo || p.mode || '',
                    status: p.status || p.estado || '',
                    codigoFisico: p.codigoFisico || '',
                    barcode: p.barcode || '',
                    scannerSource: p.scannerSource || '',
                    address: p.address || p.direccion || '',
                    notes: p.notes || p.nota || '',
                    scannedAt: p.scannedAt || p.fechaEscaneo || '',
                    deliveredAt: p.deliveredAt || ''
                }));
                const ws = window.XLSX.utils.json_to_sheet(csvData);
                const wb = window.XLSX.utils.book_new();
                window.XLSX.utils.book_append_sheet(wb, ws, "Jornada");
                window.XLSX.writeFile(wb, "rutaboss-jornada-" + new Date().toISOString().split('T')[0] + ".csv");
            }
            break;
            
        case 'clear-jornada':
            if (confirm('⚠️ ¿Estás totalmente seguro de querer LIMPIAR LA JORNADA? Se borrarán todos los paquetes y el contador de escaneo. Asegúrate de haber exportado antes.')) {
                window.State.clearJornada();
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
        case 'open-crear-rapido':
            window.Routes.navigate('crear-paquete-rapido');
            break;
        case 'open-crear-paquete-completo':
            const activeRuta = document.querySelector('#rapido-ruta-group .active');
            window.Routes.navigate('crear-paquete', { rutaId: activeRuta ? activeRuta.dataset.val : null });
            break;
        case 'start-scanner':
            window.UI.startScanner();
            break;
        case 'stop-scanner':
            window.UI.stopScanner();
            break;
        case 'save-package-rapido':
            const rutaId = document.querySelector('#rapido-ruta-group .active')?.dataset.val;
            if (!rutaId) return alert('Selecciona una ruta');
            
            let tipo = 'domicilio';
            const extraTipo = document.getElementById('rapido-tipo-extra').value;
            if (extraTipo) {
                tipo = extraTipo;
            } else {
                const activeTipo = document.querySelector('#rapido-tipo-group .active');
                if (activeTipo) tipo = activeTipo.dataset.val;
            }
            
            const hiddenBarcode = document.getElementById('hidden-barcode-val');
            const barcodeVal = hiddenBarcode && hiddenBarcode.value ? hiddenBarcode.value : null;
            
            const p = window.State.addPaquete({
                rutaAsignada: rutaId,
                cliente: '',
                telefono: '',
                direccion: '',
                pisoPuerta: '',
                tipo: tipo,
                importeCobro: 0,
                barcode: barcodeVal,
                scannerSource: barcodeVal ? 'zxing' : 'manual'
            });
            
            document.getElementById('ultimo-paquete-rapido').classList.remove('hidden');
            document.getElementById('rapido-codigo-fisico').textContent = p.codigoFisico;
            window.State.data.routeParams = { rutaId };
            
            // Limpiar escáner para el próximo
            if (hiddenBarcode) hiddenBarcode.value = '';
            const resBox = document.getElementById('scanner-result-box');
            if (resBox) resBox.classList.add('hidden');
            break;
        case 'quick-deliver':
            window.State.updatePaquete(btn.dataset.pkgId, { estado: 'entregado', nota: '' });
            window.Routes.renderCurrent();
            break;
        case 'quick-fail':
            window.State.updatePaquete(btn.dataset.pkgId, { estado: 'fallido', nota: 'Fallido rápido' });
            window.Routes.renderCurrent();
            break;
        case 'quick-reset':
            window.State.updatePaquete(btn.dataset.pkgId, { estado: 'pendiente', nota: '' });
            window.Routes.renderCurrent();
            break;
        case 'quick-copy':
            const codeToCopy = btn.closest('.paquete-card').querySelector('.paquete-fisico').textContent;
            navigator.clipboard.writeText(codeToCopy).then(() => alert('Copiado'));
            break;
        case 'quick-copy-last':
            const lastCode = document.getElementById('rapido-codigo-fisico').textContent;
            navigator.clipboard.writeText(lastCode).then(() => alert('Copiado'));
            break;
        case 'generate-demo-packages':
            window.State.generateDemoPackages();
            window.Routes.renderCurrent();
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
        case 'adjust-to-roads':
            window.UI.handleAdjustToRoads();
            break;
        case 'adjust-to-roads':
            window.UI.handleAdjustToRoads();
            break;
        case 'toggle-paint-mode':
            window.UI.handleTogglePaintMode();
            break;
        case 'finish-paint-mode':
            window.UI.handleFinishPaintMode();
            break;
        case 'run-free-ocr':
            window.UI.handleRunFreeOCR();
            break;
        case 'copy-raw-ocr':
            window.UI.handleCopyRawOCR();
            break;
        case 'clear-paint':
            window.UI.handleClearPaint();
            break;
        case 'export-excel':
            window.UI.handleExportExcel();
            break;
        case 'open-manager-report':
            window.Routes.navigate('reporte-jefe');
            break;
        case 'copy-manager-report':
            window.UI.handleCopyManagerReport();
            break;
        case 'send-manager-report':
            window.UI.handleSendManagerReport();
            break;
    }
}
