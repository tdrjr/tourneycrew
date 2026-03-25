/**
 * Tournament Scraper Index
 *
 * Aggregates results from all supported platforms and upserts to Supabase.
 * Run via: npm run scrape
 */
import { createClient } from "@supabase/supabase-js";
import { scrapeSportsEngine } from "./sportsengine";
import { scrapeAES } from "./aes";
import { scrapeGotSport } from "./gotsport";
import { scrapePerfectGame } from "./perfectgame";
import type { Tournament } from "@/types";

const SCRAPERS: { name: string; fn: () => Promise<Partial<Tournament>[]> }[] = [
  { name: "SportsEngine", fn: scrapeSportsEngine },
  { name: "AES",          fn: scrapeAES },
  { name: "GotSport",     fn: scrapeGotSport },
  { name: "Perfect Game", fn: scrapePerfectGame },
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("🔍 Starting tournament scrape…");

  const results = await Promise.allSettled(
    SCRAPERS.map(({ fn }) => fn())
  );

  const tournaments: Partial<Tournament>[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const name = SCRAPERS[i].name;
    if (result.status === "fulfilled") {
      console.log(`  ✓ ${name}: ${result.value.length} tournaments`);
      tournaments.push(...result.value);
    } else {
      console.error(`  ✗ ${name} failed:`, result.reason);
    }
  }

  console.log(`✅ Scraped ${tournaments.length} tournaments — upserting…`);

  if (tournaments.length > 0) {
    const { error } = await supabase
      .from("tournaments")
      .upsert(tournaments, { onConflict: "source_url" });

    if (error) console.error("Upsert error:", error);
    else console.log("✅ Upsert complete.");
  }
}

main().catch(console.error);
