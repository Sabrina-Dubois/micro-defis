import webpush from "npm:web-push@3.6.7";

function addHours(hhmm, hoursToAdd) {
  const [h, m] = (hhmm || "20:00").split(":").map(Number);
  const total = (((h * 60 + m + hoursToAdd * 60) % (24 * 60)) + 24 * 60) % (24 * 60);
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

function zonedNowHHMM(timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timeZone || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = parts.find((p) => p.type === "hour")?.value || "00";
  const mm = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hh}:${mm}`;
}

function zonedTodayDate(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value || "1970";
  const m = parts.find((p) => p.type === "month")?.value || "01";
  const d = parts.find((p) => p.type === "day")?.value || "01";
  return `${y}-${m}-${d}`;
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
          title: "🔥 Alerte flamme en danger !",
          body:
            streak > 0
              ? `${streak} jours de série… ce serait dommage de casser ça maintenant 👀`
              : "Ton défi du jour attend son héroïne. 5 minutes et c'est plié.",
        }
      : {
          title: "🔥 Streak in danger!",
          body:
            streak > 0
              ? `${streak} days in a row... don't break it now 👀`
              : "Today's challenge is waiting for you. 5 minutes and done.",
        };
  }

  return isFr
    ? {
        title: "🎯 Nouveau micro-défi disponible",
        body:
          streak > 0
            ? `${streak} jours de suite, machine. On continue ? 💪`
            : "Petite action, gros impact: ton défi du jour est prêt.",
      }
    : {
        title: "🎯 New micro-challenge unlocked",
        body:
          streak > 0
            ? `${streak} days straight. Ready to keep the fire alive? 💪`
            : "Small action, big momentum: your daily challenge is ready.",
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

    // Prefer timezone-aware columns if deployed, fallback otherwise.
    let subscriptions = [];
    try {
      const subUrl = new URL(`${supabaseUrl}/rest/v1/push_subscriptions`);
      subUrl.searchParams.set("select", "user_id,subscription,reminder_time,reminder_time_local,timezone");
      if (targetUserId) subUrl.searchParams.set("user_id", `eq.${targetUserId}`);
      subscriptions = await fetchJson(subUrl.toString(), headers);
    } catch {
      const subUrl = new URL(`${supabaseUrl}/rest/v1/push_subscriptions`);
      subUrl.searchParams.set("select", "user_id,subscription,reminder_time");
      if (targetUserId) subUrl.searchParams.set("user_id", `eq.${targetUserId}`);
      subscriptions = await fetchJson(subUrl.toString(), headers);
    }

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ ok: true, now: nowHHMM, matched: 0, success: 0, failed: 0, sent: [] }), {
        headers: { "Content-Type": "application/json" },
      });
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
      const timezone = row.timezone || "UTC";
      const localReminder = row.reminder_time_local || null;
      const utcReminder = row.reminder_time || "20:00";
      const activeBaseTime = localReminder || utcReminder;
      const secondaryTime = addHours(activeBaseTime, 4);

      const currentTimeForUser = localReminder ? zonedNowHHMM(timezone) : nowHHMM;
      const userToday = localReminder ? zonedTodayDate(timezone) : today;
      const isMainSlot = currentTimeForUser === activeBaseTime;
      const isRiskSlot = currentTimeForUser === secondaryTime;
      if (!force && !isMainSlot && !isRiskSlot) continue;

      const doneToday = daysByUser.get(row.user_id)?.has(userToday) ?? false;
      if (doneToday && !force) continue;

      const streak = computeStreak(daysByUser.get(row.user_id) || new Set());
      const lang = langByUser.get(row.user_id) || "fr";
      const type = force ? "manual_test" : isRiskSlot ? "streak_risk" : "daily_reminder";
      const msg = messageFor(type, lang, streak);
      const notificationTag = force
        ? `manual-test-${row.user_id}-${Date.now()}`
        : `${type}-${today}`;
      const isManualTest = type === "manual_test";
      const payload = {
        ...msg,
        title: isManualTest ? "🧪 Test push Micro Defis" : msg.title,
        body: isManualTest ? "Si tu vois ceci, la push distante fonctionne." : msg.body,
        url: "/daily",
        tag: notificationTag,
        requireInteraction: isManualTest ? false : type !== "daily_reminder",
        renotify: false,
        ts: Date.now(),
      };

      jobs.push({ row, type, payload });
    }

    if (!jobs.length) {
      return new Response(JSON.stringify({ ok: true, now: nowHHMM, matched: 0, success: 0, failed: 0, sent: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = await Promise.allSettled(
      jobs.map(({ row, payload }) =>
        // Keep push options minimal for maximum provider compatibility.
        webpush.sendNotification(
          typeof row.subscription === "string" ? JSON.parse(row.subscription) : row.subscription,
          JSON.stringify(payload),
        ),
      ),
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
        sent.push({
          ...meta,
          status: "failed",
          statusCode: reason.statusCode || null,
          message: reason.message || null,
        });
      }
    });

    return new Response(JSON.stringify({ ok: true, now: nowHHMM, matched: jobs.length, success, failed, sent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
