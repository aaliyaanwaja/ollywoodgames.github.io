/* Offline support: cache the game shell, serve from cache first, refresh in the background. Bump VERSION on every release.
   Files are cached one by one so a level pack that is listed but not yet shipped cannot block the install. */
const VERSION = 'omt-0.10.1';
const FILES = ['./', 'index.html', 'css/style.css', 'js/sim.js', 'js/sounds.js', 'js/audio.js', 'js/render.js', 'js/game.js',
  'js/levels/pack1.js', 'js/levels/pack2.js', 'js/levels/pack3.js', 'js/levels/pack4.js', 'js/levels/pack5.js', 'js/levels/pack6.js', 'js/levels/pack7.js', 'js/levels/pack8.js', 'js/levels/story.js', 'js/levels/pars.js', 'js/levels/practice.js', 'js/levels/daily.js', 'js/config.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/anton-latin-400-normal.woff2', 'fonts/barlow-latin-500-normal.woff2', 'fonts/barlow-latin-600-normal.woff2',
  'fonts/barlow-condensed-latin-600-normal.woff2', 'fonts/barlow-condensed-latin-700-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
