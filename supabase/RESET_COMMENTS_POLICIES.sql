-- COMPLETE RESET of comments table RLS policies
-- Run this if you still get 403 errors

-- Step 1: Disable RLS temporarily
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'comments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON comments';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, permissive policies

-- Anyone can view non-deleted comments (no auth required)
CREATE POLICY "public_read_comments"
ON comments FOR SELECT
USING (is_deleted = false);

-- Authenticated users can insert their own comments
CREATE POLICY "auth_insert_comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can UPDATE their own comments
CREATE POLICY "users_update_own_comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can DELETE their own comments
CREATE POLICY "users_delete_own_comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can UPDATE any comment (for soft delete)
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

-- Admins can DELETE any comment
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

-- Moderators can UPDATE any comment (for soft delete)
CREATE POLICY "moderators_update_any_comment"
ON comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM moderators
    WHERE moderators.user_id = auth.uid()
  )
);

-- Moderators can DELETE any comment
CREATE POLICY "moderators_delete_any_comment"
ON comments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM moderators
    WHERE moderators.user_id = auth.uid()
  )
);

-- Step 5: Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'comments'
ORDER BY policyname;

-- Step 6: Test if you can query comments
SELECT COUNT(*) as total_comments FROM comments;
SELECT COUNT(*) as non_deleted_comments FROM comments WHERE is_deleted = false;
