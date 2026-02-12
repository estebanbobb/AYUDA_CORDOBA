```javascript
// ============================================
// SOCORRO CÓRDOBA - API CLIENT
// Comunicación con Google Apps Script
// ============================================

const API = (function() {
    'use strict';

    /**
     * Realiza una petición GET al backend usando JSONP
     * (Google Apps Script requiere JSONP para leer respuestas cross-origin)
     */
    async function get(endpoint) {
        return new Promise((resolve, reject) => {
            try {
                // Crear nombre único para la función callback
                const callbackName = `jsonp_callback_${ Date.now() }_${ Math.random().toString(36).substr(2, 9) } `;

                // Crear la URL con el parámetro callback
                const url = `${ CONFIG.API_URL }?action = ${ endpoint }& callback=${ callbackName } `;

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
                    reject(new Error(`Error al cargar datos de ${ endpoint } `));
                };

                // Timeout de 30 segundos
                const timeout = setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        document.body.removeChild(script);
                        reject(new Error(`Timeout al cargar ${ endpoint } `));
                    }
                }, 30000);

                // Limpiar timeout cuando se resuelva
                // La función callback ya se encarga de limpiar el timeout
                const originalCallback = window[callbackName];
                window[callbackName] = function (data) {
                    clearTimeout(timeout);
                    originalCallback(data);
                };

                // Agregar el script al DOM
                document.body.appendChild(script);

            } catch (error) {
                console.error(`Error en GET ${ endpoint }: `, error);
                reject(error);
            }
        });
    }

    /**
     * Realiza una petición POST al backend
     */
    async function post(endpoint, data) {
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
            console.error(`Error en POST ${ endpoint }: `, error);
            throw error;
        }
    }

    /**
     * Obtiene todas las solicitudes de ayuda
     */
    function getSolicitudes() {
        return get('getSolicitudes');
    }

    /**
     * Obtiene todas las ofertas de ayuda
     */
    function getOfertas() {
        return get('getOfertas');
    }

    /**
     * Obtiene todos los albergues
     */
    function getAlbergues() {
        return get('getAlbergues');
    }

    /**
     * Crea una nueva solicitud de ayuda
     */
    function crearSolicitud(datos) {
        return post('crearSolicitud', datos);
    }

    /**
     * Crea una nueva oferta de ayuda
     */
    function crearOferta(datos) {
        return post('crearOferta', datos);
    }

    /**
     * Registra o actualiza un albergue
     */
    function gestionarAlbergue(datos) {
        return post('gestionarAlbergue', datos);
    }

    /**
     * Obtiene todos los datos (mapa)
     */
    async function getAllData() {
        // Ejecutar en paralelo para mejor rendimiento
        const [solicitudes, ofertas, albergues] = await Promise.all([
            getSolicitudes(),
            getOfertas(),
            getAlbergues()
        ]);

        return {
            solicitudes,
            ofertas,
            albergues
        };
    }

    // ============================================
    // MÉTODOS DE ADMINISTRACIÓN
    // ============================================

    /**
     * Obtiene estadísticas del sistema
     */
    function getEstadisticas() {
        return get('getEstadisticas');
    }

    /**
     * Obtiene solicitudes pendientes
     */
    function getSolicitudesPendientes() {
        return get('getSolicitudesPendientes');
    }

    /**
     * Obtiene ofertas pendientes
     */
    function getOfertasPendientes() {
        return get('getOfertasPendientes');
    }

    /**
     * Obtiene albergues pendientes
     */
    function getAlberguesPendientes() {
        return get('getAlberguesPendientes');
    }

    /**
     * Aprueba una solicitud
     */
    function aprobarSolicitud(id) {
        return post('aprobarSolicitud', { id: id });
    }

    /**
     * Rechaza una solicitud
     */
    function rechazarSolicitud(id) {
        return post('rechazarSolicitud', { id: id });
    }

    /**
     * Aprueba una oferta
     */
    function aprobarOferta(id) {
        return post('aprobarOferta', { id: id });
    }

    /**
     * Rechaza una oferta
     */
    function rechazarOferta(id) {
        return post('rechazarOferta', { id: id });
    }

    /**
     * Aprueba un albergue
     */
    function aprobarAlbergue(id) {
        return post('aprobarAlbergue', { id: id });
    }

    /**
     * Registra inventario de albergue
     */
    function registrarInventario(datos) {
        return post('registrarInventario', datos);
    }

    /**
     * Obtiene inventario de un albergue
     */
    async function getInventario(albergueId = null) {
        const endpoint = albergueId ? `getInventario & albergueId=${ albergueId } ` : 'getInventario';
        return await get(endpoint);
    }

    /**
     * Registra feedback del usuario
     */
    function registrarFeedback(datos) {
        return post('registrarFeedback', datos);
    }

    // API Pública
    return {
        get: get,
        post: post,
        getSolicitudes: getSolicitudes,
        getOfertas: getOfertas,
        getAlbergues: getAlbergues,
        crearSolicitud: crearSolicitud,
        crearOferta: crearOferta,
        gestionarAlbergue: gestionarAlbergue,
        getAllData: getAllData,
        getEstadisticas: getEstadisticas,
        getSolicitudesPendientes: getSolicitudesPendientes,
        getOfertasPendientes: getOfertasPendientes,
        getAlberguesPendientes: getAlberguesPendientes,
        aprobarSolicitud: aprobarSolicitud,
        rechazarSolicitud: rechazarSolicitud,
        aprobarOferta: aprobarOferta,
        rechazarOferta: rechazarOferta,
        aprobarAlbergue: aprobarAlbergue,
        registrarInventario: registrarInventario,
        getInventario: getInventario, // Added getInventario to the public interface
        registrarFeedback: registrarFeedback
    };
})();
```
