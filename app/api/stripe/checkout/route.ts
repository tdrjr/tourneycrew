import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PREMIUM_PRICE_ID } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("premium_subscriptions")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
    customer_email: user.email,
    metadata: { user_id: user.id },
    success_url: `${SITE_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/premium`,
  });

  return NextResponse.json({ url: session.url });
}
