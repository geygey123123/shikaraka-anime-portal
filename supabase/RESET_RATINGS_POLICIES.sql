-- COMPLETE RESET of ratings table RLS policies
-- Run this if you get 406 errors when loading or saving ratings

-- Step 1: Disable RLS temporarily
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ratings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ratings';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, permissive policies

-- Anyone can view all ratings (no auth required for reading)
CREATE POLICY "public_read_ratings"
ON ratings FOR SELECT
USING (true);

-- Authenticated users can insert their own ratings
CREATE POLICY "auth_insert_ratings"
ON ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can UPDATE their own ratings
CREATE POLICY "users_update_own_ratings"
ON ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can DELETE their own ratings
CREATE POLICY "users_delete_own_ratings"
ON ratings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

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
WHERE tablename = 'ratings'
ORDER BY policyname;

-- Step 6: Test if you can query ratings
SELECT COUNT(*) as total_ratings FROM ratings;
SELECT anime_id, COUNT(*) as rating_count, AVG(rating) as avg_rating
FROM ratings
GROUP BY anime_id
ORDER BY rating_count DESC
LIMIT 10;

-- Step 7: Test insert (replace USER_ID with your actual user ID)
-- INSERT INTO ratings (user_id, anime_id, rating) 
-- VALUES ('YOUR_USER_ID', 1, 8)
-- ON CONFLICT (user_id, anime_id) 
-- DO UPDATE SET rating = 8, updated_at = NOW();

