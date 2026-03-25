"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PremiumCheckoutButtonProps {
  isSignedIn: boolean;
}

export function PremiumCheckoutButton({ isSignedIn }: PremiumCheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (!isSignedIn) {
      router.push("/auth/login?next=/premium");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Checkout failed");

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Redirecting to checkout…"
          : isSignedIn
          ? "Subscribe — $4.99/month"
          : "Sign in to subscribe"}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center mt-2">{error}</p>
      )}
    </div>
  );
}
