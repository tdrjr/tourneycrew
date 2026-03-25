/**
 * Perfect Game Scraper
 *
 * Perfect Game (perfectgame.org) is the premier platform for youth
 * baseball and softball tournaments. Targets public event listings.
 */
import axios from "axios";
import * as cheerio from "cheerio";
import type { Tournament } from "@/types";

const BASE_URL = "https://www.perfectgame.org/Events/Default.aspx";

export async function scrapePerfectGame(): Promise<Partial<Tournament>[]> {
  const tournaments: Partial<Tournament>[] = [];

  try {
    const { data: html } = await axios.get(BASE_URL, {
      params: { EventType: "Tournament" },
      headers: {
        "User-Agent": "TourneyCrew/1.0 (family tournament guide; contact: info@tourneycrew.com)",
        Accept: "text/html",
      },
      timeout: 12_000,
    });

    const $ = cheerio.load(html);

    // Perfect Game uses a DataGrid / repeater pattern
    $("table.rgMasterTable tr:not(:first-child), .event-item, tr[class*='Event']").each((_, el) => {
      const cells = $(el).find("td");
      if (cells.length < 3) return;

      const name = cells.eq(0).text().trim();
      const dateText = cells.eq(1).text().trim();
      const location = cells.eq(2).text().trim();
      const link = cells.eq(0).find("a").attr("href");

      if (!name || name.toLowerCase().includes("event name")) return;

      const [city, state] = parseLocation(location);
      const dates = parseDateRange(dateText);

      const ageGroups = extractAgeGroups(name);

      tournaments.push({
        name,
        sport: "baseball",
        venue_name: extractVenueName(location) || name,
        venue_address: location,
        city,
        state,
        start_date: dates.start,
        end_date: dates.end,
        source_url: link
          ? link.startsWith("http")
            ? link
            : `https://www.perfectgame.org${link}`
          : null,
        source_platform: "perfectgame",
        registration_open: true,
        age_groups: ageGroups,
        divisions: extractDivisions(name),
      });
    });
  } catch (err) {
    console.warn("Perfect Game scrape failed:", err);
  }

  return tournaments;
}

function parseLocation(location: string): [string, string] {
  // "City, ST" or "City, State"
  const parts = location.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    const stateRaw = parts[parts.length - 1];
    // Normalize full state names to abbreviations if needed (keep as-is for now)
    return [parts[parts.length - 2] || parts[0], stateRaw];
  }
  return [parts[0] || "", ""];
}

function extractVenueName(location: string): string {
  // Perfect Game sometimes includes venue as first part: "Complex Name, City, ST"
  const parts = location.split(",").map((s) => s.trim());
  if (parts.length >= 3) return parts[0];
  return "";
}

function extractAgeGroups(name: string): string[] {
  const matches = name.match(/\b(\d{1,2}[Uu]|\d{2}[A-Z]|[A-Z]\d{2}|[89]U|1[0-9]U)\b/g);
  if (matches) return [...new Set(matches)];

  // Also catch patterns like "10 & Under", "13-14"
  const under = name.match(/(\d{1,2})\s*&?\s*[Uu]nder/g);
  return under ? under.map((m) => m.replace(/\s+/g, "")) : [];
}

function extractDivisions(name: string): string[] {
  const divMatches = name.match(/\b(AA|AAA|AAAA|Open|Elite|Select|Majors?|Wood[Bb]at)\b/g);
  return divMatches ? [...new Set(divMatches)] : [];
}

function parseDateRange(dateText: string): { start: string; end: string } {
  const now = new Date().toISOString().split("T")[0];
  try {
    const cleaned = dateText.replace(/\s+/g, " ").trim();

    // "June 14-16, 2026" or "Jun 14 - Jun 16, 2026"
    const monthRange = cleaned.match(
      /([A-Za-z]+\.?\s+\d{1,2})\s*[-–]\s*(\d{1,2}),?\s*(\d{4})/
    );
    if (monthRange) {
      const year = monthRange[3];
      const start = new Date(`${monthRange[1]}, ${year}`);
      const end = new Date(`${monthRange[1].replace(/\d+$/, "")} ${monthRange[2]}, ${year}`);
      if (!isNaN(start.getTime())) {
        return {
          start: start.toISOString().split("T")[0],
          end: !isNaN(end.getTime()) ? end.toISOString().split("T")[0] : start.toISOString().split("T")[0],
        };
      }
    }

    // "MM/DD/YYYY" single date
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
