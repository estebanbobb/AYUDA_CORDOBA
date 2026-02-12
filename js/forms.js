// ============================================
// SOCORRO CÓRDOBA - GESTIÓN DE FORMULARIOS
// ============================================

const Forms = (function () {
    'use strict';

    /**
     * Inicializa los event listeners de los formularios
     */
    function init() {
        // Formulario "Necesito Ayuda"
        const formNecesito = document.getElementById('form-necesito');
        if (formNecesito) {
            formNecesito.addEventListener('submit', (e) => _handleNecesitoSubmit(e));
        }

        // Formulario "Tengo Ayuda"
        const formTengo = document.getElementById('form-tengo');
        if (formTengo) {
            formTengo.addEventListener('submit', (e) => _handleTengoSubmit(e));
        }

        // Botones de geolocalización - Necesito Ayuda
        const btnUseGPS = document.getElementById('btn-use-gps');
        if (btnUseGPS) {
            btnUseGPS.addEventListener('click', () => _handleGPSClick('necesito'));
        }

        const btnSelectMap = document.getElementById('btn-select-map');
        if (btnSelectMap) {
            btnSelectMap.addEventListener('click', () => _handleMapSelectClick('necesito'));
        }

        // Botones de geolocalización - Tengo Ayuda
        const btnUseGPSTengo = document.getElementById('btn-use-gps-tengo');
        if (btnUseGPSTengo) {
            btnUseGPSTengo.addEventListener('click', () => _handleGPSClick('tengo'));
        }

        const btnSelectMapTengo = document.getElementById('btn-select-map-tengo');
        if (btnSelectMapTengo) {
            btnSelectMapTengo.addEventListener('click', () => _handleMapSelectClick('tengo'));
        }

        // Formulario de Albergue (Modal)
        const btnAddAlbergue = document.getElementById('btn-add-albergue');
        if (btnAddAlbergue) {
            btnAddAlbergue.addEventListener('click', () => showAlbergueModal());
        }

        const btnCloseModal = document.getElementById('btn-close-modal');
        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', () => hideAlbergueModal());
        }

        const btnCancelAlbergue = document.getElementById('btn-cancel-albergue');
        if (btnCancelAlbergue) {
            btnCancelAlbergue.addEventListener('click', () => hideAlbergueModal());
        }

        const formAlbergue = document.getElementById('form-albergue');
        if (formAlbergue) {
            formAlbergue.addEventListener('submit', (e) => _handleAlbergueSubmit(e));
        }

        // Botones GPS y mapa para albergue
        const btnUseGPSAlbergue = document.getElementById('btn-use-gps-albergue');
        if (btnUseGPSAlbergue) {
            btnUseGPSAlbergue.addEventListener('click', () => _handleGPSClick('albergue'));
        }

        const btnSelectMapAlbergue = document.getElementById('btn-select-map-albergue');
        if (btnSelectMapAlbergue) {
            btnSelectMapAlbergue.addEventListener('click', () => _handleMapSelectClick('albergue'));
        }

        console.log('✅ Formularios inicializados');
    }

    /**
     * Muestra el modal de registro de albergue
     */
    function showAlbergueModal() {
        const modal = document.getElementById('modal-albergue');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Oculta el modal de registro de albergue
     */
    function hideAlbergueModal() {
        const modal = document.getElementById('modal-albergue');
        if (modal) {
            modal.style.display = 'none';
            // Limpiar formulario
            const form = document.getElementById('form-albergue');
            if (form) {
                Utils.resetForm(form);
            }
        }
    }

    /**
     * Maneja el click en el botón de GPS (Privado)
     */
    async function _handleGPSClick(formPrefix) {
        try {
            // Nota: Geolocation no ha sido refactorizado aún, asumo que está global o en otro archivo
            // Si Geolocation no existe, esto fallará. Debería verificar si existe.
            // Asumiré que existe por ahora, o usaré una implementación simple si falla.
            if (typeof Geolocation !== 'undefined') {
                const coords = await Geolocation.getCurrentPosition();
                await Geolocation.updateFormWithLocation(formPrefix, coords);
            } else {
                console.error('Geolocation module not found');
                Utils.showToast('Error: Módulo de geolocalización no encontrado', 'error');
            }
        } catch (error) {
            console.error('Error obteniendo ubicación GPS:', error);
            Utils.showToast(CONFIG.MESSAGES.ERROR.UBICACION_NO_DISPONIBLE, 'error');
        }
    }

    /**
     * Maneja el click en el botón de seleccionar en mapa (Privado)
     */
    function _handleMapSelectClick(formPrefix) {
        // Cambiar a la vista del mapa
        window.location.hash = 'mapa';

        Utils.showToast('📍 Haz click en el mapa para seleccionar tu ubicación', 'info');

        // Agregar listener temporal al mapa usando el proxy 'on'
        // Necesitamos una función que podamos referenciar para usar 'off'
        const onMapClick = async (e) => {
            const coords = {
                lat: e.latlng.lat,
                lng: e.latlng.lng
            };

            if (typeof Geolocation !== 'undefined') {
                await Geolocation.updateFormWithLocation(formPrefix, coords);
            }

            // Volver al formulario
            window.location.hash = formPrefix;

            // Remover listener usando el proxy 'off'
            MapManager.off('click', onMapClick);

            Utils.showToast('✅ Ubicación seleccionada', 'success');
        };

        MapManager.on('click', onMapClick);
    }

    /**
     * Maneja el envío del formulario "Necesito Ayuda" (Privado)
     */
    async function _handleNecesitoSubmit(e) {
        e.preventDefault();

        const form = e.target;

        // Validar formulario
        if (!Utils.validateForm(form)) {
            Utils.showToast(CONFIG.MESSAGES.ERROR.CAMPOS_REQUERIDOS, 'error');
            return;
        }

        // Validar que tenga ubicación
        const lat = document.getElementById('necesito-lat').value;
        const lng = document.getElementById('necesito-lng').value;

        if (!lat || !lng) {
            Utils.showToast('📍 Por favor, selecciona tu ubicación', 'error');
            return;
        }

        // Validar que tenga al menos un tipo de ayuda seleccionado
        const checkboxes = form.querySelectorAll('input[name="ayuda"]:checked');
        if (checkboxes.length === 0) {
            Utils.showToast('⚠️ Por favor, selecciona al menos un tipo de ayuda', 'error');
            return;
        }

        // Obtener datos del formulario
        const formData = Utils.getFormData(form);
        formData.id = Utils.generateId();
        formData.estado = 'pendiente';

        Utils.showSpinner(true);

        try {
            // Intentar enviar a la API
            if (navigator.onLine) {
                await API.crearSolicitud(formData);
                Utils.showToast(CONFIG.MESSAGES.SUCCESS.SOLICITUD_ENVIADA, 'success');
            } else {
                // Guardar offline
                if (typeof OfflineManager !== 'undefined') {
                    OfflineManager.saveSolicitud(formData);
                    Utils.showToast(CONFIG.MESSAGES.ERROR.SIN_CONEXION, 'info');
                } else {
                    console.warn('OfflineManager no disponible');
                }
            }

            // Limpiar formulario
            Utils.resetForm(form);

            // Actualizar mapa
            await MapManager.refresh();

            // Cambiar a vista del mapa
            setTimeout(() => {
                window.location.hash = 'mapa';
            }, 2000);

        } catch (error) {
            console.error('Error enviando solicitud:', error);

            // Guardar offline como fallback
            if (typeof OfflineManager !== 'undefined') {
                OfflineManager.saveSolicitud(formData);
                Utils.showToast('⚠️ Error al enviar. Datos guardados localmente.', 'info');
            }
        } finally {
            Utils.showSpinner(false);
        }
    }

    /**
     * Maneja el envío del formulario "Tengo Ayuda" (Privado)
     */
    async function _handleTengoSubmit(e) {
        e.preventDefault();

        const form = e.target;

        // Validar formulario
        if (!Utils.validateForm(form)) {
            Utils.showToast(CONFIG.MESSAGES.ERROR.CAMPOS_REQUERIDOS, 'error');
            return;
        }

        // Validar que tenga al menos un tipo de ayuda seleccionado
        const checkboxes = form.querySelectorAll('input[name="ayuda"]:checked');
        if (checkboxes.length === 0) {
            Utils.showToast('⚠️ Por favor, selecciona al menos un tipo de ayuda', 'error');
            return;
        }

        // Obtener datos del formulario
        const formData = Utils.getFormData(form);
        formData.id = Utils.generateId();
        formData.estado = 'activo';

        Utils.showSpinner(true);

        try {
            // Intentar enviar a la API
            if (navigator.onLine) {
                await API.crearOferta(formData);
                Utils.showToast(CONFIG.MESSAGES.SUCCESS.OFERTA_ENVIADA, 'success');
            } else {
                // Guardar offline
                if (typeof OfflineManager !== 'undefined') {
                    OfflineManager.saveOferta(formData);
                    Utils.showToast(CONFIG.MESSAGES.ERROR.SIN_CONEXION, 'info');
                }
            }

            // Limpiar formulario
            Utils.resetForm(form);

            // Actualizar mapa
            await MapManager.refresh();

            // Cambiar a vista del mapa
            setTimeout(() => {
                window.location.hash = 'mapa';
            }, 2000);

        } catch (error) {
            console.error('Error enviando oferta:', error);

            // Guardar offline como fallback
            if (typeof OfflineManager !== 'undefined') {
                OfflineManager.saveOferta(formData);
                Utils.showToast('⚠️ Error al enviar. Datos guardados localmente.', 'info');
            }
        } finally {
            Utils.showSpinner(false);
        }
    }

    /**
     * Maneja el envío del formulario de Albergue (Privado)
     */
    async function _handleAlbergueSubmit(e) {
        e.preventDefault();

        const form = e.target;

        // Validar formulario
        if (!Utils.validateForm(form)) {
            Utils.showToast(CONFIG.MESSAGES.ERROR.CAMPOS_REQUERIDOS, 'error');
            return;
        }

        // Validar que tenga ubicación
        const lat = document.getElementById('albergue-lat').value;
        const lng = document.getElementById('albergue-lng').value;

        if (!lat || !lng) {
            Utils.showToast('📍 Por favor, selecciona la ubicación del albergue', 'error');
            return;
        }

        // Obtener datos del formulario
        const formData = Utils.getFormData(form);
        formData.id = Utils.generateId();
        formData.estado = 'pendiente_aprobacion';

        Utils.showSpinner(true);

        try {
            // Intentar enviar a la API
            if (navigator.onLine) {
                await API.gestionarAlbergue(formData);
                Utils.showToast('✅ Albergue registrado. Esperando aprobación del administrador.', 'success');
            } else {
                // Guardar offline
                if (typeof OfflineManager !== 'undefined') {
                    OfflineManager.saveAlbergue(formData);
                    Utils.showToast(CONFIG.MESSAGES.ERROR.SIN_CONEXION, 'info');
                }
            }

            // Cerrar modal
            hideAlbergueModal();

            // Actualizar mapa
            await MapManager.refresh();

            // Actualizar lista de albergues
            if (typeof App !== 'undefined' && App.loadAlbergues) {
                await App.loadAlbergues();
            }

        } catch (error) {
            console.error('Error registrando albergue:', error);

            // Guardar offline como fallback
            if (typeof OfflineManager !== 'undefined') {
                OfflineManager.saveAlbergue(formData);
                Utils.showToast('⚠️ Error al enviar. Datos guardados localmente.', 'info');
            }
        } finally {
            Utils.showSpinner(false);
        }
    }

    // API Pública
    return {
        init: init,
        showAlbergueModal: showAlbergueModal,
        hideAlbergueModal: hideAlbergueModal
    };
})();
