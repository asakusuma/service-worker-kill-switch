const version = '%VERSION%';
const cacheName = version;

function logMessage(msg) {
  return self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(msg);
    });
  });
}

function install() {
  const openCache = caches.open(cacheName);
  const network = fetch('/asset.js');
  return Promise.all([openCache, network]).then((results) => {
    results[0].put('/asset.js', results[1]);
  });
}

function respondFromCache() {
  return caches.open(cacheName).then((cache) => {
    return cache.match('/asset.js').then((response) => {
      if (response) {
        return response;
      }
      throw new Error('cache miss');
    });
  });
}

function checkPulse() {
  return fetch('/pulse').then((response) => {
    if (!response.ok) {
      return self.registration.unregister();
    }
  });
}

function neverEnding() {
  return new Promise(function() {

  });
}

function guardResponse(promise) {
  const timeout = new Promise(function(r, reject) {
    setTimeout(function() {
      reject(new Response(null, {
        status: 500
      }));
    }, 10000);
  });
  return Promise.race([promise, timeout]);
}

self.addEventListener('install', function(event) {
  event.waitUntil(install());
});

self.addEventListener('activate', function(event) {
  logMessage(`Version ${version} activated`);
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  const path = new URL(event.request.url).pathname;
  if (path === '/asset.js') {
    event.respondWith(guardResponse(neverEnding()));
    event.waitUntil(neverEnding());
  }
  event.waitUntil(checkPulse())
});