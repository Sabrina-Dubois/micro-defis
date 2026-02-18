// ─────────────────────────────────────────
// CACHE PWA
// ─────────────────────────────────────────
const CACHE = "microdefis-v1";
const PRECACHE_URLS = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("fetch", (e) => {
  // Ne gère que les requêtes GET pour éviter les erreurs fetch bruyantes.
  if (e.request.method !== "GET") return;

  e.respondWith(
    (async () => {
      const cachedResponse = await caches.match(e.request);
      if (cachedResponse) return cachedResponse;

      try {
        return await fetch(e.request);
      } catch {
        const offlineFallback = await caches.match("/index.html");
        if (offlineFallback && e.request.mode === "navigate") {
          return offlineFallback;
        }
        return new Response("", { status: 503, statusText: "Service Unavailable" });
      }
    })(),
  );
});

// ─────────────────────────────────────────
// PUSH NOTIFICATIONS
// ─────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    data = {};
  }

  e.waitUntil(
    self.registration.showNotification(data.title || "🔥 Défi du jour", {
      body: data.body || "Ton défi quotidien t'attend !",
      icon: "/images/microdefis-logo-192.png",
      badge: "/images/microdefis-logo-192.png",
      data: { url: data.url || "/daily" },
      tag: data.tag || "daily",
      renotify: Boolean(data.renotify),
      requireInteraction: Boolean(data.requireInteraction),
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
