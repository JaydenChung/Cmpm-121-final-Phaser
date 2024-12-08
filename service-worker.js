const CACHE_NAME = 'graceful-garden-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/lib/phaser.js',
    '/src/main.js',
    '/src/PlantManagement.js',
    '/src/SaveState.js',
    '/src/scenes/StartScene.js',
    '/src/scenes/PreloadScene.js',
    '/src/scenes/GameScene.js',
    '/assets/mapBG.png',
    '/assets/GRASS+.png',

    // Add any other assets you want to cache (images, sounds, etc.)
];

// Install Event - Cache the assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event - Serve cached assets if available
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});