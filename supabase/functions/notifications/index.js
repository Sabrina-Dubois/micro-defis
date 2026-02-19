import webpush from "npm:web-push@3.6.7";

const VERSION = "notif-v16";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify({ version: VERSION, ...payload }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function addHours(hhmm, hoursToAdd) {
  const [h, m] = (hhmm || "20:00").split(":").map(Number);
  const total = (((h * 60 + m + hoursToAdd * 60) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function hhmmToMinutes(hhmm) {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return ((Number.isFinite(h) ? h : 0) * 60) + (Number.isFinite(m) ? m : 0);
}

function isWithinWindow(nowHHMM, targetHHMM, windowMinutes = 5) {
  const now = hhmmToMinutes(nowHHMM);
  const target = hhmmToMinutes(targetHHMM);
  // works across midnight as well
  const delta = ((now - target) + 24 * 60) % (24 * 60);
  return delta >= 0 && delta < windowMinutes;
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

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickOne(items, seed) {
  if (!items.length) return null;
  const index = hashString(seed) % items.length;
  return items[index];
}
function messageFor(type, lang, streak, seed) {
  const isFr = (lang || "fr").startsWith("fr");

  const frDaily = [
    {
      title: "⚡ Défi du jour dispo !",
      body: streak > 0 ? `${streak} jours de série, continue la vibe 💪🔥` : "Petit défi, grosse satisfaction 😎✨",
    },
    {
      title: "🎯 Challenge prêt à exploser !",
      body: streak > 0 ? `${streak} jours en cours, lâche rien 🚀` : "5 minutes et ton défi est bouclé ⚡",
    },
    {
      title: "🔥 Allume ton flow",
      body: streak > 0 ? `${streak} jours d’affilée 🔥 T’es chaud !` : "Micro-défi du jour, go go go 🏃‍♂️💨",
    },
    {
      title: "✨ Action du jour",
      body:
        streak > 0 ? `Ton streak: ${streak} jours 💥 Keep it alive` : "Petit pas aujourd'hui, gros boost demain ⚡😎",
    },
    {
      title: "🚀 C’est parti !",
      body: streak > 0 ? `${streak} jours de suite, t’assures 💪` : "Ton défi t’attend, juste 5 min 🔥",
    },
    {
      title: "🎉 Boost instantané",
      body: streak > 0 ? `${streak} jours de flow 💫 On continue !` : "Un micro-défi et c’est validé ✅",
    },
  ];

  const frRisk = [
    {
      title: "🚨 Danger streak !",
      body: streak > 0 ? `${streak} jours en jeu 😱 Sauve ta série !` : "Ton défi du jour n’est pas fait 😳💨",
    },
    {
      title: "⏳ Dernier rappel",
      body: streak > 0 ? `${streak} jours peuvent sauter !` : "Fais ton défi maintenant, tu peux encore 😎",
    },
    {
      title: "🔥 Ne perds pas ta flamme",
      body: streak > 0 ? `${streak} jours en feu 🔥 Un défi suffit` : "Petit défi = streak sauvé ✅",
    },
    {
      title: "⚡ Alerte micro-challenge",
      body: streak > 0 ? `Streak ${streak} jours en danger 😱` : "Ton futur toi te dira merci 😎",
    },
    {
      title: "🏃‍♂️ Action immédiate",
      body: streak > 0 ? `${streak} jours sur la corde raide !` : "5 minutes pour sauver ton streak 💨",
    },
    {
      title: "🎯 Streak critique",
      body: streak > 0 ? `${streak} jours à protéger ⚡ Go go go !` : "Allez, bouge-toi 😎🔥",
    },
  ];

  const enDaily = [
    {
      title: "⚡ Daily challenge ready!",
      body: streak > 0 ? `${streak}-day streak 💪 Keep it blazing 🔥` : "Tiny challenge, big vibes 😎✨",
    },
    { title: "🎯 Challenge unlocked!", body: streak > 0 ? `${streak} days strong 🚀` : "5 minutes max and done ⚡" },
    {
      title: "🔥 Time to shine",
      body: streak > 0 ? `${streak} days in a row 🔥 Let’s go!` : "Micro-challenge ready 🏃‍♂️💨",
    },
    {
      title: "✨ Action moment",
      body: streak > 0 ? `Your streak: ${streak} days 💥 Keep it alive` : "Small step today, big boost tomorrow ⚡😎",
    },
    {
      title: "🚀 Let’s go!",
      body: streak > 0 ? `${streak} days strong 💪` : "Your challenge is waiting, 5 min tops 🔥",
    },
    {
      title: "🎉 Instant boost",
      body: streak > 0 ? `${streak} days on fire 💫 Keep rolling!` : "One micro-challenge = ✅",
    },
  ];

  const enRisk = [
    {
      title: "🚨 Streak danger!",
      body: streak > 0 ? `${streak}-day streak at risk 😱` : "Your daily challenge is still pending 😳💨",
    },
    { title: "⏳ Last reminder", body: streak > 0 ? `${streak} days might break!` : "Finish it now, still time 😎" },
    {
      title: "🔥 Don’t lose the streak",
      body: streak > 0 ? `${streak} days on fire 🔥 One challenge saves it` : "Tiny challenge = streak saved ✅",
    },
    {
      title: "⚡ Micro-challenge alert",
      body: streak > 0 ? `Streak ${streak} days in jeopardy 😱` : "Your future self will thank you 😎",
    },
    {
      title: "🏃‍♂️ Immediate action",
      body: streak > 0 ? `${streak} days on the edge!` : "5 minutes to save your streak 💨",
    },
    {
      title: "🎯 Critical streak",
      body: streak > 0 ? `${streak} days to protect ⚡ Go go go!` : "Come on, move it 😎🔥",
    },
  ];

  if (type === "streak_risk") return pickOne(isFr ? frRisk : enRisk, seed) || (isFr ? frRisk[0] : enRisk[0]);
  return pickOne(isFr ? frDaily : enDaily, seed) || (isFr ? frDaily[0] : enDaily[0]);
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Supabase REST error (${res.status}): ${await res.text()}`);
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!supabaseUrl || !supabaseKey || !vapidPublic || !vapidPrivate) {
      return jsonResponse({ ok: false, error: "Missing env secrets" }, 500);
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

    let subscriptions = [];
    try {
      const u = new URL(`${supabaseUrl}/rest/v1/push_subscriptions`);
      u.searchParams.set("select", "user_id,subscription,reminder_time,reminder_time_local,timezone");
      if (targetUserId) u.searchParams.set("user_id", `eq.${targetUserId}`);
      subscriptions = await fetchJson(u.toString(), headers);
    } catch {
      const u = new URL(`${supabaseUrl}/rest/v1/push_subscriptions`);
      u.searchParams.set("select", "user_id,subscription,reminder_time");
      if (targetUserId) u.searchParams.set("user_id", `eq.${targetUserId}`);
      subscriptions = await fetchJson(u.toString(), headers);
    }

    if (!subscriptions.length) {
      return jsonResponse({ ok: true, now: nowHHMM, matched: 0, success: 0, failed: 0, sent: [] });
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

      const currentTimeForUser = localReminder ? zonedNowHHMM(timezone) : nowHHMM;
      const userToday = localReminder ? zonedTodayDate(timezone) : today;

      const isMainSlot = isWithinWindow(currentTimeForUser, activeBaseTime, 5);
      const isRiskSlot = isWithinWindow(currentTimeForUser, addHours(activeBaseTime, 4), 5);

      if (!force && !isMainSlot && !isRiskSlot) continue;

      const doneToday = daysByUser.get(row.user_id)?.has(userToday) ?? false;
      if (doneToday && !force) continue;

      const streak = computeStreak(daysByUser.get(row.user_id) || new Set());
      const lang = langByUser.get(row.user_id) || "fr";
      const type = force ? "manual_test" : isRiskSlot ? "streak_risk" : "daily_reminder";
      const msg = messageFor(type, lang, streak, `${row.user_id}:${userToday}:${type}`);
      const isManualTest = type === "manual_test";
      const tag = isManualTest ? `manual-test-${row.user_id}-${Date.now()}` : `${type}-${today}`;

      jobs.push({
        row,
        type,
        payload: {
          ...msg,
          title: isManualTest ? "🧪 Test push Micro Defis" : msg.title,
          body: isManualTest ? "Si tu vois ceci, la push distante fonctionne." : msg.body,
          url: "/daily",
          tag,
          requireInteraction: isManualTest ? false : type !== "daily_reminder",
          renotify: false,
          ts: Date.now(),
        },
      });
    }

    if (!jobs.length) {
      return jsonResponse({ ok: true, now: nowHHMM, matched: 0, success: 0, failed: 0, sent: [] });
    }

    const results = await Promise.allSettled(
      jobs.map(({ row, payload }) =>
        webpush.sendNotification(
          typeof row.subscription === "string" ? JSON.parse(row.subscription) : row.subscription,
          JSON.stringify(payload),
        ),
      ),
    );

    let success = 0;
    let failed = 0;
    const sent = results.map((r, idx) => {
      const meta = { user_id: jobs[idx].row.user_id, type: jobs[idx].type };
      if (r.status === "fulfilled") {
        success += 1;
        return { ...meta, status: "ok" };
      }
      failed += 1;
      const reason = r.reason || {};
      return {
        ...meta,
        status: "failed",
        statusCode: reason.statusCode || null,
        message: reason.message || null,
      };
    });

    return jsonResponse({ ok: true, now: nowHHMM, matched: jobs.length, success, failed, sent });
  } catch (e) {
    return jsonResponse({ ok: false, error: e?.message || "Unknown error" }, 500);
  }
});
