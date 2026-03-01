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
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  const payload = `${timestamp}.${body}`;

  // Import crypto pour vérifier la signature
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const computedSig = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedSig !== expectedSig) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  const subscription = event.data.object;
  const userId = subscription.metadata?.user_id;
  const customerId = subscription.customer;

  if (!userId) {
    return new Response("No user_id in metadata", { status: 400 });
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    await supabase
      .from("user_profiles")
      .update({ premium: isActive, stripe_customer_id: customerId })
      .eq("user_id", userId);
  }

  if (event.type === "customer.subscription.deleted") {
    await supabase
      .from("user_profiles")
      .update({ premium: false })
      .eq("user_id", userId);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});