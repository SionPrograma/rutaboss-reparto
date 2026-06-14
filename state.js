// state.js - Gestión de estado y LocalStorage

const State = {
    data: {
        currentUser: null, // { role: 'encargado'|'repartidor', id: '...' }
        currentRoute: 'login',
        routeParams: null, // For passing data to routes (e.g. package ID)
        paquetes: null // Store packages to persist changes (estado, llamadas, notas)
    },

    init() {
        const saved = localStorage.getItem('rutaboss_state');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                // Ensure default packages if empty
                if (!this.data.paquetes || this.data.paquetes.length === 0) {
                    this.data.paquetes = JSON.parse(JSON.stringify(window.appData.paquetes));
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
        this.save();
    },

    save() {
        localStorage.setItem('rutaboss_state', JSON.stringify(this.data));
    },

    login(role, id = null) {
        this.data.currentUser = { role, id };
        this.data.currentRoute = 'inicio';
        this.data.routeParams = null;
        this.save();
    },

    logout() {
        this.data.currentUser = null;
        this.data.currentRoute = 'login';
        this.data.routeParams = null;
        this.save();
    },

    getCurrentUser() {
        return this.data.currentUser;
    },

    setRoute(route, params = null) {
        this.data.currentRoute = route;
        this.data.routeParams = params;
        this.save();
    },

    getRoute() {
        return { path: this.data.currentRoute, params: this.data.routeParams };
    },
    
    getPaquetes() {
        return this.data.paquetes || [];
    },
    
    updatePaquete(id, updates) {
        const idx = this.data.paquetes.findIndex(p => p.id === id);
        if (idx !== -1) {
            this.data.paquetes[idx] = { ...this.data.paquetes[idx], ...updates };
            this.save();
        }
    }
};

window.State = State;
