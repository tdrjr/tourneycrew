"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function TopNav({ user }: { user: User | null }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "🏠" },
    { href: "/tournaments", icon: "🏆" },
    { href: "/myteam", icon: "⭐" },
    { href: "/tips/submit", icon: "✏️" },
    { href: "/sponsors", icon: "💼" },
  ];

  return (
    <div style={{ background: "#0D3B13", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "#4CAF50",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900, color: "#fff",
            }}>T</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Trebuchet MS', sans-serif", letterSpacing: -0.5 }}>
              TourneyCrew
            </span>
          </Link>

          {/* Nav icons */}
          <div style={{ display: "flex", gap: 4 }}>
            {navItems.map(({ href, icon }) => (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: pathname === href ? "rgba(255,255,255,0.15)" : "transparent",
                borderRadius: 8, padding: "6px 8px", fontSize: 16, textDecoration: "none",
                transition: "background 0.2s",
              }}>
                {icon}
              </Link>
            ))}
            {user ? (
              <Link href="/profile" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px",
                fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none",
              }}>
                👤
              </Link>
            ) : (
              <Link href="/auth/login" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#4CAF50", borderRadius: 8, padding: "5px 10px",
                fontSize: 11, fontWeight: 700, color: "#fff", textDecoration: "none",
              }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
