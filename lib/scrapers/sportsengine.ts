/**
 * SportsEngine Scraper
 *
 * Scrapes tournament listings from SportsEngine's public search API.
 * SportsEngine powers many youth sports organizations — this targets
 * public event listings without authentication.
 */
import axios from "axios";
import * as cheerio from "cheerio";
import type { Tournament, SportType } from "@/types";

const SPORT_MAP: Record<string, SportType> = {
  volleyball: "volleyball",
  basketball: "basketball",
  soccer: "soccer",
  baseball: "baseball",
  softball: "baseball", // map softball → baseball category for now
};

const BASE_URL = "https://www.sportsengine.com/events/search";

export async function scrapeSportsEngine(): Promise<Partial<Tournament>[]> {
  const tournaments: Partial<Tournament>[] = [];

  for (const sport of Object.keys(SPORT_MAP)) {
    try {
      const { data: html } = await axios.get(BASE_URL, {
        params: { sport, type: "tournament" },
        headers: { "User-Agent": "TourneyCrew/1.0 (family tournament guide)" },
        timeout: 10_000,
      });

      const $ = cheerio.load(html);

      $(".event-card, [data-event-type='tournament']").each((_, el) => {
        const name = $(el).find(".event-name, h2, h3").first().text().trim();
        const venue = $(el).find(".venue-name").first().text().trim();
        const dateText = $(el).find(".event-dates").first().text().trim();
        const location = $(el).find(".event-location").first().text().trim();
        const link = $(el).find("a").first().attr("href");

        if (!name || !venue) return;

        const [city, state] = location.split(",").map((s) => s.trim());
        const dates = parseDateRange(dateText);

        tournaments.push({
          name,
          sport: SPORT_MAP[sport],
          venue_name: venue,
          venue_address: location,
          city: city || "",
          state: state || "",
          start_date: dates.start,
          end_date: dates.end,
          source_url: link ? `https://www.sportsengine.com${link}` : null,
          source_platform: "sportsengine",
          registration_open: true,
          age_groups: [],
          divisions: [],
        });
      });
    } catch (err) {
      console.warn(`SportsEngine scrape failed for ${sport}:`, err);
    }
  }

  return tournaments;
}

function parseDateRange(dateText: string): { start: string; end: string } {
  // Try to parse common formats: "Jan 15-17, 2025" or "Jan 15, 2025"
  const now = new Date().toISOString().split("T")[0];
  try {
    const cleaned = dateText.replace(/\s+/g, " ").trim();
    const parts = cleaned.split("-");
    if (parts.length === 2) {
      const start = new Date(parts[0].trim());
      const end = new Date(parts[1].trim());
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
        };
      }
    }
    const single = new Date(cleaned);
    if (!isNaN(single.getTime())) {
      const iso = single.toISOString().split("T")[0];
      return { start: iso, end: iso };
    }
  } catch {
    // fall through
  }
  return { start: now, end: now };
}
