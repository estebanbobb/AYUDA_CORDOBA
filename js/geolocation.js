// ============================================
// SOCORRO CÓRDOBA - GEOLOCALIZACIÓN
// ============================================

const Geolocation = {
    currentPosition: null,
    watchId: null,

    /**
     * Obtiene la ubicación actual del usuario
     */
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) {
                reject(new Error('Geolocalización no disponible en este navegador'));
                return;
            }

            Utils.showSpinner(true);
            Utils.showToast(CONFIG.MESSAGES.INFO.OBTENIENDO_UBICACION, 'info');

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    Utils.showSpinner(false);

                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };

                    this.currentPosition = coords;
                    Utils.showToast(CONFIG.MESSAGES.SUCCESS.UBICACION_OBTENIDA, 'success');
                    resolve(coords);
                },
                (error) => {
                    Utils.showSpinner(false);

                    let errorMessage = CONFIG.MESSAGES.ERROR.UBICACION_NO_DISPONIBLE;

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = CONFIG.MESSAGES.ERROR.UBICACION_DENEGADA;
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = '❌ Información de ubicación no disponible.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = '❌ Tiempo de espera agotado al obtener ubicación.';
                            break;
                    }

                    Utils.showToast(errorMessage, 'error');
                    reject(error);
                },
                {
                    enableHighAccuracy: CONFIG.GEOLOCATION.ENABLE_HIGH_ACCURACY,
                    timeout: CONFIG.GEOLOCATION.TIMEOUT,
                    maximumAge: CONFIG.GEOLOCATION.MAX_AGE
                }
            );
        });
    },

    /**
     * Observa cambios en la ubicación
     */
    watchPosition(callback) {
        if (!('geolocation' in navigator)) {
            console.error('Geolocalización no disponible');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };

                this.currentPosition = coords;
                if (callback) callback(coords);
            },
            (error) => {
                console.error('Error watching position:', error);
            },
            {
                enableHighAccuracy: CONFIG.GEOLOCATION.ENABLE_HIGH_ACCURACY,
                timeout: CONFIG.GEOLOCATION.TIMEOUT,
                maximumAge: CONFIG.GEOLOCATION.MAX_AGE
            }
        );
    },

    /**
     * Detiene la observación de ubicación
     */
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    },

    /**
     * Reverse geocoding: obtiene dirección desde coordenadas
     * Usa Nominatim de OpenStreetMap (gratis)
     */
    async getAddressFromCoords(lat, lng) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Socorro Cordoba App'
                }
            });

            if (!response.ok) {
                throw new Error('Error en reverse geocoding');
            }

            const data = await response.json();

            // Extraer información relevante
            const address = data.address || {};
            const parts = [];

            if (address.road) parts.push(address.road);
            if (address.house_number) parts.push('#' + address.house_number);
            if (address.suburb) parts.push(address.suburb);
            if (address.city) parts.push(address.city);

            return {
                formatted: parts.join(', ') || data.display_name,
                barrio: address.suburb || address.neighbourhood || '',
                ciudad: address.city || address.town || 'Montería',
                raw: data
            };
        } catch (error) {
            console.error('Error en reverse geocoding:', error);
            return {
                formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                barrio: '',
                ciudad: 'Montería',
                raw: null
            };
        }
    },

    /**
     * Actualiza el formulario con la ubicación obtenida
     */
    async updateFormWithLocation(formPrefix, coords) {
        // Actualizar campos hidden
        document.getElementById(`${formPrefix}-lat`).value = coords.lat;
        document.getElementById(`${formPrefix}-lng`).value = coords.lng;

        // Determinar el sufijo correcto para el display
        let displaySuffix = '';
        if (formPrefix === 'tengo') {
            displaySuffix = '-tengo';
        } else if (formPrefix === 'albergue') {
            displaySuffix = '-albergue';
        }

        // Mostrar display de ubicación
        const display = document.getElementById(`location-display${displaySuffix}`);
        const textElement = document.getElementById(`location-text${displaySuffix}`);

        if (display && textElement) {
            display.style.display = 'block';
            textElement.textContent = Utils.formatCoords(coords.lat, coords.lng);

            // Intentar obtener dirección
            try {
                const address = await this.getAddressFromCoords(coords.lat, coords.lng);
                textElement.textContent = address.formatted;

                // Auto-llenar barrio si está vacío (solo para necesito y tengo)
                const barrioInput = document.getElementById(`${formPrefix}-barrio`);
                if (barrioInput && !barrioInput.value && address.barrio) {
                    barrioInput.value = address.barrio;
                }

                // Auto-llenar dirección para albergue si está vacío
                if (formPrefix === 'albergue') {
                    const direccionInput = document.getElementById(`${formPrefix}-direccion`);
                    if (direccionInput && !direccionInput.value && address.formatted) {
                        direccionInput.value = address.formatted;
                    }
                }
            } catch (error) {
                console.error('Error obteniendo dirección:', error);
            }
        }

        // Actualizar mapa si existe
        if (window.MapManager) {
            MapManager.setUserLocation(coords.lat, coords.lng);
        }
    },
};
