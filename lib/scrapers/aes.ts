/**
 * AES (Athletic Event Services) Scraper
 *
 * Scrapes tournament listings from AES's public event calendar.
 * Primarily used for volleyball and basketball events.
 */
import axios from "axios";
import * as cheerio from "cheerio";
import type { Tournament, SportType } from "@/types";

const AES_BASE = "https://www.aesathletics.com/schedule";

export async function scrapeAES(): Promise<Partial<Tournament>[]> {
  const tournaments: Partial<Tournament>[] = [];

  try {
    const { data: html } = await axios.get(AES_BASE, {
      headers: { "User-Agent": "TourneyCrew/1.0 (family tournament guide)" },
      timeout: 10_000,
    });

    const $ = cheerio.load(html);

    $(".tournament-row, .event-item").each((_, el) => {
      const name  = $(el).find(".tournament-name, .event-title").first().text().trim();
      const venue = $(el).find(".venue").first().text().trim();
      const date  = $(el).find(".date").first().text().trim();
      const sport = $(el).find(".sport").first().text().trim().toLowerCase() as SportType;
      const link  = $(el).find("a").first().attr("href");
      const loc   = $(el).find(".location").first().text().trim();

      if (!name) return;

      const [city, state] = loc.split(",").map((s) => s.trim());
      const iso = new Date().toISOString().split("T")[0];

      tournaments.push({
        name,
        sport: (["volleyball", "basketball", "soccer", "baseball"].includes(sport)
          ? sport
          : "volleyball") as SportType,
        venue_name: venue || name,
        venue_address: loc,
        city: city || "",
        state: state || "",
        start_date: date ? new Date(date).toISOString().split("T")[0] : iso,
        end_date: date ? new Date(date).toISOString().split("T")[0] : iso,
        source_url: link
          ? link.startsWith("http") ? link : `https://www.aesathletics.com${link}`
          : null,
        source_platform: "aes",
        registration_open: true,
        age_groups: [],
        divisions: [],
      });
    });
  } catch (err) {
    console.warn("AES scrape failed:", err);
  }

  return tournaments;
}
