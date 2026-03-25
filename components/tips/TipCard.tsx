"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TIP_CATEGORY_EMOJI, TIP_CATEGORY_LABELS } from "@/lib/utils";
import type { FamilyTip } from "@/types";

interface TipCardProps {
  tip: FamilyTip;
}

export function TipCard({ tip }: TipCardProps) {
  const [votes, setVotes] = useState(tip.upvotes);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVote() {
    if (loading) return;
    setLoading(true);
    try {
      if (voted) {
        const res = await fetch(`/api/tips/vote?tipId=${tip.id}`, { method: "DELETE" });
        if (res.ok) {
          setVotes((v) => Math.max(0, v - 1));
          setVoted(false);
        }
      } else {
        const res = await fetch("/api/tips/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipId: tip.id }),
        });
        if (res.ok) {
          setVotes((v) => v + 1);
          setVoted(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="group">
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg" aria-hidden>
                {TIP_CATEGORY_EMOJI[tip.category]}
              </span>
              <Badge variant="category">
                {TIP_CATEGORY_LABELS[tip.category]}
              </Badge>
            </div>

            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {tip.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {tip.body}
            </p>

            {tip.contributor && (
              <p className="mt-2 text-xs text-gray-400">
                — {tip.contributor.display_name}
              </p>
            )}
          </div>

          {/* Vote button */}
          <button
            onClick={handleVote}
            disabled={loading}
            aria-label={voted ? `Remove upvote (${votes} votes)` : `Upvote tip (${votes} votes)`}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-lg border transition-all min-w-[48px] ${
              voted
                ? "border-brand-300 bg-brand-50 text-brand-600"
                : "border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-500"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
            <span className="text-xs font-semibold">{votes}</span>
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
