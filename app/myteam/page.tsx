"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const sports = [
  { name: "Volleyball", icon: "🏐" },
  { name: "Basketball", icon: "🏀" },
  { name: "Soccer", icon: "⚽" },
  { name: "Baseball", icon: "⚾" },
];

const ageGroups = ["8U", "10U", "12U", "14U", "16U", "18U", "Open"];

interface Team {
  name: string;
  sport: string;
  ageGroup: string;
}

export default function MyTeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("Volleyball");
  const [ageGroup, setAgeGroup] = useState("14U");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("myteam");
    if (stored) {
      try { setTeam(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  function saveTeam() {
    if (!name.trim()) return;
    const t = { name: name.trim(), sport, ageGroup };
    localStorage.setItem("myteam", JSON.stringify(t));
    setTeam(t);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (team && !editing) {
    return (
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{
          background: "linear-gradient(135deg, #0D3B13, #1B5E20)",
          borderRadius: 16, padding: "20px", color: "#fff", marginBottom: 16, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>My Team</div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, fontFamily: "'Trebuchet MS', sans-serif" }}>{team.name}</h2>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                {sports.find(s => s.name === team.sport)?.icon} {team.sport} • {team.ageGroup}
              </div>
            </div>
            <button onClick={() => { setName(team.name); setSport(team.sport); setAgeGroup(team.ageGroup); setEditing(true); }}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 600 }}>
              Edit ✏️
            </button>
          </div>
        </div>

        <div style={{ background: "#F1F8E9", borderRadius: 12, padding: "16px", marginBottom: 16, border: "1px solid #DCEDC8" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#1B5E20" }}>⭐ Find Your Tournaments</h3>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#424242", lineHeight: 1.5 }}>
            Browse upcoming {team.sport.toLowerCase()} tournaments for {team.ageGroup} teams.
          </p>
          <Link href={`/tournaments?sport=${team.sport.toLowerCase()}`} style={{
            display: "inline-block", padding: "10px 16px", background: "#1B5E20", color: "#fff",
            fontWeight: 700, fontSize: 13, borderRadius: 10, textDecoration: "none",
          }}>
            Find {team.sport} Tournaments →
          </Link>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: "16px", border: "1px solid #E0E0E0" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#212121" }}>💡 Quick Tips</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "📍", text: "Check tournament pages for parking tips before you go" },
              { icon: "🍔", text: "Browse food tips to find the best local spots near venues" },
              { icon: "✏️", text: "Share tips after attending to help other families" },
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{tip.icon}</span>
                <span style={{ fontSize: 13, color: "#616161", lineHeight: 1.4 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => { setTeam(null); localStorage.removeItem("myteam"); }}
          style={{ display: "block", width: "100%", marginTop: 16, padding: "10px", background: "none", border: "1px solid #E0E0E0", borderRadius: 10, color: "#9E9E9E", fontSize: 12, cursor: "pointer" }}>
          Remove team
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F1F8E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 12px" }}>⭐</div>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900, color: "#212121", fontFamily: "'Trebuchet MS', sans-serif" }}>
          {editing ? "Edit My Team" : "Set Up My Team"}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#757575", lineHeight: 1.5 }}>
          Save your team to get personalized tournament recommendations.
        </p>
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: "#616161", display: "block", marginBottom: 6 }}>Team Name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., TX Tornados"
        style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "2px solid #E0E0E0", fontSize: 15, outline: "none", marginBottom: 16 }} />

      <label style={{ fontSize: 13, fontWeight: 700, color: "#616161", display: "block", marginBottom: 8 }}>Sport</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {sports.map(s => (
          <button key={s.name} onClick={() => setSport(s.name)} style={{
            flex: 1, padding: "10px 4px", borderRadius: 10, cursor: "pointer", textAlign: "center",
            background: sport === s.name ? "#F1F8E9" : "#fff",
            border: sport === s.name ? "2px solid #1B5E20" : "2px solid #E0E0E0",
            color: sport === s.name ? "#1B5E20" : "#616161", fontWeight: 600, fontSize: 11,
          }}>
            <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
            {s.name}
          </button>
        ))}
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: "#616161", display: "block", marginBottom: 8 }}>Age Group</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {ageGroups.map(age => (
          <button key={age} onClick={() => setAgeGroup(age)} style={{
            padding: "8px 14px", borderRadius: 8, cursor: "pointer",
            background: ageGroup === age ? "#1B5E20" : "#fff",
            color: ageGroup === age ? "#fff" : "#616161",
            border: ageGroup === age ? "2px solid #1B5E20" : "2px solid #E0E0E0",
            fontWeight: 600, fontSize: 13,
          }}>
            {age}
          </button>
        ))}
      </div>

      <button onClick={saveTeam} style={{
        width: "100%", padding: "14px", borderRadius: 12, border: "none",
        background: name.trim() ? "#1B5E20" : "#E0E0E0",
        color: "#fff", fontWeight: 700, fontSize: 15, cursor: name.trim() ? "pointer" : "not-allowed",
        boxShadow: name.trim() ? "0 4px 12px rgba(27,94,32,0.3)" : "none",
      }}>
        {saved ? "✅ Saved!" : editing ? "Save Changes" : "Save My Team"}
      </button>

      <div style={{ background: "#FAFAFA", borderRadius: 10, padding: 14, marginTop: 16, border: "1px solid #E0E0E0" }}>
        <div style={{ fontSize: 12, color: "#9E9E9E", lineHeight: 1.5 }}>
          💾 Saved to your browser. No account needed. Your team info stays on this device.
        </div>
      </div>

      {editing && (
        <button onClick={() => setEditing(false)} style={{ display: "block", width: "100%", marginTop: 10, padding: "10px", background: "none", border: "1px solid #E0E0E0", borderRadius: 10, color: "#9E9E9E", fontSize: 13, cursor: "pointer" }}>
          Cancel
        </button>
      )}
    </div>
  );
}
