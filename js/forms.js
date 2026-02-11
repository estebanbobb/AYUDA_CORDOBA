// ============================================
// SOCORRO CÓRDOBA - GESTIÓN DE FORMULARIOS
// ============================================

const Forms = {
    /**
     * Inicializa los event listeners de los formularios
     */
    init() {
        // Formulario "Necesito Ayuda"
        const formNecesito = document.getElementById('form-necesito');
        if (formNecesito) {
            formNecesito.addEventListener('submit', (e) => this.handleNecesitoSubmit(e));
        }

        // Formulario "Tengo Ayuda"
        const formTengo = document.getElementById('form-tengo');
        if (formTengo) {
            formTengo.addEventListener('submit', (e) => this.handleTengoSubmit(e));
        }

        // Botones de geolocalización - Necesito Ayuda
        const btnUseGPS = document.getElementById('btn-use-gps');
        if (btnUseGPS) {
            btnUseGPS.addEventListener('click', () => this.handleGPSClick('necesito'));
        }

        const btnSelectMap = document.getElementById('btn-select-map');
        if (btnSelectMap) {
            btnSelectMap.addEventListener('click', () => this.handleMapSelectClick('necesito'));
        }

        // Botones de geolocalización - Tengo Ayuda
        const btnUseGPSTengo = document.getElementById('btn-use-gps-tengo');
        if (btnUseGPSTengo) {
            btnUseGPSTengo.addEventListener('click', () => this.handleGPSClick('tengo'));
        }

        const btnSelectMapTengo = document.getElementById('btn-select-map-tengo');
        if (btnSelectMapTengo) {
            btnSelectMapTengo.addEventListener('click', () => this.handleMapSelectClick('tengo'));
        }

        // Formulario de Albergue (Modal)
        const btnAddAlbergue = document.getElementById('btn-add-albergue');
        if (btnAddAlbergue) {
            btnAddAlbergue.addEventListener('click', () => this.showAlbergueModal());
        }

        const btnCloseModal = document.getElementById('btn-close-modal');
        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', () => this.hideAlbergueModal());
        }

        const btnCancelAlbergue = document.getElementById('btn-cancel-albergue');
        if (btnCancelAlbergue) {
            btnCancelAlbergue.addEventListener('click', () => this.hideAlbergueModal());
        }

        const formAlbergue = document.getElementById('form-albergue');
        if (formAlbergue) {
            formAlbergue.addEventListener('submit', (e) => this.handleAlbergueSubmit(e));
        }

        // Botones GPS y mapa para albergue
        const btnUseGPSAlbergue = document.getElementById('btn-use-gps-albergue');
        if (btnUseGPSAlbergue) {
            btnUseGPSAlbergue.addEventListener('click', () => this.handleGPSClick('albergue'));
        }

        const btnSelectMapAlbergue = document.getElementById('btn-select-map-albergue');
        if (btnSelectMapAlbergue) {
            btnSelectMapAlbergue.addEventListener('click', () => this.handleMapSelectClick('albergue'));
        }

        console.log('✅ Formularios inicializados');
    },

    /**
     * Muestra el modal de registro de albergue
     */
    showAlbergueModal() {
        const modal = document.getElementById('modal-albergue');
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    /**
     * Oculta el modal de registro de albergue
     */
    hideAlbergueModal() {
        const modal = document.getElementById('modal-albergue');
        if (modal) {
            modal.style.display = 'none';
            // Limpiar formulario
            const form = document.getElementById('form-albergue');
            if (form) {
                Utils.resetForm(form);
            }
        }
    },

    /**
     * Maneja el click en el botón de GPS
     */
    async handleGPSClick(formPrefix) {
        try {
            const coords = await Geolocation.getCurrentPosition();
            await Geolocation.updateFormWithLocation(formPrefix, coords);
        } catch (error) {
            console.error('Error obteniendo ubicación GPS:', error);
        }
    },

    /**
     * Maneja el click en el botón de seleccionar en mapa
     */
    handleMapSelectClick(formPrefix) {
        // Cambiar a la vista del mapa
        window.location.hash = 'mapa';

        Utils.showToast('📍 Haz click en el mapa para seleccionar tu ubicación', 'info');

        // Agregar listener temporal al mapa
        if (MapManager.map) {
            const onMapClick = async (e) => {
                const coords = {
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                };

                await Geolocation.updateFormWithLocation(formPrefix, coords);

                // Volver al formulario
                window.location.hash = formPrefix;

                // Remover listener
                MapManager.map.off('click', onMapClick);

                Utils.showToast('✅ Ubicación seleccionada', 'success');
            };

            MapManager.map.on('click', onMapClick);
        }
    },

    /**
     * Maneja el envío del formulario "Necesito Ayuda"
     */
    async handleNecesitoSubmit(e) {
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
                OfflineManager.saveSolicitud(formData);
                Utils.showToast(CONFIG.MESSAGES.ERROR.SIN_CONEXION, 'info');
            }

            // Limpiar formulario
            Utils.resetForm(form);

            // Actualizar mapa
            if (MapManager.map) {
                await MapManager.refresh();
            }

            // Cambiar a vista del mapa
            setTimeout(() => {
                window.location.hash = 'mapa';
            }, 2000);

        } catch (error) {
            console.error('Error enviando solicitud:', error);

            // Guardar offline como fallback
            OfflineManager.saveSolicitud(formData);
            Utils.showToast('⚠️ Error al enviar. Datos guardados localmente.', 'info');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Maneja el envío del formulario "Tengo Ayuda"
     */
    async handleTengoSubmit(e) {
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
                OfflineManager.saveOferta(formData);
                Utils.showToast(CONFIG.MESSAGES.ERROR.SIN_CONEXION, 'info');
            }

            // Limpiar formulario
            Utils.resetForm(form);

            // Actualizar mapa
            if (MapManager.map) {
                await MapManager.refresh();
            }

            // Cambiar a vista del mapa
            setTimeout(() => {
                window.location.hash = 'mapa';
            }, 2000);

        } catch (error) {
            console.error('Error enviando oferta:', error);

            // Guardar offline como fallback
            OfflineManager.saveOferta(formData);
            Utils.showToast('⚠️ Error al enviar. Datos guardados localmente.', 'info');
        } finally {
            Utils.showSpinner(false);
        }
    },

    /**
     * Maneja el envío del formulario de Albergue
     */
    async handleAlbergueSubmit(e) {
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
                OfflineManager.saveAlbergue(formData);
                Utils.showToast(CONFIG.MESSAGES.ERROR.SIN_CONEXION, 'info');
            }

            // Cerrar modal
            this.hideAlbergueModal();

            // Actualizar mapa
            if (MapManager.map) {
                await MapManager.refresh();
            }

            // Actualizar lista de albergues
            if (typeof App !== 'undefined' && App.loadAlbergues) {
                await App.loadAlbergues();
            }

        } catch (error) {
            console.error('Error registrando albergue:', error);

            // Guardar offline como fallback
            OfflineManager.saveAlbergue(formData);
            Utils.showToast('⚠️ Error al enviar. Datos guardados localmente.', 'info');
        } finally {
            Utils.showSpinner(false);
        }
    },
};
