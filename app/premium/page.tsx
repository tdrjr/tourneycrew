import Link from "next/link";
import { Trophy, Check, Bell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium – Coming Soon",
  description: "TourneyCrew Premium is coming soon. Get early access and support the community.",
};

const UPCOMING_FEATURES = [
  "Ad-free browsing",
  "Supporter badge on your tips",
  "Priority tip review",
  "Early access to new features",
  "Monthly tournament digest email",
];

export default function PremiumPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-100 mb-4">
          <Trophy className="w-7 h-7 text-brand-600" />
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          🚧 Coming Soon
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TourneyCrew Premium</h1>
        <p className="text-gray-500">
          We&apos;re working on a premium plan to support the community and unlock extra features.
          Check back soon!
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          What&apos;s planned
        </h2>
        <ul className="space-y-3">
          {UPCOMING_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
              <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
        <Bell className="w-6 h-6 text-brand-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-brand-900 mb-1">Want to be notified?</p>
        <p className="text-xs text-brand-700 mb-4">
          In the meantime, share your first tip and help other families!
        </p>
        <Link
          href="/tips/submit"
          className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          Share a Tip
        </Link>
      </div>
    </div>
  );
}
