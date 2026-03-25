"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TipCategory } from "@/types";
import { TIP_CATEGORY_LABELS, TIP_CATEGORY_EMOJI } from "@/lib/utils";

interface TipFormProps {
  tournamentId: string;
  tournamentName: string;
}

const CATEGORIES: TipCategory[] = ["parking", "food", "wifi", "seating", "lodging", "general"];

export function TipForm({ tournamentId, tournamentName }: TipFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    category: "parking" as TipCategory,
    title: "",
    body: "",
    displayName: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tournamentId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      setStatus("success");
      setTimeout(() => router.push(`/tournaments/${tournamentId}`), 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="font-semibold text-green-900 mb-1">Tip submitted!</h3>
        <p className="text-sm text-green-700">
          Thanks for helping other families. Your tip is being reviewed and will appear shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">
          Sharing a tip for <span className="text-gray-900">{tournamentName}</span>
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: cat }))}
              className={`p-2.5 rounded-lg border text-sm font-medium text-center transition-all ${
                form.category === cat
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="text-xl mb-0.5">{TIP_CATEGORY_EMOJI[cat]}</div>
              <div className="text-xs">{TIP_CATEGORY_LABELS[cat]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Tip title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={100}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Best parking is Lot B near the south entrance"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Details <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          required
          rows={4}
          maxLength={500}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          placeholder="Share the details that would have helped you when you first arrived..."
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{form.body.length}/500</p>
      </div>

      {/* Display name (optional) */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
          Your name (optional)
        </label>
        <input
          id="displayName"
          type="text"
          maxLength={50}
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          placeholder="Tournament Parent"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {status === "error" && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Submitting…" : "Submit Tip"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Tips are reviewed by AI and our team before going live. Keep it helpful and family-friendly!
      </p>
    </form>
  );
}
