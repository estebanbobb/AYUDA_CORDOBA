// ============================================
// SOCORRO CÓRDOBA - GESTIÓN DEL MAPA
// ============================================

const MapManager = (function () {
    'use strict';

    // Variables privadas
    let map = null;
    let markers = {
        solicitudes: null,
        ofertas: null,
        albergues: null,
        userLocation: null,
    };
    let markerClusters = {
        solicitudes: null,
        ofertas: null,
        albergues: null,
    };

    /**
     * Inicializa el mapa
     */
    function init() {
        if (map) return; // Ya inicializado

        // Crear mapa centrado en Montería
        map = L.map('map').setView(CONFIG.MAP.CENTER, CONFIG.MAP.ZOOM);

        // Agregar capa de tiles
        L.tileLayer(CONFIG.MAP.TILE_LAYER, {
            attribution: CONFIG.MAP.TILE_ATTRIBUTION,
            minZoom: CONFIG.MAP.MIN_ZOOM,
            maxZoom: CONFIG.MAP.MAX_ZOOM,
        }).addTo(map);

        // Inicializar clusters
        _initClusters();

        // Agregar clusters al mapa
        map.addLayer(markerClusters.solicitudes);
        map.addLayer(markerClusters.ofertas);
        map.addLayer(markerClusters.albergues);

        console.log('✅ Mapa inicializado');
    }

    /**
     * Inicializa los grupos de clusters (Privado)
     */
    function _initClusters() {
        markerClusters.solicitudes = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div class="marker-cluster marker-cluster-need">${cluster.getChildCount()}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });

        markerClusters.ofertas = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div class="marker-cluster marker-cluster-offer">${cluster.getChildCount()}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });

        markerClusters.albergues = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                return L.divIcon({
                    html: `<div class="marker-cluster marker-cluster-shelter">${cluster.getChildCount()}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });
    }

    /**
     * Crea un icono personalizado (Privado)
     */
    function _createCustomIcon(emoji, color) {
        return L.divIcon({
            html: `<div style="background: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 3px solid white;">${emoji}</div>`,
            className: 'custom-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });
    }

    /**
     * Agrega marcadores de solicitudes de ayuda
     */
    function addSolicitudes(solicitudes) {
        // Limpiar marcadores anteriores
        markerClusters.solicitudes.clearLayers();

        solicitudes.forEach(solicitud => {
            if (!solicitud.lat || !solicitud.lng) return;

            const icon = _createCustomIcon('🆘', '#E53E3E');

            const marker = L.marker([solicitud.lat, solicitud.lng], { icon })
                .bindPopup(_createSolicitudPopup(solicitud));

            markerClusters.solicitudes.addLayer(marker);
        });
    }

    /**
     * Agrega marcadores de ofertas de ayuda
     */
    function addOfertas(ofertas) {
        // Limpiar marcadores anteriores
        markerClusters.ofertas.clearLayers();

        ofertas.forEach(oferta => {
            if (!oferta.lat || !oferta.lng) return;

            const icon = _createCustomIcon('💚', '#38A169');

            const marker = L.marker([oferta.lat, oferta.lng], { icon })
                .bindPopup(_createOfertaPopup(oferta));

            markerClusters.ofertas.addLayer(marker);
        });
    }

    /**
     * Agrega marcadores de albergues
     */
    function addAlbergues(albergues) {
        // Limpiar marcadores anteriores
        markerClusters.albergues.clearLayers();

        albergues.forEach(albergue => {
            if (!albergue.lat || !albergue.lng) return;

            const icon = _createCustomIcon('🏠', '#DD6B20');

            const marker = L.marker([albergue.lat, albergue.lng], { icon })
                .bindPopup(_createAlberguePopup(albergue));

            markerClusters.albergues.addLayer(marker);
        });
    }

    /**
     * Crea el contenido del popup para solicitudes (Privado)
     */
    function _createSolicitudPopup(solicitud) {
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
    }

    /**
     * Crea el contenido del popup para ofertas (Privado)
     */
    function _createOfertaPopup(oferta) {
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
    }

    /**
     * Crea el contenido del popup para albergues (Privado)
     */
    function _createAlberguePopup(albergue) {
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
    }

    /**
     * Establece la ubicación del usuario en el mapa
     */
    function setUserLocation(lat, lng) {
        if (!map) return;

        // Remover marcador anterior si existe
        if (markers.userLocation) {
            map.removeLayer(markers.userLocation);
        }

        // Crear nuevo marcador
        const icon = L.divIcon({
            html: `<div style="background: #3182CE; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 10px rgba(49, 130, 206, 0.5);"></div>`,
            className: 'user-location-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        markers.userLocation = L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup('📍 Tu ubicación');

        // Centrar mapa en la ubicación
        map.setView([lat, lng], 15);
    }

    /**
     * Refresca todos los datos del mapa
     */
    async function refresh() {
        Utils.showSpinner(true);

        try {
            const data = await API.getAllData();

            if (data.solicitudes) addSolicitudes(data.solicitudes);
            if (data.ofertas) addOfertas(data.ofertas);
            if (data.albergues) addAlbergues(data.albergues);

            Utils.showToast('✅ Mapa actualizado', 'success');
        } catch (error) {
            console.error('Error refrescando mapa:', error);
            Utils.showToast('❌ Error al actualizar el mapa', 'error');
        } finally {
            Utils.showSpinner(false);
        }
    }

    // ============================================
    // MÉTODOS PROXY (PARA SEGURIDAD Y ENCAPSULAMIENTO)
    // ============================================

    function invalidateSize() {
        if (map) map.invalidateSize();
    }

    function setView(center, zoom) {
        if (map) map.setView(center, zoom);
    }

    function on(event, handler) {
        if (map) map.on(event, handler);
    }

    function off(event, handler) {
        if (map) map.off(event, handler);
    }

    // Obtener instancia (solo si es estrictamente necesario, tratar de evitar)
    function getMapInstance() {
        return map;
    }

    // API Pública
    return {
        init: init,
        refresh: refresh,
        setUserLocation: setUserLocation,
        // Proxies
        invalidateSize: invalidateSize,
        setView: setView,
        on: on,
        off: off,
        // Solo para emergencias o plugins complejos
        get map() { return map; }
    };
})();
