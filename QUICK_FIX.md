# ⚡ QUICK FIX - Do This Now

## 1. Run SQL in Supabase (2 minutes)

```sql
-- Copy from supabase/EMERGENCY_FIX_ALL.sql and run in Supabase SQL Editor
-- OR run these essential commands:

-- Fix Comments
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_delete_own_comments" ON comments;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_delete_own_comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix Ratings  
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_ratings" ON ratings;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_ratings" ON ratings FOR SELECT USING (true);

-- Set Admin
UPDATE profiles SET is_admin = true WHERE email = 'lifeshindo96@gmail.com';

-- Clear Rate Limits
DELETE FROM rate_limits;
```

## 2. Clear Browser Cache (30 seconds)

Press `Ctrl + Shift + Delete` → Select "All time" → Clear

OR

Open Incognito window

## 3. Restart Dev Server (30 seconds)

```bash
# Ctrl+C to stop
npm run dev
```

## 4. Test (1 minute)

- Try deleting a comment → Should work
- Go to /admin → Should stay there
- Try rating anime → Should work

## ✅ Done!

If still not working, read `COMPLETE_FIX_GUIDE.md`
