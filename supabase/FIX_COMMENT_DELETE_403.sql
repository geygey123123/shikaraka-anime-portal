-- ============================================
-- FIX: Comment Deletion 403 Error
-- ============================================
-- This script fixes the RLS policies for comment deletion
-- Users should be able to delete their own comments
-- Admins and moderators should be able to delete any comment
--
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies for comments table
DROP POLICY IF EXISTS "Users can view non-deleted comments" ON comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Moderators can update comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON comments;
DROP POLICY IF EXISTS "Moderators can delete any comment" ON comments;

-- ============================================
-- SELECT Policy: Anyone can view non-deleted comments
-- ============================================
CREATE POLICY "Users can view non-deleted comments"
  ON comments
  FOR SELECT
  USING (is_deleted = false);

-- ============================================
-- INSERT Policy: Authenticated users can insert their own comments
-- ============================================
CREATE POLICY "Users can insert own comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DELETE Policy: Users can delete their own comments
-- ============================================
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DELETE Policy: Admins can delete any comment
-- ============================================
CREATE POLICY "Admins can delete any comment"
  ON comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- DELETE Policy: Moderators can delete any comment
-- ============================================
CREATE POLICY "Moderators can delete any comment"
  ON comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE moderators.user_id = auth.uid()
    )
  );

-- ============================================
-- UPDATE Policy: Moderators and admins can soft-delete comments
-- ============================================
CREATE POLICY "Moderators can update comments"
  ON comments
  FOR UPDATE
  USING (
    -- Moderators can update
    EXISTS (
      SELECT 1 FROM moderators
      WHERE moderators.user_id = auth.uid()
    )
    OR
    -- Admins can update
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    -- Moderators can update
    EXISTS (
      SELECT 1 FROM moderators
      WHERE moderators.user_id = auth.uid()
    )
    OR
    -- Admins can update
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the policies were created:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'comments'
ORDER BY policyname;

-- ============================================
-- Test Queries (Optional)
-- ============================================
-- Test as regular user (replace 'your-user-id' with actual user ID):
-- DELETE FROM comments WHERE id = 'comment-id' AND user_id = 'your-user-id';

-- Test as admin (should work for any comment):
-- DELETE FROM comments WHERE id = 'any-comment-id';

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. After running this script, clear your browser cache
-- 2. Log out and log back in to refresh the session
-- 3. The policies now allow:
--    - Users to DELETE their own comments (hard delete)
--    - Admins to DELETE any comment (hard delete)
--    - Moderators to DELETE any comment (hard delete)
--    - Moderators/Admins to UPDATE comments (for soft delete)
-- 4. If you want ONLY soft deletes for moderators, modify the
--    comments.service.ts to use UPDATE instead of DELETE

