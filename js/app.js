// ============================================
// SOCORRO CÓRDOBA - APLICACIÓN PRINCIPAL
// ============================================

const App = {
    currentView: 'mapa',

    /**
     * Inicializa la aplicación
     */
    async init() {
        console.log('🚀 Iniciando Socorro Córdoba...');

        // Inicializar módulos
        this.initNavigation();
        this.initMapControls();
        this.initAlbergues();

        // Inicializar gestor offline
        OfflineManager.init();

        // Inicializar formularios
        Forms.init();

        // Inicializar panel admin
        Admin.init();

        // Inicializar mapa
        MapManager.init();

        // Cargar datos iniciales
        await this.loadInitialData();

        // Manejar hash inicial
        this.handleHashChange();

        console.log('✅ Socorro Córdoba iniciado correctamente');
    },

    /**
     * Inicializa la navegación entre vistas
     */
    initNavigation() {
        // Tabs
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const hash = tab.getAttribute('href').substring(1);
                window.location.hash = hash;
            });
        });

        // Hash change
        window.addEventListener('hashchange', () => this.handleHashChange());
    },

    /**
     * Maneja cambios en el hash (navegación)
     */
    handleHashChange() {
        const hash = window.location.hash.substring(1) || 'mapa';
        this.showView(hash);
    },

    /**
     * Muestra una vista específica
     */
    showView(viewName) {
        // Ocultar todas las vistas
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));

        // Mostrar vista seleccionada
        const targetView = document.getElementById(`view-${viewName}`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }

        // Actualizar tabs
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            const tabHash = tab.getAttribute('href').substring(1);
            if (tabHash === viewName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Manejar vista de admin
        if (viewName === 'admin') {
            if (Auth.isAuthenticated()) {
                Admin.showDashboard();
                Admin.loadDashboardData();
            } else {
                Admin.showLogin();
            }
        }

        // Si es la vista del mapa, invalidar tamaño (fix para Leaflet)
        if (viewName === 'mapa' && MapManager.map) {
            setTimeout(() => {
                MapManager.map.invalidateSize();
            }, 100);
        }
    },

    /**
     * Inicializa controles del mapa
     */
    initMapControls() {
        // Botón "Mi Ubicación"
        const btnMyLocation = document.getElementById('btn-my-location');
        if (btnMyLocation) {
            btnMyLocation.addEventListener('click', async () => {
                try {
                    const coords = await Geolocation.getCurrentPosition();
                    MapManager.setUserLocation(coords.lat, coords.lng);
                } catch (error) {
                    console.error('Error obteniendo ubicación:', error);
                }
            });
        }

        // Botón "Actualizar"
        const btnRefresh = document.getElementById('btn-refresh-map');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => {
                MapManager.refresh();
            });
        }

        // Botón de estadísticas
        const btnStats = document.getElementById('stats-button');
        if (btnStats) {
            btnStats.addEventListener('click', () => this.showStats());
        }
    },

    /**
     * Inicializa la sección de albergues
     */
    initAlbergues() {
        // El botón de agregar albergue ahora abre el modal (manejado en forms.js)

        // Formulario de inventario
        const formInventario = document.getElementById('form-inventario');
        if (formInventario) {
            formInventario.addEventListener('submit', (e) => Admin.registrarInventario(e));
        }
    },

    /**
     * Carga datos iniciales
     */
    async loadInitialData() {
        Utils.showSpinner(true);

        try {
            // Cargar datos del mapa
            await MapManager.refresh();

            // Cargar albergues
            await this.loadAlbergues();

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            Utils.showToast('⚠️ Error al cargar algunos datos', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Carga y muestra la lista de albergues
     */
    async loadAlbergues() {
        const container = document.getElementById('albergues-list');
        if (!container) return;

        try {
            const albergues = await API.getAlbergues();

            if (!albergues || albergues.length === 0) {
                container.innerHTML = '<div class="loading">No hay albergues registrados aún.</div>';
                return;
            }

            container.innerHTML = '';

            albergues.forEach(albergue => {
                const card = this.createAlbergueCard(albergue);
                container.appendChild(card);
            });

        } catch (error) {
            console.error('Error cargando albergues:', error);
            container.innerHTML = '<div class="loading">Error al cargar albergues.</div>';
        }
    },

    /**
     * Crea una tarjeta de albergue
     */
    createAlbergueCard(albergue) {
        const card = document.createElement('div');
        card.className = 'albergue-card';

        const capacidad = albergue.capacidadTotal || 0;
        const ocupacion = albergue.ocupacionActual || 0;
        const disponible = capacidad - ocupacion;
        const estado = disponible > 0 ? 'activo' : 'lleno';

        card.innerHTML = `
      <div class="albergue-header">
        <h3 class="albergue-name">🏠 ${albergue.nombre}</h3>
        <span class="albergue-status ${estado}">
          ${estado === 'activo' ? 'Disponible' : 'Lleno'}
        </span>
      </div>
      <div class="albergue-info">
        <p><strong>📍 Dirección:</strong> ${albergue.direccion || 'No especificada'}</p>
        <p><strong>👥 Capacidad:</strong> ${ocupacion}/${capacidad} (${disponible} espacios disponibles)</p>
        ${albergue.recursos ? `<p><strong>📦 Recursos:</strong> ${albergue.recursos}</p>` : ''}
        ${albergue.contacto ? `<p><strong>📞 Contacto:</strong> ${albergue.contacto}</p>` : ''}
      </div>
      ${albergue.lat && albergue.lng ? `
        <button class="btn btn-outline" onclick="App.showAlbergueOnMap(${albergue.lat}, ${albergue.lng})">
          🗺️ Ver en el mapa
        </button>
      ` : ''}
    `;

        return card;
    },

    /**
     * Muestra un albergue en el mapa
     */
    showAlbergueOnMap(lat, lng) {
        window.location.hash = 'mapa';

        setTimeout(() => {
            if (MapManager.map) {
                MapManager.map.setView([lat, lng], 16);
            }
        }, 200);
    },

    /**
     * Muestra estadísticas
     */
    async showStats() {
        try {
            const stats = await API.getEstadisticas();

            let message = '📊 ESTADÍSTICAS\n\n';
            message += `🆘 Solicitudes: ${stats.totalSolicitudes || 0}\n`;
            message += `💚 Ofertas: ${stats.totalOfertas || 0}\n`;
            message += `🏠 Albergues: ${stats.totalAlbergues || 0}\n`;
            message += `✅ Atendidos: ${stats.atendidos || 0}`;

            alert(message);
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            Utils.showToast('❌ Error al obtener estadísticas', 'error');
        }
    },
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registrado con scope:', registration.scope);
            })
            .catch((error) => {
                console.error('❌ Falló el registro del Service Worker:', error);
            });
    });
}
