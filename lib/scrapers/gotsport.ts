/**
 * GotSport Scraper
 *
 * GotSport (gotsport.com) is a widely used platform for youth soccer,
 * volleyball, and multi-sport tournaments. Targets public event search.
 */
import axios from "axios";
import * as cheerio from "cheerio";
import type { Tournament, SportType } from "@/types";

const SPORT_MAP: Record<string, SportType> = {
  soccer: "soccer",
  volleyball: "volleyball",
  basketball: "basketball",
  baseball: "baseball",
};

const BASE_URL = "https://www.gotsport.com/asp/events/eventsearch.asp";

export async function scrapeGotSport(): Promise<Partial<Tournament>[]> {
  const tournaments: Partial<Tournament>[] = [];

  for (const [sportKey, sportValue] of Object.entries(SPORT_MAP)) {
    try {
      const { data: html } = await axios.get(BASE_URL, {
        params: {
          sport: sportKey,
          type: "tournament",
          upcoming: 1,
        },
        headers: {
          "User-Agent": "TourneyCrew/1.0 (family tournament guide; contact: info@tourneycrew.com)",
          Accept: "text/html",
        },
        timeout: 12_000,
      });

      const $ = cheerio.load(html);

      // GotSport renders events in a table or .event-row divs
      $("table.event-list tr[data-id], .event-row, tr.EventRow").each((_, el) => {
        const cells = $(el).find("td");
        const name = cells.eq(0).text().trim() || $(el).find(".event-name").text().trim();
        const dateText = cells.eq(1).text().trim() || $(el).find(".event-date").text().trim();
        const location = cells.eq(2).text().trim() || $(el).find(".event-location").text().trim();
        const link = $(el).find("a").first().attr("href");

        if (!name) return;

        const [city, state] = parseLocation(location);
        const dates = parseDateRange(dateText);

        tournaments.push({
          name,
          sport: sportValue,
          venue_name: name, // GotSport often uses event name as venue context
          venue_address: location,
          city,
          state,
          start_date: dates.start,
          end_date: dates.end,
          source_url: link
            ? link.startsWith("http")
              ? link
              : `https://www.gotsport.com${link}`
            : null,
          source_platform: "gotsport",
          registration_open: true,
          age_groups: extractAgeGroups($(el).text()),
          divisions: [],
        });
      });
    } catch (err) {
      console.warn(`GotSport scrape failed for ${sportKey}:`, err);
    }
  }

  return tournaments;
}

function parseLocation(location: string): [string, string] {
  const parts = location.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    return [parts[parts.length - 2] || "", parts[parts.length - 1] || ""];
  }
  return [parts[0] || "", ""];
}

function extractAgeGroups(text: string): string[] {
  const matches = text.match(/\b(U\d{1,2}|\d{1,2}U|[A-Z]\d{2}|1[0-9]U|[6-9]U)\b/g);
  return matches ? [...new Set(matches)] : [];
}

function parseDateRange(dateText: string): { start: string; end: string } {
  const now = new Date().toISOString().split("T")[0];
  try {
    const cleaned = dateText.replace(/\s+/g, " ").trim();

    // "MM/DD/YYYY - MM/DD/YYYY" or "Month DD - DD, YYYY"
    const slashRange = cleaned.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s*[-–]\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (slashRange) {
      const start = new Date(slashRange[1]);
      const end = new Date(slashRange[2]);
      if (!isNaN(start.getTime())) {
        return {
          start: start.toISOString().split("T")[0],
          end: !isNaN(end.getTime()) ? end.toISOString().split("T")[0] : start.toISOString().split("T")[0],
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
