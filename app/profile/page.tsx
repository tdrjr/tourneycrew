import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Star, MessageSquare, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TipCard } from "@/components/tips/TipCard";
import { formatTournamentDates } from "@/lib/utils";
import type { FamilyTip } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
};

interface ContributorWithTips {
  id: string;
  display_name: string;
  tip_count: number;
  karma: number;
  created_at: string;
  tips: (FamilyTip & { tournament: { name: string; id: string; start_date: string; end_date: string } | null })[];
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/profile");

  // Find contributor record linked to this user
  const { data: contributor } = await supabase
    .from("contributors")
    .select(`
      id, display_name, tip_count, karma, created_at,
      tips:family_tips(
        id, tournament_id, category, title, body, upvotes, status, ai_score, created_at,
        tournament:tournaments(id, name, start_date, end_date)
      )
    `)
    .eq("user_id", user.id)
    .single() as { data: ContributorWithTips | null };

  const displayName =
    contributor?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "TourneyCrew Member";

  const approvedTips = contributor?.tips?.filter((t) => t.status === "approved") || [];
  const pendingTips = contributor?.tips?.filter((t) => t.status === "pending") || [];
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-brand-600">
              {displayName[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              Member since {memberSince}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              {contributor?.tip_count || 0}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Tips shared</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
              <Star className="w-5 h-5 text-yellow-500" />
              {contributor?.karma || 0}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Karma points</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
              <Trophy className="w-5 h-5 text-orange-500" />
              {approvedTips.reduce((sum, t) => sum + t.upvotes, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Total upvotes</p>
          </div>
        </div>
      </div>

      {/* Pending tips notice */}
      {pendingTips.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-800">
            ⏳ You have {pendingTips.length} tip{pendingTips.length > 1 ? "s" : ""} pending review.
            They&apos;ll appear here once approved.
          </p>
        </div>
      )}

      {/* My tips */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">My Tips</h2>
        <Link
          href="/tips/submit"
          className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          + Share a Tip
        </Link>
      </div>

      {approvedTips.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="font-semibold text-gray-700 mb-2">No tips yet</h3>
          <p className="text-gray-500 text-sm mb-5">
            Share what you know — other families will thank you!
          </p>
          <Link
            href="/tips/submit"
            className="inline-flex px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700"
          >
            Share your first tip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedTips.map((tip) => (
            <div key={tip.id}>
              {tip.tournament && (
                <Link
                  href={`/tournaments/${tip.tournament.id}`}
                  className="block text-xs text-brand-600 hover:text-brand-700 font-medium mb-1.5 ml-1"
                >
                  {tip.tournament.name} ·{" "}
                  {formatTournamentDates(tip.tournament.start_date, tip.tournament.end_date)}
                </Link>
              )}
              <TipCard tip={tip} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
