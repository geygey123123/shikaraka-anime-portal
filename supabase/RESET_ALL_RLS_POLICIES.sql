-- ============================================================================
-- COMPLETE RESET OF ALL RLS POLICIES FOR SHIKARAKA V2
-- ============================================================================
-- This script resets RLS policies for all V2 tables:
-- - comments
-- - ratings
-- - moderators
-- - rate_limits
-- - profiles (updates only)
-- - favorites (updates only)
--
-- Run this script if you encounter permission errors (403, 406, etc.)
-- ============================================================================

-- ============================================================================
-- PART 1: COMMENTS TABLE
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "public_read_comments" ON comments;
DROP POLICY IF EXISTS "auth_insert_comments" ON comments;
DROP POLICY IF EXISTS "users_update_own_comments" ON comments;
DROP POLICY IF EXISTS "users_delete_own_comments" ON comments;
DROP POLICY IF EXISTS "admins_update_any_comment" ON comments;
DROP POLICY IF EXISTS "admins_delete_any_comment" ON comments;
DROP POLICY IF EXISTS "moderators_update_any_comment" ON comments;
DROP POLICY IF EXISTS "moderators_delete_any_comment" ON comments;

-- Re-enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create new policies
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

-- ============================================================================
-- PART 2: RATINGS TABLE
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "public_read_ratings" ON ratings;
DROP POLICY IF EXISTS "auth_insert_ratings" ON ratings;
DROP POLICY IF EXISTS "users_update_own_ratings" ON ratings;
DROP POLICY IF EXISTS "users_delete_own_ratings" ON ratings;

-- Re-enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create new policies
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

-- ============================================================================
-- PART 3: MODERATORS TABLE
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE moderators DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "public_read_moderators" ON moderators;
DROP POLICY IF EXISTS "admins_manage_moderators" ON moderators;

-- Re-enable RLS
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "public_read_moderators"
ON moderators FOR SELECT
USING (true);

CREATE POLICY "admins_manage_moderators"
ON moderators FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================================================
-- PART 4: RATE_LIMITS TABLE
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "users_read_own_rate_limits" ON rate_limits;
DROP POLICY IF EXISTS "system_manage_rate_limits" ON rate_limits;

-- Re-enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "users_read_own_rate_limits"
ON rate_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "system_manage_rate_limits"
ON rate_limits FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PART 5: PROFILES TABLE (Verify existing policies)
-- ============================================================================

-- Drop and recreate profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PART 6: FAVORITES TABLE (Verify existing policies)
-- ============================================================================

-- Drop and recreate favorites policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
ON favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites"
ON favorites FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION: Show all policies for V2 tables
-- ============================================================================

SELECT 
    'COMMENTS' as table_name,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'comments'
ORDER BY policyname;

SELECT 
    'RATINGS' as table_name,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'ratings'
ORDER BY policyname;

SELECT 
    'MODERATORS' as table_name,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'moderators'
ORDER BY policyname;

SELECT 
    'RATE_LIMITS' as table_name,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'rate_limits'
ORDER BY policyname;

-- ============================================================================
-- TEST QUERIES: Verify you can access the tables
-- ============================================================================

SELECT 'Test Results' as status;

SELECT COUNT(*) as total_comments FROM comments;
SELECT COUNT(*) as visible_comments FROM comments WHERE is_deleted = false;

SELECT COUNT(*) as total_ratings FROM ratings;

SELECT COUNT(*) as total_moderators FROM moderators;

SELECT COUNT(*) as total_rate_limits FROM rate_limits;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 
    'RLS policies have been reset successfully!' as status,
    'Clear your browser cache and test the application.' as next_step;
