# ShiKaraKa V2 Database Migration Guide

This guide explains how to apply the V2 feature migrations to your Supabase database.

## Migration Files Overview

The following migration files have been created for V2 features:

1. **003_create_v2_tables.sql** - Creates new tables (moderators, comments, ratings, rate_limits)
2. **004_update_existing_tables.sql** - Updates favorites and profiles tables with new columns
3. **005_create_admin_trigger.sql** - Creates trigger to auto-set admin flag for lifeshindo96@gmail.com
4. **006_create_indexes.sql** - Creates performance indexes for all new tables
5. **007_create_avatars_bucket.sql** - Sets up Supabase Storage bucket for avatars

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. For each migration file (in order 003 → 007):
   - Open the file in your code editor
   - Copy the entire SQL content
   - Paste it into the SQL Editor
   - Click **Run** to execute
4. Verify each migration completes successfully before moving to the next

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project root directory
cd /path/to/shikaraka

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply all pending migrations
supabase db push
```

### Option 3: Manual Execution via psql

If you have direct database access:

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# Execute each migration file
\i supabase/migrations/003_create_v2_tables.sql
\i supabase/migrations/004_update_existing_tables.sql
\i supabase/migrations/005_create_admin_trigger.sql
\i supabase/migrations/006_create_indexes.sql
\i supabase/migrations/007_create_avatars_bucket.sql
```

## Verification Steps

After applying all migrations, verify the setup:

### 1. Check Tables Exist

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('moderators', 'comments', 'ratings', 'rate_limits');
```

You should see all 4 tables listed.

### 2. Check New Columns in Existing Tables

```sql
-- Check favorites table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'favorites' 
AND column_name IN ('watch_status', 'status_updated_at');

-- Check profiles table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('is_admin', 'bio', 'last_active');
```

### 3. Check Indexes

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('comments', 'ratings', 'rate_limits', 'moderators')
ORDER BY tablename, indexname;
```

### 4. Check Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Verify the "avatars" bucket exists
3. Check bucket settings:
   - Public: Yes
   - File size limit: 2MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

### 5. Test Admin Trigger

The admin trigger will automatically set `is_admin = true` when a user with email `lifeshindo96@gmail.com` registers. To test:

1. Register a new account with email `lifeshindo96@gmail.com`
2. Check the profiles table:

```sql
SELECT id, username, is_admin 
FROM profiles 
WHERE is_admin = true;
```

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

### Moderators Table
- ✅ Admins can manage all moderators
- ✅ All users can view moderators list

### Comments Table
- ✅ Users can view non-deleted comments
- ✅ Users can insert their own comments
- ✅ Users can delete their own comments
- ✅ Moderators and admins can update any comment

### Ratings Table
- ✅ All users can view ratings
- ✅ Users can manage their own ratings (insert, update, delete)

### Rate Limits Table
- ✅ Users can view their own rate limits
- ✅ Users can manage their own rate limits

### Storage (Avatars)
- ✅ Anyone can view avatars (public bucket)
- ✅ Users can only upload/update/delete their own avatar

## Rollback Instructions

If you need to rollback these migrations:

```sql
-- Drop storage policies
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Delete avatars bucket
DELETE FROM storage.buckets WHERE id = 'avatars';

-- Drop indexes
DROP INDEX IF EXISTS idx_comments_anime_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_comments_created_at;
DROP INDEX IF EXISTS idx_comments_anime_created;
DROP INDEX IF EXISTS idx_ratings_anime_id;
DROP INDEX IF EXISTS idx_ratings_user_anime;
DROP INDEX IF EXISTS idx_rate_limits_user_action;
DROP INDEX IF EXISTS idx_rate_limits_window;
DROP INDEX IF EXISTS idx_rate_limits_user_action_window;
DROP INDEX IF EXISTS idx_moderators_user_id;
DROP INDEX IF EXISTS idx_moderators_email;

-- Drop trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS set_admin_flag();

-- Remove new columns from existing tables
ALTER TABLE profiles DROP COLUMN IF EXISTS is_admin;
ALTER TABLE profiles DROP COLUMN IF EXISTS bio;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_active;
ALTER TABLE favorites DROP COLUMN IF EXISTS watch_status;
ALTER TABLE favorites DROP COLUMN IF EXISTS status_updated_at;

-- Drop new tables
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS moderators;
```

## Troubleshooting

### Issue: "relation already exists"
This means the table or index already exists. You can either:
- Skip that specific migration
- Add `IF NOT EXISTS` to the CREATE statements

### Issue: "column already exists"
The column was already added. You can:
- Skip that ALTER TABLE statement
- Add `IF NOT EXISTS` to the ALTER TABLE statements

### Issue: Storage bucket creation fails
- Check if the bucket already exists in Storage dashboard
- Verify you have the necessary permissions
- Try creating the bucket manually via the dashboard

### Issue: RLS policies fail
- Ensure the tables exist before creating policies
- Check that the referenced tables (profiles, auth.users) exist
- Verify you're running as a superuser or have sufficient privileges

## Next Steps

After successfully applying all migrations:

1. ✅ Update your `.env` file with any new environment variables
2. ✅ Install new dependencies (if any)
3. ✅ Proceed to implement the service layer (Task 2)
4. ✅ Test the database setup with your application

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Review the error messages carefully
3. Ensure all previous migrations (001, 002) were applied successfully
4. Verify your database user has sufficient permissions
