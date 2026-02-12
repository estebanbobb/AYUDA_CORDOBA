// ============================================
// SOCORRO CÓRDOBA - SERVICE WORKER
// Version: 1.0.0
// ============================================

const CACHE_NAME = 'socorro-cordoba-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './favicon.ico',
    './css/styles.css',
    './css/modal.css',
    './js/config.js',
    './js/api.js',
    './js/utils.js',
    './js/geolocation.js',
    './js/map.js',
    './js/forms.js',
    './js/offline.js',
    './js/auth.js',
    './js/admin.js',
    './js/app.js',
    // External Libraries (si no se cachean, la app falla offline)
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// ============================================
// 1. INSTALL EVENT
// Instalar el SW y cachear assets estáticos
// ============================================
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cacheando App Shell');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting()) // Activar inmediatamente
    );
});

// ============================================
// 2. ACTIVATE EVENT
// Limpiar cachés antiguas
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Borrando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Tomar control de clientes
    );
});

// ============================================
// 3. FETCH EVENT
// Interceptar peticiones de red
// ============================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // A. Ignorar peticiones a la API de Google Apps Script (siempre red o fallo)
    // Las peticiones JSONP son complicadas de cachear y offline.js maneja la cola
    if (url.hostname.includes('script.google.com')) {
        return; // Dejar que el navegador maneje la red, o offline.js maneje el error
    }

    // B. Estrategia: Cache First, falling back to Network
    // Para assets estáticos, fuentes, mapas, etc.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 1. Si está en caché, devolverlo
                if (response) {
                    return response;
                }

                // 2. Si no, ir a la red
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Verificar respuesta válida
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                            return networkResponse;
                        }

                        // Cachear recursos nuevos dinámicamente (ej. tiles del mapa)
                        constresponseToCache = networkResponse.clone();

                        // Solo cachear tiles de OpenStreetMap y recursos propios faltantes
                        if (url.hostname.includes('openstreetmap.org') || url.origin === self.location.origin) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return networkResponse;
                    })
                    .catch(() => {
                        // 3. Si falla la red y no está en caché (Offline y recurso no cacheado)
                        console.log('[Service Worker] Fallo de red y no en caché:', event.request.url);
                        // Podríamos devolver una página offline.html aquí si existiera
                    });
            })
    );
});
