-- Quick check script to verify all tables are ready
-- Run this in Supabase SQL Editor

-- Check comments table
SELECT 'comments' as table_name, COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'comments';

-- Check ratings table
SELECT 'ratings' as table_name, COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'ratings';

-- Check profiles table
SELECT 'profiles' as table_name, COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check favorites table
SELECT 'favorites' as table_name, COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'favorites';

-- Check moderators table
SELECT 'moderators' as table_name, COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'moderators';

-- Check rate_limits table
SELECT 'rate_limits' as table_name, COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'rate_limits';

-- List all columns in comments table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- List all columns in ratings table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ratings'
ORDER BY ordinal_position;
