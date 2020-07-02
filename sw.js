const staticCacheName = 'site-static-v3'
const dynamicCacheName = 'site-dynamic-v3'
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    'img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v53/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    '/pages/fallback.html'
]
const maxItemsPerDynamicCache = 15;

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name)
        .then(cache => {
            cache.keys()
                .then(keys => {
                    if (keys.length > size) {
                        cache.delete(keys[0])
                            .then(limitCacheSize(name, size));
                    }
                })
        })
}


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
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
})

// fetch events
self.addEventListener('fetch', evt => {
    if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {


        evt.respondWith(
            caches.match(evt.request)
                .then(cacheRes => {
                    return cacheRes || fetch(evt.request)
                        .then(fetchRes => {
                            return caches.open(dynamicCacheName)
                                .then(cache => {
                                    cache.put(evt.request.url, fetchRes.clone());
                                    limitCacheSize(dynamicCacheName, maxItemsPerDynamicCache);
                                    return fetchRes;
                                })
                        });
                })
                .catch((err) => {
                    if (evt.request.url.indexOf('.html') > -1) {
                        return caches.match('/pages/fallback.html');
                    }


                })
        );
    }
});