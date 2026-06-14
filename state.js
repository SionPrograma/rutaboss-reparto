// state.js
const State = {
    data: {
        currentUser: null,
        currentRoute: 'login',
        routeParams: null,
        rutas: null,
        paquetes: null,
        globalScanCounter: 0
    },

    init() {
        const saved = localStorage.getItem('rutaboss_state');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                if (!this.data.paquetes || !this.data.rutas) {
                    this.loadDefaults();
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
        this.data.paquetes = JSON.parse(JSON.stringify(window.appData.paquetes));
        this.data.rutas = JSON.parse(JSON.stringify(window.appData.rutas));
        this.data.globalScanCounter = window.appData.globalScanCounter;
        this.save();
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
        this.data.rutas.push(ruta);
        this.save();
    },

    addPaquete(paquete) {
        this.data.globalScanCounter++;
        paquete.numeroEscaneo = this.data.globalScanCounter;
        paquete.idPaquete = 'PAQ-N' + this.data.globalScanCounter; // Generado interno
        
        const ruta = this.data.rutas.find(r => r.id === paquete.rutaAsignada);
        const numeroRuta = ruta ? ruta.numeroRuta : '?';
        
        let alerta = 'NORMAL';
        if (paquete.esHoraria) alerta = 'HORARIA';
        else if (paquete.esTienda) alerta = 'TIENDA';
        else if (paquete.esCobro) alerta = 'COBRO';
        else if (paquete.esBloque) alerta = 'BLOQUE';
        
        paquete.codigoFisico = `${paquete.numeroEscaneo}/${numeroRuta} ${alerta}`;
        paquete.codigoEscrito = false;
        paquete.estado = 'pendiente';
        paquete.llamadas = 0;
        paquete.nota = '';
        
        this.data.paquetes.push(paquete);
        this.save();
        return paquete;
    },

    updatePaquete(id, updates) {
        const idx = this.data.paquetes.findIndex(p => p.idPaquete === id);
        if (idx !== -1) {
            this.data.paquetes[idx] = { ...this.data.paquetes[idx], ...updates };
            this.save();
        }
    }
};

window.State = State;
