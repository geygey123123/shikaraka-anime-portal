# Fix Rate Limiting Excessive Blocking - Step by Step Guide

## Problem
Users are getting blocked after just 1 action with messages like "Попробуйте позже через 1440 минут" (24 hours).

## Root Cause
The rate limiting settings were too restrictive:
- **Old limits**: 5 comments/hour, 20 ratings/hour
- **Old block duration**: 24 hours (1440 minutes)

These limits were too aggressive for normal user behavior.

## Solution

### Changes Made

The rate limits have been adjusted to more reasonable values:

| Action | Old Limit | New Limit | Window |
|--------|-----------|-----------|--------|
| Comments | 5/hour | 30/hour | 1 hour |
| Ratings | 20/hour | 50/hour | 1 hour |
| Profile Updates | 10/hour | 10/hour | 1 hour |
| Registration | 3/hour | 3/hour | 1 hour |

**Block Duration**: Reduced from 24 hours to 1 hour

### Step 1: Clear Existing Rate Limits

If you're currently blocked, you need to clear the rate limits table:

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following:

```sql
-- Clear all rate limits
DELETE FROM rate_limits;
```

5. Click **Run** to execute

### Step 2: Verify Rate Limits Are Cleared

Run this query to confirm:

```sql
SELECT COUNT(*) as remaining_rate_limits FROM rate_limits;
```

Should return `0` or a very small number.

### Step 3: Test the Application

1. Log in to your application
2. Try performing actions that were previously blocked:
   - Add multiple comments
   - Rate multiple anime
   - Update your profile
3. You should be able to perform many more actions before hitting the limit

### Step 4: Monitor Rate Limiting

To see your current rate limit status:

```sql
-- Check your rate limits (replace YOUR_USER_ID)
SELECT 
    action_type,
    action_count,
    window_start,
    is_blocked,
    blocked_until
FROM rate_limits
WHERE user_id = 'YOUR_USER_ID';
```

## Understanding the New Limits

### Comments: 30 per hour
- Allows active users to participate in discussions
- Still prevents spam (30 comments in 1 hour is a lot)
- If exceeded, user is blocked for 1 hour (not 24 hours)

### Ratings: 50 per hour
- Users might want to rate many anime in one session
- 50 ratings is reasonable for a binge-rating session
- If exceeded, user is blocked for 1 hour

### Profile Updates: 10 per hour
- Unchanged - 10 profile updates per hour is generous
- Prevents abuse of avatar uploads and bio changes

### Registration: 3 per hour
- Unchanged - prevents bot registrations
- 3 attempts per hour per IP is reasonable

## Troubleshooting

### Still Getting Blocked Too Quickly?

1. **Check if old rate limits exist:**
   ```sql
   SELECT * FROM rate_limits WHERE user_id = 'YOUR_USER_ID';
   ```

2. **Clear your specific rate limits:**
   ```sql
   DELETE FROM rate_limits WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Check the application code:**
   - Verify `src/services/rateLimit.service.ts` has the new limits
   - Restart your development server if running locally
   - Clear browser cache

### Want to Adjust Limits Further?

Edit `src/services/rateLimit.service.ts`:

```typescript
private readonly limits: Record<ActionType, RateLimitRule> = {
  comment: { max: 30, window: 3600 },      // Adjust max value
  rating: { max: 50, window: 3600 },       // Adjust max value
  profile_update: { max: 10, window: 3600 },
  registration: { max: 3, window: 3600 },
};

private readonly BLOCK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
```

### Disable Rate Limiting for Testing

**NOT RECOMMENDED FOR PRODUCTION**

If you want to disable rate limiting temporarily for testing:

1. Comment out the rate limit check in your services:
   ```typescript
   // await rateLimitModule.checkRateLimit(userId, 'comment');
   ```

2. Or increase limits to very high values:
   ```typescript
   comment: { max: 1000, window: 3600 },
   rating: { max: 1000, window: 3600 },
   ```

## Best Practices

1. **Monitor rate limit hits**: Check the `rate_limits` table periodically
2. **Adjust based on usage**: If legitimate users hit limits, increase them
3. **Log suspicious activity**: The app already logs when limits are exceeded
4. **Consider IP-based limits**: For registration, track by IP not just user
5. **Gradual blocking**: Consider warning users before blocking them

## SQL Queries for Monitoring

### See all blocked users:
```sql
SELECT 
    user_id,
    action_type,
    action_count,
    blocked_until
FROM rate_limits
WHERE is_blocked = true;
```

### See users close to limits:
```sql
SELECT 
    user_id,
    action_type,
    action_count,
    window_start
FROM rate_limits
WHERE action_count > 20
ORDER BY action_count DESC;
```

### Clear old rate limit records:
```sql
-- Delete records older than 7 days
DELETE FROM rate_limits
WHERE window_start < NOW() - INTERVAL '7 days';
```

## Additional Resources

- [Rate Limiting Best Practices](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
