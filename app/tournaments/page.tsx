import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Tournaments",
  description: "Browse upcoming youth sports tournaments with family tips for parking, food, WiFi, and seating.",
};

const sportColors: Record<string, { bg: string; text: string; emoji: string }> = {
  volleyball: { bg: "#FFF3E0", text: "#EF6C00", emoji: "🏐" },
  basketball: { bg: "#FFEBEE", text: "#C62828", emoji: "🏀" },
  soccer:     { bg: "#E8F5E9", text: "#2E7D32", emoji: "⚽" },
  baseball:   { bg: "#E3F2FD", text: "#1565C0", emoji: "⚾" },
};

const SPORTS = [
  { id: "", label: "All Sports" },
  { id: "volleyball", label: "🏐 Volleyball" },
  { id: "basketball", label: "🏀 Basketball" },
  { id: "soccer", label: "⚽ Soccer" },
  { id: "baseball", label: "⚾ Baseball" },
];

interface SearchParams { sport?: string; q?: string; }

async function getTournaments(sport?: string, q?: string): Promise<Tournament[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("tournaments")
      .select("*")
      .gte("end_date", new Date().toISOString().split("T")[0])
      .order("start_date", { ascending: true })
      .limit(50);

    if (sport) query = query.eq("sport", sport);
    if (q) query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`);

    const { data } = await query;
    return (data as Tournament[]) || [];
  } catch {
    return [];
  }
}

function TournamentCard({ t }: { t: Tournament }) {
  const c = sportColors[t.sport] || { bg: "#F5F5F5", text: "#616161", emoji: "🏆" };
  const start = new Date(t.start_date + "T00:00:00");
  const end = new Date(t.end_date + "T00:00:00");
  const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    (t.start_date !== t.end_date ? "–" + end.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "") +
    ", " + start.getFullYear();

  return (
    <Link href={`/tournaments/${t.id}`} style={{
      display: "block", background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10,
      border: "1px solid #E0E0E0", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{c.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#212121", lineHeight: 1.3 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: "#757575", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.venue_name}</div>
          </div>
        </div>
        <span style={{ background: c.bg, color: c.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 }}>
          {t.sport.charAt(0).toUpperCase() + t.sport.slice(1)}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8, borderTop: "1px solid #F5F5F5" }}>
        <span style={{ fontSize: 12, color: "#757575" }}>📅 {dateStr}</span>
        <span style={{ fontSize: 12, color: "#757575" }}>📍 {t.city}, {t.state}</span>
        {t.registration_open && <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 600 }}>✅ Open</span>}
      </div>
    </Link>
  );
}

export default async function TournamentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const sport = params.sport || "";
  const q = params.q || "";
  const tournaments = await getTournaments(sport, q);

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0D3B13, #1B5E20)", padding: "20px 16px", color: "#fff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, fontFamily: "'Trebuchet MS', sans-serif" }}>
          🏆 Find Tournaments
        </h1>
        <form action="/tournaments" method="GET" style={{ position: "relative" }}>
          {sport && <input type="hidden" name="sport" value={sport} />}
          <input name="q" type="text" defaultValue={q} placeholder="Search by name or city..."
            style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px 12px 40px", borderRadius: 10, border: "none", fontSize: 14, outline: "none", background: "rgba(255,255,255,0.95)", color: "#212121" }} />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        </form>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "12px 16px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #E0E0E0" }} className="no-scrollbar">
        {SPORTS.map(s => (
          <Link key={s.id} href={`/tournaments${s.id ? `?sport=${s.id}` : ""}${q ? `${s.id ? "&" : "?"}q=${q}` : ""}`} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            background: sport === s.id ? "#1B5E20" : "#fff",
            color: sport === s.id ? "#fff" : "#616161",
            border: sport === s.id ? "1px solid #1B5E20" : "1px solid #E0E0E0",
            textDecoration: "none",
          }}>
            {s.label}
          </Link>
        ))}
      </div>

      <div style={{ padding: "12px 16px 20px" }}>
        <div style={{ fontSize: 13, color: "#9E9E9E", marginBottom: 12 }}>
          {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""} found
        </div>
        {tournaments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ margin: "0 0 8px", color: "#424242" }}>No tournaments found</h3>
            <p style={{ margin: 0, fontSize: 13, color: "#9E9E9E" }}>Try a different sport or search term</p>
            <Link href="/tournaments" style={{ display: "inline-block", marginTop: 12, color: "#1B5E20", fontWeight: 600, textDecoration: "none" }}>Clear filters →</Link>
          </div>
        ) : (
          tournaments.map(t => <TournamentCard key={t.id} t={t} />)
        )}
      </div>
    </div>
  );
}
