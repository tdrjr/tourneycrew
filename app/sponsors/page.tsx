import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor TourneyCrew | Reach Sports Families",
  description: "Reach thousands of youth sports families every tournament weekend.",
};

const tiers = [
  {
    name: "Premium", price: 500, color: "#FFB300", bg: "#FFFDE7", icon: "👑", best: true,
    perks: ["Top banner above the fold", "Exclusive category sponsorship", "Full logo + description + offer", "Featured in tournament emails", "Social media shoutout", "Analytics dashboard"],
  },
  {
    name: "Featured", price: 300, color: "#1B5E20", bg: "#F1F8E9", icon: "⭐", best: false,
    perks: ["Featured section placement", "Logo + description + offer", "Included in guide emails", "Social media mention"],
  },
  {
    name: "Standard", price: 150, color: "#616161", bg: "#FAFAFA", icon: "📌", best: false,
    perks: ["Sponsor directory listing", "Business name + offer text", "Link to website", "Basic analytics"],
  },
];

export default function SponsorsPage() {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0D3B13, #1B5E20)", padding: "28px 16px", color: "#fff", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, fontFamily: "'Trebuchet MS', sans-serif" }}>
          Reach Tournament Families
        </h1>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>
          Thousands of families search for food, activities & services every tournament weekend.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "16px", justifyContent: "center" }}>
        {[
          { num: "168", label: "Tournaments" },
          { num: "50K+", label: "Families/mo" },
          { num: "92%", label: "Mobile" },
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "14px 8px", textAlign: "center", border: "1px solid #E0E0E0" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#1B5E20" }}>{stat.num}</div>
            <div style={{ fontSize: 11, color: "#9E9E9E", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        {tiers.map((tier, i) => (
          <div key={i} style={{
            background: tier.bg, borderRadius: 16, padding: "20px", marginBottom: 12,
            border: tier.best ? `2px solid ${tier.color}` : "1px solid #E0E0E0",
            boxShadow: tier.best ? "0 4px 20px rgba(255,179,0,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
            position: "relative", overflow: "hidden",
          }}>
            {tier.best && (
              <div style={{ position: "absolute", top: 12, right: -28, background: tier.color, color: "#fff", padding: "4px 32px", fontSize: 10, fontWeight: 800, transform: "rotate(45deg)", letterSpacing: 1 }}>
                BEST
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{tier.icon}</div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: tier.color }}>{tier.name}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#212121" }}>${tier.price}</div>
                <div style={{ fontSize: 11, color: "#9E9E9E" }}>per tournament</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tier.perks.map((perk, j) => (
                <div key={j} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#616161" }}>
                  <span style={{ color: "#4CAF50", fontWeight: 700 }}>✓</span> {perk}
                </div>
              ))}
            </div>
            <a href={`mailto:sponsors@tourneycrew.com?subject=${tier.name} Sponsorship Inquiry`} style={{
              display: "block", width: "100%", marginTop: 16, padding: "12px", borderRadius: 10, border: "none",
              background: tier.best ? tier.color : tier.color === "#616161" ? "#424242" : "#1B5E20",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", textDecoration: "none", textAlign: "center",
            }}>
              Get Started — ${tier.price}
            </a>
          </div>
        ))}
        <p style={{ textAlign: "center", fontSize: 12, color: "#BDBDBD", marginTop: 8 }}>
          Questions? Email <a href="mailto:sponsors@tourneycrew.com" style={{ color: "#1B5E20" }}>sponsors@tourneycrew.com</a>
        </p>
      </div>
    </div>
  );
}
