const CACHE = "microdefis-v4";
const PRECACHE_URLS = ["/", "/index.html"];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE) return caches.delete(key);
          }),
        ),
      )
      .then(() => clients.claim()),
  );
});

// PUSH NOTIFICATIONS
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "🔥 Défi du jour", {
      body: data.body || "Ton défi quotidien t'attend !",
      icon: "/images/microdefis-logo-192.png",
      badge: "/images/microdefis-logo-192.png",
      data: { url: data.url || "/daily" },
      requireInteraction: Boolean(data.requireInteraction),
      tag: data.tag || "microdefis-daily", // évite les doublons
      renotify: Boolean(data.renotify), //pas de re-vibration si remplacement
    }),
  );
});

// CLICK SUR LA NOTIF
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url || "/daily");
    }),
  );
});
