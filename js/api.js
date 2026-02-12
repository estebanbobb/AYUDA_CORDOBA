// ============================================
// SOCORRO CÓRDOBA - API CLIENT
// Comunicación con Google Apps Script
// ============================================

const API = {
    /**
     * Realiza una petición GET al backend usando JSONP
     * (Google Apps Script requiere JSONP para leer respuestas cross-origin)
     */
    async get(endpoint) {
        return new Promise((resolve, reject) => {
            try {
                // Crear nombre único para la función callback
                const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Crear la URL con el parámetro callback
                const url = `${CONFIG.API_URL}?action=${endpoint}&callback=${callbackName}`;

                // Definir la función callback global
                window[callbackName] = function (response) {
                    // Limpiar
                    delete window[callbackName];
                    document.body.removeChild(script);

                    // Manejar formato estandarizado (Socorro pattern)
                    if (response && response.success !== undefined) {
                        if (response.success) {
                            resolve(response.data); // Devolver solo los datos para compatibilidad
                        } else {
                            console.error('API Error:', response.error, response.code);
                            reject(new Error(response.error || 'Error desconocido del servidor'));
                        }
                    } else {
                        // Formato antiguo (directo)
                        resolve(response);
                    }
                };

                // Crear el script tag
                const script = document.createElement('script');
                script.src = url;
                script.async = true;

                // Manejar errores
                script.onerror = function () {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    reject(new Error(`Error al cargar datos de ${endpoint}`));
                };

                // Timeout de 30 segundos
                const timeout = setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        document.body.removeChild(script);
                        reject(new Error(`Timeout al cargar ${endpoint}`));
                    }
                }, 30000);

                // Limpiar timeout cuando se resuelva
                const originalCallback = window[callbackName];
                window[callbackName] = function (data) {
                    clearTimeout(timeout);
                    originalCallback(data);
                };

                // Agregar el script al DOM
                document.body.appendChild(script);

            } catch (error) {
                console.error(`Error en GET ${endpoint}:`, error);
                reject(error);
            }
        });
    },

    /**
     * Realiza una petición POST al backend
     * Usa application/x-www-form-urlencoded para mejor compatibilidad
     */
    async post(endpoint, data) {
        try {
            const url = CONFIG.API_URL;

            // Convertir datos a formato form-urlencoded
            const formData = new URLSearchParams();
            formData.append('action', endpoint);

            // Agregar cada campo de data como parámetro separado
            for (const [key, value] of Object.entries(data)) {
                formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                redirect: 'follow'
            });

            // Intentar leer la respuesta
            const text = await response.text();

            try {
                return JSON.parse(text);
            } catch {
                // Si no es JSON, asumir éxito
                return { success: true };
            }
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
