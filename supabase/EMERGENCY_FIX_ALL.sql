-- ============================================================================
-- EMERGENCY FIX - RUN THIS NOW IN SUPABASE SQL EDITOR
-- ============================================================================
-- This will fix ALL permission issues immediately
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN
-- ============================================================================

-- STEP 1: Fix Comments Table
-- ============================================================================
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_comments" ON comments;
DROP POLICY IF EXISTS "auth_insert_comments" ON comments;
DROP POLICY IF EXISTS "users_update_own_comments" ON comments;
DROP POLICY IF EXISTS "users_delete_own_comments" ON comments;
DROP POLICY IF EXISTS "admins_update_any_comment" ON comments;
DROP POLICY IF EXISTS "admins_delete_any_comment" ON comments;
DROP POLICY IF EXISTS "moderators_update_any_comment" ON comments;
DROP POLICY IF EXISTS "moderators_delete_any_comment" ON comments;
DROP POLICY IF EXISTS "Users can view non-deleted comments" ON comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_comments"
ON comments FOR SELECT
USING (is_deleted = false);

CREATE POLICY "auth_insert_comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "admins_update_any_comment"
ON comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "admins_delete_any_comment"
ON comments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "moderators_update_any_comment"
ON comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM moderators
    WHERE moderators.user_id = auth.uid()
  )
);

CREATE POLICY "moderators_delete_any_comment"
ON comments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM moderators
    WHERE moderators.user_id = auth.uid()
  )
);

-- STEP 2: Fix Ratings Table
-- ============================================================================
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ratings" ON ratings;
DROP POLICY IF EXISTS "auth_insert_ratings" ON ratings;
DROP POLICY IF EXISTS "users_update_own_ratings" ON ratings;
DROP POLICY IF EXISTS "users_delete_own_ratings" ON ratings;
DROP POLICY IF EXISTS "Users can view all ratings" ON ratings;
DROP POLICY IF EXISTS "Users can manage own ratings" ON ratings;

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_ratings"
ON ratings FOR SELECT
USING (true);

CREATE POLICY "auth_insert_ratings"
ON ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_ratings"
ON ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_ratings"
ON ratings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- STEP 3: Clear Rate Limits
-- ============================================================================
DELETE FROM rate_limits;

-- STEP 4: Verify Everything
-- ============================================================================
SELECT '✅ COMMENTS POLICIES CREATED' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'comments' ORDER BY policyname;

SELECT '✅ RATINGS POLICIES CREATED' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'ratings' ORDER BY policyname;

SELECT '✅ RATE LIMITS CLEARED' as status;
SELECT COUNT(*) as remaining_rate_limits FROM rate_limits;

SELECT '✅ AUTHENTICATION CHECK' as status;
SELECT 
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ NOT LOGGED IN - Please log in to the app'
        ELSE '✅ Logged in as: ' || auth.uid()::text
    END as auth_status;

SELECT '✅ ADMIN CHECK' as status;
SELECT 
    COALESCE(
        (SELECT 
            CASE 
                WHEN is_admin THEN '✅ YOU ARE ADMIN'
                ELSE '❌ NOT ADMIN'
            END
        FROM profiles WHERE id = auth.uid()),
        '❌ NO PROFILE FOUND'
    ) as admin_status;

-- STEP 5: Test Queries
-- ============================================================================
SELECT '✅ TEST: Can read comments' as test;
SELECT COUNT(*) as comment_count FROM comments;

SELECT '✅ TEST: Can read ratings' as test;
SELECT COUNT(*) as rating_count FROM ratings;

SELECT '🎉 ALL FIXES APPLIED SUCCESSFULLY!' as final_status;
SELECT 'Now clear your browser cache (Ctrl+Shift+Delete) and refresh the app' as next_step;
