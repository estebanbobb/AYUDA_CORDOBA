// ============================================
// SOCORRO CÓRDOBA - CONFIGURACIÓN
// ============================================

const CONFIG = {
    // Google Apps Script Web App URL
    // IMPORTANTE: Reemplaza esto con tu URL de Google Apps Script después de desplegarlo
    API_URL: 'https://script.google.com/macros/s/AKfycbw101oSuVyaUGk6NWQvRSrizTEFAk7VjHNXHFwqPISThqUwYLNe5x4Htz6XNyAGHyPhTg/exec',
    // Configuración del mapa
    MAP: {
        // Centro inicial: Montería, Córdoba, Colombia
        CENTER: [8.7479, -75.8814],
        ZOOM: 13,
        MIN_ZOOM: 10,
        MAX_ZOOM: 18,

        // Tiles de OpenStreetMap
        TILE_LAYER: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },

    // Categorías de ayuda
    HELP_TYPES: {
        agua: { label: '💧 Agua potable', icon: '💧', color: '#3182CE' },
        comida: { label: '🍲 Comida', icon: '🍲', color: '#38A169' },
        medicina: { label: '💊 Medicinas', icon: '💊', color: '#E53E3E' },
        ropa: { label: '👕 Ropa', icon: '👕', color: '#805AD5' },
        albergue: { label: '🏠 Albergue', icon: '🏠', color: '#DD6B20' },
        rescate: { label: '🚨 Rescate urgente', icon: '🚨', color: '#C53030' },
        transporte: { label: '🚗 Transporte', icon: '🚗', color: '#2C5282' },
        voluntario: { label: '🙋 Trabajo voluntario', icon: '🙋', color: '#2F855A' },
    },

    // Estados
    STATUS: {
        pendiente: { label: 'Pendiente', color: '#DD6B20' },
        en_proceso: { label: 'En proceso', color: '#3182CE' },
        atendido: { label: 'Atendido', color: '#38A169' },
        cancelado: { label: 'Cancelado', color: '#718096' },
    },

    // Configuración de geolocalización
    GEOLOCATION: {
        TIMEOUT: 10000, // 10 segundos
        MAX_AGE: 60000, // 1 minuto
        ENABLE_HIGH_ACCURACY: true,
    },

    // Configuración de offline
    OFFLINE: {
        STORAGE_KEY: 'socorro_cordoba_offline_data',
        MAX_ITEMS: 100,
    },

    // Mensajes
    MESSAGES: {
        SUCCESS: {
            SOLICITUD_ENVIADA: '✅ Tu solicitud de ayuda ha sido registrada. Los voluntarios serán notificados.',
            OFERTA_ENVIADA: '✅ Tu oferta de ayuda ha sido registrada. Te contactaremos pronto.',
            UBICACION_OBTENIDA: '✅ Ubicación obtenida correctamente.',
        },
        ERROR: {
            UBICACION_NO_DISPONIBLE: '❌ No se pudo obtener tu ubicación. Por favor, selecciona manualmente en el mapa.',
            UBICACION_DENEGADA: '❌ Permiso de ubicación denegado. Por favor, habilítalo en la configuración de tu navegador.',
            CAMPOS_REQUERIDOS: '❌ Por favor, completa todos los campos requeridos.',
            ERROR_ENVIO: '❌ Error al enviar los datos. Por favor, intenta de nuevo.',
            SIN_CONEXION: '⚠️ Sin conexión a internet. Los datos se guardarán localmente.',
        },
        INFO: {
            CARGANDO: 'Cargando...',
            OBTENIENDO_UBICACION: '📍 Obteniendo tu ubicación...',
            ENVIANDO_DATOS: '📤 Enviando datos...',
        },
    },
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
