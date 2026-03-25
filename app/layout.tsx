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
      <body className="min-h-screen bg-gray-100">
        <TopNav user={user} />
        {/* On mobile: full width. On desktop: centered max-width container */}
        <main className="pb-16 md:pb-0 max-w-screen-xl mx-auto">
          {children}
        </main>
        {/* Bottom nav only on mobile */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
