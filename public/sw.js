// ─────────────────────────────────────────
// CACHE PWA
// ─────────────────────────────────────────
const CACHE = "microdefis-v1";
const PRECACHE_URLS = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});

// ─────────────────────────────────────────
// PUSH NOTIFICATIONS
// ─────────────────────────────────────────
self.addEventListener("push", (e) => {
  const data = e.data?.json() ?? {};

  e.waitUntil(
    self.registration.showNotification(data.title || "🔥 Défi du jour", {
      body: data.body || "Ton défi quotidien t'attend !",
      icon: "/images/microdefis-logo-192.png",
      badge: "/images/microdefis-logo-192.png",
      data: { url: data.url || "/daily" },
      vibrate: [200, 100, 200],
    }),
  );
});

// Clic sur la notification → ouvre l'app
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si l'app est déjà ouverte → focus
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Sinon → ouvrir un nouvel onglet
      return clients.openWindow(e.notification.data?.url || "/daily");
    }),
  );
});
