// src/pwa.js
export async function registerSW(vapidPublicKey) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const swUrl = `${import.meta.env.BASE_URL}sw.js`;

  try {
    // 1️⃣ Supprime tous les anciens SW
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      console.log("⏳ Unregistering old SW:", reg);
      await reg.unregister();
    }

    // 2️⃣ Re-register le SW
    const reg = await navigator.serviceWorker.register(swUrl, { scope: "/" });
    console.log("✅ SW registered:", reg);

    // 3️⃣ Récupère la subscription existante
    let sub = await reg.pushManager.getSubscription();

    // 4️⃣ Si subscription existante, supprime-la pour repartir propre
    if (sub) {
      console.log("⚡ Subscription existante trouvée, on la supprime");
      await sub.unsubscribe();
      sub = null;
    }

    // 5️⃣ Crée une nouvelle subscription
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log("✅ Nouvelle subscription push:", sub);

    // 6️⃣ Envoie au backend (Supabase)
    await fetch("/api/save-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub }),
    });
    console.log("✅ Subscription envoyée au backend");
  } catch (err) {
    console.error("❌ Erreur SW/PWA:", err);
  }
}

// Utilitaire pour convertir VAPID Key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
