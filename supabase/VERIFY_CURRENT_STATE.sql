-- ============================================================================
-- VERIFY CURRENT STATE - Run this first to see what's wrong
-- ============================================================================

-- Check if tables exist
SELECT 'TABLE EXISTENCE CHECK' as check_type;
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('comments', 'ratings', 'moderators', 'rate_limits', 'profiles', 'favorites')
ORDER BY tablename;

-- Check comments policies
SELECT 'COMMENTS POLICIES' as check_type;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'comments'
ORDER BY policyname;

-- Check ratings policies
SELECT 'RATINGS POLICIES' as check_type;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'ratings'
ORDER BY policyname;

-- Check if you're authenticated
SELECT 'AUTHENTICATION CHECK' as check_type;
SELECT 
    CASE 
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
        ELSE 'AUTHENTICATED: ' || auth.uid()::text
    END as auth_status;

-- Check if you're an admin
SELECT 'ADMIN CHECK' as check_type;
SELECT 
    id,
    is_admin,
    CASE 
        WHEN is_admin THEN 'YES - YOU ARE ADMIN'
        ELSE 'NO - NOT ADMIN'
    END as admin_status
FROM profiles 
WHERE id = auth.uid();

-- Check comments table structure
SELECT 'COMMENTS TABLE STRUCTURE' as check_type;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- Try to read comments (should work for everyone)
SELECT 'COMMENTS READ TEST' as check_type;
SELECT COUNT(*) as total_comments FROM comments;

-- Check if there are any comments to delete
SELECT 'YOUR COMMENTS' as check_type;
SELECT id, anime_id, LEFT(content, 50) as content_preview, created_at
FROM comments 
WHERE user_id = auth.uid()
LIMIT 5;
