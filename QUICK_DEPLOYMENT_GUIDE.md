# Quick Deployment Guide - ShiKaraKa V2

**Status:** ✅ PRODUCTION READY  
**Estimated Time:** 15-30 minutes

---

## 🚀 Quick Start (5 Steps)

### Step 1: Database Setup (5 minutes)
```sql
-- In Supabase SQL Editor, run these in order:
1. supabase/migrations/001_create_profiles_table.sql
2. supabase/migrations/002_create_favorites_table.sql
3. supabase/migrations/003_create_v2_tables.sql
4. supabase/migrations/004_update_existing_tables.sql
5. supabase/migrations/005_create_admin_trigger.sql
6. supabase/migrations/006_create_indexes.sql
7. supabase/migrations/007_create_avatars_bucket.sql

-- Verify:
-- Run: supabase/migrations/VERIFY_V2_SETUP.sql
```

### Step 2: Environment Variables (2 minutes)
In Vercel Dashboard → Settings → Environment Variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
VITE_ADMIN_EMAIL=lifeshindo96@gmail.com
```

### Step 3: Deploy (5 minutes)
```bash
# Option A: GitHub Integration (Recommended)
git push origin main
# Vercel auto-deploys

# Option B: Vercel CLI
vercel --prod
```

### Step 4: Verify Deployment (10 minutes)
Visit your deployment URL and test:
- [ ] Homepage loads
- [ ] User registration works (with CAPTCHA)
- [ ] Login works
- [ ] Add comment
- [ ] Rate anime
- [ ] Add to favorites
- [ ] Admin panel (lifeshindo96@gmail.com)

### Step 5: Monitor (30 minutes)
- Check Vercel logs for errors
- Monitor Supabase dashboard
- Test on mobile device
- Verify rate limiting works

---

## 🆘 Quick Troubleshooting

### Issue: 403 Forbidden on comments
```sql
-- Run: supabase/RESET_COMMENTS_POLICIES.sql
```

### Issue: Rate limiting too aggressive
```sql
-- Run: supabase/CLEAR_RATE_LIMITS.sql
DELETE FROM rate_limits;
```

### Issue: Admin panel not accessible
```sql
UPDATE profiles SET is_admin = true 
WHERE email = 'lifeshindo96@gmail.com';
```

### Issue: Avatar upload fails
```sql
-- Run: supabase/FIX_STORAGE_POLICIES.sql
```

---

## 📚 Full Documentation

For detailed information, see:
- **Setup:** `DEPLOYMENT.md`
- **Database:** `supabase/SETUP_INSTRUCTIONS.md`
- **Verification:** `.kiro/specs/shikaraka-v2-features/FINAL_SYSTEM_VERIFICATION.md`
- **Readiness:** `.kiro/specs/shikaraka-v2-features/DEPLOYMENT_READINESS.md`
- **Summary:** `.kiro/specs/shikaraka-v2-features/COMPLETION_SUMMARY.md`

---

## ✅ Success Checklist

Deployment is successful when:
- [x] Build completed without errors
- [ ] All migrations applied
- [ ] Environment variables set
- [ ] Homepage loads
- [ ] Users can register and login
- [ ] Comments work
- [ ] Ratings work
- [ ] Admin panel accessible
- [ ] No errors in logs

---

**Ready to deploy?** Follow the 5 steps above! 🚀

**Need help?** Check the troubleshooting section or full documentation.

**Questions?** Review `.kiro/specs/shikaraka-v2-features/DEPLOYMENT_READINESS.md`
