import webpush from "npm:web-push@3.6.7";

function addHours(hhmm, hoursToAdd) {
  const [h, m] = (hhmm || "20:00").split(":").map(Number);
  const total = ((h * 60 + m + hoursToAdd * 60) % (24 * 60) + 24 * 60) % (24 * 60);
  const outH = String(Math.floor(total / 60)).padStart(2, "0");
  const outM = String(total % 60).padStart(2, "0");
  return `${outH}:${outM}`;
}

function utcNowHHMM() {
  const now = new Date();
  return `${String(now.getUTCHours()).padStart(2, "0")}:00`;
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(days) {
  if (!days?.size) return 0;
  const today = new Date(todayUtcDate());
  let streak = 0;
  while (true) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - streak);
    const key = d.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
  }
  return streak;
}

function messageFor(type, lang, streak) {
  const isFr = (lang || "fr").startsWith("fr");
  if (type === "streak_risk") {
    return isFr
      ? {
          title: "⚠️ Ne perds pas ta flamme",
          body:
            streak > 0
              ? `Tu es à ${streak} jours de série. Fais ton défi avant ce soir 🔥`
              : "Tu n'as pas encore validé ton défi du jour. 5 minutes suffisent.",
        }
      : {
          title: "⚠️ Don't lose your streak",
          body:
            streak > 0
              ? `You're on a ${streak}-day streak. Complete today's challenge before tonight 🔥`
              : "You haven't completed today's challenge yet. It only takes 5 minutes.",
        };
  }

  return isFr
    ? {
        title: "🎯 Ton défi du jour est prêt",
        body:
          streak > 0
            ? `Tu as ${streak} jours de série. Continue aujourd'hui 💪`
            : "Commence une nouvelle série aujourd'hui. Ton défi t'attend.",
      }
    : {
        title: "🎯 Your daily challenge is ready",
        body:
          streak > 0
            ? `You're on a ${streak}-day streak. Keep it going today 💪`
            : "Start a new streak today. Your challenge is waiting.",
      };
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase REST error (${res.status}): ${txt}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!supabaseUrl || !supabaseKey || !vapidPublic || !vapidPrivate) {
      return new Response(JSON.stringify({ ok: false, error: "Missing env secrets" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    webpush.setVapidDetails("mailto:contact@microdefis.com", vapidPublic, vapidPrivate);

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const force = body?.force === true;
    const targetUserId = body?.user_id || null;
    const nowHHMM = utcNowHHMM();
    const today = todayUtcDate();

    const subUrl = new URL(`${supabaseUrl}/rest/v1/push_subscriptions`);
    subUrl.searchParams.set("select", "user_id,subscription,reminder_time");
    if (targetUserId) subUrl.searchParams.set("user_id", `eq.${targetUserId}`);
    const subscriptions = await fetchJson(subUrl.toString(), headers);

    if (!subscriptions?.length) {
      return new Response(
        JSON.stringify({ ok: true, now: nowHHMM, matched: 0, success: 0, failed: 0, sent: [] }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const userIds = [...new Set(subscriptions.map((s) => s.user_id))];
    const inUsers = `(${userIds.join(",")})`;

    const prefUrl = new URL(`${supabaseUrl}/rest/v1/user_preferences`);
    prefUrl.searchParams.set("select", "user_id,language");
    prefUrl.searchParams.set("user_id", `in.${inUsers}`);
    const preferences = await fetchJson(prefUrl.toString(), headers);
    const langByUser = new Map(preferences.map((p) => [p.user_id, p.language || "fr"]));

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 14);
    const completionUrl = new URL(`${supabaseUrl}/rest/v1/daily_completions`);
    completionUrl.searchParams.set("select", "user_id,day");
    completionUrl.searchParams.set("user_id", `in.${inUsers}`);
    completionUrl.searchParams.set("day", `gte.${since.toISOString().slice(0, 10)}`);
    const completions = await fetchJson(completionUrl.toString(), headers);

    const daysByUser = new Map();
    for (const c of completions) {
      if (!daysByUser.has(c.user_id)) daysByUser.set(c.user_id, new Set());
      daysByUser.get(c.user_id).add(c.day);
    }

    const jobs = [];
    for (const row of subscriptions) {
      const baseTime = row.reminder_time || "20:00";
      const secondaryTime = addHours(baseTime, 4);
      const isMainSlot = nowHHMM === baseTime;
      const isRiskSlot = nowHHMM === secondaryTime;
      if (!force && !isMainSlot && !isRiskSlot) continue;

      const doneToday = daysByUser.get(row.user_id)?.has(today) ?? false;
      if (doneToday && !force) continue;

      const streak = computeStreak(daysByUser.get(row.user_id) || new Set());
      const lang = langByUser.get(row.user_id) || "fr";
      const type = force ? "manual_test" : isRiskSlot ? "streak_risk" : "daily_reminder";
      const msg = messageFor(type, lang, streak);
      const payload = {
        ...msg,
        url: "/daily",
        tag: `${type}-${today}`,
        requireInteraction: type !== "daily_reminder",
      };

      jobs.push({ row, type, payload });
    }

    if (!jobs.length) {
      return new Response(
        JSON.stringify({ ok: true, now: nowHHMM, matched: 0, success: 0, failed: 0, sent: [] }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const results = await Promise.allSettled(
      jobs.map(({ row, payload, type }) => {
        const shortTopic =
          type === "manual_test"
            ? "md-test"
            : type === "streak_risk"
              ? "md-risk"
              : "md-daily";

        return webpush.sendNotification(
          typeof row.subscription === "string" ? JSON.parse(row.subscription) : row.subscription,
          JSON.stringify(payload),
          {
            TTL: 60,
            urgency: type === "streak_risk" ? "high" : "normal",
            topic: shortTopic,
          },
        );
      }),
    );

    const sent = [];
    let success = 0;
    let failed = 0;
    results.forEach((r, idx) => {
      const meta = { user_id: jobs[idx].row.user_id, type: jobs[idx].type };
      if (r.status === "fulfilled") {
        success += 1;
        sent.push({ ...meta, status: "ok" });
      } else {
        failed += 1;
        const reason = r.reason || {};
        console.error("Push send failed:", {
          ...meta,
          statusCode: reason.statusCode,
          body: reason.body,
          message: reason.message,
        });
        sent.push({ ...meta, status: "failed", statusCode: reason.statusCode || null });
      }
    });

    return new Response(
      JSON.stringify({ ok: true, now: nowHHMM, matched: jobs.length, success, failed, sent }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
