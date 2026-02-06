# Task 20.2 Quick Checklist

## 📋 Vercel Project Setup - Quick Reference

Use this checklist to track your progress through Task 20.2.

---

## Pre-Flight Check

Before starting, ensure:
- [ ] Task 20.1 completed (code pushed to GitHub)
- [ ] GitHub repository is accessible
- [ ] Supabase credentials are ready:
  - [ ] Project URL: `https://xxxxxxxxxxxxx.supabase.co`
  - [ ] Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Step 1: Vercel Account Setup

- [ ] Navigate to https://vercel.com
- [ ] Click "Sign Up"
- [ ] Choose "Continue with GitHub"
- [ ] Authorize Vercel
- [ ] Verify dashboard access

---

## Step 2: Import Project

- [ ] Click "Add New..." → "Project"
- [ ] Find "shikaraka-anime-portal" repository
- [ ] Click "Import"
- [ ] Proceed to configuration page

---

## Step 3: Configure Project

### Basic Settings
- [ ] Project name: `shikaraka-anime-portal`
- [ ] Framework: `Vite` (auto-detected)
- [ ] Root directory: `./` (default)

### Build Settings
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

---

## Step 4: Environment Variables

### Add Variables
- [ ] Add `VITE_SUPABASE_URL`
  - Key: `VITE_SUPABASE_URL`
  - Value: Your Supabase project URL
  - Environment: All (Production, Preview, Development)

- [ ] Add `VITE_SUPABASE_ANON_KEY`
  - Key: `VITE_SUPABASE_ANON_KEY`
  - Value: Your Supabase anon key
  - Environment: All

### Verify
- [ ] Both variables show "Production, Preview, Development"
- [ ] Both variables start with `VITE_`

---

## Step 5: Deploy

- [ ] Review all settings
- [ ] Click "Deploy" button
- [ ] Monitor build logs
- [ ] Wait for "Deployment Ready" message (1-3 minutes)

---

## Step 6: Get Production URL

- [ ] Copy production URL: `https://shikaraka-anime-portal.vercel.app`
- [ ] Click "Visit" to open site
- [ ] Verify site loads

---

## Step 7: Update Supabase

- [ ] Open https://app.supabase.com
- [ ] Navigate to Authentication → URL Configuration
- [ ] Update Site URL to Vercel URL
- [ ] Add Redirect URL: `https://your-app.vercel.app/**`
- [ ] Keep localhost URL: `http://localhost:5173/**`
- [ ] Click "Save"

---

## Step 8: Verification Testing

### Home Page
- [ ] Hero section displays
- [ ] Anime cards load
- [ ] Skeleton screens work
- [ ] Images display
- [ ] No console errors

### Search
- [ ] Search field works
- [ ] Results display correctly
- [ ] Clear search returns popular anime

### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] User email shows in header
- [ ] Logout works

### Anime Details
- [ ] Click card opens detail page
- [ ] Poster displays
- [ ] Genres, status, studio visible
- [ ] Video player loads
- [ ] Favorite button visible (when logged in)

### Favorites
- [ ] Can add anime to favorites
- [ ] Heart icon fills
- [ ] Favorites page shows added anime
- [ ] Can remove from favorites

### Mobile Responsive
- [ ] Test on iPhone SE (375px) - 2 columns
- [ ] Test on iPad (768px) - 4 columns
- [ ] Test on Desktop (1920px) - 6 columns
- [ ] Touch targets are 44x44px minimum

### Navigation
- [ ] Direct URL navigation works (no 404)
- [ ] Page refresh works
- [ ] Browser back/forward works

### Performance
- [ ] Initial load < 3 seconds
- [ ] No failed requests
- [ ] Images lazy load
- [ ] Lighthouse score > 80

---

## Step 9: Optional - Custom Domain

- [ ] Add domain in Vercel Settings → Domains
- [ ] Configure DNS records
- [ ] Update Supabase URLs with custom domain
- [ ] Verify SSL certificate

---

## Step 10: Automatic Deployments

- [ ] Test push to GitHub triggers deployment
- [ ] Enable deployment notifications
- [ ] Verify preview deployments for branches

---

## Final Verification

### Configuration Complete
- [ ] Vercel project created
- [ ] GitHub integration active
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Supabase URLs updated

### All Features Working
- [ ] Home page ✅
- [ ] Search ✅
- [ ] Authentication ✅
- [ ] Anime details ✅
- [ ] Video player ✅
- [ ] Favorites ✅
- [ ] Mobile responsive ✅
- [ ] Direct navigation ✅

### Performance Verified
- [ ] Load time acceptable
- [ ] No console errors
- [ ] Images loading
- [ ] Caching working

---

## Troubleshooting Reference

### Build Fails
→ Check build logs for errors
→ Run `npm run build` locally
→ Fix TypeScript errors

### Environment Variables Not Working
→ Verify variables in Vercel settings
→ Ensure they start with `VITE_`
→ Redeploy after changes

### Authentication Fails
→ Check Supabase Site URL
→ Verify Redirect URLs
→ Check environment variables

### 404 on Refresh
→ Verify `vercel.json` exists
→ Check rewrite rules
→ Redeploy if needed

---

## Task Completion

✅ **Task 20.2 is complete when:**
- All checkboxes above are checked
- Production site is accessible
- All features are verified working
- No critical errors in console or logs

---

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repository**: https://github.com/yourusername/shikaraka-anime-portal
- **Production URL**: https://shikaraka-anime-portal.vercel.app
- **Detailed Guide**: See `VERCEL_SETUP_GUIDE.md`

---

## Time Estimate

- **Setup**: 10-15 minutes
- **Testing**: 5-10 minutes
- **Total**: ~15-25 minutes

---

## Next Task

After completing this checklist:
→ **Task 20.3**: Post-deployment verification and optimization

---

**Need Help?**
- See detailed instructions in `VERCEL_SETUP_GUIDE.md`
- Check troubleshooting section above
- Review `DEPLOYMENT.md` for comprehensive guide
