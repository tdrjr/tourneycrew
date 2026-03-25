import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
