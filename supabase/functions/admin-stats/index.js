import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Headers CORS — obligatoires pour que le navigateur accepte la réponse
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Le "req" est obligatoire pour intercepter les requêtes OPTIONS
Deno.serve(async (req) => {

  // Le navigateur envoie toujours une requête OPTIONS avant la vraie requête
  // Si on ne répond pas, ça bloque tout
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const requesterId = authData?.user?.id;
    if (authError || !requesterId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", requesterId)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count: totalUsers } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);
    const { count: newUsers30d } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since30d.toISOString());

    const since60d = new Date();
    since60d.setDate(since60d.getDate() - 60);
    const { count: newUsersPrev } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since60d.toISOString())
      .lt("created_at", since30d.toISOString());

    const { count: totalPremium } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("premium", true);

    const since7d = new Date();
    since7d.setDate(since7d.getDate() - 7);
    const { data: activeData } = await supabase
      .from("daily_completions")
      .select("user_id")
      .gte("day", since7d.toISOString().slice(0, 10));
    const activeWeek = new Set(activeData?.map((r) => r.user_id)).size;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { data: allUsers } = await supabase
      .from("user_profiles")
      .select("user_id, premium");
    const { data: activeMonth } = await supabase
      .from("daily_completions")
      .select("user_id")
      .gte("day", startOfMonth.toISOString().slice(0, 10));

    const activeIds = new Set(activeMonth?.map((r) => r.user_id));
    const total = allUsers?.length ?? 0;
    let freeActive = 0, premiumActive = 0, inactive = 0;
    for (const user of allUsers ?? []) {
      if (!activeIds.has(user.user_id)) inactive++;
      else if (user.premium) premiumActive++;
      else freeActive++;
    }

    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const from = new Date();
      from.setDate(from.getDate() - (i + 1) * 7);
      const to = new Date();
      to.setDate(to.getDate() - i * 7);
      const { count } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", from.toISOString())
        .lt("created_at", to.toISOString());
      weeks.push({ label: `S-${i + 1}`, value: count ?? 0 });
    }
    const maxWeek = Math.max(...weeks.map((w) => w.value), 1);
    const weeklySignups = weeks.map((w) => ({
      ...w,
      percent: Math.round((w.value / maxWeek) * 100),
    }));

    const { count: totalPush } = await supabase
      .from("push_subscriptions")
      .select("*", { count: "exact", head: true });
    const globalRate = total > 0 ? Math.round(((totalPush ?? 0) / total) * 100) : 0;

    const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

    // Récupère les 10 derniers événements pour l'activité récente
    const { data: logs } = await supabase
      .from("activity_logs")
      .select("id, type, text, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Formate le temps en "Il y a X min/h/j"
    function timeAgo(dateStr) {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return "À l'instant";
      if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
      if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
      return `Il y a ${Math.floor(diff / 86400)}j`;
    }

    const events = (logs ?? []).map((log) => ({
      id: log.id,
      type: log.type,
      text: log.text,
      time: timeAgo(log.created_at),
    }));

    return new Response(JSON.stringify({
      kpi: {
        totalUsers: totalUsers ?? 0,
        newUsers30d: newUsers30d ?? 0,
        newUsersPrev: newUsersPrev ?? 0,
        totalPremium: totalPremium ?? 0,
        activeWeek,
        inactive,
      },
      segments: [
        { label: "Free actifs", value: freeActive, pct: pct(freeActive), color: "#0EA5E9" },
        { label: "Premium actifs", value: premiumActive, pct: pct(premiumActive), color: "#F97316" },
        { label: "Inactifs", value: inactive, pct: pct(inactive), color: "#94A3B8" },
      ],
      weeklySignups,
      pushStats: [
        { label: "Taux d'abonnement global", value: `${globalRate}%`, pct: globalRate, color: "#0EA5E9" },
        { label: "Total abonnés push", value: String(totalPush ?? 0), pct: 100, color: "#10B981" },
      ],
      events,
    }), {
      // corsHeaders ajoutés ici — sans ça le navigateur bloque la réponse
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
