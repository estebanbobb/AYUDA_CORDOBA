// ============================================
// SOCORRO CÓRDOBA - AUTENTICACIÓN
// ============================================

const Auth = {
    // Hash simple de la contraseña (SHA-256 básico)
    // Contraseña por defecto: "admin2026"
    // Para cambiarla, genera un nuevo hash en: https://emn178.github.io/online-tools/sha256.html
    ADMIN_PASSWORD_HASH: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // "admin"

    SESSION_KEY: 'socorro_admin_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas

    /**
     * Genera un hash simple de una cadena
     */
    async simpleHash(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    /**
     * Verifica si la contraseña es correcta
     */
    async verificarPassword(password) {
        const hash = await this.simpleHash(password);
        return hash === this.ADMIN_PASSWORD_HASH;
    },

    /**
     * Inicia sesión de administrador
     */
    async login(password) {
        const isValid = await this.verificarPassword(password);

        if (!isValid) {
            return { success: false, error: 'Contraseña incorrecta' };
        }

        // Guardar sesión
        const session = {
            authenticated: true,
            timestamp: Date.now(),
            expires: Date.now() + this.SESSION_DURATION
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        return { success: true };
    },

    /**
     * Cierra sesión
     */
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.hash = 'mapa';
    },

    /**
     * Verifica si hay una sesión activa
     */
    isAuthenticated() {
        try {
            const sessionStr = localStorage.getItem(this.SESSION_KEY);

            if (!sessionStr) return false;

            const session = JSON.parse(sessionStr);

            // Verificar si la sesión expiró
            if (session.expires < Date.now()) {
                this.logout();
                return false;
            }

            return session.authenticated === true;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            return false;
        }
    },

    /**
     * Requiere autenticación (redirige si no está autenticado)
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.hash = 'admin';
            return false;
        }
        return true;
    },
};
