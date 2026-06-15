// state.js
const State = {
    data: {
        currentUser: null,
        currentRoute: 'login',
        routeParams: null,
        rutas: [],
        paquetes: [],
        globalScanCounter: 0,
        managerReportPhone: '',
        managerReportHistory: []
    },

    init() {
        const saved = localStorage.getItem('rutaboss_state');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                if (!this.data.paquetes || !this.data.rutas) {
                    this.loadDefaults();
                } else {
                    this.migrateData();
                }
            } catch (e) {
                console.error("Error parsing state", e);
                this.loadDefaults();
            }
        } else {
            this.loadDefaults();
        }
    },
    
    loadDefaults() {
        this.data.paquetes = JSON.parse(JSON.stringify(window.appData.paquetes || []));
        this.data.rutas = JSON.parse(JSON.stringify(window.appData.rutas || []));
        this.data.globalScanCounter = window.appData.globalScanCounter || 0;
        this.migrateData();
        this.save();
    },

    migrateData() {
        let changed = false;
        
        // Migrar Rutas
        if (this.data.rutas) {
            this.data.rutas.forEach(r => {
                if (!r.status) {
                    r.status = 'not_active';
                    r.startedPickingAt = null;
                    r.startedDeliveringAt = null;
                    r.closedAt = null;
                    changed = true;
                }
            });
        }
        if (this.data.paquetes) {
            this.data.paquetes.forEach(p => {
                if (p.isLoaded === undefined) {
                    p.isLoaded = false;
                    p.loadedAt = null;
                    changed = true;
                }
                
                if (p.tipo) return; // Already migrated
                
                if (p.esHoraria) p.tipo = 'horaria';
                else if (p.esTienda) p.tipo = 'tienda';
                else if (p.esCobro) p.tipo = 'cobro';
                else if (p.esBloque) p.tipo = 'bloque';
                else p.tipo = 'domicilio';
                
                if (p.codigoFisico && (p.codigoFisico.includes('NORMAL') || p.codigoFisico.includes('TIENDA') || p.codigoFisico.includes('COBRO') || p.codigoFisico.includes('HORARIA') || p.codigoFisico.includes('BLOQUE'))) {
                    const partes = p.codigoFisico.split(' ');
                    if (partes.length === 2) {
                        p.codigoFisico = `${partes[0]} ${p.tipo}`;
                    }
                }
                changed = true;
            });
        }
        if (changed) this.save();
    },

    save() { localStorage.setItem('rutaboss_state', JSON.stringify(this.data)); },
    login(role, id = null) { this.data.currentUser = { role, id }; this.setRoute('inicio'); },
    logout() { this.data.currentUser = null; this.setRoute('login'); },
    getCurrentUser() { return this.data.currentUser; },
    setRoute(route, params = null) { this.data.currentRoute = route; this.data.routeParams = params; this.save(); },
    getRoute() { return { path: this.data.currentRoute, params: this.data.routeParams }; },
    getPaquetes() { return this.data.paquetes || []; },
    getRutas() { return this.data.rutas || []; },
    
    addRuta(ruta) {
        ruta.status = ruta.status || 'not_active';
        ruta.startedPickingAt = ruta.startedPickingAt || null;
        ruta.startedDeliveringAt = ruta.startedDeliveringAt || null;
        ruta.closedAt = ruta.closedAt || null;
        this.data.rutas.push(ruta);
        this.save();
    },

    updateRuta(id, updates) {
        const idx = this.data.rutas.findIndex(r => r.id === id);
        if (idx !== -1) {
            this.data.rutas[idx] = { ...this.data.rutas[idx], ...updates };
            this.save();
        }
    },

    addPaquete(paquete) {
        this.data.globalScanCounter++;
        paquete.numeroEscaneo = this.data.globalScanCounter;
        paquete.scanOrder = this.data.globalScanCounter;
        paquete.idPaquete = 'PAQ-N' + this.data.globalScanCounter;
        paquete.id = paquete.idPaquete;
        
        const ruta = this.data.rutas.find(r => r.id === paquete.rutaAsignada);
        const numeroRuta = ruta ? ruta.numeroRuta : '?';
        paquete.routeNo = numeroRuta;
        
        let tipoEtiqueta = paquete.tipo || 'domicilio';
        paquete.mode = tipoEtiqueta;
        
        paquete.codigoFisico = `${paquete.numeroEscaneo}/${numeroRuta} ${tipoEtiqueta}`;
        paquete.estado = 'pendiente';
        paquete.status = 'pending';
        paquete.llamadas = 0;
        paquete.nota = paquete.nota || '';
        paquete.notes = paquete.nota;
        paquete.fechaEscaneo = new Date().toISOString();
        paquete.scannedAt = paquete.fechaEscaneo;
        paquete.deliveredAt = null;
        paquete.barcode = paquete.barcode || null;
        paquete.scannerSource = paquete.scannerSource || 'manual';
        paquete.address = paquete.pisoPuerta ? `${paquete.direccion}, ${paquete.pisoPuerta}` : paquete.direccion;
        
        paquete.isLoaded = paquete.isLoaded || false;
        paquete.loadedAt = paquete.loadedAt || null;
        
        this.data.paquetes.push(paquete);
        this.save();
        return paquete;
    },

    clearJornada() {
        this.data.paquetes = [];
        this.data.globalScanCounter = 0;
        this.save();
    },

    updatePaquete(id, updates) {
        const idx = this.data.paquetes.findIndex(p => p.idPaquete === id || p.id === id);
        if (idx !== -1) {
            if (updates.estado === 'entregado') {
                updates.deliveredAt = new Date().toISOString();
                updates.status = 'delivered';
            } else if (updates.estado === 'fallido') {
                updates.status = 'failed';
            } else if (updates.estado === 'pendiente') {
                updates.status = 'pending';
                updates.deliveredAt = null;
            }
            this.data.paquetes[idx] = { ...this.data.paquetes[idx], ...updates };
            this.save();
        }
    },
};

window.State = State;
