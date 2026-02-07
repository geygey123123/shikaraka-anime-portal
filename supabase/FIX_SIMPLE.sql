-- ============================================
-- SIMPLE FIX FOR COMMENTS RELATIONSHIP
-- ============================================
-- This is a simplified version that focuses on the critical fix
-- Run this if the main script has issues
-- ============================================

-- Step 1: Add Foreign Key for comments -> profiles
-- This is the CRITICAL fix for "Could not find a relationship" error
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Step 2: Create essential indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Step 3: Fix admin access policy for comments
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;

CREATE POLICY "Admins can view all comments"
ON public.comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
  OR user_id = auth.uid()
  OR is_deleted = false
);

-- Step 4: Refresh schema
NOTIFY pgrst, 'reload schema';

-- Done!
SELECT 'Foreign key created successfully! Now go to Settings → API → Reload PostgREST Schema' AS message;
