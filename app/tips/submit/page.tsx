import { createClient } from "@/lib/supabase/server";
import { TipForm } from "@/components/tips/TipForm";
import type { Tournament } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share a Tip",
  description: "Share parking, food, WiFi, and seating tips to help other sports families.",
};

interface PageProps {
  searchParams: Promise<{ tournament?: string }>;
}

async function getTournamentForTip(id: string): Promise<Tournament | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("id, name, sport, city, state, start_date, end_date")
      .eq("id", id)
      .single();
    return data as Tournament | null;
  } catch {
    return null;
  }
}

async function getRecentTournaments(): Promise<Tournament[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("id, name, sport, city, state, start_date, end_date")
      .gte("end_date", new Date().toISOString().split("T")[0])
      .order("start_date", { ascending: true })
      .limit(20);
    return (data as Tournament[]) || [];
  } catch {
    return [];
  }
}

export default async function SubmitTipPage({ searchParams }: PageProps) {
  const { tournament: tournamentId } = await searchParams;
  const [preselectedTournament, recentTournaments] = await Promise.all([
    tournamentId ? getTournamentForTip(tournamentId) : null,
    getRecentTournaments(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share a Tip</h1>
        <p className="text-gray-500">
          Your experience helps other families prepare. Tips are reviewed before going live.
        </p>
      </div>

      {/* Tournament selector (if no preselected) */}
      {!preselectedTournament && recentTournaments.length > 0 && (
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-900 mb-3">
            📍 First, select the tournament you attended:
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {recentTournaments.map((t) => (
              <a
                key={t.id}
                href={`/tips/submit?tournament=${t.id}`}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 hover:border-brand-300 hover:shadow-sm transition-all text-sm"
              >
                <div>
                  <div className="font-medium text-gray-900">{t.name}</div>
                  <div className="text-gray-400">{t.city}, {t.state}</div>
                </div>
                <span className="text-gray-400">→</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {preselectedTournament ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <TipForm
            tournamentId={preselectedTournament.id}
            tournamentName={preselectedTournament.name}
          />
        </div>
      ) : (
        !recentTournaments.length && (
          <div className="text-center py-14">
            <p className="text-gray-500">No upcoming tournaments found. Check back soon!</p>
          </div>
        )
      )}
    </div>
  );
}
