const CACHE = 'netmeter-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const ok = u.origin === location.origin || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!ok) return;  // speed-test traffic always goes straight to the network
  e.respondWith(caches.open(CACHE).then(async c => {
    const key = req.mode === 'navigate' ? './index.html' : req;
    const hit = await c.match(key, { ignoreSearch: req.mode === 'navigate' });
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(key, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
