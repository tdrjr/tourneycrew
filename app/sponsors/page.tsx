import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sponsor TourneyCrew | Reach Sports Families",
  description: "Reach thousands of youth sports families every tournament weekend. Sponsor TourneyCrew to put your business in front of the right audience.",
};

const TIERS = [
  {
    name: "Bronze",
    price: "$150/mo",
    emoji: "🥉",
    color: "border-orange-300 bg-orange-50",
    headerColor: "text-orange-700",
    features: [
      "Logo on relevant tournament pages",
      "Listed in city business directory",
      "1 sport or city targeting",
    ],
  },
  {
    name: "Silver",
    price: "$300/mo",
    emoji: "🥈",
    color: "border-gray-400 bg-gray-50",
    headerColor: "text-gray-700",
    features: [
      "Everything in Bronze",
      "Highlighted placement in search results",
      "3 city/sport targeting combinations",
      "Monthly performance report",
    ],
  },
  {
    name: "Gold",
    price: "$500/mo",
    emoji: "🥇",
    color: "border-amber-400 bg-amber-50 shadow-md",
    headerColor: "text-amber-700",
    badge: "Most Popular",
    features: [
      "Everything in Silver",
      "Banner on homepage",
      "Priority placement on all tournament pages",
      "Unlimited targeting",
      "Dedicated account manager",
    ],
  },
];

const STATS = [
  { label: "Tournaments indexed",    value: "1,000+" },
  { label: "Families reached/month", value: "50K+" },
  { label: "States covered",         value: "48" },
  { label: "Avg session length",     value: "7 min" },
];

export default function SponsorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Reach families, right when it matters
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          TourneyCrew is the go-to guide for tournament weekends. Parents are actively looking for restaurants, hotels, and local services — be there when they search.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-14">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-extrabold text-brand-700">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tiers */}
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Sponsorship Tiers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border-2 p-6 flex flex-col ${tier.color}`}
          >
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {tier.badge}
              </span>
            )}
            <div className="text-3xl mb-2">{tier.emoji}</div>
            <h3 className={`text-xl font-bold mb-1 ${tier.headerColor}`}>{tier.name}</h3>
            <p className="text-2xl font-extrabold text-gray-900 mb-4">{tier.price}</p>
            <ul className="space-y-2 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={`mailto:sponsors@tourneycrew.com?subject=${tier.name} Sponsorship Inquiry`}
              className="mt-6 block text-center py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </a>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-brand-700 text-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Questions? Let&apos;s chat.</h2>
        <p className="text-brand-200 mb-6">
          We&apos;ll work with you to find the right fit and targeting strategy for your business.
        </p>
        <a
          href="mailto:sponsors@tourneycrew.com"
          className="inline-flex px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
        >
          Email us →
        </a>
      </div>
    </div>
  );
}
