import webpush from "npm:web-push@3.6.7";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");

  if (!supabaseUrl || !supabaseKey || !vapidPublic || !vapidPrivate) {
    return new Response("Variables d'environnement manquantes", { status: 500 });
  }

  webpush.setVapidDetails("mailto:contact@microdefis.com", vapidPublic, vapidPrivate);

  // Heure actuelle HH:00 en UTC (les rappels front sont stockés à l'heure pile)
  const now = new Date();
  const currentTime = `${String(now.getUTCHours()).padStart(2, "0")}:00`;

  // Récupère les abonnés dont c'est l'heure de rappel
  const res = await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?reminder_time=eq.${currentTime}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  const subs = await res.json();

  if (!subs?.length) {
    return new Response(
      JSON.stringify({ ok: true, time: currentTime, matched: 0, success: 0, failed: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Envoie les notifications en parallèle
  const results = await Promise.allSettled(
    subs.map((row) =>
      webpush.sendNotification(
        typeof row.subscription === "string" ? JSON.parse(row.subscription) : row.subscription,
        JSON.stringify({
          title: "🔥 Défi du jour",
          body: "Ton défi quotidien t'attend !",
          url: "/daily",
          tag: `daily-${new Date().toISOString().slice(0, 10)}`,
          requireInteraction: true,
        }),
        {
          TTL: 60,
          urgency: "high",
          topic: "microdefis-daily",
        },
      ),
    ),
  );

  const success = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  for (const result of results) {
    if (result.status === "rejected") {
      const reason = result.reason || {};
      console.error("Push send failed:", {
        statusCode: reason.statusCode,
        body: reason.body,
        message: reason.message,
      });
    }
  }

  console.log(`✅ ${success} envoyés, ❌ ${failed} échoués à ${currentTime}`);

  return new Response(JSON.stringify({ ok: true, time: currentTime, matched: subs.length, success, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});
