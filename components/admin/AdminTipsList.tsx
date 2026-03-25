"use client";

import { useState } from "react";
import { CheckCircle, XCircle, RotateCcw, ExternalLink } from "lucide-react";
import { TIP_CATEGORY_EMOJI, TIP_CATEGORY_LABELS } from "@/lib/utils";

export interface AdminTip {
  id: string;
  category: string;
  title: string;
  body: string;
  upvotes: number;
  status: string;
  ai_score: number | null;
  ai_moderated: boolean;
  created_at: string;
  tournament: { id: string; name: string; city: string; state: string } | null;
  contributor: { id: string; display_name: string } | null;
}

interface AdminTipsListProps {
  tips: AdminTip[];
}

type TipAction = "approved" | "rejected" | "remoderate";

export function AdminTipsList({ tips: initialTips }: AdminTipsListProps) {
  const [tips, setTips] = useState(initialTips);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(tipId: string, action: TipAction) {
    setLoading(tipId);
    try {
      const res = await fetch("/api/admin/tips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId, action }),
      });

      if (res.ok) {
        if (action === "remoderate") {
          const data = await res.json();
          setTips((prev) =>
            prev.map((t) =>
              t.id === tipId
                ? { ...t, status: data.status, ai_score: data.ai_score, ai_moderated: true }
                : t
            )
          );
        } else {
          // Remove from list once actioned (status changed)
          setTips((prev) => prev.filter((t) => t.id !== tipId));
        }
      }
    } finally {
      setLoading(null);
    }
  }

  if (tips.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">No tips here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tips.map((tip) => (
        <div key={tip.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-base">{TIP_CATEGORY_EMOJI[tip.category as keyof typeof TIP_CATEGORY_EMOJI]}</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                  {TIP_CATEGORY_LABELS[tip.category as keyof typeof TIP_CATEGORY_LABELS]}
                </span>
                {tip.ai_score !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    tip.ai_score >= 0.7 ? "bg-green-100 text-green-700" :
                    tip.ai_score >= 0.4 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    AI: {Math.round(tip.ai_score * 100)}%
                  </span>
                )}
                {tip.tournament && (
                  <a
                    href={`/tournaments/${tip.tournament.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    {tip.tournament.name} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 text-sm mb-1">{tip.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{tip.body}</p>

              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {tip.contributor && <span>by {tip.contributor.display_name}</span>}
                <span>{new Date(tip.created_at).toLocaleDateString()}</span>
                <span>👍 {tip.upvotes}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => handleAction(tip.id, "approved")}
                disabled={loading === tip.id || tip.status === "approved"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => handleAction(tip.id, "rejected")}
                disabled={loading === tip.id || tip.status === "rejected"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                onClick={() => handleAction(tip.id, "remoderate")}
                disabled={loading === tip.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading === tip.id ? "animate-spin" : ""}`} />
                Re-run AI
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
