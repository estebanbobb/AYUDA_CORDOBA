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
    ENVIANDO_DATOS: '📤 Enviando datos...',
},
    },
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
