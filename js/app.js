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

        // Escuchar cambios de hash (bindeado para asegurar contexto, aunque en IIFE no es tan crítico si usamos funciones directas)
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
                // El link cambiará el hash, lo que disparará hashchange -> _handleRoute
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
    async function _switchView(viewId) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });

        // Mostrar vista actual
        const currentViewEl = document.getElementById('view-' + viewId);
        if (currentViewEl) {
            currentViewEl.classList.add('active');
        } else {
            // Si la vista no existe, volver al mapa
            if (viewId !== 'mapa') {
                window.location.hash = 'mapa';
            }
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
            } else {
                if (typeof Admin !== 'undefined') Admin.showLogin();
            }
        } else if (viewId === 'donaciones' || viewId === 'albergues') {
            // Si hay lógica específica para carga perezosa (lazy load) de estas vistas
            if (viewId === 'albergues') {
                await loadAlbergues();
            }
        }
    }

    /**
     * Carga y muestra la lista de albergues
     */
    async function loadAlbergues() {
        const container = document.getElementById('albergues-list');
        if (!container) return;

        try {
            // Intentar cargar albergues
            // Nota: API.getAlbergues() debe existir y devolver una promesa
            let albergues = [];
            if (typeof API !== 'undefined') {
                albergues = await API.getAlbergues();
            }

            if (!albergues || albergues.length === 0) {
                container.innerHTML = '<p class="empty-state">No hay albergues registrados por el momento.</p>';
                return;
            }

            container.innerHTML = albergues.map(a => {
                const capacidad = a.capacidadTotal || 0;
                const ocupacion = a.ocupacionActual || 0;
                const porcentaje = capacidad > 0 ? Math.round((ocupacion / capacidad) * 100) : 0;
                let estadoClass = 'battery-high';
                if (porcentaje > 80) estadoClass = 'battery-low';
                else if (porcentaje > 50) estadoClass = 'battery-medium';

                return `
          <div class="card albergue-card" onclick="App.showAlbergueOnMap(${a.lat}, ${a.lng})">
            <div class="card-header">
              <h3>🏠 ${a.nombre}</h3>
            </div>
            <div class="card-body">
              <p><strong>📍 Dirección:</strong> ${a.direccion || 'No especificada'}</p>
              
              <div class="capacity-bar">
                <div class="capacity-fill ${estadoClass}" style="width: ${porcentaje}%"></div>
              </div>
              <p class="capacity-text">Ocupación: ${ocupacion}/${capacidad} (${porcentaje}%)</p>
              
              <p><strong>📞 Contacto:</strong> ${a.contacto || 'No especificado'}</p>
              ${a.recursos ? `<p><strong>📦 Recursos:</strong> ${a.recursos}</p>` : ''}
            </div>
          </div>
        `;
            }).join('');

        } catch (error) {
            console.error('Error cargando albergues:', error);
            container.innerHTML = '<p class="error-state">Error al cargar la lista de albergues.</p>';
        }
    }

    /**
     * Muestra un albergue en el mapa
     */
    function showAlbergueOnMap(lat, lng) {
        if (!lat || !lng) return;

        // Cambiar a vista mapa
        window.location.hash = 'mapa';

        // Esperar un poco a que el mapa se haga visible y redimensione
        setTimeout(() => {
            if (typeof MapManager !== 'undefined') {
                MapManager.setView([lat, lng], 18);
            }
        }, 100);
    }

    // API Pública
    return {
        init: init,
        loadAlbergues: loadAlbergues,
        showAlbergueOnMap: showAlbergueOnMap
    };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
