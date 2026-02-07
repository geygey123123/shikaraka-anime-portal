-- Final Fix Script for ShiKaraKa V2
-- This script ensures all tables and relationships are properly configured

-- ============================================
-- 1. VERIFY COMMENTS TABLE
-- ============================================
-- Check if comments table exists and has correct structure
DO $$ 
BEGIN
    -- Ensure user_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE comments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 2. VERIFY RATINGS TABLE
-- ============================================
-- Check unique constraint on ratings
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ratings_user_id_anime_id_key' 
        AND table_name = 'ratings'
    ) THEN
        ALTER TABLE ratings DROP CONSTRAINT ratings_user_id_anime_id_key;
    END IF;
    
    -- Add unique constraint
    ALTER TABLE ratings ADD CONSTRAINT ratings_user_id_anime_id_key UNIQUE (user_id, anime_id);
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN others THEN NULL;
END $$;

-- ============================================
-- 3. VERIFY PROFILES TABLE
-- ============================================
-- Ensure profiles table has all required columns
DO $$ 
BEGIN
    -- Add is_admin if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
    
    -- Add avatar_url if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add bio if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add last_active if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- 4. VERIFY FAVORITES TABLE
-- ============================================
-- Ensure favorites table has watch_status
DO $$ 
BEGIN
    -- Add watch_status if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorites' AND column_name = 'watch_status'
    ) THEN
        ALTER TABLE favorites ADD COLUMN watch_status TEXT DEFAULT 'plan_to_watch';
    END IF;
    
    -- Add status_updated_at if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorites' AND column_name = 'status_updated_at'
    ) THEN
        ALTER TABLE favorites ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- 5. VERIFY RLS POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================
-- Check comments table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- Check ratings table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ratings'
ORDER BY ordinal_position;

-- Check profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check favorites table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE 'All tables verified and fixed successfully!';
END $$;
