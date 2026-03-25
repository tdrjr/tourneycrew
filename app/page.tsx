import Link from "next/link";
import { Search, Users, Star, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import type { Tournament } from "@/types";

const SPORTS = [
  { id: "volleyball", label: "Volleyball", emoji: "🏐", color: "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200" },
  { id: "basketball", label: "Basketball", emoji: "🏀", color: "bg-red-100 hover:bg-red-200 text-red-800 border-red-200" },
  { id: "soccer",     label: "Soccer",     emoji: "⚽", color: "bg-green-100 hover:bg-green-200 text-green-800 border-green-200" },
  { id: "baseball",   label: "Baseball",   emoji: "⚾", color: "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200" },
];

const WHY_US = [
  { icon: Users,  title: "Community-Powered",  desc: "Real tips from parents who've been there — not generic advice." },
  { icon: Star,   title: "AI Quality Check",   desc: "Every tip is reviewed by Claude to keep content helpful and safe." },
  { icon: Trophy, title: "All Major Platforms", desc: "We pull data from SportsEngine, AES, GotSport, Perfect Game, and more." },
];

async function getUpcomingTournaments(): Promise<Tournament[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .gte("start_date", new Date().toISOString().split("T")[0])
      .order("start_date", { ascending: true })
      .limit(6);
    return (data as Tournament[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const tournaments = await getUpcomingTournaments();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm mb-6">
            🏆 Free for every sports family
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5 text-balance">
            Your tournament weekend,<br className="hidden sm:block" /> sorted.
          </h1>
          <p className="text-lg text-brand-100 mb-8 max-w-xl mx-auto">
            Find parking, food, WiFi, and seating tips shared by parents just like you — for youth volleyball, basketball, soccer, and baseball tournaments.
          </p>

          {/* Search bar */}
          <form action="/tournaments" method="GET" className="flex max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="q"
                type="text"
                placeholder="Search by tournament name or city…"
                className="w-full pl-11 pr-4 py-3.5 rounded-l-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-white text-brand-700 font-semibold rounded-r-xl hover:bg-brand-50 transition-colors text-sm"
            >
              Search
            </button>
          </form>

          {/* Sport filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {SPORTS.map((s) => (
              <Link
                key={s.id}
                href={`/tournaments?sport=${s.id}`}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${s.color}`}
              >
                {s.emoji} {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why TourneyCrew ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {WHY_US.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 mb-3">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upcoming Tournaments ─────────────────────────────── */}
      {tournaments.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Tournaments</h2>
            <Link href="/tournaments" className="text-brand-600 text-sm font-medium hover:text-brand-700">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-brand-50 border-t border-brand-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Know a great tournament tip?
          </h2>
          <p className="text-gray-600 mb-6">
            Share what you wish you&apos;d known. Other families will thank you.
          </p>
          <Link
            href="/tips/submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            + Share a Tip
          </Link>
        </div>
      </section>
    </>
  );
}
