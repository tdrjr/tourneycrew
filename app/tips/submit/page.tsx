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

const sportEmoji: Record<string, string> = { volleyball: "🏐", basketball: "🏀", soccer: "⚽", baseball: "⚾" };

export default async function SubmitTipPage({ searchParams }: PageProps) {
  const { tournament: tournamentId } = await searchParams;
  const [preselectedTournament, recentTournaments] = await Promise.all([
    tournamentId ? getTournamentForTip(tournamentId) : null,
    getRecentTournaments(),
  ]);

  return (
    <div>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0D3B13, #1B5E20)", padding: "20px 16px", color: "#fff" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, fontFamily: "'Trebuchet MS', sans-serif" }}>
          ✏️ Share a Tip
        </h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
          Help other families at {preselectedTournament ? preselectedTournament.name : "a tournament"}
        </p>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Tournament selector */}
        {!preselectedTournament && recentTournaments.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#616161", marginBottom: 10 }}>
              📍 First, select the tournament:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
              {recentTournaments.map(t => (
                <a key={t.id} href={`/tips/submit?tournament=${t.id}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", background: "#fff", borderRadius: 12,
                  border: "1px solid #E0E0E0", textDecoration: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 22 }}>{sportEmoji[t.sport] || "🏆"}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#212121" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#9E9E9E" }}>{t.city}, {t.state}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: "#BDBDBD" }}>›</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tip form */}
        {preselectedTournament ? (
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px", border: "1px solid #E0E0E0" }}>
            <TipForm
              tournamentId={preselectedTournament.id}
              tournamentName={preselectedTournament.name}
            />
          </div>
        ) : (
          !recentTournaments.length && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
              <p style={{ margin: 0, fontSize: 14, color: "#9E9E9E" }}>No upcoming tournaments found. Check back soon!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
