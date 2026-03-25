import Link from "next/link";
import type { Sponsor } from "@/types";

interface SponsorBannerProps {
  sponsor: Sponsor;
  compact?: boolean;
}

const TIER_STYLES = {
  gold:   "bg-amber-50 border-amber-200",
  silver: "bg-gray-50 border-gray-200",
  bronze: "bg-orange-50 border-orange-200",
};

const TIER_LABEL_STYLES = {
  gold:   "text-amber-600",
  silver: "text-gray-500",
  bronze: "text-orange-600",
};

export function SponsorBanner({ sponsor, compact = false }: SponsorBannerProps) {
  if (compact) {
    return (
      <Link
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-xs ${TIER_STYLES[sponsor.tier]} hover:shadow-sm transition-shadow`}
      >
        <span className={`font-semibold uppercase tracking-wide ${TIER_LABEL_STYLES[sponsor.tier]}`}>
          {sponsor.tier} Sponsor
        </span>
        <span className="text-gray-800 font-medium">{sponsor.business_name}</span>
        {sponsor.tagline && (
          <span className="text-gray-500 hidden sm:block">— {sponsor.tagline}</span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={sponsor.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-5 rounded-xl border ${TIER_STYLES[sponsor.tier]} hover:shadow-md transition-shadow group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${TIER_LABEL_STYLES[sponsor.tier]}`}>
            {sponsor.tier} Sponsor
          </p>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">
            {sponsor.business_name}
          </h3>
          {sponsor.tagline && (
            <p className="text-gray-500 text-sm mt-1">{sponsor.tagline}</p>
          )}
        </div>
        {sponsor.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sponsor.logo_url}
            alt={`${sponsor.business_name} logo`}
            className="w-16 h-16 object-contain rounded-lg"
          />
        )}
      </div>
      <p className="mt-3 text-xs text-brand-600 font-medium">Visit website →</p>
    </Link>
  );
}
