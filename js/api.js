// ============================================
// SOCORRO CÓRDOBA - API CLIENT
// Comunicación con Google Apps Script
// ============================================

const API = {
    /**
     * Realiza una petición GET al backend
     */
    async get(endpoint) {
        try {
            const url = `${CONFIG.API_URL}?action=${endpoint}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error en GET ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Realiza una petición POST al backend
     */
    async post(endpoint, data) {
        try {
            const url = CONFIG.API_URL;

            const payload = {
                action: endpoint,
                data: data
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                mode: 'no-cors', // Google Apps Script requiere esto
            });

            // Nota: con mode: 'no-cors', no podemos leer la respuesta
            // Asumimos que fue exitoso si no hubo error
            return { success: true };
        } catch (error) {
            console.error(`Error en POST ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene todas las solicitudes de ayuda
     */
    async getSolicitudes() {
        return await this.get('getSolicitudes');
    },

    /**
     * Obtiene todas las ofertas de ayuda
     */
    async getOfertas() {
        return await this.get('getOfertas');
    },

    /**
     * Obtiene todos los albergues
     */
    async getAlbergues() {
        return await this.get('getAlbergues');
    },

    /**
     * Obtiene todos los datos (solicitudes, ofertas, albergues)
     */
    async getAllData() {
        try {
            const [solicitudes, ofertas, albergues] = await Promise.all([
                this.getSolicitudes().catch(() => []),
                this.getOfertas().catch(() => []),
                this.getAlbergues().catch(() => []),
            ]);

            return {
                solicitudes,
                ofertas,
                albergues,
            };
        } catch (error) {
            console.error('Error obteniendo todos los datos:', error);
            return {
                solicitudes: [],
                ofertas: [],
                albergues: [],
            };
        }
    },

    /**
     * Crea una nueva solicitud de ayuda
     */
    async crearSolicitud(data) {
        return await this.post('crearSolicitud', data);
    },

    /**
     * Crea una nueva oferta de ayuda
     */
    async crearOferta(data) {
        return await this.post('crearOferta', data);
    },

    /**
     * Crea o actualiza un albergue
     */
    async gestionarAlbergue(data) {
        return await this.post('gestionarAlbergue', data);
    },

    /**
     * Obtiene estadísticas
     */
    async getEstadisticas() {
        return await this.get('getEstadisticas');
    },

    // ============================================
    // MÉTODOS DE ADMINISTRACIÓN
    // ============================================

    /**
     * Obtiene solicitudes pendientes de aprobación
     */
    async getSolicitudesPendientes() {
        return await this.get('getSolicitudesPendientes');
    },

    /**
     * Obtiene ofertas pendientes de aprobación
     */
    async getOfertasPendientes() {
        return await this.get('getOfertasPendientes');
    },

    /**
     * Obtiene albergues pendientes de aprobación
     */
    async getAlberguesPendientes() {
        return await this.get('getAlberguesPendientes');
    },

    /**
     * Aprueba una solicitud
     */
    async aprobarSolicitud(id) {
        return await this.post('aprobarSolicitud', { id });
    },

    /**
     * Rechaza una solicitud
     */
    async rechazarSolicitud(id) {
        return await this.post('rechazarSolicitud', { id });
    },

    /**
     * Aprueba una oferta
     */
    async aprobarOferta(id) {
        return await this.post('aprobarOferta', { id });
    },

    /**
     * Rechaza una oferta
     */
    async rechazarOferta(id) {
        return await this.post('rechazarOferta', { id });
    },

    /**
     * Aprueba un albergue
     */
    async aprobarAlbergue(id) {
        return await this.post('aprobarAlbergue', { id });
    },

    /**
     * Registra inventario de un albergue
     */
    async registrarInventario(data) {
        return await this.post('registrarInventario', data);
    },

    /**
     * Obtiene inventario de un albergue
     */
    async getInventario(albergueId = null) {
        const endpoint = albergueId ? `getInventario&albergueId=${albergueId}` : 'getInventario';
        return await this.get(endpoint);
    },
};
