-- ============================================================
-- TourneyCrew – Initial Schema Migration
-- Run: supabase db push  OR  paste into Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── tournaments ──────────────────────────────────────────────

CREATE TABLE tournaments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  sport             TEXT NOT NULL CHECK (sport IN ('volleyball','basketball','soccer','baseball')),
  venue_name        TEXT NOT NULL,
  venue_address     TEXT NOT NULL,
  city              TEXT NOT NULL,
  state             TEXT NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  age_groups        TEXT[] DEFAULT '{}',
  divisions         TEXT[] DEFAULT '{}',
  source_url        TEXT UNIQUE,
  source_platform   TEXT,
  registration_open BOOLEAN DEFAULT TRUE,
  entry_fee         NUMERIC(8,2),
  teams_count       INTEGER,
  ai_summary        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tournaments_sport      ON tournaments(sport);
CREATE INDEX idx_tournaments_state      ON tournaments(state);
CREATE INDEX idx_tournaments_city       ON tournaments(city);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── contributors ─────────────────────────────────────────────

CREATE TABLE contributors (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL,
  avatar_url   TEXT,
  email        TEXT UNIQUE,
  tip_count    INTEGER DEFAULT 0,
  karma        INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── family_tips ──────────────────────────────────────────────

CREATE TABLE family_tips (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  contributor_id  UUID REFERENCES contributors(id) ON DELETE SET NULL,
  category        TEXT NOT NULL CHECK (category IN ('parking','food','wifi','seating','lodging','general')),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  upvotes         INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  ai_moderated    BOOLEAN DEFAULT FALSE,
  ai_score        NUMERIC(3,2),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tips_tournament ON family_tips(tournament_id);
CREATE INDEX idx_tips_status     ON family_tips(status);
CREATE INDEX idx_tips_category   ON family_tips(category);

-- ─── tip_votes ────────────────────────────────────────────────

CREATE TABLE tip_votes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tip_id         UUID NOT NULL REFERENCES family_tips(id) ON DELETE CASCADE,
  voter_session  TEXT NOT NULL,  -- anonymous session ID or user ID
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tip_id, voter_session)
);

-- Trigger to keep family_tips.upvotes in sync
CREATE OR REPLACE FUNCTION sync_tip_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE family_tips SET upvotes = upvotes + 1 WHERE id = NEW.tip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE family_tips SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.tip_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tip_votes_sync
  AFTER INSERT OR DELETE ON tip_votes
  FOR EACH ROW EXECUTE FUNCTION sync_tip_upvotes();

-- ─── local_businesses ─────────────────────────────────────────

CREATE TABLE local_businesses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  address         TEXT NOT NULL,
  google_place_id TEXT,
  rating          NUMERIC(2,1),
  price_level     INTEGER CHECK (price_level BETWEEN 1 AND 4),
  distance_miles  NUMERIC(5,2),
  website         TEXT,
  phone           TEXT,
  hours           JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_city  ON local_businesses(city, state);
CREATE INDEX idx_businesses_cat   ON local_businesses(category);

-- ─── sponsors ─────────────────────────────────────────────────

CREATE TABLE sponsors (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name    TEXT NOT NULL,
  tier             TEXT NOT NULL CHECK (tier IN ('bronze','silver','gold')),
  logo_url         TEXT,
  website_url      TEXT NOT NULL,
  tagline          TEXT,
  city_targeting   TEXT[],
  sport_targeting  TEXT[],
  active_from      DATE NOT NULL,
  active_until     DATE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sponsors_active ON sponsors(active_from, active_until);

-- ─── premium_subscriptions ────────────────────────────────────

CREATE TABLE premium_subscriptions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL,
  stripe_subscription_id   TEXT UNIQUE NOT NULL,
  status                   TEXT DEFAULT 'active' CHECK (status IN ('active','canceled','past_due')),
  current_period_end       TIMESTAMPTZ NOT NULL,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security ───────────────────────────────────────

ALTER TABLE tournaments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_tips         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_businesses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_votes           ENABLE ROW LEVEL SECURITY;

-- Public read access for all main tables
CREATE POLICY "public_read_tournaments"      ON tournaments      FOR SELECT USING (TRUE);
CREATE POLICY "public_read_approved_tips"   ON family_tips      FOR SELECT USING (status = 'approved');
CREATE POLICY "public_read_businesses"      ON local_businesses FOR SELECT USING (TRUE);
CREATE POLICY "public_read_active_sponsors" ON sponsors         FOR SELECT USING (NOW() BETWEEN active_from AND active_until);

-- Authenticated insert for tips
CREATE POLICY "insert_tip"  ON family_tips FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "insert_vote" ON tip_votes   FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "delete_vote" ON tip_votes   FOR DELETE USING (TRUE);

-- ─── Seed Data (sample tournaments) ──────────────────────────

INSERT INTO tournaments (name, sport, venue_name, venue_address, city, state, start_date, end_date, age_groups, registration_open, ai_summary)
VALUES
  ('Spring Spike Classic', 'volleyball', 'Metro Sports Center', '1234 Arena Blvd', 'Kansas City', 'MO', '2026-04-12', '2026-04-13', ARRAY['12U','14U','16U','18U'], TRUE, 'A premier spring volleyball event at Metro Sports Center in Kansas City. Families will find excellent on-site food vendors, ample parking in Lot C, and comfortable bleacher seating with cushion rentals available.'),
  ('Midwest Hoops Challenge', 'basketball', 'REC Fieldhouse', '456 Court Ave', 'Overland Park', 'KS', '2026-04-19', '2026-04-20', ARRAY['10U','12U','14U','16U'], TRUE, 'The Midwest Hoops Challenge draws top youth basketball talent to the REC Fieldhouse. The venue has free WiFi in the lobby, a great concession stand, and dedicated family viewing areas on the upper deck.'),
  ('Southland Soccer Cup', 'soccer', 'Riverside Complex', '789 Field Rd', 'Lee''s Summit', 'MO', '2026-05-03', '2026-05-04', ARRAY['U8','U10','U12','U14','U16'], TRUE, 'Riverside Complex hosts this popular spring soccer tournament across eight natural grass fields. Bring lawn chairs — sideline space fills up fast. Food trucks are typically parked along Field Road throughout the weekend.'),
  ('Diamond Classic Baseball', 'baseball', 'Legends Field', '321 Diamond Dr', 'Olathe', 'KS', '2026-05-10', '2026-05-11', ARRAY['9U','10U','11U','12U'], TRUE, 'Legends Field''s Diamond Classic is a top-rated youth baseball tournament with well-maintained infields. Concessions open at 7am, and the parking lot opens 90 minutes before first pitch. Bring cash for entry.');
