# RLS Policies Guide - Complete Reference

## Overview

This guide provides comprehensive information about Row Level Security (RLS) policies for the ShiKaraKa V2 application.

## Quick Fix

If you're experiencing permission errors (403, 406, etc.):

1. Run `supabase/RESET_ALL_RLS_POLICIES.sql` in Supabase SQL Editor
2. Clear your browser cache (Ctrl+Shift+Delete)
3. Test the application

## Table of Contents

1. [Understanding RLS](#understanding-rls)
2. [Policy Reference](#policy-reference)
3. [Troubleshooting](#troubleshooting)
4. [Testing Policies](#testing-policies)
5. [Common Errors](#common-errors)

## Understanding RLS

Row Level Security (RLS) is a PostgreSQL feature that restricts which rows users can access in a table. Supabase uses RLS to secure your data.

### Key Concepts

- **USING clause**: Determines which rows are visible for SELECT, UPDATE, DELETE
- **WITH CHECK clause**: Determines which rows can be inserted or updated
- **Policy types**: SELECT, INSERT, UPDATE, DELETE, ALL
- **Roles**: `authenticated` (logged in users), `anon` (anonymous users)

### Why RLS Matters

Without proper RLS policies:
- Users might see data they shouldn't
- Users might be blocked from their own data
- You'll get 403 (Forbidden) or 406 (Not Acceptable) errors

## Policy Reference

### Comments Table

| Policy Name | Type | Who | What |
|------------|------|-----|------|
| `public_read_comments` | SELECT | Everyone | View non-deleted comments |
| `auth_insert_comments` | INSERT | Authenticated | Insert own comments |
| `users_update_own_comments` | UPDATE | Authenticated | Update own comments |
| `users_delete_own_comments` | DELETE | Authenticated | Delete own comments |
| `admins_update_any_comment` | UPDATE | Admins | Update any comment (soft delete) |
| `admins_delete_any_comment` | DELETE | Admins | Delete any comment |
| `moderators_update_any_comment` | UPDATE | Moderators | Update any comment (soft delete) |
| `moderators_delete_any_comment` | DELETE | Moderators | Delete any comment |

**Key Points:**
- Anyone can read non-deleted comments (no login required)
- Users can only modify their own comments
- Admins and moderators can modify any comment

### Ratings Table

| Policy Name | Type | Who | What |
|------------|------|-----|------|
| `public_read_ratings` | SELECT | Everyone | View all ratings |
| `auth_insert_ratings` | INSERT | Authenticated | Insert own ratings |
| `users_update_own_ratings` | UPDATE | Authenticated | Update own ratings |
| `users_delete_own_ratings` | DELETE | Authenticated | Delete own ratings |

**Key Points:**
- Anyone can read ratings (public data)
- Only authenticated users can rate anime
- Users can only modify their own ratings

### Moderators Table

| Policy Name | Type | Who | What |
|------------|------|-----|------|
| `public_read_moderators` | SELECT | Everyone | View moderator list |
| `admins_manage_moderators` | ALL | Admins | Full control over moderators |

**Key Points:**
- Moderator list is public (transparency)
- Only admins can add/remove moderators

### Rate Limits Table

| Policy Name | Type | Who | What |
|------------|------|-----|------|
| `users_read_own_rate_limits` | SELECT | Authenticated | View own rate limits |
| `system_manage_rate_limits` | ALL | Authenticated | System can manage all rate limits |

**Key Points:**
- Users can see their own rate limit status
- System needs full access to manage rate limits

### Profiles Table

| Policy Name | Type | Who | What |
|------------|------|-----|------|
| `Users can view all profiles` | SELECT | Everyone | View all profiles |
| `Users can update own profile` | UPDATE | Authenticated | Update own profile |

**Key Points:**
- Profiles are public (usernames, avatars, bios)
- Users can only edit their own profile

### Favorites Table

| Policy Name | Type | Who | What |
|------------|------|-----|------|
| `Users can view own favorites` | SELECT | Authenticated | View own favorites |
| `Users can insert own favorites` | INSERT | Authenticated | Add to favorites |
| `Users can update own favorites` | UPDATE | Authenticated | Update watch status |
| `Users can delete own favorites` | DELETE | Authenticated | Remove from favorites |

**Key Points:**
- Favorites are private (only owner can see)
- Full CRUD access for own favorites

## Troubleshooting

### 403 Forbidden Error

**Cause**: RLS policy is blocking the operation

**Solutions**:
1. Check if you're authenticated (logged in)
2. Verify the policy exists for your operation
3. Run `RESET_ALL_RLS_POLICIES.sql`
4. Clear browser cache

**Example**:
```
Error: 403 when deleting comment
→ Check: Does "users_delete_own_comments" policy exist?
→ Check: Are you the comment author?
→ Check: Is auth.uid() returning your user ID?
```

### 406 Not Acceptable Error

**Cause**: Query format doesn't match policy expectations

**Solutions**:
1. Check if SELECT policy allows reading the data
2. Verify you're not trying to read restricted columns
3. Run `RESET_RATINGS_POLICIES.sql` (common for ratings)
4. Clear browser cache

**Example**:
```
Error: 406 when loading ratings
→ Check: Does "public_read_ratings" policy exist?
→ Check: Is RLS enabled on ratings table?
→ Solution: Run RESET_RATINGS_POLICIES.sql
```

### Policy Not Working

**Debugging Steps**:

1. **Check if policy exists**:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'comments';
   ```

2. **Check if RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'comments';
   ```

3. **Test policy with SQL**:
   ```sql
   -- Try to select as your user
   SELECT * FROM comments WHERE user_id = auth.uid();
   ```

4. **Check auth.uid()**:
   ```sql
   SELECT auth.uid(); -- Should return your user ID
   ```

## Testing Policies

### Test Comments Policies

```sql
-- As authenticated user, insert your own comment
INSERT INTO comments (user_id, anime_id, content)
VALUES (auth.uid(), 1, 'Test comment');

-- Try to delete your own comment
DELETE FROM comments WHERE user_id = auth.uid() AND content = 'Test comment';

-- Try to delete someone else's comment (should fail unless admin/moderator)
DELETE FROM comments WHERE user_id != auth.uid() LIMIT 1;
```

### Test Ratings Policies

```sql
-- Anyone can read ratings
SELECT * FROM ratings LIMIT 10;

-- As authenticated user, insert your own rating
INSERT INTO ratings (user_id, anime_id, rating)
VALUES (auth.uid(), 1, 8);

-- Update your own rating
UPDATE ratings SET rating = 9 WHERE user_id = auth.uid() AND anime_id = 1;
```

### Test Admin Policies

```sql
-- Check if you're an admin
SELECT is_admin FROM profiles WHERE id = auth.uid();

-- If admin, try to delete any comment
DELETE FROM comments WHERE id = 'some-comment-id';
```

## Common Errors

### "permission denied for table X"

**Cause**: RLS is blocking all access

**Fix**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'X';

-- If true, check policies
SELECT policyname FROM pg_policies WHERE tablename = 'X';

-- If no policies, run RESET_ALL_RLS_POLICIES.sql
```

### "new row violates row-level security policy"

**Cause**: WITH CHECK clause is failing on INSERT/UPDATE

**Fix**:
```sql
-- Check the WITH CHECK clause
SELECT policyname, with_check FROM pg_policies WHERE tablename = 'X';

-- Common issue: auth.uid() doesn't match user_id
-- Solution: Ensure you're setting user_id = auth.uid() in your insert
```

### "infinite recursion detected in policy"

**Cause**: Policy references itself or creates a circular dependency

**Fix**:
- Simplify policy conditions
- Avoid nested EXISTS queries that reference the same table
- Run RESET_ALL_RLS_POLICIES.sql to get clean policies

## Browser Cache Issues

After updating RLS policies, you MUST clear browser cache:

### Why?

- Supabase client caches authentication tokens
- Old tokens might have old permissions
- Cached API responses might be stale

### How to Clear Cache

**Chrome/Edge**:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Select "Cookies and other site data"
4. Click "Clear data"

**Firefox**:
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Select "Cookies"
4. Click "Clear Now"

**Or use Incognito/Private mode** for testing.

## Best Practices

1. **Always test policies** after creating them
2. **Use the principle of least privilege**: Only grant necessary permissions
3. **Make public data truly public**: Don't require auth for SELECT on public data
4. **Separate read and write policies**: Different rules for SELECT vs INSERT/UPDATE/DELETE
5. **Document your policies**: Add comments explaining why each policy exists
6. **Keep policies simple**: Complex policies are hard to debug
7. **Test with different user roles**: Regular user, admin, moderator, anonymous
8. **Monitor policy performance**: Complex policies can slow down queries

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Policy Examples](https://supabase.com/docs/guides/auth/row-level-security#policy-examples)

## Quick Reference Commands

```sql
-- View all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'comments';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'comments';

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Disable RLS (not recommended for production)
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Drop a specific policy
DROP POLICY "policy_name" ON table_name;

-- Check current user
SELECT auth.uid();

-- Check if user is admin
SELECT is_admin FROM profiles WHERE id = auth.uid();
```
