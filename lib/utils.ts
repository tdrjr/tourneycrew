import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays } from "date-fns";
import type { SportType, TipCategory } from "@/types";

// ─── Tailwind Utility ─────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function formatTournamentDates(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  if (differenceInDays(e, s) === 0) return format(s, "MMM d, yyyy");
  if (s.getMonth() === e.getMonth()) {
    return `${format(s, "MMM d")}–${format(e, "d, yyyy")}`;
  }
  return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
}

export function isTournamentUpcoming(startDate: string): boolean {
  return parseISO(startDate) >= new Date();
}

export function tournamentDaysAway(startDate: string): number {
  return differenceInDays(parseISO(startDate), new Date());
}

// ─── Sport Helpers ────────────────────────────────────────────────────────────

export const SPORT_LABELS: Record<SportType, string> = {
  volleyball: "Volleyball",
  basketball: "Basketball",
  soccer: "Soccer",
  baseball: "Baseball",
};

export const SPORT_COLORS: Record<SportType, string> = {
  volleyball: "bg-orange-100 text-orange-800",
  basketball: "bg-red-100 text-red-800",
  soccer:     "bg-green-100 text-green-800",
  baseball:   "bg-blue-100 text-blue-800",
};

export const SPORT_EMOJI: Record<SportType, string> = {
  volleyball: "🏐",
  basketball: "🏀",
  soccer:     "⚽",
  baseball:   "⚾",
};

// ─── Tip Category Helpers ─────────────────────────────────────────────────────

export const TIP_CATEGORY_LABELS: Record<TipCategory, string> = {
  parking:  "Parking",
  food:     "Food & Drinks",
  wifi:     "WiFi",
  seating:  "Seating",
  lodging:  "Lodging",
  general:  "General",
};

export const TIP_CATEGORY_EMOJI: Record<TipCategory, string> = {
  parking: "🅿️",
  food:    "🍔",
  wifi:    "📶",
  seating: "🪑",
  lodging: "🏨",
  general: "💡",
};

// ─── String Helpers ───────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatAddress(city: string, state: string): string {
  return `${city}, ${state}`;
}
