import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Users, ExternalLink, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TipCard } from "@/components/tips/TipCard";
import { Badge } from "@/components/ui/Badge";
import { formatTournamentDates, SPORT_EMOJI, SPORT_LABELS, SPORT_COLORS, TIP_CATEGORY_LABELS, TIP_CATEGORY_EMOJI } from "@/lib/utils";
import type { Tournament, FamilyTip, TipCategory } from "@/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTournament(id: string): Promise<Tournament | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();
    return data as Tournament | null;
  } catch {
    return null;
  }
}

async function getTips(tournamentId: string): Promise<FamilyTip[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("family_tips")
      .select("*, contributor:contributors(id, display_name, avatar_url)")
      .eq("tournament_id", tournamentId)
      .eq("status", "approved")
      .order("upvotes", { ascending: false });
    return (data as FamilyTip[]) || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) return {};
  return {
    title: tournament.name,
    description: tournament.ai_summary || `Family tips for ${tournament.name} at ${tournament.venue_name} in ${tournament.city}, ${tournament.state}.`,
  };
}

const TIP_CATEGORIES: TipCategory[] = ["parking", "food", "wifi", "seating", "lodging", "general"];

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tournament, tips] = await Promise.all([getTournament(id), getTips(id)]);

  if (!tournament) notFound();

  const tipsByCategory = TIP_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = tips.filter((t) => t.category === cat);
    return acc;
  }, {} as Record<TipCategory, FamilyTip[]>);

  const categoriesWithTips = TIP_CATEGORIES.filter((c) => tipsByCategory[c].length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/tournaments" className="hover:text-brand-600">Tournaments</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 truncate max-w-xs">{tournament.name}</span>
      </nav>

      {/* Tournament header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${SPORT_COLORS[tournament.sport]}`}>
            {SPORT_EMOJI[tournament.sport]} {SPORT_LABELS[tournament.sport]}
          </span>
          {tournament.registration_open && <Badge variant="success">Registration Open</Badge>}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{tournament.name}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-800">{tournament.venue_name}</div>
              <div className="text-gray-500">{tournament.venue_address}</div>
              <div className="text-gray-500">{tournament.city}, {tournament.state}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{formatTournamentDates(tournament.start_date, tournament.end_date)}</span>
            </div>
            {tournament.age_groups.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span>{tournament.age_groups.join(" · ")}</span>
              </div>
            )}
            {tournament.source_url && (
              <a
                href={tournament.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700"
              >
                <ExternalLink className="w-4 h-4" />
                Official event page
              </a>
            )}
          </div>
        </div>

        {tournament.ai_summary && (
          <div className="mt-5 p-4 bg-brand-50 rounded-xl border border-brand-100">
            <p className="text-sm text-brand-800 leading-relaxed">
              <span className="font-semibold">💡 Quick Summary: </span>
              {tournament.ai_summary}
            </p>
          </div>
        )}
      </div>

      {/* Tips section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Family Tips {tips.length > 0 && <span className="text-gray-400 font-normal text-base">({tips.length})</span>}
        </h2>
        <Link
          href={`/tips/submit?tournament=${id}`}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          + Add a Tip
        </Link>
      </div>

      {tips.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="font-semibold text-gray-700 mb-2">Be the first to share a tip!</h3>
          <p className="text-gray-500 text-sm mb-5">
            Help other families know what to expect at this tournament.
          </p>
          <Link
            href={`/tips/submit?tournament=${id}`}
            className="inline-flex px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700"
          >
            Share a Tip
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {categoriesWithTips.map((cat) => (
            <div key={cat}>
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-3">
                <span className="text-xl">{TIP_CATEGORY_EMOJI[cat]}</span>
                {TIP_CATEGORY_LABELS[cat]}
                <span className="text-xs text-gray-400 font-normal">({tipsByCategory[cat].length})</span>
              </h3>
              <div className="space-y-3">
                {tipsByCategory[cat].map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
