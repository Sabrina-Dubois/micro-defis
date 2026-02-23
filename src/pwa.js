// src/pwa.js
export async function registerServiceWorker(vapidPublicKey) {
  if (!("serviceWorker" in navigator)) return;

  const swUrl = `${import.meta.env.BASE_URL}sw.js`;

  try {
    // Supprime les anciens workers
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) await reg.unregister();

    // Register nouveau SW
    const reg = await navigator.serviceWorker.register(swUrl, { scope: "/" });

    // Gestion de la subscription push
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      console.log("Nouvelle subscription push:", sub);
      // Envoie au backend
    }
  } catch (err) {
    console.error("Erreur SW/PWA:", err);
  }
}

// Fonction utilitaire pour VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
