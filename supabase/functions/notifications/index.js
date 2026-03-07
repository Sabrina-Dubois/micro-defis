import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VERSION = "notif-v20";

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
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function isWithinWindow(nowHHMM, targetHHMM, windowMinutes = 5) {
  const now = hhmmToMinutes(nowHHMM);
  const target = hhmmToMinutes(targetHHMM);
  const delta = (now - target + 24 * 60) % (24 * 60);
  return delta >= 0 && delta < windowMinutes;
}

function isAfterOrEqualTime(nowHHMM, targetHHMM) {
  return hhmmToMinutes(nowHHMM) >= hhmmToMinutes(targetHHMM);
}

function utcNowHHMM() {
  const now = new Date();
  return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
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

function computeStreak(days, todayKey) {
  if (!days?.size) return 0;
  const baseDay = todayKey || todayUtcDate();
  const today = new Date(`${baseDay}T00:00:00.000Z`);
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

function pickOne(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function messageFor(type, lang, streak, username) {
  const isFr = (lang || "fr").startsWith("fr");
  const name = username ? ` ${username}` : "";

  const frDaily = [
    {
      title: `⚡ Hey${name} !`,
      body: streak > 0 ? `${streak} jours de série, continue la vibe 💪🔥` : "Ton défi du jour t'attend 😎✨",
    },
    {
      title: `🎯 C'est l'heure${name} !`,
      body: streak > 0 ? `${streak} jours en cours, lâche rien 🚀` : "5 minutes et ton défi est bouclé ⚡",
    },
    {
      title: `🔥 Allume ton flow${name}`,
      body: streak > 0 ? `${streak} jours d'affilée 🔥 T'es chaud !` : "MicroDéfi du jour, go go go 🏃‍♂️💨",
    },
    {
      title: `✨ Action du jour${name}`,
      body:
        streak > 0 ? `Ton streak: ${streak} jours 💥 Keep it alive` : "Petit pas aujourd'hui, gros boost demain ⚡😎",
    },
    {
      title: `🚀 C'est parti${name} !`,
      body: streak > 0 ? `${streak} jours de suite, t'assures 💪` : "Ton défi t'attend, juste 5 min 🔥",
    },
    {
      title: `🎉 Go${name} !`,
      body: streak > 0 ? `${streak} jours de flow 💫 On continue !` : "Un MicroDéfi et c'est validé ✅",
    },
  ];

  const frRisk = [
    {
      title: `🚨 ${name ? name.trim() + ", d" : "D"}anger streak !`,
      body: streak > 0 ? `${streak} jours en jeu 😱 Sauve ta série !` : "Ton défi du jour n'est pas fait 😳 😱",
    },
    {
      title: `⏳ ${name ? name.trim() + ", t" : "T"}u as encore le temps !`,
      body: streak > 0 ? `${streak} jours peuvent sauter !` : "Fais ton défi maintenant, tu peux encore 😎",
    },
    {
      title: `🔥 Ne perds pas ta flamme${name}`,
      body: streak > 0 ? `${streak} jours en feu 🔥 Un défi suffit` : "Petit défi = streak sauvé ✅",
    },
    {
      title: `⚡ Alerte MicroDefis${name}`,
      body: streak > 0 ? `Streak ${streak} jours en danger 😱` : "Ton futur toi te dira merci 😎",
    },
    {
      title: `🏃 Go${name} !`,
      body: streak > 0 ? `${streak} jours sur la corde raide !` : "5 minutes pour sauver ton streak 🥺",
    },
    {
      title: `🎯 Streak critique${name}`,
      body: streak > 0 ? `${streak} jours à protéger ⚡ Go go go !` : "Allez, bouge-toi 😎🔥",
    },
  ];

  const fr23h = [
    {
      title: `🌙 Dernière chance${name} !`,
      body:
        streak > 0 ? `${streak} jours en jeu 😱 Il te reste encore le temps !` : "23h... ton défi t'attend encore 😴",
    },
    {
      title: `🌙 Minuit approche${name}`,
      body: streak > 0 ? `${streak} jours de streak à sauver !` : "Dernier appel avant minuit 🌙",
    },
    {
      title: `⏰ Il est encore temps${name} !`,
      body: streak > 0 ? `Ne casse pas ta série de ${streak} jours 😤` : "Un petit défi avant de dormir ? 🛌",
    },
    {
      title: `🌙 23h — Dernier rappel${name}`,
      body: streak > 0 ? `${streak} jours sur la corde raide 😱 Go !` : "Tu peux encore le faire avant minuit ⚡",
    },
  ];

  const enDaily = [
    {
      title: `⚡ Hey${name}!`,
      body: streak > 0 ? `${streak}-day streak 💪 Keep it blazing 🔥` : "Your daily challenge is ready 😎✨",
    },
    { title: `🎯 Time to shine${name}!`, body: streak > 0 ? `${streak} days strong 🚀` : "5 minutes max and done ⚡" },
    {
      title: `🔥 Let's go${name}!`,
      body: streak > 0 ? `${streak} days in a row 🔥 Keep going!` : "Micro-challenge ready 🏃‍♂️💨",
    },
    {
      title: `✨ Action time${name}!`,
      body: streak > 0 ? `Your streak: ${streak} days 💥 Keep it alive` : "Small step today, big boost tomorrow ⚡😎",
    },
    {
      title: `🚀 Go${name}!`,
      body: streak > 0 ? `${streak} days strong 💪` : "Your challenge is waiting, 5 min tops 🔥",
    },
    {
      title: `🎉 Daily boost${name}!`,
      body: streak > 0 ? `${streak} days on fire 💫 Keep rolling!` : "One MicroDefi = ✅",
    },
  ];

  const enRisk = [
    {
      title: `🚨 ${name ? name.trim() + ", s" : "S"}treak danger!`,
      body: streak > 0 ? `${streak}-day streak at risk 😱` : "Your daily challenge is still pending 😳 😱",
    },
    {
      title: `⏳ Still time${name}!`,
      body: streak > 0 ? `${streak} days might break!` : "Finish it now, still time 😎",
    },
    {
      title: `🔥 Don't lose it${name}!`,
      body: streak > 0 ? `${streak} days on fire 🔥 One challenge saves it` : "Tiny challenge = streak saved ✅",
    },
    {
      title: `⚡ Alert${name}!`,
      body: streak > 0 ? `Streak ${streak} days in jeopardy 😱` : "Your future self will thank you 😎",
    },
    { title: `🏃 Go${name}!`, body: streak > 0 ? `${streak} days on the edge!` : "5 minutes to save your streak 🥺" },
    {
      title: `🎯 Critical streak${name}!`,
      body: streak > 0 ? `${streak} days to protect ⚡ Go go go!` : "Come on, move it 😎🔥",
    },
  ];

  const en23h = [
    {
      title: `🌙 Last chance${name}!`,
      body:
        streak > 0
          ? `${streak}-day streak at stake 😱 You still have time!`
          : "23:00... your challenge is still waiting 😴",
    },
    {
      title: `🌙 Midnight is near${name}!`,
      body: streak > 0 ? `${streak} days to save!` : "Last call before midnight 🌙",
    },
    {
      title: `⏰ Still time${name}!`,
      body: streak > 0 ? `Don't break your ${streak}-day streak 😤` : "One quick challenge before bed? 🛌",
    },
    {
      title: `🌙 11PM reminder${name}!`,
      body: streak > 0 ? `${streak} days on the edge 😱 Go!` : "You can still do it before midnight ⚡",
    },
  ];

  if (type === "streak_risk") return pickOne(isFr ? frRisk : enRisk) || (isFr ? frRisk[0] : enRisk[0]);
  if (type === "23h_reminder") return pickOne(isFr ? fr23h : en23h) || (isFr ? fr23h[0] : en23h[0]);
  return pickOne(isFr ? frDaily : enDaily) || (isFr ? frDaily[0] : enDaily[0]);
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Supabase REST error (${res.status}): ${await res.text()}`);
  return res.json();
}

async function postJson(url, headers, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase REST error (${res.status}): ${await res.text()}`);
  if (res.status === 204) return null;
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

    // ── S-4 : Vérification JWT — doit être un admin ou un appel serveur ────────
    // Cet endpoint est appelé soit par le cron Supabase (service_role),
    // soit depuis le dashboard admin (utilisateur avec is_admin = true).
    // Tout autre appelant reçoit un 401.
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return jsonResponse({ ok: false, error: "Unauthorized: missing token" }, 401);
    }

    // Cas 1 : appel cron/serveur avec la service_role key directement
    const isServiceRole = token === supabaseKey;

    if (!isServiceRole) {
      // Cas 2 : appel depuis le dashboard admin — vérifier que l'user est admin
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return jsonResponse({ ok: false, error: "Unauthorized: invalid token" }, 401);
      }

      // Vérifier is_admin dans user_profiles (même logique que admin-stats)
      const profileUrl = new URL(`${supabaseUrl}/rest/v1/user_profiles`);
      profileUrl.searchParams.set("select", "is_admin");
      profileUrl.searchParams.set("user_id", `eq.${user.id}`);
      profileUrl.searchParams.set("limit", "1");
      const profiles = await fetchJson(profileUrl.toString(), {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      });

      if (!profiles?.[0]?.is_admin) {
        return jsonResponse({ ok: false, error: "Forbidden: admin only" }, 403);
      }
    }
    // ── Fin du contrôle d'accès ───────────────────────────────────────────────

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
      u.searchParams.set("select", "user_id,subscription,reminder_time,reminder_time_local,timezone,updated_at");
      if (targetUserId) u.searchParams.set("user_id", `eq.${targetUserId}`);
      subscriptions = await fetchJson(u.toString(), headers);
    } catch {
      const u = new URL(`${supabaseUrl}/rest/v1/push_subscriptions`);
      u.searchParams.set("select", "user_id,subscription,reminder_time,updated_at");
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

    const profileUrl = new URL(`${supabaseUrl}/rest/v1/user_profiles`);
    profileUrl.searchParams.set("select", "user_id,username");
    profileUrl.searchParams.set("user_id", `in.${inUsers}`);
    const profiles = await fetchJson(profileUrl.toString(), headers);
    const usernameByUser = new Map(profiles.map((p) => [p.user_id, p.username || null]));

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
      const is23hSlot = isWithinWindow(currentTimeForUser, "23:00", 5);

      const doneToday = daysByUser.get(row.user_id)?.has(userToday) ?? false;

      if (force) {
        // Force send ignore tous les filtres
      } else {
        if (!isMainSlot && !isRiskSlot && !is23hSlot) continue;
        if (doneToday) continue;
      }

      const streak = computeStreak(daysByUser.get(row.user_id) || new Set(), userToday);
      const lang = langByUser.get(row.user_id) || "fr";
      const username = usernameByUser.get(row.user_id) || null;
      const type = force ? "manual_test" : is23hSlot ? "23h_reminder" : isRiskSlot ? "streak_risk" : "daily_reminder";
      const msg = messageFor(type, lang, streak, username);

      if (!force) {
        try {
          const lockRaw = await postJson(`${supabaseUrl}/rest/v1/rpc/reserve_notification_send`, headers, {
            p_user_id: row.user_id,
            p_notif_type: type,
            p_day_local: userToday,
          });
          const reserved =
            lockRaw === true ||
            lockRaw?.reserve_notification_send === true ||
            (Array.isArray(lockRaw) && lockRaw[0]?.reserve_notification_send === true);
          if (!reserved) {
            continue;
          }
        } catch (e) {
          console.error("LOCK ERROR", row.user_id, type, userToday, e?.message || e);
          continue;
        }
      }

      const isManualTest = type === "manual_test";
      const tag = isManualTest ? `manual-test-${row.user_id}-${Date.now()}` : `${type}-${userToday}`;

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
      if (r.status === "rejected") console.log("PUSH DEBUG REASON", r.reason);
      const meta = { user_id: jobs[idx].row.user_id, type: jobs[idx].type };
      if (r.status === "fulfilled") {
        success += 1;
        return { ...meta, status: "ok" };
      }
      failed += 1;
      const reason = r.reason || {};
      return { ...meta, status: "failed", statusCode: reason.statusCode || null, message: reason.message || null };
    });

    if (success > 0) {
      try {
        const logUrl = new URL(`${supabaseUrl}/rest/v1/activity_logs`);
        await fetch(logUrl.toString(), {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            type: "PUSH",
            text: `Campagne notif ${nowHHMM} envoyée à ${success} utilisateur${success > 1 ? "s" : ""}`,
          }),
        });
      } catch (e) {
        console.error("Erreur log campagne push:", e?.message);
      }
    }

    return jsonResponse({ ok: true, now: nowHHMM, matched: jobs.length, success, failed, sent });
  } catch (e) {
    console.error("=== ERROR ===", e?.message);
    return jsonResponse({ ok: false, error: e?.message || "Unknown error" }, 500);
  }
});
