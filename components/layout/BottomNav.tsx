"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/tournaments", icon: "🏆", label: "Guide" },
  { href: "/myteam", icon: "⭐", label: "My Team" },
  { href: "/tips/submit", icon: "✏️", label: "Add Tip" },
  { href: "/sponsors", icon: "💼", label: "Sponsors" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: "#fff", borderTop: "1px solid #E0E0E0", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-around", padding: "6px 0 8px" }}>
        {items.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              color: active ? "#1B5E20" : "#9E9E9E", textDecoration: "none",
              transition: "color 0.2s", padding: "4px 8px",
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
