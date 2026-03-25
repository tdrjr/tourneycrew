import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
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
