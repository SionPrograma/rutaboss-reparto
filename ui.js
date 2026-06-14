// ui.js - Funciones para renderizar la interfaz

const UI = {
    appContainer: document.getElementById('app'),
    navContainer: document.getElementById('bottom-nav'),

    clearApp() { this.appContainer.innerHTML = ''; },
    cloneTpl(id) { return document.getElementById(id).content.cloneNode(true); },
    setupBackBtn(el) {
        const btn = el.querySelector('.btn-volver');
        if (btn) btn.addEventListener('click', () => window.history.back());
    },
    setupExitBtn(el) {
        const btn = el.querySelector('.btn-salir');
        if (btn) btn.addEventListener('click', () => { window.State.logout(); });
    },

    // Login & Selectors
    renderLogin() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-login');
        
        tpl.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.dataset.role === 'encargado') {
                    document.getElementById('encargado-login').classList.remove('hidden');
                } else {
                    window.State.login('repartidor');
                }
            });
        });

        const passInput = tpl.querySelector('#password');
        tpl.querySelector('#btn-login-encargado').addEventListener('click', () => {
            if (passInput.value === '1234') window.State.login('encargado');
            else alert('Contraseña incorrecta');
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderSelectorRepartidor() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-selector-repartidor');
        this.setupExitBtn(tpl);
        const btnVolver = tpl.querySelector('.btn-volver');
        if (btnVolver) btnVolver.addEventListener('click', () => window.State.logout());

        const list = tpl.querySelector('#repartidores-lista-botones');
        window.appData.repartidores.forEach(rep => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary btn-large';
            btn.textContent = rep.nombre;
            btn.addEventListener('click', () => {
                window.State.login('repartidor', rep.id);
            });
            list.appendChild(btn);
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Encargado: Dashboard & Rutas
    renderDashboardEncargado() {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-dashboard-encargado');
        this.setupExitBtn(tpl);

        const paquetes = window.State.getPaquetes();
        const rutas = window.State.getRutas();
        
        // Stats
        tpl.querySelector('#stat-horaria').textContent = paquetes.filter(p => p.esHoraria).length;
        tpl.querySelector('#stat-tienda').textContent = paquetes.filter(p => p.esTienda).length;

        // Rutas List
        const rutasList = tpl.querySelector('#rutas-list');
        rutas.forEach(ruta => {
            const rTpl = this.cloneTpl('tpl-ruta-card');
            const card = rTpl.querySelector('.ruta-card');
            card.style.borderLeftColor = ruta.color || 'var(--color-primary)';
            rTpl.querySelector('.ruta-nombre').textContent = `${ruta.nombre} (R${ruta.numeroRuta})`;
            
            const pqs = paquetes.filter(p => p.rutaAsignada === ruta.id);
            rTpl.querySelector('.ruta-totales').textContent = pqs.length;
            rTpl.querySelector('.ruta-tiendas').textContent = pqs.filter(p=>p.esTienda).length;
            rTpl.querySelector('.ruta-horarias').textContent = pqs.filter(p=>p.esHoraria).length;
            rTpl.querySelector('.ruta-bloques').textContent = pqs.filter(p=>p.esBloque).length;
            rTpl.querySelector('.ruta-cobros').textContent = pqs.filter(p=>p.esCobro).length;

            if (ruta.repartidorAsignado) {
                const rep = window.appData.repartidores.find(r => r.id === ruta.repartidorAsignado);
                if (rep) rTpl.querySelector('.ruta-repartidor').textContent = rep.nombre;
            } else {
                rTpl.querySelector('.ruta-repartidor').style.display = 'none';
            }

            rTpl.querySelector('.action-cargar-paquete').addEventListener('click', () => {
                window.Routes.navigate('crear-paquete', { rutaId: ruta.id });
            });

            rutasList.appendChild(rTpl);
        });

        tpl.querySelector('.action-crear-ruta').addEventListener('click', () => {
            window.Routes.navigate('crear-ruta');
        });

        // Últimos Paquetes
        const paqList = tpl.querySelector('#paquetes-list');
        paquetes.slice(-5).reverse().forEach(pkg => {
            paqList.appendChild(this.createPaqueteCard(pkg, true));
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderCrearRuta() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-crear-ruta');
        this.setupBackBtn(tpl);

        const selectRep = tpl.querySelector('#form-ruta-repartidor');
        window.appData.repartidores.forEach(r => {
            selectRep.add(new Option(r.nombre, r.id));
        });

        tpl.querySelector('.action-guardar-ruta').addEventListener('click', () => {
            const num = tpl.querySelector('#form-ruta-num').value;
            const nom = tpl.querySelector('#form-ruta-nombre').value;
            const rep = selectRep.value;
            
            if (!num || !nom) return alert("Completa número y nombre");
            
            window.State.addRuta({
                id: 'ruta-' + Date.now(),
                numeroRuta: parseInt(num),
                nombre: nom,
                color: '#1E3A8A', // generic color
                repartidorAsignado: rep || null
            });
            window.history.back();
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderCrearPaquete(rutaId) {
        this.navContainer.classList.add('hidden');
        const ruta = window.State.getRutas().find(r => r.id === rutaId);
        if (!ruta) return window.history.back();

        const tpl = this.cloneTpl('tpl-crear-paquete');
        this.setupBackBtn(tpl);
        tpl.querySelector('#form-paq-ruta-nombre').textContent = `En: ${ruta.nombre}`;

        const chkCobro = tpl.querySelector('#form-paq-cobro');
        const contImporte = tpl.querySelector('#container-importe');
        chkCobro.addEventListener('change', () => {
            contImporte.classList.toggle('hidden', !chkCobro.checked);
        });

        tpl.querySelector('.action-guardar-paquete').addEventListener('click', () => {
            const p = window.State.addPaquete({
                rutaAsignada: ruta.id,
                cliente: tpl.querySelector('#form-paq-cliente').value || 'Sin nombre',
                telefono: tpl.querySelector('#form-paq-tel').value || '',
                direccion: tpl.querySelector('#form-paq-dir').value || '',
                pisoPuerta: tpl.querySelector('#form-paq-piso').value || '',
                esHoraria: tpl.querySelector('#form-paq-horaria').checked,
                esTienda: tpl.querySelector('#form-paq-tienda').checked,
                esBloque: tpl.querySelector('#form-paq-bloque').checked,
                esCobro: chkCobro.checked,
                importeCobro: parseFloat(tpl.querySelector('#form-paq-importe').value) || 0,
            });
            window.Routes.navigate('escribir-codigo', { paqueteId: p.idPaquete });
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderEscribirCodigo(paqueteId) {
        this.navContainer.classList.add('hidden');
        const pkg = window.State.getPaquetes().find(p => p.idPaquete === paqueteId);
        if (!pkg) return window.history.back();

        const tpl = this.cloneTpl('tpl-escribir-codigo');
        tpl.querySelector('#display-codigo-fisico').textContent = pkg.codigoFisico;
        
        tpl.querySelector('.action-marcar-escrito').addEventListener('click', () => {
            window.State.updatePaquete(paqueteId, { codigoEscrito: true });
            window.Routes.navigate('inicio');
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    // Repartidor
    renderPanelRepartidor(repartidorId) {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-panel-repartidor');
        this.setupBackBtn(tpl);
        this.setupExitBtn(tpl);

        const rep = window.appData.repartidores.find(r => r.id === repartidorId);
        if (rep) tpl.querySelector('#ruta-title').textContent = `Ruta de ${rep.nombre}`;

        const rutasDelRepartidor = window.State.getRutas().filter(r => r.repartidorAsignado === repartidorId).map(r=>r.id);
        
        // Paquetes asignados directamente (legacy) o por estar en su ruta
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

        tpl.querySelector('.action-ver').addEventListener('click', () => {
            window.Routes.navigate('detalle-paquete', { id: pkg.idPaquete });
        });

        return card;
    },

    renderDetallePaquete(id) {
        this.navContainer.classList.add('hidden');
        const pkg = window.State.getPaquetes().find(p => p.idPaquete === id);
        if (!pkg) return window.history.back();

        const tpl = this.cloneTpl('tpl-detalle-paquete');
        this.setupBackBtn(tpl);

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

        // Actions
        tpl.querySelector('.action-llamar').addEventListener('click', () => {
            window.State.updatePaquete(pkg.idPaquete, { llamadas: pkg.llamadas + 1 });
            window.location.href = `tel:${pkg.telefono}`;
        });

        tpl.querySelector('.action-whatsapp').addEventListener('click', () => {
            const msg = encodeURIComponent(`Hola ${pkg.cliente}, soy el repartidor. Estoy intentando entregar un paquete en ${pkg.direccion}.`);
            window.open(`https://wa.me/34${pkg.telefono.replace(/\s+/g,'')}?text=${msg}`, '_blank');
        });

        tpl.querySelector('.action-maps').addEventListener('click', () => {
            const query = encodeURIComponent(fullDir);
            window.open(`https://maps.google.com/?q=${query}`, '_blank');
        });

        const notaInput = tpl.querySelector('#nota');
        notaInput.value = pkg.nota || '';

        const incPanel = tpl.querySelector('#incidencia-panel');
        const motivoSelect = tpl.querySelector('#motivo');

        tpl.querySelector('.action-entregado').addEventListener('click', () => {
            window.State.updatePaquete(pkg.idPaquete, { estado: 'entregado', nota: notaInput.value });
            window.history.back();
        });

        tpl.querySelector('.action-no-entregado').addEventListener('click', () => incPanel.classList.remove('hidden'));

        tpl.querySelector('.action-guardar-incidencia').addEventListener('click', () => {
            if (!motivoSelect.value) return alert("Selecciona un motivo");
            window.State.updatePaquete(pkg.idPaquete, { 
                estado: 'fallido', 
                nota: `${motivoSelect.value} - ${notaInput.value}`
            });
            window.history.back();
        });

        if (pkg.estado !== 'pendiente') {
            tpl.querySelector('#card-acciones').style.opacity = '0.5';
            tpl.querySelector('#card-acciones').style.pointerEvents = 'none';
        }

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderPlaceholder(title) {
        this.navContainer.classList.remove('hidden');
        this.updateNav(title.toLowerCase());
        const tpl = this.cloneTpl('tpl-view-placeholder');
        this.setupBackBtn(tpl);
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
