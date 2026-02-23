export async function registerSW(vapidPublicKey) {
  if (!("serviceWorker" in navigator)) return;

  try {
    // REGISTER LE SW
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

    // PUSH SUBSCRIPTION
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      console.log("Nouvelle subscription push :", sub);
      // TODO : envoyer la subscription à ton backend Supabase pour push notifications
    }
  } catch (err) {
    console.error("Erreur registration SW:", err);
  }
}

// UTILITAIRE pour VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
