// ui.js - Renderizado (Lógica limpia sin event listeners de botones)

const UI = {
    appContainer: document.getElementById('app'),
    navContainer: document.getElementById('bottom-nav'),
    isPaintModeActive: false,
    isPainting: false,
    freehandPoints: [],
    roadBoundaries: [],
    strokeBounds: null,
    adjustedToRoads: false,
    
    currentPolygonLayer: null,
    currentColor: '#1E3A8A',

    clearApp() { 
        if (this.codeReader) {
            try { this.stopScanner(false); } catch(e){}
        }
        this.appContainer.innerHTML = ''; 
    },
    cloneTpl(id) { return document.getElementById(id).content.cloneNode(true); },

    // Render Login
    renderLogin() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-login');
        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Render Selector Repartidor
    renderSelectorRepartidor() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-selector-repartidor');
        
        const list = tpl.querySelector('#repartidores-lista-botones');
        window.appData.repartidores.forEach(rep => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary btn-large';
            btn.textContent = rep.nombre;
            btn.setAttribute('data-action', 'select-driver');
            btn.setAttribute('data-driver-id', rep.id);
            list.appendChild(btn);
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Render Dashboard V1
    renderDashboardV1() {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-dashboard-v1');
        
        const paquetes = window.State.getPaquetes();
        
        // Formatear Fecha
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        tpl.querySelector('#dashboard-date').textContent = new Date().toLocaleDateString('es-ES', options).toUpperCase();

        tpl.querySelector('#stat-total').textContent = paquetes.length;
        tpl.querySelector('#stat-pendientes').textContent = paquetes.filter(p => p.estado === 'pendiente').length;
        tpl.querySelector('#stat-entregados').textContent = paquetes.filter(p => p.estado === 'entregado').length;
        tpl.querySelector('#stat-fallidos').textContent = paquetes.filter(p => p.estado === 'fallido').length;

        const rutas = window.State.getRutas();
        const rutasStatsList = tpl.querySelector('#rutas-stats-list');
        
        rutas.forEach(r => {
            const paqsRuta = paquetes.filter(p => p.rutaAsignada === r.id);
            if(paqsRuta.length > 0) {
                const div = document.createElement('div');
                div.style = "display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--color-border); font-size:0.9rem;";
                div.innerHTML = `<strong>R${r.numeroRuta} - ${r.nombre}</strong> <span>${paqsRuta.length} paquetes</span>`;
                rutasStatsList.appendChild(div);
            }
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Render Crear Ruta (Mapa)
    renderCrearRuta() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-crear-ruta');
        
        const selectRep = tpl.querySelector('#form-ruta-repartidor');
        window.appData.repartidores.forEach(r => { selectRep.add(new Option(r.nombre, r.id)); });

        this.clearApp();
        this.appContainer.appendChild(tpl);

        // INIT LEAFLET MAP
        const mapEl = document.getElementById('map-crear-ruta');
        if(this.mapInstance) { this.mapInstance.remove(); }
        
        const map = L.map(mapEl, { zoomControl: false }).setView([36.741, -4.425], 14);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 20
        }).addTo(map);

        this.mapInstance = map;
        this.isPaintModeActive = false;
        this.isPainting = false;
        this.freehandPoints = [];
        this.roadBoundaries = [];
        this.strokeBounds = null;
        this.adjustedToRoads = false;
        this.currentPolygonLayer = null;
        this.currentColor = '#1E3A8A';

        // Draw existing
        window.State.getRutas().forEach(r => {
            if (r.tipoGeometria === 'circle' && r.centro) {
                L.circle([r.centro.lat, r.centro.lng], { color: r.color, fillColor: r.color, fillOpacity: 0.1, weight: 1 }).addTo(map);
            } else if (r.tipoGeometria === 'polygon') {
                const pts = r.geometryAdjusted || r.puntos;
                if (pts) L.polygon(pts, { color: r.color, fillColor: r.color, fillOpacity: 0.1, weight: 1 }).addTo(map);
            } else if (r.tipoGeometria === 'freehand-road-bounds' && r.freehandPoints) {
                // Representar los garabatos dibujados para visualizarlos
                L.polygon(r.freehandPoints, { color: r.color, fillColor: r.color, fillOpacity: 0.1, weight: 1 }).addTo(map);
            }
        });

        // Eventos de Paint Mode sobre Leaflet (mousedown, mousemove, mouseup simulan touch fluidamente)
        map.on('mousedown', (e) => {
            if (!this.isPaintModeActive) return;
            this.isPainting = true;
            this.freehandPoints.push(e.latlng);
            this.updatePaintDrawer();
        });
        
        map.on('mousemove', (e) => {
            if (!this.isPainting || !this.isPaintModeActive) return;
            this.freehandPoints.push(e.latlng);
            this.updatePaintDrawer();
        });
        
        map.on('mouseup', () => {
            if (!this.isPaintModeActive) return;
            this.isPainting = false;
        });
    },

    updatePaintDrawer() {
        if (!this.mapInstance) return;
        if (this.currentPolygonLayer) this.currentPolygonLayer.remove();
        
        if (this.freehandPoints.length > 1) {
            this.currentPolygonLayer = L.polyline(this.freehandPoints, {
                color: this.currentColor, weight: 4
            }).addTo(this.mapInstance);
        }
    },

    handleTogglePaintMode() {
        this.isPaintModeActive = !this.isPaintModeActive;
        const btnToggle = document.getElementById('btn-paint-toggle');
        const btnFinish = document.getElementById('btn-paint-finish');
        
        if (this.isPaintModeActive) {
            this.mapInstance.dragging.disable();
            btnToggle.classList.replace('btn-secondary', 'btn-primary');
            btnToggle.textContent = '✏️ Dibujando...';
            if (btnFinish) btnFinish.classList.remove('hidden');
        } else {
            this.mapInstance.dragging.enable();
            btnToggle.classList.replace('btn-primary', 'btn-secondary');
            btnToggle.textContent = '✏️ Activar Dibujo';
            if (btnFinish) btnFinish.classList.add('hidden');
        }
    },

    handleFinishPaintMode() {
        this.isPaintModeActive = false;
        this.isPainting = false;
        if (this.mapInstance) this.mapInstance.dragging.enable();
        
        const btnToggle = document.getElementById('btn-paint-toggle');
        const btnFinish = document.getElementById('btn-paint-finish');
        if (btnToggle) {
            btnToggle.classList.replace('btn-primary', 'btn-secondary');
            btnToggle.textContent = '✏️ Activar Dibujo';
        }
        if (btnFinish) btnFinish.classList.add('hidden');

        if (this.freehandPoints.length > 5) {
            document.getElementById('ajuste-panel').classList.remove('hidden');
        }
    },

    handleClearPaint() {
        this.freehandPoints = [];
        this.roadBoundaries = [];
        this.strokeBounds = null;
        this.adjustedToRoads = false;
        if (this.currentPolygonLayer) this.currentPolygonLayer.remove();
        this.currentPolygonLayer = null;
        const panel = document.getElementById('ajuste-panel');
        const limits = document.getElementById('limites-detectados');
        if (panel) panel.classList.add('hidden');
        if (limits) limits.classList.add('hidden');
    },

    handleAdjustToRoads() {
        if (this.freehandPoints.length < 3) return;
        this.strokeBounds = window.getStrokeBounds(this.freehandPoints);
        this.roadBoundaries = window.detectNearbyRoadsFromStroke(this.freehandPoints);
        this.adjustedToRoads = true;
        
        document.getElementById('limites-detectados').classList.remove('hidden');
    },

    // Handle Color Picker (called from app.js)
    handleColorSelect(btn) {
        document.querySelectorAll('.color-btn').forEach(b => b.style.borderColor = 'transparent');
        btn.style.borderColor = 'var(--color-text)';
        this.currentColor = btn.dataset.color;
        
        if (this.mapInstance) {
            this.updatePaintDrawer();
        }
    },

    // Handle Save Route (called from app.js)
    handleSaveRoute() {
        const num = document.getElementById('form-ruta-num').value;
        const nom = document.getElementById('form-ruta-nombre').value;
        const rep = document.getElementById('form-ruta-repartidor').value = '';
        
        if (!num || !nom) return alert("Completa el número y nombre de la ruta.");
        if (this.freehandPoints.length < 5) {
            return alert("Dibuja un trazo en el mapa (activando el modo dibujo) para delimitar la ruta.");
        }
        
        const rId = 'ruta-' + Date.now();
        const pts = this.freehandPoints.map(p => ({ lat: p.lat, lng: p.lng }));
        
        window.State.addRuta({
            id: rId,
            numeroRuta: parseInt(num),
            nombre: nom,
            color: this.currentColor,
            repartidorAsignado: rep || null,
            tipoGeometria: 'freehand-road-bounds',
            freehandPoints: pts,
            roadBoundaries: this.roadBoundaries || [],
            bounds: this.strokeBounds || window.getStrokeBounds(pts),
            adjustedToRoads: this.adjustedToRoads,
            fechaCreacion: new Date().toISOString()
        });
        window.Routes.navigate('ruta-creada', { rutaId: rId });
    },

    async handleRunFreeOCR() {
        const fileInput = document.getElementById('foto-input');
        if (!fileInput.files || fileInput.files.length === 0) return alert('Saca una foto primero.');
        
        const loadingDiv = document.getElementById('ocr-loading');
        const progressSpan = document.getElementById('ocr-progress');
        const resultsBlock = document.getElementById('ocr-results-block');
        const rawTextArea = document.getElementById('ocr-raw-text');
        const errorMsg = document.getElementById('ocr-error-msg');
        const successMsg = document.getElementById('ocr-success-msg');
        const summaryData = document.getElementById('ocr-summary-data');
        
        loadingDiv.classList.remove('hidden');
        resultsBlock.classList.add('hidden');
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
        
        const file = fileInput.files[0];
        
        const result = await readLabelWithOCR(file, (progress) => {
            progressSpan.textContent = Math.round(progress * 100) + '%';
        });
        
        loadingDiv.classList.add('hidden');
        resultsBlock.classList.remove('hidden');
        
        if (!result || !result.parsed) {
            errorMsg.style.display = 'block';
            return;
        }
        
        const { text, parsed } = result;
        rawTextArea.value = text;
        successMsg.style.display = 'block';
        
        // Populate Form
        if (parsed.cliente) {
            const input = document.getElementById('form-paq-cliente');
            input.value = parsed.cliente;
            input.style.borderLeft = "4px solid var(--color-primary)";
        }
        if (parsed.telefono) {
            const input = document.getElementById('form-paq-tel');
            input.value = parsed.telefono;
            input.style.borderLeft = "4px solid var(--color-primary)";
        }
        if (parsed.direccion) {
            const input = document.getElementById('form-paq-dir');
            input.value = parsed.direccion;
            input.style.borderLeft = "4px solid var(--color-primary)";
        }
        if (parsed.pisoPuerta) {
            const input = document.getElementById('form-paq-piso');
            input.value = parsed.pisoPuerta;
            input.style.borderLeft = "4px solid var(--color-primary)";
        }
        if (parsed.posibleCobro) {
            document.getElementById('form-paq-cobro').checked = true;
            document.getElementById('container-importe').classList.remove('hidden');
            document.getElementById('form-paq-importe').value = parsed.importeCobro;
        }
        
        // Show summary card details
        const routeId = window.State.data.routeParams.rutaId;
        const rutaObj = window.State.getRutas().find(r => r.id === routeId);
        
        let pqsEnRuta = window.State.getPaquetes().filter(p => p.rutaAsignada === routeId);
        let numPaquete = pqsEnRuta.length + 1;
        let pRutaNum = rutaObj ? rutaObj.numeroRuta : '?';
        
        let typeStr = "DOMICILIO";
        const tipoEl = document.getElementById('form-paq-tipo');
        if (tipoEl) {
            typeStr = tipoEl.value.toUpperCase();
        } else if (parsed.posibleCobro) {
            typeStr = "COBRO";
        }
        
        summaryData.innerHTML = `
            <strong>👤 Cliente:</strong> ${parsed.cliente || '---'}<br>
            <strong>📞 Teléfono:</strong> ${parsed.telefono || '---'}<br>
            <strong>📍 Dirección:</strong> ${parsed.direccion || '---'} ${parsed.pisoPuerta ? '('+parsed.pisoPuerta+')' : ''}<br>
            <strong>🏙️ CP/Ciudad:</strong> ${parsed.codigoPostal || '---'} / ${parsed.ciudad || '---'}<br>
            <strong>💰 Cobro:</strong> ${parsed.posibleCobro ? 'Sí (€' + parsed.importeCobro + ')' : 'No'}<br>
            <br>
            <div style="background:var(--color-bg); padding:0.5rem; border-radius:4px; font-weight:bold; color:var(--color-primary);">
                Se generará: ${numPaquete}/${pRutaNum} ${typeStr}
            </div>
        `;
    },

    handleCopyRawOCR() {
        const text = document.getElementById('ocr-raw-text').value;
        if (!text) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Texto copiado al portapapeles');
            });
        } else {
            const textArea = document.getElementById('ocr-raw-text');
            textArea.select();
            document.execCommand('copy');
            alert('Texto copiado al portapapeles');
        }
    },

    handleExportExcel() {
        if (typeof XLSX === 'undefined') return alert('Cargando librería Excel, por favor intenta de nuevo en unos segundos.');
        const pqs = window.State.getPaquetes();
        const routes = window.State.getRutas();
        
        const data = pqs.map(p => {
            const r = routes.find(rut => rut.id === p.rutaAsignada);
            return {
                "Código Físico": p.codigoFisico,
                "Cliente": p.cliente,
                "Teléfono": p.telefono,
                "Dirección": p.direccion,
                "Ruta": r ? r.nombre : 'Sin Ruta',
                "Estado": p.estado,
                "Horaria": p.tipo === 'horaria' ? "Sí" : "No",
                "Tienda": p.tipo === 'tienda' ? "Sí" : "No",
                "Cobro": p.tipo === 'cobro' ? "Sí" : "No",
                "Tipo": p.tipo
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Paquetes_RutaBoss");
        XLSX.writeFile(workbook, "RutaBoss_Reporte.xlsx");
    },

    renderReporteJefe() {
        this.navContainer.classList.add('hidden');
        const tpl = document.getElementById('tpl-reporte-jefe').content.cloneNode(true);
        
        const phoneInput = tpl.querySelector('#form-jefe-phone');
        phoneInput.value = window.State.data.managerReportPhone || '';
        
        const preview = tpl.querySelector('#report-preview');
        preview.value = this.generateManagerReport();
        
        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    generateManagerReport() {
        const pqs = window.State.getPaquetes();
        const routes = window.State.getRutas();
        const reps = window.appData.repartidores;
        
        const pad0 = (n) => n.toString().padStart(2, '0');
        const d = new Date();
        const timeStr = `${pad0(d.getHours())}:${pad0(d.getMinutes())}`;
        
        const entregados = pqs.filter(p => p.estado === 'entregado').length;
        const pendientes = pqs.filter(p => p.estado === 'pendiente').length;
        const incidencias = pqs.filter(p => p.estado === 'fallido' && (!p.incidencia || p.incidencia.motivo !== 'Reintentar')).length;
        const reintentos = pqs.filter(p => p.estado === 'fallido' && p.incidencia && p.incidencia.motivo === 'Reintentar').length;
        
        const cobrosP = pqs.filter(p => p.tipo === 'cobro' && p.estado === 'pendiente').length;
        const tiendasP = pqs.filter(p => p.tipo === 'tienda' && p.estado === 'pendiente').length;
        const horariasP = pqs.filter(p => p.tipo === 'horaria' && p.estado === 'pendiente').length;
        const sinAsignar = pqs.filter(p => !p.rutaAsignada).length;

        let str = `📦 Reporte general de ruta — ${timeStr}\n\n`;
        str += `Total paquetes: ${pqs.length}\n`;
        str += `Entregados: ${entregados}\n`;
        str += `Pendientes: ${pendientes}\n`;
        str += `Incidencias: ${incidencias}\n`;
        str += `Reintentos: ${reintentos}\n`;
        str += `Cobros pendientes: ${cobrosP}\n`;
        str += `Tiendas pendientes: ${tiendasP}\n`;
        str += `Horarias pendientes: ${horariasP}\n`;
        str += `Sin asignar: ${sinAsignar}\n\n`;
        
        str += `🗺️ Por ruta:\n`;
        routes.forEach(r => {
            const rp = pqs.filter(p => p.rutaAsignada === r.id);
            const rent = rp.filter(p => p.estado === 'entregado').length;
            const rpend = rp.filter(p => p.estado === 'pendiente').length;
            const rinc = rp.filter(p => p.estado === 'fallido').length;
            str += `- ${r.nombre || ('Ruta ' + r.numeroRuta)}: ${rent} entregados / ${rpend} pendientes / ${rinc} incidencias\n`;
        });
        
        str += `\n👥 Por repartidor:\n`;
        reps.forEach(rep => {
            const rRep = routes.filter(r => r.repartidorAsignado === rep.id).map(r => r.id);
            const rp = pqs.filter(p => rRep.includes(p.rutaAsignada));
            if (rp.length > 0) {
                const rent = rp.filter(p => p.estado === 'entregado').length;
                const rpend = rp.filter(p => p.estado === 'pendiente').length;
                const rinc = rp.filter(p => p.estado === 'fallido').length;
                str += `- ${rep.nombre}: ${rent} entregados / ${rpend} pendientes / ${rinc} incidencias\n`;
            }
        });
        
        str += `\n⚠️ Alertas:\n`;
        str += `- Cobros pendientes: ${cobrosP}\n`;
        str += `- Tiendas pendientes: ${tiendasP}\n`;
        str += `- Prioridad horaria pendiente: ${horariasP}\n\n`;
        
        str += `Última actualización: ${timeStr}`;
        return str;
    },

    handleCopyManagerReport() {
        const text = document.getElementById('report-preview').value;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('¡Reporte copiado al portapapeles!');
            }).catch(() => alert('No se pudo copiar el texto.'));
        } else {
            // Fallback for older browsers
            const textArea = document.getElementById('report-preview');
            textArea.select();
            document.execCommand('copy');
            alert('¡Reporte copiado al portapapeles!');
        }
    },

    handleSendManagerReport() {
        const phone = document.getElementById('form-jefe-phone').value.trim();
        if (!phone) return alert('Por favor, ingresa el teléfono del jefe/a.');
        
        window.State.data.managerReportPhone = phone;
        const text = document.getElementById('report-preview').value;
        
        if (!window.State.data.managerReportHistory) window.State.data.managerReportHistory = [];
        window.State.data.managerReportHistory.push({
            id: 'rep-' + Date.now(),
            createdAt: new Date().toISOString(),
            message: text
        });
        window.State.save();
        
        const cleanPhone = phone.replace(/\D/g, '');
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
    },

    // Render Ruta Creada
    renderRutaCreada(rutaId) {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-ruta-creada');
        // El id se agarra en app.js desde el State params
        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Render Cargar Paquete
    renderCrearPaquete(rutaId) {
        this.navContainer.classList.add('hidden');
        const ruta = window.State.getRutas().find(r => r.id === rutaId);
        if (!ruta) return window.history.back();

        const tpl = this.cloneTpl('tpl-crear-paquete');
        tpl.querySelector('#form-paq-ruta-nombre').textContent = `En sector: ${ruta.nombre} (R${ruta.numeroRuta})`;

        // These specific UI changes stay here
        const selectTipo = tpl.querySelector('#form-paq-tipo');
        const contImporte = tpl.querySelector('#container-importe');
        
        const fotoInput = tpl.querySelector('#foto-input');
        const previewCont = tpl.querySelector('#preview-container');
        const previewImg = tpl.querySelector('#foto-preview');
        
        this.clearApp();
        this.appContainer.appendChild(tpl);

        // Add listeners after appending to ensure they work smoothly
        document.getElementById('form-paq-tipo').addEventListener('change', (e) => {
            document.getElementById('container-importe').classList.toggle('hidden', e.target.value !== 'cobro');
        });

        document.getElementById('foto-input').addEventListener('change', async (e) => {
            if(e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = function(evt) {
                    document.getElementById('foto-preview').src = evt.target.result;
                    document.getElementById('preview-container').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
                
                // OCR Mock
                const data = await window.extractPackageDataFromLabel(file);
                if(data.cliente) document.getElementById('form-paq-cliente').value = data.cliente;
                if(data.direccion) document.getElementById('form-paq-dir').value = data.direccion;
            }
        });
    },

    // Handle Save Paquete (called from app.js)
    handleSavePackage() {
        const rutaId = window.State.getRoute().params?.rutaId;
        if(!rutaId) return;
        
        const p = window.State.addPaquete({
            rutaAsignada: rutaId,
            cliente: document.getElementById('form-paq-cliente').value || 'Sin nombre',
            telefono: document.getElementById('form-paq-tel').value || '',
            direccion: document.getElementById('form-paq-dir').value || '',
            pisoPuerta: document.getElementById('form-paq-piso').value || '',
            tipo: document.getElementById('form-paq-tipo').value || 'domicilio',
            importeCobro: parseFloat(document.getElementById('form-paq-importe').value) || 0,
        });
        window.Routes.navigate('escribir-codigo', { paqueteId: p.idPaquete });
    },

    // Render Escribir Código
    renderEscribirCodigo(paqueteId) {
        this.navContainer.classList.add('hidden');
        const pkg = window.State.getPaquetes().find(p => p.idPaquete === paqueteId);
        if (!pkg) return window.history.back();

        const tpl = this.cloneTpl('tpl-escribir-codigo');
        tpl.querySelector('#display-codigo-fisico').textContent = pkg.codigoFisico;
        
        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Render Panel Repartidor
    renderPanelRepartidor(repartidorId) {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-panel-repartidor');
        
        const rep = window.appData.repartidores.find(r => r.id === repartidorId);
        if (rep) tpl.querySelector('#ruta-title').textContent = `Ruta de ${rep.nombre}`;

        const rutasDelRepartidor = window.State.getRutas().filter(r => r.repartidorAsignado === repartidorId).map(r=>r.id);
        let paquetes = window.State.getPaquetes().filter(p => 
            p.asignadoId === repartidorId || rutasDelRepartidor.includes(p.rutaAsignada)
        );

        const updateCounters = () => {
            const p = window.State.getPaquetes();
            const repId = window.appData.repartidores.find(r => r.id === repartidorId)?.id;
            const rutasDelRepartidor = window.State.getRutas().filter(r => r.repartidorAsignado === repartidorId).map(r=>r.id);
            let paquetesActuales = p.filter(pkg => pkg.asignadoId === repartidorId || rutasDelRepartidor.includes(pkg.rutaAsignada));
            
            const cPend = paquetesActuales.filter(x => x.estado === 'pendiente').length;
            const cEnt = paquetesActuales.filter(x => x.estado === 'entregado').length;
            const cFal = paquetesActuales.filter(x => x.estado === 'fallido').length;
            
            if(document.getElementById('count-pendientes')) document.getElementById('count-pendientes').textContent = cPend;
            if(document.getElementById('count-entregados')) document.getElementById('count-entregados').textContent = cEnt;
            if(document.getElementById('count-fallidos')) document.getElementById('count-fallidos').textContent = cFal;
        };

        const list = tpl.querySelector('#mis-paquetes-list');
        
        const renderSortedPackages = () => {
            list.innerHTML = '';
            const sortCriteria = document.getElementById('sort-packages') ? document.getElementById('sort-packages').value : window.State.data.currentSort || 'numeroEscaneo';
            const searchStr = document.getElementById('search-packages') ? document.getElementById('search-packages').value.toLowerCase() : '';
            const filterEstado = document.getElementById('filter-estado') ? document.getElementById('filter-estado').value : 'todos';
            
            let filtered = paquetes.filter(pkg => {
                if (filterEstado !== 'todos' && pkg.estado !== filterEstado) return false;
                if (searchStr) {
                    const matchFisico = pkg.codigoFisico && pkg.codigoFisico.toLowerCase().includes(searchStr);
                    const matchBarcode = pkg.barcode && pkg.barcode.toLowerCase().includes(searchStr);
                    if (!matchFisico && !matchBarcode) return false;
                }
                return true;
            });
            
            let sorted = [...filtered];
            
            if (sortCriteria === 'numeroEscaneo') {
                sorted.sort((a,b) => a.numeroEscaneo - b.numeroEscaneo);
            } else if (sortCriteria === 'ruta') {
                const getRutaNum = (id) => {
                    const r = window.State.getRutas().find(rut => rut.id === id);
                    return r ? r.numeroRuta : 999;
                };
                sorted.sort((a,b) => getRutaNum(a.rutaAsignada) - getRutaNum(b.rutaAsignada) || a.numeroEscaneo - b.numeroEscaneo);
            } else if (sortCriteria === 'tipo') {
                sorted.sort((a,b) => (a.tipo || '').localeCompare(b.tipo || '') || a.numeroEscaneo - b.numeroEscaneo);
            }

            // Mover los entregados/fallidos al final
            sorted.sort((a,b) => {
                const sA = a.estado === 'pendiente' ? 0 : 1;
                const sB = b.estado === 'pendiente' ? 0 : 1;
                return sA - sB;
            });
            
            const fragment = document.createDocumentFragment();
            sorted.forEach((pkg) => fragment.appendChild(this.createPaqueteCard(pkg, false)));
            list.appendChild(fragment);
        };

        this.clearApp();
        this.appContainer.appendChild(tpl);
        
        // Setup listeners
        const sortSelect = document.getElementById('sort-packages');
        if (sortSelect) {
            sortSelect.value = window.State.data.currentSort || 'numeroEscaneo';
            sortSelect.addEventListener('change', (e) => {
                window.State.data.currentSort = e.target.value;
                window.State.save();
                renderSortedPackages();
            });
        }

        const filterEstado = document.getElementById('filter-estado');
        if (filterEstado) {
            filterEstado.addEventListener('change', renderSortedPackages);
        }

        const searchPkgs = document.getElementById('search-packages');
        if (searchPkgs) {
            searchPkgs.addEventListener('input', renderSortedPackages);
        }
        
        renderSortedPackages();
        updateCounters();
    },

    // Render Cargar Paquete Rápido
    renderCrearPaqueteRapido() {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-crear-paquete-rapido');
        
        const rutas = window.State.getRutas();
        const rutaGroup = tpl.querySelector('#rapido-ruta-group');
        
        const repId = window.State.getCurrentUser()?.id;
        let selectedRouteId = window.State.data.routeParams?.rutaId || null;
        
        if (!selectedRouteId && rutas.length > 0) {
            const misRutas = rutas.filter(r => r.repartidorAsignado === repId);
            selectedRouteId = misRutas.length > 0 ? misRutas[0].id : rutas[0].id;
        }

        rutas.forEach(r => {
            const btn = document.createElement('button');
            btn.className = `pill-btn ${r.id === selectedRouteId ? 'active' : ''}`;
            btn.textContent = `R${r.numeroRuta}`;
            btn.dataset.val = r.id;
            btn.onclick = () => {
                rutaGroup.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
            rutaGroup.appendChild(btn);
        });

        const tipoGroup = tpl.querySelector('#rapido-tipo-group');
        tipoGroup.querySelectorAll('.pill-btn').forEach(btn => {
            btn.onclick = () => {
                tipoGroup.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tpl.querySelector('#rapido-tipo-extra').value = '';
            };
        });

        tpl.querySelector('#rapido-tipo-extra').onchange = (e) => {
            if (e.target.value) {
                tipoGroup.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
            } else {
                tipoGroup.querySelector('[data-val="domicilio"]').classList.add('active');
            }
        };

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Create Card Utility
    createPaqueteCard(pkg, isEncargado = false) {
        const tpl = this.cloneTpl('tpl-paquete-card');
        const card = tpl.querySelector('.paquete-card');
        card.classList.add(`status-${pkg.estado}`);

        tpl.querySelector('.paquete-fisico').textContent = pkg.codigoFisico;
        tpl.querySelector('.paquete-cliente').textContent = pkg.cliente;
        
        const fullDir = pkg.pisoPuerta ? `${pkg.direccion}, ${pkg.pisoPuerta}` : pkg.direccion;
        tpl.querySelector('.paquete-dir').textContent = fullDir;
        tpl.querySelector('.paquete-tel').textContent = pkg.telefono;

        const rutaObj = window.State.getRutas().find(r => r.id === pkg.rutaAsignada);
        tpl.querySelector('.paquete-ruta-info span').textContent = rutaObj ? `${rutaObj.nombre} (R${rutaObj.numeroRuta})` : 'Sin Ruta';

        if (isEncargado && rutaObj && rutaObj.repartidorAsignado) {
            const rep = window.appData.repartidores.find(r => r.id === rutaObj.repartidorAsignado);
            if (rep) {
                const asig = tpl.querySelector('.paquete-asignado');
                asig.textContent = rep.nombre;
                asig.classList.remove('hidden');
            }
        }

        tpl.querySelector('.action-ver').setAttribute('data-pkg-id', pkg.idPaquete);
        
        const qDeliver = tpl.querySelector('.action-quick-deliver');
        const qFail = tpl.querySelector('.action-quick-fail');
        const qReset = tpl.querySelector('.action-quick-reset');
        const qCopy = tpl.querySelector('.action-quick-copy');
        
        if (qDeliver) qDeliver.setAttribute('data-pkg-id', pkg.idPaquete);
        if (qFail) qFail.setAttribute('data-pkg-id', pkg.idPaquete);
        if (qReset) qReset.setAttribute('data-pkg-id', pkg.idPaquete);
        if (qCopy) qCopy.setAttribute('data-pkg-id', pkg.idPaquete);

        if (pkg.estado !== 'pendiente') {
            if (qDeliver) qDeliver.classList.add('hidden');
            if (qFail) qFail.classList.add('hidden');
            if (qReset) qReset.classList.remove('hidden');
        }

        return card;
    },

    // Render Detalle
    renderDetallePaquete(id) {
        this.navContainer.classList.add('hidden');
        const pkg = window.State.getPaquetes().find(p => p.idPaquete === id);
        if (!pkg) return window.history.back();

        const tpl = this.cloneTpl('tpl-detalle-paquete');
        
        tpl.querySelector('.det-id').textContent = pkg.idPaquete;
        tpl.querySelector('.det-fisico').textContent = pkg.codigoFisico;
        tpl.querySelector('.det-cliente').textContent = pkg.cliente;
        tpl.querySelector('.det-tel').textContent = pkg.telefono;
        
        const fullDir = pkg.pisoPuerta ? `${pkg.direccion}, ${pkg.pisoPuerta}` : pkg.direccion;
        tpl.querySelector('.det-dir').textContent = fullDir;

        const pagoEl = tpl.querySelector('.det-pago');
        if (pkg.tipo === 'cobro') {
            pagoEl.textContent = `A COBRAR: ${pkg.importeCobro} €`;
            pagoEl.classList.add('con-cobro');
        } else {
            pagoEl.textContent = 'PAQUETE SIN COBRO';
            pagoEl.classList.add('sin-cobro');
        }

        tpl.querySelector('.det-llamadas').textContent = `(${pkg.llamadas})`;

        // Set attributes for delegation
        tpl.querySelector('.action-llamar').setAttribute('data-pkg-id', pkg.idPaquete);
        tpl.querySelector('.action-whatsapp').setAttribute('data-pkg-id', pkg.idPaquete);
        tpl.querySelector('.action-maps').setAttribute('data-pkg-id', pkg.idPaquete);
        tpl.querySelector('.action-entregado').setAttribute('data-pkg-id', pkg.idPaquete);
        tpl.querySelector('.action-guardar-incidencia').setAttribute('data-pkg-id', pkg.idPaquete);
        
        const notaInput = tpl.querySelector('#nota');
        notaInput.value = pkg.nota || '';

        if (pkg.estado !== 'pendiente') {
            tpl.querySelector('#card-acciones').style.opacity = '0.5';
            tpl.querySelector('#card-acciones').style.pointerEvents = 'none';
        }

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Actions Handlers for Detalle Paquete (called from app.js)
    handleCallClient(id) {
        const pkg = window.State.getPaquetes().find(p => p.idPaquete === id);
        if(!pkg) return;
        window.State.updatePaquete(id, { llamadas: pkg.llamadas + 1 });
        window.location.href = `tel:${pkg.telefono}`;
        // Re-render
        window.Routes.renderCurrent();
    },

    handleMessageClient(id) {
        const pkg = window.State.getPaquetes().find(p => p.idPaquete === id);
        if(!pkg) return;
        const msg = encodeURIComponent(`Hola ${pkg.cliente}, soy el repartidor. Estoy intentando entregar un paquete en ${pkg.direccion}.`);
        window.open(`https://wa.me/34${pkg.telefono.replace(/\s+/g,'')}?text=${msg}`, '_blank');
    },

    handleOpenMaps(id) {
        const pkg = window.State.getPaquetes().find(p => p.idPaquete === id);
        if(!pkg) return;
        const fullDir = pkg.pisoPuerta ? `${pkg.direccion}, ${pkg.pisoPuerta}` : pkg.direccion;
        const query = encodeURIComponent(fullDir);
        window.open(`https://maps.google.com/?q=${query}`, '_blank');
    },

    handleMarkDelivered(id) {
        const nota = document.getElementById('nota').value;
        window.State.updatePaquete(id, { estado: 'entregado', nota: nota });
        window.history.back();
    },

    handleConfirmFailure(id) {
        const motivo = document.getElementById('motivo').value;
        const nota = document.getElementById('nota').value;
        if (!motivo) return alert("Selecciona un motivo");
        window.State.updatePaquete(id, { 
            estado: 'fallido', 
            nota: `${motivo} - ${nota}`
        });
        window.history.back();
    },

    // Others
    renderPlaceholder(title) {
        this.navContainer.classList.remove('hidden');
        this.updateNav(title.toLowerCase());
        const tpl = this.cloneTpl('tpl-view-placeholder');
        tpl.querySelector('.view-title').textContent = title;
        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    startScanner() {
        if (!window.ZXing) {
            const errMsg = document.getElementById('scanner-error-msg');
            if (errMsg) {
                errMsg.textContent = 'La librería ZXing no cargó o no hay internet. Usá la carga manual.';
                errMsg.classList.remove('hidden');
            }
            return;
        }
        
        const container = document.getElementById('scanner-container');
        const errMsg = document.getElementById('scanner-error-msg');
        if (container) container.classList.remove('hidden');
        if (errMsg) errMsg.classList.add('hidden');
        
        this.codeReader = new ZXing.BrowserMultiFormatReader();
        const videoElement = document.getElementById('zxing-video');
        
        this.codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
            if (result) {
                const resBox = document.getElementById('scanner-result-box');
                const barVal = document.getElementById('scanner-barcode-val');
                const hidVal = document.getElementById('hidden-barcode-val');
                if(resBox) resBox.classList.remove('hidden');
                if(barVal) barVal.textContent = result.text;
                if(hidVal) hidVal.value = result.text;
                
                this.stopScanner(false);
                if(container) container.classList.add('hidden');
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.warn(err);
            }
        }).catch(err => {
            console.error(err);
            if (errMsg) {
                errMsg.textContent = 'Error al abrir la cámara. Verifica permisos o usa carga manual.';
                errMsg.classList.remove('hidden');
            }
            if (container) container.classList.add('hidden');
        });
    },

    stopScanner(hideContainer = true) {
        if (this.codeReader) {
            this.codeReader.reset();
            this.codeReader = null;
        }
        if (hideContainer) {
            const container = document.getElementById('scanner-container');
            if (container) container.classList.add('hidden');
        }
    },

    updateNav(activeTarget) {
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.dataset.target === activeTarget) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
};

window.UI = UI;
