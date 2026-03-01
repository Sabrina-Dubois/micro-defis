Deno.serve(async (req) => {
  // Gère le CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { priceId, userId, email } = await req.json();
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const origin = req.headers.get("origin") ?? "http://localhost:5173";

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
        customer_email: email,
        success_url: `${origin}/premium/success`,
        cancel_url: `${origin}/premium`,
      }),
    });

    const session = await response.json();
    if (!session.url) throw new Error(session.error?.message ?? "Erreur Stripe");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    });
  }
});
