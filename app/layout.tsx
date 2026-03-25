import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "TourneyCrew – Your Youth Tournament Weekend Guide",
    template: "%s | TourneyCrew",
  },
  description:
    "Family tips for parking, food, WiFi, and seating at youth sports tournaments. Volleyball, basketball, soccer, and baseball.",
  keywords: ["youth sports", "tournament guide", "family tips", "volleyball", "basketball", "soccer", "baseball"],
  openGraph: {
    type: "website",
    siteName: "TourneyCrew",
    title: "TourneyCrew – Your Youth Tournament Weekend Guide",
    description: "Family tips for parking, food, WiFi, and seating at youth sports tournaments.",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // silently fail if supabase not available
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
        <TopNav user={user} />
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
