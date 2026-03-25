"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/tournaments", label: "Find Tournaments" },
  { href: "/tips/submit", label: "Share a Tip" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/myteam", label: "My Team" },
];

export function TopNav({ user }: { user: User | null }) {
  const pathname = usePathname();

  return (
    <div style={{ background: "#0D3B13", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: "#4CAF50",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 900, color: "#fff",
            }}>T</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 20, fontFamily: "'Trebuchet MS', sans-serif", letterSpacing: -0.5 }}>
              TourneyCrew
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden-mobile">
            {navItems.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{
                  padding: "8px 14px", borderRadius: 8, textDecoration: "none",
                  fontSize: 14, fontWeight: 600,
                  color: active ? "#fff" : "rgba(255,255,255,0.75)",
                  background: active ? "rgba(255,255,255,0.15)" : "transparent",
                  transition: "all 0.2s",
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {user ? (
              <>
                <Link href="/profile" style={{
                  padding: "7px 14px", borderRadius: 8, textDecoration: "none",
                  fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}>
                  👤 Profile
                </Link>
                <form action="/auth/signout" method="POST">
                  <button type="submit" style={{
                    padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                    background: "transparent",
                  }}>
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{
                  padding: "7px 14px", borderRadius: 8, textDecoration: "none",
                  fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}>
                  Sign In
                </Link>
                <Link href="/auth/signup" style={{
                  padding: "7px 14px", borderRadius: 8, textDecoration: "none",
                  fontSize: 13, fontWeight: 700, color: "#1B5E20",
                  background: "#fff",
                }}>
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile-only icon nav */}
            <div style={{ display: "flex", gap: 2 }} className="mobile-only">
              {[
                { href: "/", icon: "🏠" },
                { href: "/tournaments", icon: "🏆" },
                { href: "/myteam", icon: "⭐" },
                { href: "/tips/submit", icon: "✏️" },
              ].map(({ href, icon }) => (
                <Link key={href} href={href} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: pathname === href ? "rgba(255,255,255,0.15)" : "transparent",
                  borderRadius: 8, padding: "6px 8px", fontSize: 16, textDecoration: "none",
                }}>
                  {icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
