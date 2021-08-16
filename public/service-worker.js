console.log('Hi from your service-worker.js file!');
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
    '/',
    "/manifest.webmanifest",
    "/styles.css",
    '/db.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/index.html',
    '/index.js',
    

]
// install
self.addEventListener('install', function (evt) {
    // pre cache image data
   

    // pre cache all static assets
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting();
  });


  //Activate
  self.addEventListener('activate', function(evt) {
      evt.waitUntil(
          caches.keys().then((keyList) => {
              return Promise.all(
                  keyList.map((key) => {
                      if(key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                          console.log('Removing old cache data', key);
                          return caches.delete(key);
                      }
                  })
              )
          })
      )
  })
 
  // fetch 

  self.addEventListener('fetch', function (evt) {
    // code to handle requests goes here
    if(evt.request.url.includes('/api/')){
        console.log('[Service Worker] Fetch (data)', evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response =>{
                    if(response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
        );
        return;
    }

  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});
