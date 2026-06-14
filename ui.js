// ui.js - Funciones para renderizar la interfaz

const UI = {
    appContainer: document.getElementById('app'),
    navContainer: document.getElementById('bottom-nav'),

    // Helpers
    clearApp() { this.appContainer.innerHTML = ''; },
    cloneTpl(id) { return document.getElementById(id).content.cloneNode(true); },
    setupBackBtn(el) {
        const btn = el.querySelector('.btn-volver');
        if (btn) btn.addEventListener('click', () => window.history.back() || window.Routes.navigate('inicio'));
    },
    setupExitBtn(el) {
        const btn = el.querySelector('.btn-salir');
        if (btn) btn.addEventListener('click', () => { window.State.logout(); window.Routes.navigate('login'); });
    },

    // Views
    renderLogin() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-login');
        
        tpl.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const role = e.target.dataset.role;
                if (role === 'encargado') {
                    document.getElementById('encargado-login').classList.remove('hidden');
                } else {
                    window.State.login('repartidor');
                    window.Routes.navigate('inicio');
                }
            });
        });

        const passInput = tpl.querySelector('#password');
        tpl.querySelector('#btn-login-encargado').addEventListener('click', () => {
            if (passInput.value === '1234') {
                window.State.login('encargado');
                window.Routes.navigate('inicio');
            } else {
                alert('Contraseña incorrecta');
            }
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderSelectorRepartidor() {
        this.navContainer.classList.add('hidden');
        const tpl = this.cloneTpl('tpl-selector-repartidor');
        this.setupBackBtn(tpl);
        this.setupExitBtn(tpl);

        const list = tpl.querySelector('#repartidores-lista-botones');
        window.appData.repartidores.forEach(rep => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary btn-large';
            btn.textContent = rep.nombre;
            btn.addEventListener('click', () => {
                window.State.login('repartidor', rep.id);
                window.Routes.navigate('inicio');
            });
            list.appendChild(btn);
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderDashboardEncargado() {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-dashboard-encargado');
        this.setupExitBtn(tpl);

        const paquetes = window.State.getPaquetes();
        
        // Stats
        tpl.querySelector('#stat-horaria').textContent = paquetes.filter(p => p.etiquetas.includes('Horaria')).length;
        tpl.querySelector('#stat-tienda').textContent = paquetes.filter(p => p.etiquetas.includes('Tienda')).length;
        tpl.querySelector('#stat-bloque').textContent = paquetes.filter(p => p.etiquetas.includes('Bloque')).length;
        tpl.querySelector('#stat-cobro').textContent = paquetes.filter(p => p.etiquetas.includes('Cobro')).length;

        // Repartidores
        const repList = tpl.querySelector('#repartidores-list');
        window.appData.repartidores.forEach(rep => {
            const el = document.createElement('div');
            el.className = 'repartidor-chip';
            el.textContent = rep.nombre;
            repList.appendChild(el);
        });

        // Paquetes (List all)
        const paqList = tpl.querySelector('#paquetes-list');
        paquetes.forEach(pkg => {
            paqList.appendChild(this.createPaqueteCard(pkg, true));
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    renderPanelRepartidor(repartidorId) {
        this.navContainer.classList.remove('hidden');
        const tpl = this.cloneTpl('tpl-panel-repartidor');
        this.setupBackBtn(tpl);
        this.setupExitBtn(tpl);

        const rep = window.appData.repartidores.find(r => r.id === repartidorId);
        if (rep) tpl.querySelector('#ruta-title').textContent = `Ruta de ${rep.nombre}`;

        const paquetes = window.State.getPaquetes().filter(p => p.asignadoId === repartidorId);
        tpl.querySelector('#count-pendientes').textContent = paquetes.filter(p => p.estado === 'pendiente').length;

        const list = tpl.querySelector('#mis-paquetes-list');
        // Sort: Horaria > Tienda > Bloque > Cobro
        const priorityScore = (p) => {
            if (p.estado !== 'pendiente') return 100; // Move done to bottom
            if (p.etiquetas.includes('Horaria')) return 1;
            if (p.etiquetas.includes('Tienda')) return 2;
            if (p.etiquetas.includes('Bloque')) return 3;
            if (p.etiquetas.includes('Cobro')) return 4;
            return 5;
        };
        
        const sorted = [...paquetes].sort((a,b) => priorityScore(a) - priorityScore(b));

        sorted.forEach((pkg, index) => {
            list.appendChild(this.createPaqueteCard(pkg, false, index + 1));
        });

        this.clearApp();
        this.appContainer.appendChild(tpl);
    },

    createPaqueteCard(pkg, showAsignado = false, orderNum = null) {
        const tpl = this.cloneTpl('tpl-paquete-card');
        const card = tpl.querySelector('.paquete-card');
        card.classList.add(`status-${pkg.estado}`);

        let idText = pkg.id;
        if (orderNum) idText = `#${orderNum} - ${idText}`;
        tpl.querySelector('.paquete-id').textContent = idText;
        
        tpl.querySelector('.paquete-cliente').textContent = pkg.cliente;
        tpl.querySelector('.paquete-dir').textContent = pkg.direccion;
        tpl.querySelector('.paquete-tel').textContent = pkg.telefono;

        if (showAsignado) {
            const rep = window.appData.repartidores.find(r => r.id === pkg.asignadoId);
            const asigNode = tpl.querySelector('.paquete-asignado');
            asigNode.textContent = rep ? rep.nombre : 'Sin asignar';
            asigNode.classList.remove('hidden');
            asigNode.classList.add('badge-asignado');
        }

        const tagsContainer = tpl.querySelector('.paquete-etiquetas');
        pkg.etiquetas.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = `badge badge-${tag.toLowerCase()}`;
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });

        // Status badge if not pending
        if (pkg.estado !== 'pendiente') {
            const stEl = document.createElement('span');
            stEl.className = `badge`;
            stEl.style.backgroundColor = pkg.estado === 'entregado' ? 'var(--color-success)' : 'var(--color-danger)';
            stEl.style.color = 'white';
            stEl.textContent = pkg.estado.toUpperCase();
            tagsContainer.appendChild(stEl);
        }

        tpl.querySelector('.action-ver').addEventListener('click', () => {
            window.Routes.navigate('detalle-paquete', { id: pkg.id });
        });

        return card;
    },

    renderDetallePaquete(id) {
        this.navContainer.classList.add('hidden');
        const pkg = window.State.getPaquetes().find(p => p.id === id);
        if (!pkg) {
            window.history.back();
            return;
        }

        const tpl = this.cloneTpl('tpl-detalle-paquete');
        this.setupBackBtn(tpl);

        tpl.querySelector('.det-id').textContent = pkg.id;
        tpl.querySelector('.det-cliente').textContent = pkg.cliente;
        tpl.querySelector('.det-tel').textContent = pkg.telefono;
        tpl.querySelector('.det-dir').textContent = pkg.direccion;

        const pagoEl = tpl.querySelector('.det-pago');
        if (pkg.cobro) {
            pagoEl.textContent = `A COBRAR: ${pkg.importe} €`;
            pagoEl.classList.add('con-cobro');
        } else {
            pagoEl.textContent = 'PAQUETE SIN COBRO';
            pagoEl.classList.add('sin-cobro');
        }

        const tagsContainer = tpl.querySelector('.det-etiquetas');
        pkg.etiquetas.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = `badge badge-${tag.toLowerCase()}`;
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });

        tpl.querySelector('.det-llamadas').textContent = `(${pkg.llamadas})`;

        // Actions
        tpl.querySelector('.action-llamar').addEventListener('click', () => {
            pkg.llamadas++;
            window.State.updatePaquete(pkg.id, { llamadas: pkg.llamadas });
            window.location.href = `tel:${pkg.telefono}`;
            // Re-render
            window.Routes.renderCurrent();
        });

        tpl.querySelector('.action-whatsapp').addEventListener('click', () => {
            const msg = encodeURIComponent(`Hola ${pkg.cliente}, soy el repartidor de RB Logistics. Estoy intentando entregar un paquete en ${pkg.direccion}.`);
            window.open(`https://wa.me/34${pkg.telefono.replace(/\s+/g,'')}?text=${msg}`, '_blank');
        });

        tpl.querySelector('.action-maps').addEventListener('click', () => {
            const query = encodeURIComponent(pkg.direccion);
            window.open(`https://maps.google.com/?q=${query}`, '_blank');
        });

        const notaInput = tpl.querySelector('#nota');
        notaInput.value = pkg.nota || '';

        // Status actions
        const incPanel = tpl.querySelector('#incidencia-panel');
        const motivoSelect = tpl.querySelector('#motivo');

        tpl.querySelector('.action-entregado').addEventListener('click', () => {
            window.State.updatePaquete(pkg.id, { estado: 'entregado', nota: notaInput.value });
            window.history.back();
        });

        tpl.querySelector('.action-no-entregado').addEventListener('click', () => {
            incPanel.classList.remove('hidden');
        });

        tpl.querySelector('.action-guardar-incidencia').addEventListener('click', () => {
            if (!motivoSelect.value) { alert("Selecciona un motivo"); return; }
            window.State.updatePaquete(pkg.id, { 
                estado: 'fallido', 
                nota: `${motivoSelect.value} - ${notaInput.value}`
            });
            window.history.back();
        });

        // Hide action card if already processed
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
            if (btn.dataset.target === activeTarget) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
};

window.UI = UI;
