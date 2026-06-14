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

    clearApp() { this.appContainer.innerHTML = ''; },
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

    // Render Dashboard Encargado
    renderDashboardEncargado() {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-dashboard-encargado');
        
        const paquetes = window.State.getPaquetes();
        const rutas = window.State.getRutas();
        
        tpl.querySelector('#stat-horaria').textContent = paquetes.filter(p => p.esHoraria).length;
        tpl.querySelector('#stat-tienda').textContent = paquetes.filter(p => p.esTienda).length;

        const rutasList = tpl.querySelector('#rutas-list');
        rutas.forEach(ruta => {
            const rTpl = this.cloneTpl('tpl-ruta-card');
            const card = rTpl.querySelector('.ruta-card');
            card.style.borderLeftColor = ruta.color || 'var(--color-primary)';
            if(ruta.color && ruta.color.length === 7) {
                 card.style.backgroundColor = ruta.color + '0A';
            }
            
            rTpl.querySelector('.ruta-nombre').textContent = `${ruta.nombre} (R${ruta.numeroRuta})`;
            const pqs = paquetes.filter(p => p.rutaAsignada === ruta.id);
            rTpl.querySelector('.ruta-totales').textContent = pqs.length;
            rTpl.querySelector('.ruta-tiendas').textContent = pqs.filter(p=>p.esTienda).length;
            rTpl.querySelector('.ruta-horarias').textContent = pqs.filter(p=>p.esHoraria).length;
            rTpl.querySelector('.ruta-bloques').textContent = pqs.filter(p=>p.esBloque).length;

            if (ruta.adjusted) {
                rTpl.querySelector('.ruta-ajustada').classList.remove('hidden');
            }

            if (ruta.repartidorAsignado) {
                const rep = window.appData.repartidores.find(r => r.id === ruta.repartidorAsignado);
                if (rep) rTpl.querySelector('.ruta-repartidor').textContent = rep.nombre;
            } else {
                rTpl.querySelector('.ruta-repartidor').style.display = 'none';
            }

            // Set data properties for actions
            rTpl.querySelector('.action-cargar-paquete').setAttribute('data-ruta-id', ruta.id);

            rutasList.appendChild(rTpl);
        });

        const paqList = tpl.querySelector('#paquetes-list');
        paquetes.slice(-5).reverse().forEach(pkg => {
            paqList.appendChild(this.createPaqueteCard(pkg, true));
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
        const rep = document.getElementById('form-ruta-repartidor').value;
        
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
        const chkCobro = tpl.querySelector('#form-paq-cobro');
        const contImporte = tpl.querySelector('#container-importe');
        
        const fotoInput = tpl.querySelector('#foto-input');
        const previewCont = tpl.querySelector('#preview-container');
        const previewImg = tpl.querySelector('#foto-preview');
        
        this.clearApp();
        this.appContainer.appendChild(tpl);

        // Add listeners after appending to ensure they work smoothly
        document.getElementById('form-paq-cobro').addEventListener('change', (e) => {
            document.getElementById('container-importe').classList.toggle('hidden', !e.target.checked);
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
            esHoraria: document.getElementById('form-paq-horaria').checked,
            esTienda: document.getElementById('form-paq-tienda').checked,
            esBloque: document.getElementById('form-paq-bloque').checked,
            esCobro: document.getElementById('form-paq-cobro').checked,
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

        tpl.querySelector('#count-pendientes').textContent = paquetes.filter(p => p.estado === 'pendiente').length;

        const list = tpl.querySelector('#mis-paquetes-list');
        const priorityScore = (p) => {
            if (p.estado !== 'pendiente') return 100;
            if (p.esHoraria) return 1;
            if (p.esTienda) return 2;
            if (p.esBloque) return 3;
            if (p.esCobro) return 4;
            return 5;
        };
        
        const sorted = [...paquetes].sort((a,b) => priorityScore(a) - priorityScore(b));
        sorted.forEach((pkg) => list.appendChild(this.createPaqueteCard(pkg, false)));

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
        if (pkg.esCobro) {
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

    updateNav(activeTarget) {
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.dataset.target === activeTarget) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
};

window.UI = UI;
