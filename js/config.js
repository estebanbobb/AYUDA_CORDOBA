const CONFIG = (function () {
    'use strict';

    return {
        // API URL del Backend (Google Apps Script)
        API_URL: 'https://script.google.com/macros/s/AKfycbw101oSuVyaUGk6NWQvRSrizTEFAk7VjHNXHFwqPISThqUwYLNe5x4Htz6XNyAGHyPhTg/exec',

        // Configuración del Mapa
        MAP: {
            CENTER: [8.747984, -75.881428], // Montería, Córdoba
            ZOOM: 13,
            MIN_ZOOM: 11,
            MAX_ZOOM: 18,
            TILE_LAYER: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        },

        // Tipos de Ayuda
        HELP_TYPES: [
            'Comida',
            'Agua',
            'Ropa',
            'Medicinas',
            'Hospedaje',
            'Transporte',
            'Voluntariado',
            'Otro'
        ],

        // Estados de Solicitud/Oferta
        STATUS: {
            PENDING: 'pendiente',
            APPROVED: 'aprobada',
            REJECTED: 'rechazada',
            COMPLETED: 'completada'
        },

        // Configuración de Geolocalización
        GEOLOCATION: {
            TIMEOUT: 10000,
            MAX_AGE: 0,
            ENABLE_HIGH_ACCURACY: true
        },

        // Keys para LocalStorage
        STORAGE_KEYS: {
            PENDING_REQUESTS: 'socorro_pending_requests',
            USER_SESSION: 'socorro_user_session'
        },

        // Mensajes del Sistema
        MESSAGES: {
            ERROR: {
                GENERAL: 'Ha ocurrido un error. Por favor intenta de nuevo.',
                NETWORK: 'Error de conexión. Tus datos se guardarán localmente.',
                LOCATION: 'No se pudo obtener tu ubicación.',
                CAMPOS_REQUERIDOS: 'Por favor completa todos los campos requeridos.',
                SIN_CONEXION: 'Estás offline. La información se guardará y enviará cuando recuperes conexión.',
                UBICACION_NO_DISPONIBLE: 'No se pudo obtener tu ubicación. Por favor actívala o selecciona en el mapa.'
            },
            SUCCESS: {
                SOLICITUD_ENVIADA: 'Solicitud enviada correctamente. Espera nuestra confirmación.',
                OFERTA_ENVIADA: 'Gracias por tu oferta de ayuda. Nos pondremos en contacto.',
                DATOS_SINCRONIZADOS: 'Datos sincronizados correctamente.'
            }
        }
    };
})();
