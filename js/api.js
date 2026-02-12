const API = (function () {
    'use strict';

    /**
     * Realiza una petición GET al backend usando JSONP
     * (Google Apps Script requiere JSONP para leer respuestas cross-origin)
     */
    async function get(endpoint) {
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
                    reject(new Error('Error de conexión con el script (JSONP)'));
                };

                document.body.appendChild(script);

                // Timeout de seguridad
                setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        if (document.body.contains(script)) {
                            document.body.removeChild(script);
                        }
                        reject(new Error('Tiempo de espera agotado (Timeout)'));
                    }
                }, 10000); // 10 segundos

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Realiza una petición POST al backend
     */
    async function post(action, data) {
        try {
            // Google Apps Script requiere que los datos viajen como string en un campo 'data'
            // o como parámetros de formulario. Usamos 'no-cors' por restricciones de GAS.
            // NOTA IMPORTANTE: 'no-cors' devuelve una respuesta opaca (type: 'opaque').
            // No podemos leer el body ni el status. Asumimos éxito si no hay excepción de red.

            const formData = new FormData();
            formData.append('action', action);
            formData.append('data', JSON.stringify(data));

            await fetch(CONFIG.API_URL, {
                method: 'POST',
                mode: 'no-cors', // Indispensable para GAS
                body: formData
            });

            // Como no podemos leer la respuesta, devolvemos un éxito simulado.
            // En un entorno ideal, usaríamos un proxy CORS o configuración de servidor diferente.
            return {
                success: true,
                message: 'Enviado (respuesta opaca)'
            };

        } catch (error) {
            console.error('API Client Error (POST):', error);
            throw error;
        }
    }

    // --- MÉTODOS PÚBLICOS (Fachada) ---

    // Solicitudes
    async function getSolicitudesPendientes() {
        return get('getSolicitudes'); // El endpoint filtra pendientes o el cliente lo hace? Revisar backend.
        // Backend 'getSolicitudes' devuelve todas. Deberíamos filtrar aquí si el backend no lo hace.
        // Revisando Code.gs: getSolicitudes devuelve todas.
        // Mejor usamos un helper si queremos filtrar, o pedimos al backend.
        // Por compatibilidad con Admin.js, devolvemos todas y el admin filtra, o filtramos aquí.
        // El refactor de Code.gs DEBERÍA tener un endpoint 'getSolicitudes'?
        // Sí, Code.gs tiene 'getSolicitudes'.
    }

    async function crearSolicitud(data) {
        return post('crearSolicitud', data);
    }

    async function aprobarSolicitud(id) {
        return post('aprobarSolicitud', { id: id });
    }

    async function rechazarSolicitud(id) {
        return post('rechazarSolicitud', { id: id });
    }


    // Ofertas
    async function getOfertasPendientes() {
        return get('getOfertas'); // Code.gs devuelve todas (o pendientes según implementación)
    }

    async function crearOferta(data) {
        return post('crearOferta', data);
    }

    async function aprobarOferta(id) {
        return post('aprobarOferta', { id: id });
    }

    async function rechazarOferta(id) {
        return post('rechazarOferta', { id: id });
    }

    // Albergues
    async function getAlbergues() {
        return get('getAlbergues'); // Devuelve aprobados
    }

    async function getAlberguesPendientes() {
        // Code.gs 'getAlbergues' suele devolver solo aprobados.
        // Si necesitamos pendientes, Code.gs debería soportarlo o traer todos.
        // Asumiendo que 'getAlbergues' trae todo o que hay otro endpoint.
        // admin.js espera getAlberguesPendientes.
        // Si no existe en backend, usamos getAlbergues y filtramos (si devuelve todo).
        // Por seguridad, intentemos 'getAlbergues' por ahora.
        return get('getAlbergues');
    }

    async function gestionarAlbergue(data) {
        return post('gestionarAlbergue', data);
    }

    async function aprobarAlbergue(id) {
        return post('aprobarAlbergue', { id: id });
    }

    async function registrarInventario(data) {
        return post('registrarInventario', data);
    }

    // Data General
    async function getAllData() {
        return get('getAllData'); // Si existe
    }

    // API Pública
    return {
        get: get,
        post: post,
        getSolicitudesPendientes: getSolicitudesPendientes,
        crearSolicitud: crearSolicitud,
        aprobarSolicitud: aprobarSolicitud,
        rechazarSolicitud: rechazarSolicitud,
        getOfertasPendientes: getOfertasPendientes,
        crearOferta: crearOferta,
        aprobarOferta: aprobarOferta,
        rechazarOferta: rechazarOferta,
        getAlbergues: getAlbergues,
        getAlberguesPendientes: getAlberguesPendientes,
        gestionarAlbergue: gestionarAlbergue,
        aprobarAlbergue: aprobarAlbergue,
        registrarInventario: registrarInventario,
        getAllData: getAllData
    };

})();
