const staticCacheName = 'site-static'
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    'img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
]

// install service worker
self.addEventListener('install', evt => {
    console.log('installing new service worker')
    evt.waitUntil(
        caches.open(staticCacheName)
            .then((cache) => {
                console.log('caching shell assets');
                // .addAll() & .add() make requests so we store the urls for those requests in the assets array
                cache.addAll(assets)
            })
    )
})

// activate service
self.addEventListener('activate', evt => {
    console.log('service worker has been activated');
})

// fetch events
self.addEventListener('fetch', evt => {
})