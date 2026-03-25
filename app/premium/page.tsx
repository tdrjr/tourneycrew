import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PremiumCheckoutButton } from "@/components/premium/PremiumCheckoutButton";
import { Check, Trophy } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Go Premium",
  description: "Support TourneyCrew and unlock premium features.",
};

export default async function PremiumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAlreadyPremium = false;
  if (user) {
    const { data } = await supabase
      .from("premium_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    isAlreadyPremium = !!data;
  }

  const plan = PLANS.premium;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-100 mb-4">
          <Trophy className="w-7 h-7 text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Go Premium</h1>
        <p className="text-gray-500">
          Support the community and unlock a better experience.
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-brand-500 shadow-lg p-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-gray-900">
              ${(plan.price / 100).toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

        <ul className="space-y-3 mb-8">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
              <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {isAlreadyPremium ? (
          <div className="w-full py-3 text-center bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
            ✅ You&apos;re already a Premium member!
          </div>
        ) : (
          <PremiumCheckoutButton isSignedIn={!!user} />
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Cancel anytime. Payments processed securely by Stripe.
      </p>
    </div>
  );
}
