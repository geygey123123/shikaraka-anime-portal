-- Fix comments table RLS policies to allow deletion

-- Drop existing policies
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Moderators can soft delete comments" ON comments;
DROP POLICY IF EXISTS "Users can view non-deleted comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view non-deleted comments
CREATE POLICY "Anyone can view non-deleted comments"
ON comments FOR SELECT
USING (is_deleted = false);

-- Policy: Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own comments (hard delete)
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins and moderators can soft delete any comment (update is_deleted)
CREATE POLICY "Admins can soft delete comments"
ON comments FOR UPDATE
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

-- Policy: Moderators can soft delete comments
CREATE POLICY "Moderators can soft delete comments"
ON comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM moderators
    WHERE moderators.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM moderators
    WHERE moderators.user_id = auth.uid()
  )
);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'comments';
