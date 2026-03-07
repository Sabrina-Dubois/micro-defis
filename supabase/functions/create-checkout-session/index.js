import { createClient } from "npm:@supabase/supabase-js@2";

// ─── Whitelist des priceId autorisés ────────────────────────────────────────
// Renseigne ALLOWED_PRICE_IDS dans tes variables d'env Supabase (séparés par virgule)
// Ex : ALLOWED_PRICE_IDS=price_abc123,price_xyz456
function getAllowedPriceIds() {
  const raw = Deno.env.get("ALLOWED_PRICE_IDS") ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

// ─── Whitelist des origines autorisées ──────────────────────────────────────
// Renseigne ALLOWED_ORIGINS dans tes variables d'env Supabase (séparés par virgule)
// Ex : ALLOWED_ORIGINS=https://monapp.com,http://localhost:5173
function getAllowedOrigins() {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

Deno.serve(async (req) => {
  // ── CORS preflight ────────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // ── S-1 : Vérification JWT Supabase ──────────────────────────────────────
    // On lit le token depuis le header Authorization envoyé par le client Supabase
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return jsonError("Unauthorized: missing token", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonError("Server misconfiguration", 500);
    }

    // On crée un client avec le token de l'utilisateur pour vérifier son identité
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError("Unauthorized: invalid token", 401);
    }

    // userId et email viennent du token vérifié — jamais du body client
    const userId = user.id;
    const email = user.email ?? "";

    // ── S-2 : Validation du priceId ──────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { priceId } = body;

    if (!priceId || typeof priceId !== "string") {
      return jsonError("Bad request: priceId manquant", 400);
    }

    const allowedPrices = getAllowedPriceIds();
    if (allowedPrices.size > 0 && !allowedPrices.has(priceId)) {
      return jsonError("Bad request: priceId non autorisé", 400);
    }

    // ── S-3 : Validation de l'origine ────────────────────────────────────────
    // L'origin vient du header HTTP (non modifiable par le JS client)
    // et est comparée à la whitelist — jamais prise du body
    const requestOrigin = req.headers.get("origin") ?? "";
    const allowedOrigins = getAllowedOrigins();

    let safeOrigin;
    if (allowedOrigins.size > 0 && allowedOrigins.has(requestOrigin)) {
      // Origine connue et autorisée
      safeOrigin = requestOrigin;
    } else if (allowedOrigins.size === 0) {
      // Fallback dev si ALLOWED_ORIGINS n'est pas encore configuré
      safeOrigin = requestOrigin || "http://localhost:5173";
    } else {
      return jsonError("Forbidden: origine non autorisée", 403);
    }

    // ── Appel Stripe ─────────────────────────────────────────────────────────
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    if (!stripeKey) return jsonError("Server misconfiguration", 500);

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "subscription",
        "payment_method_types[0]": "card",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "subscription_data[trial_period_days]": "7",
        "subscription_data[metadata][user_id]": userId,
        "metadata[user_id]": userId,
        client_reference_id: userId,
        customer_email: email,
        success_url: `${safeOrigin}/premium/success`,
        cancel_url: `${safeOrigin}/premium`,
      }),
    });

    const session = await response.json();
    if (!session.url) throw new Error(session.error?.message ?? "Erreur Stripe");

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
