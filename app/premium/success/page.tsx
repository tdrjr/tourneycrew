import Link from "next/link";
import { Trophy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Welcome to Premium!" };

export default function PremiumSuccessPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-6">
        <Trophy className="w-8 h-8 text-brand-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">You&apos;re Premium!</h1>
      <p className="text-gray-500 mb-8">
        Thank you for supporting TourneyCrew. Your subscription is active and your
        supporter badge will appear on your tips.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/tournaments"
          className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
        >
          Browse Tournaments
        </Link>
        <Link
          href="/profile"
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
