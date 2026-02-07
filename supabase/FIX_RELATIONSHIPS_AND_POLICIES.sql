-- ============================================
-- FIX DATABASE RELATIONSHIPS AND POLICIES
-- ============================================
-- This script fixes the missing foreign key relationship
-- and ensures proper RLS policies for admin/moderator access
-- ============================================

-- 1. First, check if tables exist and create indexes only if columns exist
DO $$ 
BEGIN
    -- Add Foreign Key constraint for comments.user_id -> profiles.id
    -- This fixes the "Could not find a relationship" error
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        -- Drop existing constraint if exists
        ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
        
        -- Add new constraint
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key comments_user_id_fkey created';
    END IF;
END $$;

-- 2. Create indexes for comments table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
        RAISE NOTICE 'Index idx_comments_user_id created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'anime_id') THEN
        CREATE INDEX IF NOT EXISTS idx_comments_anime_id ON public.comments(anime_id);
        RAISE NOTICE 'Index idx_comments_anime_id created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
        RAISE NOTICE 'Index idx_comments_created_at created';
    END IF;
END $$;

-- 3. Create indexes for favorites table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'favorites' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
        RAISE NOTICE 'Index idx_favorites_user_id created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'favorites' AND column_name = 'anime_id') THEN
        CREATE INDEX IF NOT EXISTS idx_favorites_anime_id ON public.favorites(anime_id);
        RAISE NOTICE 'Index idx_favorites_anime_id created';
    END IF;
END $$;

-- 4. Create indexes for ratings table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ratings' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
        RAISE NOTICE 'Index idx_ratings_user_id created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ratings' AND column_name = 'anime_id') THEN
        CREATE INDEX IF NOT EXISTS idx_ratings_anime_id ON public.ratings(anime_id);
        RAISE NOTICE 'Index idx_ratings_anime_id created';
    END IF;
END $$;

-- 5. Create index for profiles table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin') THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
        RAISE NOTICE 'Index idx_profiles_is_admin created';
    END IF;
END $$;

-- 6. Fix RLS policies for admin/moderator access to all tables
DO $$ 
BEGIN
    -- Drop existing policies that might be too restrictive
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
    DROP POLICY IF EXISTS "Admins can view all favorites" ON public.favorites;
    DROP POLICY IF EXISTS "Admins can view all ratings" ON public.ratings;
    
    RAISE NOTICE 'Old policies dropped';
END $$;

-- Create comprehensive admin access policies for profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
  OR id = auth.uid()
);

-- Create comprehensive admin access policies for comments
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        EXECUTE 'CREATE POLICY "Admins can view all comments"
        ON public.comments FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
          )
          OR user_id = auth.uid()
          OR is_deleted = false
        )';
        RAISE NOTICE 'Policy "Admins can view all comments" created';
    END IF;
END $$;

-- Create comprehensive admin access policies for favorites
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
        EXECUTE 'CREATE POLICY "Admins can view all favorites"
        ON public.favorites FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
          )
          OR user_id = auth.uid()
        )';
        RAISE NOTICE 'Policy "Admins can view all favorites" created';
    END IF;
END $$;

-- Create comprehensive admin access policies for ratings
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ratings') THEN
        EXECUTE 'CREATE POLICY "Admins can view all ratings"
        ON public.ratings FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
          )
          OR user_id = auth.uid()
        )';
        RAISE NOTICE 'Policy "Admins can view all ratings" created';
    END IF;
END $$;

-- 7. Ensure moderators table has proper foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'moderators') THEN
        ALTER TABLE public.moderators DROP CONSTRAINT IF EXISTS moderators_user_id_fkey;
        
        ALTER TABLE public.moderators
        ADD CONSTRAINT moderators_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key moderators_user_id_fkey created';
    END IF;
END $$;

-- 8. Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ All fixes applied successfully!';
    RAISE NOTICE 'Next step: Go to Settings → API → Reload PostgREST Schema';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the fixes:

-- Check foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('comments', 'moderators', 'favorites', 'ratings')
ORDER BY tc.table_name;

-- Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('comments', 'profiles', 'favorites', 'ratings', 'moderators')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('comments', 'profiles', 'favorites', 'ratings', 'moderators')
ORDER BY tablename, policyname;
