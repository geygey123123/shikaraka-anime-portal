# Fix Comments 403 Error - Step by Step Guide

## Problem
Users are getting 403 errors when trying to delete comments, even their own comments.

## Root Cause
The Row Level Security (RLS) policies on the `comments` table are too restrictive or misconfigured.

## Solution Steps

### Step 1: Execute the Reset Script in Supabase

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/RESET_COMMENTS_POLICIES.sql`
5. Click **Run** to execute the script

### Step 2: Verify Policies Were Created

The script will automatically show you the created policies at the end. You should see:

- `public_read_comments` - Anyone can view non-deleted comments
- `auth_insert_comments` - Authenticated users can insert comments
- `users_update_own_comments` - Users can update their own comments
- `users_delete_own_comments` - **Users can delete their own comments**
- `admins_update_any_comment` - Admins can update any comment
- `admins_delete_any_comment` - Admins can delete any comment
- `moderators_update_any_comment` - Moderators can update any comment
- `moderators_delete_any_comment` - Moderators can delete any comment

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

### Step 4: Test Comment Deletion

1. Log in to your application
2. Navigate to any anime detail page
3. Add a test comment
4. Try to delete the comment you just created
5. The deletion should work without 403 errors

### Step 5: Test Moderator/Admin Deletion

If you have moderator or admin privileges:

1. Navigate to any anime with comments from other users
2. Try to delete a comment from another user
3. The deletion should work (soft delete - marks as deleted)

## Troubleshooting

### Still Getting 403 Errors?

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'comments';
   ```
   Should show `rowsecurity = true`

2. **Verify your user is authenticated:**
   - Check browser console for authentication errors
   - Try logging out and logging back in

3. **Check if policies exist:**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'comments';
   ```
   Should show all 8 policies listed above

4. **Test with SQL directly:**
   ```sql
   -- Replace YOUR_USER_ID with your actual user ID
   DELETE FROM comments 
   WHERE id = 'COMMENT_ID' 
   AND user_id = 'YOUR_USER_ID';
   ```

### Error: "permission denied for table comments"

This means RLS is blocking the operation. Re-run the `RESET_COMMENTS_POLICIES.sql` script.

### Error: "new row violates row-level security policy"

This means the WITH CHECK clause is failing. The reset script should fix this.

## Prevention

To prevent this issue in the future:

1. Always test RLS policies after creating them
2. Use the Supabase policy editor to verify policies
3. Test with different user roles (regular user, moderator, admin)
4. Keep a backup of working policies

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policy Documentation](https://www.postgresql.org/docs/current/sql-createpolicy.html)
