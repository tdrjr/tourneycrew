-- ============================================================
-- Migration 002: Add auth user_id to contributors
-- ============================================================

-- Add user_id column (references auth.users if using Supabase Auth)
ALTER TABLE contributors
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contributors_user_id ON contributors(user_id)
  WHERE user_id IS NOT NULL;

-- Allow authenticated users to read their own contributor profile
CREATE POLICY "users_read_own_contributor"
  ON contributors FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to insert their own contributor profile
CREATE POLICY "users_insert_own_contributor"
  ON contributors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own contributor profile
CREATE POLICY "users_update_own_contributor"
  ON contributors FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow public read of contributor display names (for tip attribution)
CREATE POLICY "public_read_contributors"
  ON contributors FOR SELECT
  USING (TRUE);
