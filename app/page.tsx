import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/types";

const SPORTS = [
  { id: "volleyball", label: "Volleyball", emoji: "🏐", count: 47 },
  { id: "basketball", label: "Basketball", emoji: "🏀", count: 38 },
  { id: "soccer", label: "Soccer", emoji: "⚽", count: 52 },
  { id: "baseball", label: "Baseball", emoji: "⚾", count: 31 },
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

const sportColors: Record<string, { bg: string; text: string }> = {
  volleyball: { bg: "#FFF3E0", text: "#EF6C00" },
  basketball: { bg: "#FFEBEE", text: "#C62828" },
  soccer:     { bg: "#E8F5E9", text: "#2E7D32" },
  baseball:   { bg: "#E3F2FD", text: "#1565C0" },
};

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const colors = sportColors[tournament.sport] || { bg: "#F5F5F5", text: "#616161" };
  const sportEmoji = { volleyball: "🏐", basketball: "🏀", soccer: "⚽", baseball: "⚾" }[tournament.sport] || "🏆";

  const start = new Date(tournament.start_date + "T00:00:00");
  const end = new Date(tournament.end_date + "T00:00:00");
  const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    (tournament.start_date !== tournament.end_date
      ? "–" + end.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "") + ", " + start.getFullYear();

  return (
    <Link href={`/tournaments/${tournament.id}`} style={{
      display: "block", background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10,
      border: "1px solid #E0E0E0", textDecoration: "none",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>{sportEmoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#212121", lineHeight: 1.3 }}>{tournament.name}</div>
            <div style={{ fontSize: 12, color: "#757575", marginTop: 2 }}>{tournament.venue_name}</div>
          </div>
        </div>
        <span style={{ background: colors.bg, color: colors.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
          {tournament.sport.charAt(0).toUpperCase() + tournament.sport.slice(1)}
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 8, borderTop: "1px solid #F5F5F5" }}>
        <span style={{ fontSize: 12, color: "#757575" }}>📅 {dateStr}</span>
        <span style={{ fontSize: 12, color: "#757575" }}>📍 {tournament.city}, {tournament.state}</span>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const tournaments = await getUpcomingTournaments();

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0D3B13 0%, #1B5E20 50%, #2E7D32 100%)",
        padding: "32px 20px 28px", color: "#fff", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, fontFamily: "'Trebuchet MS', sans-serif", letterSpacing: -0.5, lineHeight: 1.2 }}>
          Your Tournament<br />Weekend Guide
        </h1>
        <p style={{ margin: "8px 0 20px", fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>
          Parking, food, WiFi & tips from parents who&apos;ve been there.
        </p>
        <form action="/tournaments" method="GET" style={{ position: "relative" }}>
          <input
            name="q"
            type="text"
            placeholder="Search tournaments or cities..."
            style={{
              width: "100%", boxSizing: "border-box", padding: "14px 16px 14px 44px", borderRadius: 12,
              border: "none", fontSize: 15, outline: "none", background: "rgba(255,255,255,0.95)",
              color: "#212121", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
        </form>
      </div>

      {/* Sport filters */}
      <div style={{ padding: "16px 16px 8px", display: "flex", gap: 8, overflowX: "auto" }} className="no-scrollbar">
        {SPORTS.map(s => (
          <Link key={s.id} href={`/tournaments?sport=${s.id}`} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20,
            border: "2px solid #E0E0E0", background: "#fff", cursor: "pointer", whiteSpace: "nowrap",
            fontSize: 13, fontWeight: 600, color: "#616161", textDecoration: "none", transition: "all 0.2s",
          }}>
            <span>{s.emoji}</span> {s.label} <span style={{ fontSize: 11, opacity: 0.6 }}>({s.count})</span>
          </Link>
        ))}
      </div>

      {/* Live banner */}
      {tournaments.length > 0 && (
        <Link href="/tournaments" style={{
          display: "flex", alignItems: "center", gap: 10, margin: "8px 16px", padding: "12px 16px",
          background: "linear-gradient(90deg, #FFF3E0, #FFECB3)", borderRadius: 12, textDecoration: "none",
        }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#C62828" }}>UPCOMING</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#424242" }}>
              {tournaments[0].name} — be the first to share a tip!
            </div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 18, color: "#BDBDBD" }}>›</span>
        </Link>
      )}

      {/* Tournament list */}
      <div style={{ padding: "8px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#212121" }}>Upcoming Tournaments</h2>
          <Link href="/tournaments" style={{ fontSize: 12, color: "#1B5E20", fontWeight: 600, textDecoration: "none" }}>View All →</Link>
        </div>

        {tournaments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#9E9E9E" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <p style={{ margin: 0, fontSize: 14 }}>No upcoming tournaments yet. Check back soon!</p>
          </div>
        ) : (
          <div className="desktop-grid">
            {tournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        )}
      </div>

      {/* Why TourneyCrew */}
      <div style={{ background: "#F1F8E9", padding: "20px 16px", borderTop: "1px solid #DCEDC8" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800, color: "#212121", textAlign: "center" }}>Why TourneyCrew?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "👨‍👩‍👧‍👦", title: "Community-Powered", desc: "Real tips from parents who've been there — not generic advice." },
            { icon: "🤖", title: "AI Quality Check", desc: "Every tip is reviewed by Claude to keep content helpful and safe." },
            { icon: "🏟️", title: "All Major Platforms", desc: "We pull data from SportsEngine, AES, GotSport, Perfect Game & more." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                {icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#212121" }}>{title}</div>
                <div style={{ fontSize: 13, color: "#757575", lineHeight: 1.4, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "24px 16px", textAlign: "center", background: "#fff", borderTop: "1px solid #E0E0E0" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#212121" }}>Know a great tip?</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#757575" }}>Share what you wish you&apos;d known. Other families will thank you.</p>
        <Link href="/tips/submit" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
          background: "#1B5E20", color: "#fff", fontWeight: 700, fontSize: 14, borderRadius: 12,
          textDecoration: "none", boxShadow: "0 4px 12px rgba(27,94,32,0.3)",
        }}>
          ✏️ Share a Tip
        </Link>
      </div>
    </div>
  );
}
