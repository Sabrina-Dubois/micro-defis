const CACHE = "microdefis-v3";
const PRECACHE_URLS = ["/", "/index.html"];

self.skipWaiting();

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

/*
==============================
 PUSH NOTIFICATIONS
==============================
*/

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
      tag: data.tag || "daily",
      renotify: false,
      requireInteraction: Boolean(data.requireInteraction),
    }),
  );
});

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
