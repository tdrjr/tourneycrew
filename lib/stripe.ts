import Stripe from "stripe";

// Lazy-initialize so the Stripe client isn't constructed at module load time
// (which would throw during Next.js static build when env vars aren't present)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

// Named export kept for convenience — resolves lazily
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID!;

export const PLANS = {
  premium: {
    name: "TourneyCrew Premium",
    price: 499, // $4.99/month in cents
    description: "Ad-free experience, early access to new features, and supporter badge.",
    features: [
      "Ad-free browsing",
      "Supporter badge on your tips",
      "Priority tip review",
      "Early access to new features",
    ],
  },
} as const;
