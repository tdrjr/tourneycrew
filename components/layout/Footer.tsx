import Link from "next/link";
import { Trophy } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Trophy className="w-5 h-5 text-brand-400" />
              TourneyCrew
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Family-powered tips for parking, food, WiFi, and seating at youth sports tournaments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/tournaments", label: "Find Tournaments" },
                { href: "/tips/submit", label: "Share a Tip" },
                { href: "/sponsors", label: "Sponsor Us" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Sports</h3>
            <ul className="space-y-2 text-sm">
              {[
                { sport: "volleyball", emoji: "🏐" },
                { sport: "basketball", emoji: "🏀" },
                { sport: "soccer",     emoji: "⚽" },
                { sport: "baseball",   emoji: "⚾" },
              ].map(({ sport, emoji }) => (
                <li key={sport}>
                  <Link
                    href={`/tournaments?sport=${sport}`}
                    className="hover:text-white transition-colors capitalize"
                  >
                    {emoji} {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © {year} TourneyCrew. Made with ❤️ for sports families everywhere.
        </div>
      </div>
    </footer>
  );
}
