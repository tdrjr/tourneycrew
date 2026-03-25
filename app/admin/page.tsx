import { createClient as createServiceClient } from "@supabase/supabase-js";
import { MessageSquare, Trophy, Users, ThumbsUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview" };

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getStats() {
  const supabase = serviceClient();
  const [
    { count: pendingTips },
    { count: approvedTips },
    { count: tournaments },
    { count: contributors },
  ] = await Promise.all([
    supabase.from("family_tips").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("family_tips").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("tournaments").select("*", { count: "exact", head: true }),
    supabase.from("contributors").select("*", { count: "exact", head: true }),
  ]);

  return {
    pendingTips: pendingTips || 0,
    approvedTips: approvedTips || 0,
    tournaments: tournaments || 0,
    contributors: contributors || 0,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const STAT_CARDS = [
    { label: "Pending Tips", value: stats.pendingTips, icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-50", href: "/admin/tips" },
    { label: "Approved Tips", value: stats.approvedTips, icon: ThumbsUp, color: "text-green-500", bg: "bg-green-50", href: "/admin/tips?status=approved" },
    { label: "Tournaments", value: stats.tournaments, icon: Trophy, color: "text-brand-500", bg: "bg-brand-50", href: "/admin/tournaments" },
    { label: "Contributors", value: stats.contributors, icon: Users, color: "text-purple-500", bg: "bg-purple-50", href: "/admin/tips" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, href }) => (
          <a key={label} href={href} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </a>
        ))}
      </div>

      {stats.pendingTips > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800">
            ⚠️ {stats.pendingTips} tip{stats.pendingTips > 1 ? "s" : ""} waiting for review.{" "}
            <a href="/admin/tips" className="underline hover:no-underline">
              Review now →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
