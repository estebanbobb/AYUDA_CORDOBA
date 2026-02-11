// ============================================
// SOCORRO CÓRDOBA - SOPORTE OFFLINE
// ============================================

const OfflineManager = {
    /**
     * Inicializa el gestor offline
     */
    init() {
        // Detectar cambios en la conexión
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Verificar estado inicial
        this.updateConnectionStatus();

        console.log('✅ Gestor offline inicializado');
    },

    /**
     * Actualiza el indicador de conexión
     */
    updateConnectionStatus() {
        const offlineBar = document.getElementById('offline-bar');

        if (!navigator.onLine) {
            if (offlineBar) offlineBar.classList.add('show');
        } else {
            if (offlineBar) offlineBar.classList.remove('show');
        }
    },

    /**
     * Maneja cuando vuelve la conexión
     */
    async handleOnline() {
        console.log('✅ Conexión restaurada');
        this.updateConnectionStatus();
        Utils.showToast('✅ Conexión restaurada. Sincronizando datos...', 'success');

        // Sincronizar datos pendientes
        await this.syncPendingData();
    },

    /**
     * Maneja cuando se pierde la conexión
     */
    handleOffline() {
        console.log('⚠️ Sin conexión');
        this.updateConnectionStatus();
        Utils.showToast(CONFIG.MESSAGES.ERROR.SIN_CONEXION, 'info');
    },

    /**
     * Obtiene datos del localStorage
     */
    getStorageData() {
        try {
            const data = localStorage.getItem(CONFIG.OFFLINE.STORAGE_KEY);
            return data ? JSON.parse(data) : { solicitudes: [], ofertas: [] };
        } catch (error) {
            console.error('Error leyendo localStorage:', error);
            return { solicitudes: [], ofertas: [] };
        }
    },

    /**
     * Guarda datos en localStorage
     */
    setStorageData(data) {
        try {
            localStorage.setItem(CONFIG.OFFLINE.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }
    },

    /**
     * Guarda una solicitud offline
     */
    saveSolicitud(solicitud) {
        const data = this.getStorageData();
        data.solicitudes.push(solicitud);

        // Limitar cantidad de items
        if (data.solicitudes.length > CONFIG.OFFLINE.MAX_ITEMS) {
            data.solicitudes = data.solicitudes.slice(-CONFIG.OFFLINE.MAX_ITEMS);
        }

        this.setStorageData(data);
        console.log('💾 Solicitud guardada offline:', solicitud.id);
    },

    /**
     * Guarda una oferta offline
     */
    saveOferta(oferta) {
        const data = this.getStorageData();
        data.ofertas.push(oferta);

        // Limitar cantidad de items
        if (data.ofertas.length > CONFIG.OFFLINE.MAX_ITEMS) {
            data.ofertas = data.ofertas.slice(-CONFIG.OFFLINE.MAX_ITEMS);
        }

        this.setStorageData(data);
        console.log('💾 Oferta guardada offline:', oferta.id);
    },

    /**
     * Sincroniza datos pendientes cuando vuelve la conexión
     */
    async syncPendingData() {
        const data = this.getStorageData();

        if (data.solicitudes.length === 0 && data.ofertas.length === 0) {
            console.log('✅ No hay datos pendientes para sincronizar');
            return;
        }

        Utils.showSpinner(true);

        try {
            // Sincronizar solicitudes
            for (const solicitud of data.solicitudes) {
                try {
                    await API.crearSolicitud(solicitud);
                    console.log('✅ Solicitud sincronizada:', solicitud.id);
                } catch (error) {
                    console.error('Error sincronizando solicitud:', error);
                }
            }

            // Sincronizar ofertas
            for (const oferta of data.ofertas) {
                try {
                    await API.crearOferta(oferta);
                    console.log('✅ Oferta sincronizada:', oferta.id);
                } catch (error) {
                    console.error('Error sincronizando oferta:', error);
                }
            }

            // Limpiar datos sincronizados
            this.setStorageData({ solicitudes: [], ofertas: [] });

            Utils.showToast('✅ Datos sincronizados correctamente', 'success');

            // Actualizar mapa
            if (MapManager.map) {
                await MapManager.refresh();
            }

        } catch (error) {
            console.error('Error en sincronización:', error);
            Utils.showToast('⚠️ Error al sincronizar algunos datos', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Limpia todos los datos offline
     */
    clearOfflineData() {
        this.setStorageData({ solicitudes: [], ofertas: [] });
        console.log('🗑️ Datos offline limpiados');
    },
};
