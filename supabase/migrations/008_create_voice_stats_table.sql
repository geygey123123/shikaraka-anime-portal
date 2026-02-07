-- Migration 008: Create Voice Stats Table
-- This migration creates the voice_stats table for tracking user voice selections

-- ============================================
-- VOICE_STATS TABLE
-- ============================================
CREATE TABLE voice_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  voice_name TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_anime UNIQUE(user_id, anime_id)
);

-- Create indexes for performance
CREATE INDEX idx_voice_stats_anime_id ON voice_stats(anime_id);
CREATE INDEX idx_voice_stats_user_anime ON voice_stats(user_id, anime_id);
CREATE INDEX idx_voice_stats_voice_name ON voice_stats(voice_name);

-- Enable Row Level Security
ALTER TABLE voice_stats ENABLE ROW LEVEL SECURITY;

-- Policy: All users can view voice stats
CREATE POLICY "voice_stats_select_all" ON voice_stats
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert their own records
CREATE POLICY "voice_stats_insert_own" ON voice_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own records
CREATE POLICY "voice_stats_update_own" ON voice_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own records
CREATE POLICY "voice_stats_delete_own" ON voice_stats
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at on voice stats updates
CREATE TRIGGER update_voice_stats_updated_at
  BEFORE UPDATE ON voice_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
