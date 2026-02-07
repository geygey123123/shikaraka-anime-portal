-- ============================================
-- ПОЛНАЯ МИГРАЦИЯ БАЗЫ ДАННЫХ ShiKaraKa
-- Применяет все миграции по порядку
-- ============================================

-- ============================================
-- MIGRATION 001: Create profiles table
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Trigger to update updated_at on profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- MIGRATION 002: Create favorites table
-- ============================================

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shikimori_id INTEGER NOT NULL,
  anime_name TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shikimori_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_shikimori_id ON favorites(shikimori_id);


-- ============================================
-- MIGRATION 003: Update existing tables (moved before V2 tables)
-- ============================================

-- Add columns to favorites table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='favorites' AND column_name='watch_status') THEN
    ALTER TABLE favorites ADD COLUMN watch_status TEXT DEFAULT 'plan_to_watch';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='favorites' AND column_name='status_updated_at') THEN
    ALTER TABLE favorites ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add check constraint for valid watch_status values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_watch_status') THEN
    ALTER TABLE favorites
    ADD CONSTRAINT valid_watch_status 
    CHECK (watch_status IN ('watching', 'plan_to_watch', 'completed', 'dropped', 'on_hold'));
  END IF;
END $$;

-- Add columns to profiles table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='last_active') THEN
    ALTER TABLE profiles ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;


-- ============================================
-- MIGRATION 004: Create V2 tables
-- ============================================

-- Moderators table
CREATE TABLE IF NOT EXISTS moderators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  added_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  action_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for all new tables
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage moderators" ON moderators;
DROP POLICY IF EXISTS "Users can view moderators" ON moderators;
DROP POLICY IF EXISTS "Users can view non-deleted comments" ON comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Moderators can update comments" ON comments;
DROP POLICY IF EXISTS "Users can view all ratings" ON ratings;
DROP POLICY IF EXISTS "Users can manage own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can view own rate limits" ON rate_limits;
DROP POLICY IF EXISTS "System can manage rate limits" ON rate_limits;

-- RLS Policies for moderators
CREATE POLICY "Admins can manage moderators"
  ON moderators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view moderators"
  ON moderators FOR SELECT
  USING (true);

-- RLS Policies for comments
CREATE POLICY "Users can view non-deleted comments"
  ON comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can update comments"
  ON comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE moderators.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS Policies for ratings
CREATE POLICY "Users can view all ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own ratings"
  ON ratings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for rate_limits
CREATE POLICY "Users can view own rate limits"
  ON rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON rate_limits FOR ALL
  USING (true);

-- ============================================
-- MIGRATION 005: Create admin trigger
-- ============================================

-- Function to set admin flag for specific email
CREATE OR REPLACE FUNCTION set_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'lifeshindo96@gmail.com' THEN
    INSERT INTO profiles (id, is_admin)
    VALUES (NEW.id, true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to set admin flag on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_flag();


-- ============================================
-- MIGRATION 006: Create indexes
-- ============================================

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_anime_id ON comments(anime_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_anime_created ON comments(anime_id, created_at DESC);

-- Ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_anime_id ON ratings(anime_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_anime ON ratings(user_id, anime_id);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Moderators indexes
CREATE INDEX IF NOT EXISTS idx_moderators_user_id ON moderators(user_id);
CREATE INDEX IF NOT EXISTS idx_moderators_email ON moderators(email);


-- ============================================
-- ЗАВЕРШЕНО
-- ============================================

-- Вывод информации о созданных таблицах
DO $$
BEGIN
  RAISE NOTICE '✅ Миграция завершена успешно!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Созданные таблицы:';
  RAISE NOTICE '  - profiles (с полями: bio, is_admin, last_active)';
  RAISE NOTICE '  - favorites (с полями: watch_status, status_updated_at)';
  RAISE NOTICE '  - moderators';
  RAISE NOTICE '  - comments';
  RAISE NOTICE '  - ratings';
  RAISE NOTICE '  - rate_limits';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS политики настроены для всех таблиц';
  RAISE NOTICE '📈 Индексы созданы для оптимизации запросов';
  RAISE NOTICE '⚡ Триггер для автоматической установки is_admin создан';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  ВАЖНО: Не забудьте создать bucket "avatars" в Supabase Storage!';
  RAISE NOTICE '   Инструкции в файле: supabase/migrations/007_create_avatars_bucket.sql';
END $$;
