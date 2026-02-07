-- Verification Script for ShiKaraKa V2 Database Setup
-- Run this script to verify all V2 migrations were applied successfully

-- ============================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================
SELECT 
  'Tables Check' as check_type,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ PASS - All 4 V2 tables exist'
    ELSE '❌ FAIL - Missing tables: ' || (4 - COUNT(*))::text
  END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('moderators', 'comments', 'ratings', 'rate_limits');

-- ============================================
-- 2. CHECK NEW COLUMNS IN FAVORITES TABLE
-- ============================================
SELECT 
  'Favorites Columns' as check_type,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS - watch_status and status_updated_at exist'
    ELSE '❌ FAIL - Missing columns in favorites table'
  END as result
FROM information_schema.columns
WHERE table_name = 'favorites' 
AND column_name IN ('watch_status', 'status_updated_at');

-- ============================================
-- 3. CHECK NEW COLUMNS IN PROFILES TABLE
-- ============================================
SELECT 
  'Profiles Columns' as check_type,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS - is_admin, bio, and last_active exist'
    ELSE '❌ FAIL - Missing columns in profiles table'
  END as result
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('is_admin', 'bio', 'last_active');

-- ============================================
-- 4. CHECK INDEXES EXIST
-- ============================================
SELECT 
  'Indexes Check' as check_type,
  CASE 
    WHEN COUNT(*) >= 12 THEN '✅ PASS - All performance indexes created'
    ELSE '⚠️  WARNING - Expected 12+ indexes, found: ' || COUNT(*)::text
  END as result
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('comments', 'ratings', 'rate_limits', 'moderators')
AND indexname LIKE 'idx_%';

-- ============================================
-- 5. CHECK ADMIN TRIGGER EXISTS
-- ============================================
SELECT 
  'Admin Trigger' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PASS - Admin trigger exists'
    ELSE '❌ FAIL - Admin trigger not found'
  END as result
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- 6. CHECK ADMIN FUNCTION EXISTS
-- ============================================
SELECT 
  'Admin Function' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PASS - set_admin_flag() function exists'
    ELSE '❌ FAIL - set_admin_flag() function not found'
  END as result
FROM pg_proc 
WHERE proname = 'set_admin_flag';

-- ============================================
-- 7. CHECK RLS POLICIES
-- ============================================
SELECT 
  'RLS Policies' as check_type,
  COUNT(*)::text || ' policies found' as result
FROM pg_policies 
WHERE tablename IN ('moderators', 'comments', 'ratings', 'rate_limits');

-- ============================================
-- 8. LIST ALL RLS POLICIES BY TABLE
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅ Permissive'
    ELSE '⚠️  Restrictive'
  END as policy_type
FROM pg_policies 
WHERE tablename IN ('moderators', 'comments', 'ratings', 'rate_limits')
ORDER BY tablename, policyname;

-- ============================================
-- 9. CHECK STORAGE BUCKET
-- ============================================
SELECT 
  'Storage Bucket' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PASS - Avatars bucket exists'
    ELSE '❌ FAIL - Avatars bucket not found'
  END as result
FROM storage.buckets 
WHERE id = 'avatars';

-- ============================================
-- 10. CHECK STORAGE BUCKET CONFIGURATION
-- ============================================
SELECT 
  'Bucket Config' as check_type,
  'Public: ' || public::text || 
  ', Size Limit: ' || (file_size_limit / 1024 / 1024)::text || 'MB' ||
  ', MIME Types: ' || array_length(allowed_mime_types, 1)::text as result
FROM storage.buckets 
WHERE id = 'avatars';

-- ============================================
-- 11. CHECK STORAGE RLS POLICIES
-- ============================================
SELECT 
  'Storage Policies' as check_type,
  COUNT(*)::text || ' storage policies found for avatars' as result
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- ============================================
-- 12. DETAILED TABLE STRUCTURE
-- ============================================
-- Moderators table structure
SELECT 
  'moderators' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'moderators'
ORDER BY ordinal_position;

-- Comments table structure
SELECT 
  'comments' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- Ratings table structure
SELECT 
  'ratings' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ratings'
ORDER BY ordinal_position;

-- Rate limits table structure
SELECT 
  'rate_limits' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'rate_limits'
ORDER BY ordinal_position;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  '=== VERIFICATION COMPLETE ===' as summary,
  'Review the results above to ensure all migrations were applied successfully' as note;
