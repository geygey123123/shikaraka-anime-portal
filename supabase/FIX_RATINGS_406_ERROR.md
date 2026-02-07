# Fix Ratings 406 Error - Step by Step Guide

## Problem
Users are getting 406 errors when trying to load or save ratings.

## Root Cause
The Row Level Security (RLS) policies on the `ratings` table are too restrictive or misconfigured, preventing authenticated users from reading or writing ratings.

## Solution Steps

### Step 1: Execute the Reset Script in Supabase

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/RESET_RATINGS_POLICIES.sql`
5. Click **Run** to execute the script

### Step 2: Verify Policies Were Created

The script will automatically show you the created policies at the end. You should see:

- `public_read_ratings` - **Anyone can view all ratings (no auth required)**
- `auth_insert_ratings` - Authenticated users can insert ratings
- `users_update_own_ratings` - Users can update their own ratings
- `users_delete_own_ratings` - Users can delete their own ratings

### Step 3: Clear Browser Cache

After updating the policies, you MUST clear your browser cache:

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cache"
3. Click "Clear Now"

**Or use Incognito/Private mode** to test without clearing cache.

### Step 4: Test Rating Display

1. Navigate to any anime detail page
2. The rating should load without 406 errors
3. You should see the average rating and vote count

### Step 5: Test Rating Submission

1. Log in to your application
2. Navigate to any anime detail page
3. Click on the stars to rate the anime (1-10)
4. The rating should save without 406 errors
5. Refresh the page - your rating should persist

### Step 6: Test Rating Update

1. On the same anime page, change your rating
2. Click a different star rating
3. The update should work without errors
4. Refresh the page - the new rating should be saved

## Troubleshooting

### Still Getting 406 Errors?

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'ratings';
   ```
   Should show `rowsecurity = true`

2. **Verify your user is authenticated:**
   - Check browser console for authentication errors
   - Try logging out and logging back in
   - Check if `auth.uid()` returns your user ID:
     ```sql
     SELECT auth.uid();
     ```

3. **Check if policies exist:**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'ratings';
   ```
   Should show all 4 policies listed above

4. **Test with SQL directly:**
   ```sql
   -- Test SELECT (should work for everyone)
   SELECT * FROM ratings LIMIT 10;
   
   -- Test INSERT (replace YOUR_USER_ID with your actual user ID)
   INSERT INTO ratings (user_id, anime_id, rating) 
   VALUES ('YOUR_USER_ID', 999, 8);
   
   -- Test UPDATE
   UPDATE ratings 
   SET rating = 9 
   WHERE user_id = 'YOUR_USER_ID' AND anime_id = 999;
   ```

### Error: "permission denied for table ratings"

This means RLS is blocking the operation. Re-run the `RESET_RATINGS_POLICIES.sql` script.

### Error: "new row violates row-level security policy"

This means the WITH CHECK clause is failing. The reset script should fix this by ensuring `auth.uid() = user_id`.

### Error: "duplicate key value violates unique constraint"

This is not a permissions error - it means you're trying to insert a rating that already exists. The app should handle this by updating instead of inserting.

Check the `setRating` method in `src/services/ratings.service.ts` - it should check for existing ratings first.

## Understanding the 406 Error

A 406 error in Supabase typically means:
- The RLS policy is denying access to the resource
- The query format doesn't match what the policy expects
- The user is not authenticated when they should be

The `public_read_ratings` policy fixes this by allowing anyone (authenticated or not) to read ratings, which is appropriate since ratings are public data.

## Prevention

To prevent this issue in the future:

1. Always test RLS policies after creating them
2. Use the Supabase policy editor to verify policies
3. Test with both authenticated and unauthenticated users
4. Remember that SELECT operations for public data should not require authentication
5. Keep a backup of working policies

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policy Documentation](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Supabase Error Codes](https://supabase.com/docs/guides/api#error-codes)
