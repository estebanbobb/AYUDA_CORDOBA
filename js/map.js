// ============================================
// SOCORRO CÓRDOBA - GESTIÓN DEL MAPA
// ============================================

const MapManager = {
    map: null,
    markers: {
        solicitudes: null,
        ofertas: null,
        albergues: null,
        userLocation: null,
    },
    markerClusters: {
        solicitudes: null,
        ofertas: null,
        albergues: null,
    },

    /**
     * Inicializa el mapa
     */
    init() {
        // Crear mapa centrado en Montería
        this.map = L.map('map').setView(CONFIG.MAP.CENTER, CONFIG.MAP.ZOOM);

        // Agregar capa de tiles
        L.tileLayer(CONFIG.MAP.TILE_LAYER, {
            attribution: CONFIG.MAP.TILE_ATTRIBUTION,
            minZoom: CONFIG.MAP.MIN_ZOOM,
            maxZoom: CONFIG.MAP.MAX_ZOOM,
        }).addTo(this.map);

        // Inicializar clusters
        this.markerClusters.solicitudes = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div class="marker-cluster marker-cluster-need">${cluster.getChildCount()}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });

        this.markerClusters.ofertas = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div class="marker-cluster marker-cluster-offer">${cluster.getChildCount()}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });

        this.markerClusters.albergues = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div class="marker-cluster marker-cluster-shelter">${cluster.getChildCount()}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });

        // Agregar clusters al mapa
        this.map.addLayer(this.markerClusters.solicitudes);
        this.map.addLayer(this.markerClusters.ofertas);
        this.map.addLayer(this.markerClusters.albergues);

        console.log('✅ Mapa inicializado');
    },

    /**
     * Crea un icono personalizado
     */
    createCustomIcon(emoji, color) {
        return L.divIcon({
            html: `<div style="background: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 3px solid white;">${emoji}</div>`,
            className: 'custom-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });
    },

    /**
     * Agrega marcadores de solicitudes de ayuda
     */
    addSolicitudes(solicitudes) {
        // Limpiar marcadores anteriores
        this.markerClusters.solicitudes.clearLayers();

        solicitudes.forEach(solicitud => {
            if (!solicitud.lat || !solicitud.lng) return;

            const icon = this.createCustomIcon('🆘', '#E53E3E');

            const marker = L.marker([solicitud.lat, solicitud.lng], { icon })
                .bindPopup(this.createSolicitudPopup(solicitud));

            this.markerClusters.solicitudes.addLayer(marker);
        });
    },

    /**
     * Agrega marcadores de ofertas de ayuda
     */
    addOfertas(ofertas) {
        // Limpiar marcadores anteriores
        this.markerClusters.ofertas.clearLayers();

        ofertas.forEach(oferta => {
            if (!oferta.lat || !oferta.lng) return;

            const icon = this.createCustomIcon('💚', '#38A169');

            const marker = L.marker([oferta.lat, oferta.lng], { icon })
                .bindPopup(this.createOfertaPopup(oferta));

            this.markerClusters.ofertas.addLayer(marker);
        });
    },

    /**
     * Agrega marcadores de albergues
     */
    addAlbergues(albergues) {
        // Limpiar marcadores anteriores
        this.markerClusters.albergues.clearLayers();

        albergues.forEach(albergue => {
            if (!albergue.lat || !albergue.lng) return;

            const icon = this.createCustomIcon('🏠', '#DD6B20');

            const marker = L.marker([albergue.lat, albergue.lng], { icon })
                .bindPopup(this.createAlberguePopup(albergue));

            this.markerClusters.albergues.addLayer(marker);
        });
    },

    /**
     * Crea el contenido del popup para solicitudes
     */
    createSolicitudPopup(solicitud) {
        const tipoAyuda = solicitud.tipoAyuda || 'No especificado';
        const personas = solicitud.personas || 1;
        const fecha = Utils.formatDate(solicitud.timestamp);

        return `
      <div class="map-popup">
        <h3 style="margin: 0 0 8px 0; color: #E53E3E;">🆘 Necesita Ayuda</h3>
        <p style="margin: 4px 0;"><strong>Nombre:</strong> ${solicitud.nombre}</p>
        <p style="margin: 4px 0;"><strong>Necesita:</strong> ${tipoAyuda}</p>
        <p style="margin: 4px 0;"><strong>Personas:</strong> ${personas}</p>
        <p style="margin: 4px 0;"><strong>Barrio:</strong> ${solicitud.barrio || 'No especificado'}</p>
        ${solicitud.notas ? `<p style="margin: 4px 0;"><strong>Notas:</strong> ${solicitud.notas}</p>` : ''}
        <p style="margin: 8px 0 4px 0; font-size: 12px; color: #718096;">${fecha}</p>
        <button onclick="Utils.openWhatsApp('${solicitud.telefono}', 'Hola ${solicitud.nombre}, vi tu solicitud de ayuda en Socorro Córdoba. ¿Cómo puedo ayudarte?')" style="margin-top: 8px; padding: 8px 16px; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          💬 Contactar por WhatsApp
        </button>
      </div>
    `;
    },

    /**
     * Crea el contenido del popup para ofertas
     */
    createOfertaPopup(oferta) {
        const tipoAyuda = oferta.tipoAyuda || 'No especificado';
        const fecha = Utils.formatDate(oferta.timestamp);

        return `
      <div class="map-popup">
        <h3 style="margin: 0 0 8px 0; color: #38A169;">💚 Ofrece Ayuda</h3>
        <p style="margin: 4px 0;"><strong>Nombre:</strong> ${oferta.nombre}</p>
        <p style="margin: 4px 0;"><strong>Ofrece:</strong> ${tipoAyuda}</p>
        <p style="margin: 4px 0;"><strong>Cantidad:</strong> ${oferta.cantidad || 'No especificado'}</p>
        <p style="margin: 4px 0;"><strong>Barrio:</strong> ${oferta.barrio || 'No especificado'}</p>
        <p style="margin: 8px 0 4px 0; font-size: 12px; color: #718096;">${fecha}</p>
        <button onclick="Utils.openWhatsApp('${oferta.telefono}', 'Hola ${oferta.nombre}, vi tu oferta de ayuda en Socorro Córdoba. Me gustaría coordinar contigo.')" style="margin-top: 8px; padding: 8px 16px; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          💬 Contactar por WhatsApp
        </button>
      </div>
    `;
    },

    /**
     * Crea el contenido del popup para albergues
     */
    createAlberguePopup(albergue) {
        const capacidad = albergue.capacidadTotal || 0;
        const ocupacion = albergue.ocupacionActual || 0;
        const disponible = capacidad - ocupacion;
        const porcentaje = capacidad > 0 ? Math.round((ocupacion / capacidad) * 100) : 0;

        return `
      <div class="map-popup">
        <h3 style="margin: 0 0 8px 0; color: #DD6B20;">🏠 Albergue</h3>
        <p style="margin: 4px 0;"><strong>${albergue.nombre}</strong></p>
        <p style="margin: 4px 0;"><strong>Dirección:</strong> ${albergue.direccion || 'No especificada'}</p>
        <p style="margin: 4px 0;"><strong>Capacidad:</strong> ${ocupacion}/${capacidad} (${porcentaje}%)</p>
        <p style="margin: 4px 0;"><strong>Disponible:</strong> ${disponible} espacios</p>
        ${albergue.recursos ? `<p style="margin: 4px 0;"><strong>Recursos:</strong> ${albergue.recursos}</p>` : ''}
        ${albergue.contacto ? `<p style="margin: 4px 0;"><strong>Contacto:</strong> ${albergue.contacto}</p>` : ''}
        ${albergue.contacto ? `
          <button onclick="Utils.openWhatsApp('${albergue.contacto}', 'Hola, necesito información sobre el albergue ${albergue.nombre}.')" style="margin-top: 8px; padding: 8px 16px; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            💬 Contactar
          </button>
        ` : ''}
      </div>
    `;
    },

    /**
     * Establece la ubicación del usuario en el mapa
     */
    setUserLocation(lat, lng) {
        // Remover marcador anterior si existe
        if (this.markers.userLocation) {
            this.map.removeLayer(this.markers.userLocation);
        }

        // Crear nuevo marcador
        const icon = L.divIcon({
            html: `<div style="background: #3182CE; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 10px rgba(49, 130, 206, 0.5);"></div>`,
            className: 'user-location-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        this.markers.userLocation = L.marker([lat, lng], { icon })
            .addTo(this.map)
            .bindPopup('📍 Tu ubicación');

        // Centrar mapa en la ubicación
        this.map.setView([lat, lng], 15);
    },

    /**
     * Refresca todos los datos del mapa
     */
    async refresh() {
        Utils.showSpinner(true);

        try {
            const data = await API.getAllData();

            if (data.solicitudes) this.addSolicitudes(data.solicitudes);
            if (data.ofertas) this.addOfertas(data.ofertas);
            if (data.albergues) this.addAlbergues(data.albergues);

            Utils.showToast('✅ Mapa actualizado', 'success');
        } catch (error) {
            console.error('Error refrescando mapa:', error);
            Utils.showToast('❌ Error al actualizar el mapa', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    },
};
