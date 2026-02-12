// ============================================
// SOCORRO CÓRDOBA - AUTENTICACIÓN
// ============================================

const Auth = (function () {
    'use strict';

    // Constantes privadas
    const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin"
    const SESSION_KEY = 'socorro_admin_session';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

    /**
     * Genera un hash simple de una cadena
     */
    async function _simpleHash(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Verifica si la contraseña es correcta
     */
    async function _verificarPassword(password) {
        const hash = await _simpleHash(password);
        return hash === ADMIN_PASSWORD_HASH;
    }

    /**
     * Inicia sesión de administrador
     */
    async function login(password) {
        const isValid = await _verificarPassword(password);

        if (!isValid) {
            return { success: false, error: 'Contraseña incorrecta' };
        }

        // Guardar sesión
        const session = {
            authenticated: true,
            timestamp: Date.now(),
            expires: Date.now() + SESSION_DURATION
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true };
    }

    /**
     * Cierra sesión
     */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.hash = 'mapa';
    }

    /**
     * Verifica si hay una sesión activa
     */
    function isAuthenticated() {
        try {
            const sessionStr = localStorage.getItem(SESSION_KEY);

            if (!sessionStr) return false;

            const session = JSON.parse(sessionStr);

            // Verificar si la sesión expiró
            if (session.expires < Date.now()) {
                logout();
                return false;
            }

            return session.authenticated === true;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            return false;
        }
    }

    /**
     * Requiere autenticación (redirige si no está autenticado)
     */
    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.hash = 'admin';
            return false;
        }
        return true;
    }

    // API Pública
    return {
        login: login,
        logout: logout,
        isAuthenticated: isAuthenticated,
        requireAuth: requireAuth
    };
})();
