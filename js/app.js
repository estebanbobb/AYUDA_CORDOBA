// ============================================
// SOCORRO CÓRDOBA - APLICACIÓN PRINCIPAL
// ============================================

var App = (function () {
    'use strict';

    // Estado privado
    let currentView = 'mapa';

    /**
     * Inicializa la aplicación
     */
    async function init() {
        console.log('🚀 Iniciando Socorro Córdoba...');

        // Inicializar módulos
        if (typeof MapManager !== 'undefined') MapManager.init();
        if (typeof Forms !== 'undefined') Forms.init();
        if (typeof Admin !== 'undefined') Admin.init();

        // Configurar navegación
        _setupNavigation();

        // Manejar rutas iniciales (hash)
        _handleRoute();

        // Escuchar cambios de hash
        window.addEventListener('hashchange', _handleRoute);

        // Cargar datos iniciales del mapa
        if (typeof MapManager !== 'undefined') {
            await MapManager.refresh();
        }

        // Cargar lista de albergues
        await loadAlbergues();

        // Ocultar spinner de carga inicial
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }

        console.log('✅ Aplicación inicializada');
    }

    /**
     * Configura la navegación (menú inferior) (Privado)
     */
    function _setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // El comportamiento por defecto del enlace cambiará el hash
                // y activará handleRoute, así que no necesitamos hacer mucho aquí
                const viewId = link.getAttribute('href').substring(1);
                _updateActiveLink(viewId);
            });
        });
    }

    /**
     * Actualiza el link activo en el menú (Privado)
     */
    function _updateActiveLink(viewId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + viewId) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Maneja el enrutamiento simple basado en hash (Privado)
     */
    function _handleRoute() {
        const hash = window.location.hash.substring(1) || 'mapa';
        _switchView(hash);
    }

    /**
     * Cambia la vista visible (Privado)
     */
    function _switchView(viewId) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });

        // Mostrar vista actual
        const currentViewEl = document.getElementById(viewId);
        if (currentViewEl) {
            currentViewEl.classList.add('active');
        } else {
            // Si la vista no existe, volver al mapa
            window.location.hash = 'mapa';
            return;
        }

        currentView = viewId;
        _updateActiveLink(viewId);

        // Acciones específicas por vista
        if (viewId === 'mapa') {
            if (typeof MapManager !== 'undefined') MapManager.invalidateSize();
        } else if (viewId === 'admin') {
            // Verificar autenticación
            if (typeof Auth !== 'undefined' && Auth.isAuthenticated()) {
                if (typeof Admin !== 'undefined') {
                    Admin.showDashboard();
                    Admin.loadDashboardData();
                }
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
