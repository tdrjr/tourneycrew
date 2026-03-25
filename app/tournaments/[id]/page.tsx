import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TipCard } from "@/components/tips/TipCard";
import type { Tournament, FamilyTip, TipCategory } from "@/types";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }>; }

const sportEmoji: Record<string, string> = { volleyball: "🏐", basketball: "🏀", soccer: "⚽", baseball: "⚾" };
const sportColors: Record<string, { bg: string; text: string }> = {
  volleyball: { bg: "#FFF3E0", text: "#EF6C00" },
  basketball: { bg: "#FFEBEE", text: "#C62828" },
  soccer:     { bg: "#E8F5E9", text: "#2E7D32" },
  baseball:   { bg: "#E3F2FD", text: "#1565C0" },
};
const categoryInfo: Record<string, { icon: string; label: string; bg: string; text: string }> = {
  parking:  { icon: "🅿️", label: "Parking",  bg: "#E3F2FD", text: "#1565C0" },
  food:     { icon: "🍔", label: "Food",     bg: "#FFF3E0", text: "#EF6C00" },
  wifi:     { icon: "📶", label: "WiFi",     bg: "#E8F5E9", text: "#2E7D32" },
  seating:  { icon: "💺", label: "Seating",  bg: "#FBE9E7", text: "#BF360C" },
  lodging:  { icon: "🏨", label: "Lodging",  bg: "#E8EAF6", text: "#283593" },
  general:  { icon: "💡", label: "General",  bg: "#F5F5F5", text: "#616161" },
};

async function getTournament(id: string): Promise<Tournament | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("tournaments").select("*").eq("id", id).single();
    return data as Tournament | null;
  } catch { return null; }
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
  } catch { return []; }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) return {};
  return {
    title: tournament.name,
    description: tournament.ai_summary || `Family tips for ${tournament.name} in ${tournament.city}, ${tournament.state}.`,
  };
}

const TIP_CATEGORIES: TipCategory[] = ["parking", "food", "wifi", "seating", "lodging", "general"];

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tournament, tips] = await Promise.all([getTournament(id), getTips(id)]);
  if (!tournament) notFound();

  const sc = sportColors[tournament.sport] || { bg: "#F5F5F5", text: "#616161" };
  const emoji = sportEmoji[tournament.sport] || "🏆";

  const start = new Date(tournament.start_date + "T00:00:00");
  const end = new Date(tournament.end_date + "T00:00:00");
  const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    (tournament.start_date !== tournament.end_date ? "–" + end.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "") +
    ", " + start.getFullYear();

  const tipsByCategory = TIP_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = tips.filter(t => t.category === cat);
    return acc;
  }, {} as Record<TipCategory, FamilyTip[]>);

  const categoriesWithTips = TIP_CATEGORIES.filter(c => tipsByCategory[c].length > 0);

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0D3B13, #1B5E20)", padding: "20px 16px", color: "#fff" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {emoji} {tournament.sport.charAt(0).toUpperCase() + tournament.sport.slice(1)}
          </span>
          {tournament.registration_open && (
            <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              ✅ Open
            </span>
          )}
        </div>
        <h1 style={{ margin: "8px 0 4px", fontSize: 20, fontWeight: 900, fontFamily: "'Trebuchet MS', sans-serif", lineHeight: 1.2 }}>
          {tournament.name}
        </h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{tournament.venue_name} • {tournament.city}, {tournament.state}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10, fontSize: 12, opacity: 0.85 }}>
          <span>📅 {dateStr}</span>
          {tournament.age_groups.length > 0 && <span>👥 {tournament.age_groups.join(", ")}</span>}
          <span>💬 {tips.length} tip{tips.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto" }} className="no-scrollbar">
        {[
          { icon: "📍", label: "Venue", value: tournament.venue_name, sub: tournament.city + ", " + tournament.state },
          { icon: "📅", label: "Dates", value: dateStr, sub: "" },
          ...(tournament.entry_fee ? [{ icon: "💵", label: "Entry Fee", value: `$${tournament.entry_fee}`, sub: "" }] : []),
        ].map((info, i) => (
          <div key={i} style={{ minWidth: 100, background: "#fff", borderRadius: 12, padding: "10px 12px", border: "1px solid #E0E0E0", flexShrink: 0 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{info.icon}</div>
            <div style={{ fontSize: 10, color: "#9E9E9E", fontWeight: 600, textTransform: "uppercase" }}>{info.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#212121", marginTop: 2, lineHeight: 1.3 }}>{info.value}</div>
            {info.sub && <div style={{ fontSize: 10, color: "#9E9E9E", marginTop: 2 }}>{info.sub}</div>}
          </div>
        ))}
        {tournament.source_url && (
          <a href={tournament.source_url} target="_blank" rel="noopener noreferrer" style={{ minWidth: 100, background: "#E8F5E9", borderRadius: 12, padding: "10px 12px", border: "1px solid #A5D6A7", flexShrink: 0, textDecoration: "none" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>🔗</div>
            <div style={{ fontSize: 10, color: "#2E7D32", fontWeight: 600, textTransform: "uppercase" }}>Official</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1B5E20", marginTop: 2 }}>Event Page</div>
          </a>
        )}
      </div>

      {tournament.ai_summary && (
        <div style={{ margin: "0 16px 12px", padding: "12px 14px", background: "#F1F8E9", borderRadius: 12, border: "1px solid #DCEDC8" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2E7D32", marginBottom: 4 }}>💡 Quick Summary</div>
          <p style={{ margin: 0, fontSize: 13, color: "#424242", lineHeight: 1.5 }}>{tournament.ai_summary}</p>
        </div>
      )}

      <div style={{ padding: "4px 16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#212121" }}>
            Family Tips {tips.length > 0 && <span style={{ color: "#9E9E9E", fontWeight: 400, fontSize: 14 }}>({tips.length})</span>}
          </h2>
          <Link href={`/tips/submit?tournament=${id}`} style={{
            padding: "8px 14px", background: "#1B5E20", color: "#fff", fontWeight: 700, fontSize: 13,
            borderRadius: 10, textDecoration: "none",
          }}>
            ✏️ Add Tip
          </Link>
        </div>

        {tips.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 14, border: "2px dashed #E0E0E0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🌟</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, color: "#424242" }}>Be the first to share a tip!</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#9E9E9E" }}>Help other families know what to expect.</p>
            <Link href={`/tips/submit?tournament=${id}`} style={{
              display: "inline-block", padding: "10px 20px", background: "#1B5E20", color: "#fff",
              fontWeight: 700, fontSize: 14, borderRadius: 10, textDecoration: "none",
            }}>
              Share a Tip
            </Link>
          </div>
        ) : (
          <div>
            {categoriesWithTips.map(cat => {
              const ci = categoryInfo[cat] || { icon: "💡", label: cat, bg: "#F5F5F5", text: "#616161" };
              return (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ background: ci.bg, color: ci.text, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      {ci.icon} {ci.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#9E9E9E" }}>({tipsByCategory[cat].length})</span>
                  </div>
                  {tipsByCategory[cat].map(tip => <TipCard key={tip.id} tip={tip} />)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <Link href="/tournaments" style={{ fontSize: 13, color: "#1B5E20", fontWeight: 600, textDecoration: "none" }}>
          ← Back to Tournaments
        </Link>
      </div>
    </div>
  );
}
