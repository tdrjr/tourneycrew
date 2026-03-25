// ─── Core Domain Types ────────────────────────────────────────────────────────

export type SportType = "volleyball" | "basketball" | "soccer" | "baseball";
export type TipCategory = "parking" | "food" | "wifi" | "seating" | "lodging" | "general";
export type SponsorTier = "bronze" | "silver" | "gold";
export type TipStatus = "pending" | "approved" | "rejected";

export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  venue_name: string;
  venue_address: string;
  city: string;
  state: string;
  start_date: string;        // ISO date string
  end_date: string;
  age_groups: string[];
  divisions: string[];
  source_url: string | null;
  source_platform: string | null;  // "sportsengine" | "aes" | "gotsport" | "perfectgame" | "teamsnap"
  registration_open: boolean;
  entry_fee: number | null;
  teams_count: number | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyTip {
  id: string;
  tournament_id: string;
  contributor_id: string | null;
  category: TipCategory;
  title: string;
  body: string;
  upvotes: number;
  status: TipStatus;
  ai_moderated: boolean;
  ai_score: number | null;          // 0–1 quality score from Claude
  created_at: string;
  contributor?: Contributor;
}

export interface Contributor {
  id: string;
  display_name: string;
  avatar_url: string | null;
  tip_count: number;
  karma: number;
  created_at: string;
}

export interface LocalBusiness {
  id: string;
  tournament_id: string | null;     // null = applies to all in city
  city: string;
  state: string;
  name: string;
  category: string;                 // "restaurant" | "hotel" | "grocery" | "gas" etc.
  address: string;
  google_place_id: string | null;
  rating: number | null;
  price_level: number | null;       // 1–4
  distance_miles: number | null;
  website: string | null;
  phone: string | null;
  hours: Record<string, string> | null;
  created_at: string;
}

export interface Sponsor {
  id: string;
  business_name: string;
  tier: SponsorTier;
  logo_url: string | null;
  website_url: string;
  tagline: string | null;
  city_targeting: string[] | null;  // null = all cities
  sport_targeting: SportType[] | null;
  active_from: string;
  active_until: string;
  created_at: string;
}

export interface PremiumSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: "active" | "canceled" | "past_due";
  current_period_end: string;
  created_at: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface TournamentsResponse {
  data: Tournament[];
  count: number;
  page: number;
  pageSize: number;
}

export interface TipModerationResult {
  approved: boolean;
  score: number;
  reason: string;
}

// ─── Filter / Query Params ────────────────────────────────────────────────────

export interface TournamentFilters {
  sport?: SportType;
  state?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  ageGroup?: string;
  page?: number;
  pageSize?: number;
}
