// ============================================
// SOCORRO CÓRDOBA - PANEL DE ADMINISTRACIÓN
// ============================================

const Admin = {
    currentTab: 'solicitudes',

    /**
     * Inicializa el panel de administración
     */
    init() {
        this.setupLoginForm();
        this.setupAdminTabs();
        this.setupLogoutButton();

        console.log('✅ Panel de administración inicializado');
    },

    /**
     * Configura el formulario de login
     */
    setupLoginForm() {
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e);
            });
        }
    },

    /**
     * Maneja el login
     */
    async handleLogin(e) {
        const password = document.getElementById('admin-password').value;

        Utils.showSpinner(true);

        const result = await Auth.login(password);

        Utils.showSpinner(false);

        if (result.success) {
            Utils.showToast('✅ Sesión iniciada correctamente', 'success');
            this.showDashboard();
            await this.loadDashboardData();
        } else {
            Utils.showToast('❌ Contraseña incorrecta', 'error');
            document.getElementById('admin-password').value = '';
        }
    },

    /**
     * Muestra el dashboard
     */
    showDashboard() {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
    },

    /**
     * Muestra el login
     */
    showLogin() {
        document.getElementById('admin-login').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
    },

    /**
     * Configura las pestañas del admin
     */
    setupAdminTabs() {
        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    },

    /**
     * Cambia de pestaña
     */
    switchTab(tabName) {
        // Actualizar tabs activos
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Mostrar contenido correspondiente
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`admin-${tabName}`).classList.add('active');

        this.currentTab = tabName;

        // Cargar datos de la pestaña
        this.loadTabData(tabName);
    },

    /**
     * Carga datos del dashboard
     */
    async loadDashboardData() {
        try {
            const [solicitudesPendientes, ofertasPendientes, alberguesPendientes] = await Promise.all([
                API.getSolicitudesPendientes(),
                API.getOfertasPendientes(),
                API.getAlberguesPendientes(),
            ]);

            // Actualizar contadores
            document.getElementById('count-solicitudes').textContent = solicitudesPendientes.length;
            document.getElementById('count-ofertas').textContent = ofertasPendientes.length;
            document.getElementById('count-albergues').textContent = alberguesPendientes.length;

            // Cargar primera pestaña
            this.switchTab('solicitudes');

        } catch (error) {
            console.error('Error cargando dashboard:', error);
            Utils.showToast('❌ Error al cargar datos', 'error');
        }
    },

    /**
     * Carga datos de una pestaña específica
     */
    async loadTabData(tabName) {
        Utils.showSpinner(true);

        try {
            switch (tabName) {
                case 'solicitudes':
                    await this.loadSolicitudesPendientes();
                    break;
                case 'ofertas':
                    await this.loadOfertasPendientes();
                    break;
                case 'albergues':
                    await this.loadAlberguesPendientes();
                    break;
                case 'inventario':
                    await this.loadInventarioForm();
                    break;
            }
        } catch (error) {
            console.error(`Error cargando ${tabName}:`, error);
            Utils.showToast(`❌ Error al cargar ${tabName}`, 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Carga solicitudes pendientes
     */
    async loadSolicitudesPendientes() {
        const solicitudes = await API.getSolicitudesPendientes();
        const container = document.getElementById('solicitudes-pendientes-list');

        if (!solicitudes || solicitudes.length === 0) {
            container.innerHTML = '<p class="empty-state">✅ No hay solicitudes pendientes de aprobación</p>';
            return;
        }

        container.innerHTML = solicitudes.map(s => `
      <div class="pending-card">
        <div class="pending-header">
          <h4>🆘 ${s.nombre}</h4>
          <span class="pending-time">${Utils.formatDate(s.timestamp)}</span>
        </div>
        <div class="pending-body">
          <p><strong>📞 Teléfono:</strong> ${s.telefono}</p>
          <p><strong>📍 Ubicación:</strong> ${s.barrio || 'No especificado'} - ${s.direccion || ''}</p>
          <p><strong>🆘 Necesita:</strong> ${s.tipoAyuda}</p>
          <p><strong>👥 Personas:</strong> ${s.personas}</p>
          ${s.notas ? `<p><strong>📝 Notas:</strong> ${s.notas}</p>` : ''}
          <p><strong>📌 Coordenadas:</strong> ${s.lat}, ${s.lng}</p>
        </div>
        <div class="pending-actions">
          <button class="btn btn-success" onclick="Admin.aprobarSolicitud('${s.id}')">
            ✅ Aprobar
          </button>
          <button class="btn btn-danger" onclick="Admin.rechazarSolicitud('${s.id}')">
            ❌ Rechazar
          </button>
        </div>
      </div>
    `).join('');
    },

    /**
     * Carga ofertas pendientes
     */
    async loadOfertasPendientes() {
        const ofertas = await API.getOfertasPendientes();
        const container = document.getElementById('ofertas-pendientes-list');

        if (!ofertas || ofertas.length === 0) {
            container.innerHTML = '<p class="empty-state">✅ No hay ofertas pendientes de aprobación</p>';
            return;
        }

        container.innerHTML = ofertas.map(o => `
      <div class="pending-card">
        <div class="pending-header">
          <h4>💚 ${o.nombre}</h4>
          <span class="pending-time">${Utils.formatDate(o.timestamp)}</span>
        </div>
        <div class="pending-body">
          <p><strong>📞 Teléfono:</strong> ${o.telefono}</p>
          <p><strong>💚 Ofrece:</strong> ${o.tipoAyuda}</p>
          <p><strong>📦 Cantidad:</strong> ${o.cantidad || 'No especificado'}</p>
          <p><strong>📍 Ubicación:</strong> ${o.barrio || 'No especificado'}</p>
          ${o.lat && o.lng ? `<p><strong>📌 Coordenadas:</strong> ${o.lat}, ${o.lng}</p>` : ''}
        </div>
        <div class="pending-actions">
          <button class="btn btn-success" onclick="Admin.aprobarOferta('${o.id}')">
            ✅ Aprobar
          </button>
          <button class="btn btn-danger" onclick="Admin.rechazarOferta('${o.id}')">
            ❌ Rechazar
          </button>
        </div>
      </div>
    `).join('');
    },

    /**
     * Carga albergues pendientes
     */
    async loadAlberguesPendientes() {
        const albergues = await API.getAlberguesPendientes();
        const container = document.getElementById('albergues-pendientes-list');

        if (!albergues || albergues.length === 0) {
            container.innerHTML = '<p class="empty-state">✅ No hay albergues pendientes de aprobación</p>';
            return;
        }

        container.innerHTML = albergues.map(a => `
      <div class="pending-card">
        <div class="pending-header">
          <h4>🏠 ${a.nombre}</h4>
        </div>
        <div class="pending-body">
          <p><strong>📍 Dirección:</strong> ${a.direccion || 'No especificada'}</p>
          <p><strong>👥 Capacidad:</strong> ${a.capacidadTotal} personas</p>
          <p><strong>📞 Contacto:</strong> ${a.contacto || 'No especificado'}</p>
          ${a.recursos ? `<p><strong>📦 Recursos:</strong> ${a.recursos}</p>` : ''}
          ${a.lat && a.lng ? `<p><strong>📌 Coordenadas:</strong> ${a.lat}, ${a.lng}</p>` : ''}
        </div>
        <div class="pending-actions">
          <button class="btn btn-success" onclick="Admin.aprobarAlbergue('${a.id}')">
            ✅ Aprobar
          </button>
        </div>
      </div>
    `).join('');
    },

    /**
     * Carga formulario de inventario
     */
    async loadInventarioForm() {
        const albergues = await API.getAlbergues();
        const select = document.getElementById('inventario-albergue');

        if (!albergues || albergues.length === 0) {
            select.innerHTML = '<option value="">No hay albergues registrados</option>';
            return;
        }

        select.innerHTML = '<option value="">Selecciona un albergue</option>' +
            albergues.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
    },

    /**
     * Aprueba una solicitud
     */
    async aprobarSolicitud(id) {
        if (!confirm('¿Aprobar esta solicitud?')) return;

        Utils.showSpinner(true);

        try {
            await API.aprobarSolicitud(id);
            Utils.showToast('✅ Solicitud aprobada', 'success');
            await this.loadSolicitudesPendientes();
            await this.loadDashboardData();

            // Actualizar mapa
            if (MapManager.map) {
                await MapManager.refresh();
            }
        } catch (error) {
            console.error('Error aprobando solicitud:', error);
            Utils.showToast('❌ Error al aprobar', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Rechaza una solicitud
     */
    async rechazarSolicitud(id) {
        if (!confirm('¿Rechazar esta solicitud?')) return;

        Utils.showSpinner(true);

        try {
            await API.rechazarSolicitud(id);
            Utils.showToast('✅ Solicitud rechazada', 'success');
            await this.loadSolicitudesPendientes();
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error rechazando solicitud:', error);
            Utils.showToast('❌ Error al rechazar', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Aprueba una oferta
     */
    async aprobarOferta(id) {
        if (!confirm('¿Aprobar esta oferta?')) return;

        Utils.showSpinner(true);

        try {
            await API.aprobarOferta(id);
            Utils.showToast('✅ Oferta aprobada', 'success');
            await this.loadOfertasPendientes();
            await this.loadDashboardData();

            // Actualizar mapa
            if (MapManager.map) {
                await MapManager.refresh();
            }
        } catch (error) {
            console.error('Error aprobando oferta:', error);
            Utils.showToast('❌ Error al aprobar', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Rechaza una oferta
     */
    async rechazarOferta(id) {
        if (!confirm('¿Rechazar esta oferta?')) return;

        Utils.showSpinner(true);

        try {
            await API.rechazarOferta(id);
            Utils.showToast('✅ Oferta rechazada', 'success');
            await this.loadOfertasPendientes();
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error rechazando oferta:', error);
            Utils.showToast('❌ Error al rechazar', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Aprueba un albergue
     */
    async aprobarAlbergue(id) {
        if (!confirm('¿Aprobar este albergue?')) return;

        Utils.showSpinner(true);

        try {
            await API.aprobarAlbergue(id);
            Utils.showToast('✅ Albergue aprobado', 'success');
            await this.loadAlberguesPendientes();
            await this.loadDashboardData();

            // Actualizar mapa
            if (MapManager.map) {
                await MapManager.refresh();
            }
        } catch (error) {
            console.error('Error aprobando albergue:', error);
            Utils.showToast('❌ Error al aprobar', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Registra inventario
     */
    async registrarInventario(e) {
        e.preventDefault();

        const form = e.target;
        const data = {
            albergueId: form.querySelector('[name="albergue"]').value,
            albergueNombre: form.querySelector('[name="albergue"] option:checked').text,
            agua: parseInt(form.querySelector('[name="agua"]').value) || 0,
            comida: parseInt(form.querySelector('[name="comida"]').value) || 0,
            medicinas: form.querySelector('[name="medicinas"]').value,
            ropa: form.querySelector('[name="ropa"]').value,
            notas: form.querySelector('[name="notas"]').value,
            registradoPor: 'Admin'
        };

        if (!data.albergueId) {
            Utils.showToast('⚠️ Selecciona un albergue', 'error');
            return;
        }

        Utils.showSpinner(true);

        try {
            await API.registrarInventario(data);
            Utils.showToast('✅ Inventario registrado correctamente', 'success');
            form.reset();
        } catch (error) {
            console.error('Error registrando inventario:', error);
            Utils.showToast('❌ Error al registrar inventario', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Configura botón de logout
     */
    setupLogoutButton() {
        const btn = document.getElementById('btn-logout');
        if (btn) {
            btn.addEventListener('click', () => {
                if (confirm('¿Cerrar sesión?')) {
                    Auth.logout();
                }
            });
        }
    },
};
