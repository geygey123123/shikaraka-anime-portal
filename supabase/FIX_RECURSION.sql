-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================
-- This script fixes the "infinite recursion detected" error
-- by removing recursive policy checks
-- ============================================

-- STEP 1: Drop ALL problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can view all favorites" ON public.favorites;
DROP POLICY IF EXISTS "Admins can view all ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- STEP 2: Create SIMPLE policies for profiles (NO RECURSION!)
-- Everyone can view all profiles (simple and safe)
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- STEP 3: Create SIMPLE policies for comments (NO RECURSION!)
-- Everyone can view non-deleted comments
CREATE POLICY "Anyone can view active comments"
ON public.comments FOR SELECT
TO authenticated
USING (is_deleted = false OR user_id = auth.uid());

-- STEP 4: Create SIMPLE policies for favorites (NO RECURSION!)
-- Everyone can view all favorites
CREATE POLICY "Anyone can view favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (true);

-- STEP 5: Create SIMPLE policies for ratings (NO RECURSION!)
-- Everyone can view all ratings
CREATE POLICY "Anyone can view ratings"
ON public.ratings FOR SELECT
TO authenticated
USING (true);

-- STEP 6: Add Foreign Key for comments (if not exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
        
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Foreign key comments_user_id_fkey created';
    END IF;
END $$;

-- STEP 7: Create essential indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_comments_anime_id ON public.comments(anime_id);

-- STEP 8: Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
SELECT '✅ Recursion fixed! All policies are now simple and safe.' AS status,
       '⚠️ IMPORTANT: Go to Settings → API → Reload PostgREST Schema' AS next_step,
       '🔄 Then LOGOUT and LOGIN again to refresh your session!' AS final_step;
