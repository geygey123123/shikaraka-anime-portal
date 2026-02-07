-- RUN THIS IN YOUR PRODUCTION SUPABASE (the one connected to Vercel)

-- First check what columns exist in profiles
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';

-- 1. Fix comments deletion (403 error)
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_delete_own_comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_delete_own_comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix admin access (using id instead of email)
-- First find your user ID by logging in to the app, then run:
-- UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID_HERE';

-- Or if you know your auth user ID:
UPDATE profiles SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'lifeshindo96@gmail.com'
);

-- 3. Clear rate limits
DELETE FROM rate_limits;

-- 4. Verify
SELECT 'Comments policies:' as check, COUNT(*) FROM pg_policies WHERE tablename = 'comments';
SELECT 'Admin status:' as check, id, is_admin FROM profiles WHERE is_admin = true;
SELECT 'Rate limits:' as check, COUNT(*) FROM rate_limits;
