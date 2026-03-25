import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import type { Tournament, SportType } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Tournaments",
  description: "Browse upcoming youth sports tournaments with family tips for parking, food, WiFi, and seating.",
};

const SPORTS: { id: SportType; label: string; emoji: string }[] = [
  { id: "volleyball", label: "Volleyball", emoji: "🏐" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "soccer",     label: "Soccer",     emoji: "⚽" },
  { id: "baseball",   label: "Baseball",   emoji: "⚾" },
];

interface SearchParams {
  sport?: string;
  state?: string;
  q?: string;
  page?: string;
}

async function getTournaments(params: SearchParams): Promise<{ data: Tournament[]; count: number }> {
  try {
    const supabase = await createClient();
    const page = parseInt(params.page || "1", 10);
    const pageSize = 12;

    let query = supabase
      .from("tournaments")
      .select("*", { count: "exact" })
      .gte("end_date", new Date().toISOString().split("T")[0])
      .order("start_date", { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (params.sport) query = query.eq("sport", params.sport);
    if (params.state) query = query.eq("state", params.state);
    if (params.q) query = query.ilike("name", `%${params.q}%`);

    const { data, count } = await query;
    return { data: (data as Tournament[]) || [], count: count || 0 };
  } catch {
    return { data: [], count: 0 };
  }
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { data: tournaments, count } = await getTournaments(params);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Tournaments</h1>
        <p className="text-gray-500">Browse upcoming events and read family tips before you go.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Sport filter */}
        <div className="flex flex-wrap gap-2">
          <a
            href="/tournaments"
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              !params.sport
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            All Sports
          </a>
          {SPORTS.map((s) => (
            <a
              key={s.id}
              href={`/tournaments?sport=${s.id}${params.q ? `&q=${params.q}` : ""}${params.state ? `&state=${params.state}` : ""}`}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                params.sport === s.id
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {s.emoji} {s.label}
            </a>
          ))}
        </div>

        {/* Search form */}
        <form method="GET" action="/tournaments" className="flex ml-auto">
          <input
            name="sport"
            type="hidden"
            value={params.sport || ""}
          />
          <input
            name="q"
            type="text"
            defaultValue={params.q}
            placeholder="Search tournaments…"
            className="px-4 py-2 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 text-white rounded-r-lg text-sm font-medium hover:bg-brand-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results count */}
      {count > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {tournaments.length} of {count} tournament{count !== 1 ? "s" : ""}
          {params.sport ? ` in ${params.sport}` : ""}
          {params.q ? ` matching "${params.q}"` : ""}
        </p>
      )}

      {/* Tournament grid */}
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No tournaments found</h2>
          <p className="text-gray-500 mb-6">
            Try adjusting your filters or check back soon — we add new events regularly.
          </p>
          <a href="/tournaments" className="text-brand-600 font-medium hover:text-brand-700">
            Clear filters →
          </a>
        </div>
      )}
    </div>
  );
}
