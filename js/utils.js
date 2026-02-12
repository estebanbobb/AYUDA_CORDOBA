// ============================================
// SOCORRO CÓRDOBA - UTILIDADES
// ============================================

const Utils = (function () {
    'use strict';

    /**
     * Muestra un toast notification
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    /**
     * Muestra/oculta el spinner de carga
     */
    function showSpinner(show = true) {
        const spinner = document.getElementById('spinner-overlay');
        if (spinner) {
            if (show) {
                spinner.classList.add('show');
            } else {
                spinner.classList.remove('show');
            }
        }
    }

    /**
     * Formatea coordenadas para mostrar
     */
    function formatCoords(lat, lng) {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    /**
     * Valida un formulario
     */
    function validateForm(formElement) {
        const inputs = formElement.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#E53E3E';
            } else {
                input.style.borderColor = '';
            }
        });

        return isValid;
    }

    /**
     * Obtiene los valores de un formulario
     */
    function getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};

        // Procesar checkboxes
        const checkboxes = formElement.querySelectorAll('input[type="checkbox"]:checked');
        const ayudaTypes = [];
        checkboxes.forEach(cb => {
            if (cb.name === 'ayuda') {
                ayudaTypes.push(cb.value);
            }
        });

        // Agregar tipos de ayuda
        if (ayudaTypes.length > 0) {
            data.tipoAyuda = ayudaTypes.join(', ');
        }

        // Procesar otros campos
        for (let [key, value] of formData.entries()) {
            if (key !== 'ayuda') {
                data[key] = value;
            }
        }

        // Agregar timestamp
        data.timestamp = new Date().toISOString();

        return data;
    }

    /**
     * Limpia un formulario
     */
    function resetForm(formElement) {
        formElement.reset();

        // Limpiar displays de ubicación
        const locationDisplays = formElement.querySelectorAll('.location-display');
        locationDisplays.forEach(display => {
            display.style.display = 'none';
        });

        // Limpiar campos hidden
        const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => {
            input.value = '';
        });
    }

    /**
     * Genera un ID único
     */
    function generateId() {
        return 'SC' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Calcula la distancia entre dos puntos (en km)
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = _deg2rad(lat2 - lat1);
        const dLon = _deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(_deg2rad(lat1)) * Math.cos(_deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    // Funciones privadas
    function _deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * Formatea una fecha
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;

        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Detecta si está en móvil
     */
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Abre WhatsApp con mensaje predefinido
     */
    function openWhatsApp(phone, message) {
        const cleanPhone = phone.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/57${cleanPhone}?text=${encodedMessage}`;
        window.open(url, '_blank');
    }

    // API Pública
    return {
        showToast: showToast,
        showSpinner: showSpinner,
        formatCoords: formatCoords,
        validateForm: validateForm,
        getFormData: getFormData,
        resetForm: resetForm,
        generateId: generateId,
        calculateDistance: calculateDistance,
        formatDate: formatDate,
        isMobile: isMobile,
        openWhatsApp: openWhatsApp
    };
})();
