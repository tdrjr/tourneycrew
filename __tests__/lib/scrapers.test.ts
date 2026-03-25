import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

import { scrapePerfectGame } from "@/lib/scrapers/perfectgame";
import { scrapeGotSport } from "@/lib/scrapers/gotsport";

const PERFECT_GAME_HTML = `
<html><body>
<table class="rgMasterTable">
  <tr><th>Event Name</th><th>Date</th><th>Location</th></tr>
  <tr class="EventRow">
    <td><a href="/Events/Detail.aspx?event=1234">10U Open Championship</a></td>
    <td>June 14-16, 2026</td>
    <td>Cooperstown, NY</td>
  </tr>
  <tr class="EventRow">
    <td><a href="/Events/Detail.aspx?event=5678">12U AAA Showcase</a></td>
    <td>July 4-6, 2026</td>
    <td>Omaha, NE</td>
  </tr>
</table>
</body></html>
`;

const GOTSPORT_HTML = `
<html><body>
<table class="event-list">
  <tr data-id="abc">
    <td><a href="/events/abc">Spring Soccer Classic</a></td>
    <td>05/10/2026 - 05/11/2026</td>
    <td>Austin, TX</td>
  </tr>
</table>
</body></html>
`;

describe("Perfect Game scraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses tournaments from HTML", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: PERFECT_GAME_HTML });

    const results = await scrapePerfectGame();

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].sport).toBe("baseball");
    expect(results[0].source_platform).toBe("perfectgame");
    expect(results[0].name).toContain("10U");
  });

  it("extracts age groups from event name", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: PERFECT_GAME_HTML });

    const results = await scrapePerfectGame();
    const first = results[0];

    expect(first.age_groups).toBeDefined();
    expect(first.age_groups!.length).toBeGreaterThan(0);
  });

  it("returns empty array when request fails", async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error("Network error"));

    const results = await scrapePerfectGame();
    expect(results).toEqual([]);
  });
});

describe("GotSport scraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses tournaments from HTML", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: GOTSPORT_HTML });

    const results = await scrapeGotSport();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source_platform).toBe("gotsport");
  });

  it("returns empty array on network failure", async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error("Timeout"));

    const results = await scrapeGotSport();
    expect(results).toEqual([]);
  });
});
