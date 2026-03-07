Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
      },
    });
  }

  const signature = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

  // Vérifie la signature Stripe manuellement
  const parts = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  const signedPayload = `${timestamp}.${body}`;

  // Import crypto pour vérifier la signature
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const computedSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedSig !== expectedSig) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  const payload = event.data.object;

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  // Mapping initial fiable: checkout session
  if (event.type === "checkout.session.completed") {
    const userId =
      payload.metadata?.user_id ??
      payload.client_reference_id ??
      null;
    const customerId = payload.customer ?? null;
    if (userId && customerId) {
      await supabase
        .from("user_profiles")
        .update({ premium: true, stripe_customer_id: customerId })
        .eq("user_id", userId);
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const userId = payload.metadata?.user_id ?? null;
    const customerId = payload.customer ?? null;
    const isActive = payload.status === "active" || payload.status === "trialing";

    if (userId) {
      await supabase
        .from("user_profiles")
        .update({ premium: isActive, stripe_customer_id: customerId })
        .eq("user_id", userId);
    } else if (customerId) {
      await supabase
        .from("user_profiles")
        .update({ premium: isActive })
        .eq("stripe_customer_id", customerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const userId = payload.metadata?.user_id ?? null;
    const customerId = payload.customer ?? null;
    if (userId) {
      await supabase.from("user_profiles").update({ premium: false }).eq("user_id", userId);
    } else if (customerId) {
      await supabase.from("user_profiles").update({ premium: false }).eq("stripe_customer_id", customerId);
    }
  }

  // Fallback important: certains flux passent par invoice.paid avec user_id dans les lignes/parent.
  if (event.type === "invoice.paid") {
    const customerId = payload.customer ?? null;
    const userId =
      payload.parent?.subscription_details?.metadata?.user_id ??
      payload.lines?.data?.[0]?.metadata?.user_id ??
      payload.metadata?.user_id ??
      null;

    if (userId) {
      await supabase
        .from("user_profiles")
        .update({ premium: true, stripe_customer_id: customerId })
        .eq("user_id", userId);
    } else if (customerId) {
      await supabase
        .from("user_profiles")
        .update({ premium: true })
        .eq("stripe_customer_id", customerId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
