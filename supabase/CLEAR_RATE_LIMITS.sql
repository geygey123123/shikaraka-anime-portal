-- Clear all rate limit records for testing
-- Run this if you're blocked and want to reset all rate limits

-- Option 1: Clear ALL rate limits (use for testing)
DELETE FROM rate_limits;

-- Option 2: Clear rate limits for a specific user (replace YOUR_USER_ID)
-- DELETE FROM rate_limits WHERE user_id = 'YOUR_USER_ID';

-- Option 3: Clear only blocked users
-- DELETE FROM rate_limits WHERE is_blocked = true;

-- Option 4: Unblock all users without deleting records
-- UPDATE rate_limits SET is_blocked = false, blocked_until = NULL;

-- Verify the table is cleared
SELECT COUNT(*) as remaining_rate_limits FROM rate_limits;

-- Check if any users are still blocked
SELECT COUNT(*) as blocked_users FROM rate_limits WHERE is_blocked = true;
