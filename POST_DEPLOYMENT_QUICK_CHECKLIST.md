# Post-Deployment Quick Checklist

## 🚀 Quick Verification (15 minutes)

Use this checklist for rapid post-deployment verification. For detailed testing, see `POST_DEPLOYMENT_VERIFICATION.md`.

---

## ✅ Critical Path Testing

### 1. Site Accessibility (2 min)
- [ ] Site loads at production URL
- [ ] No console errors
- [ ] Dark theme (#0a0a0c) applied
- [ ] Logo "ShiKaraKa" visible

### 2. Home Page (2 min)
- [ ] 24 anime cards load
- [ ] Each card shows: poster, title, rating, year
- [ ] Cards are clickable
- [ ] Hover effects work (desktop)

### 3. Search (2 min)
- [ ] Search field in header works
- [ ] Type "Naruto" → results appear
- [ ] Type "Наруто" → results appear
- [ ] Clear search → returns to popular anime

### 4. Anime Detail Page (2 min)
- [ ] Click any anime card
- [ ] Detail page loads
- [ ] Poster, info, and video player visible
- [ ] Video player has 16:9 ratio
- [ ] Kodik iframe loads

### 5. Authentication (3 min)
- [ ] Click "Войти" button
- [ ] Register new account (test+timestamp@example.com)
- [ ] Registration succeeds
- [ ] Header shows email
- [ ] Logout works
- [ ] Login with same credentials works

### 6. Favorites (2 min)
- [ ] Login to account
- [ ] Open any anime detail page
- [ ] Click "Добавить в список"
- [ ] Button changes to "Удалить из списка"
- [ ] Navigate to /favorites
- [ ] Anime appears in favorites list

### 7. Mobile Responsive (2 min)
- [ ] Open DevTools mobile view (375px width)
- [ ] Home page shows 2 columns
- [ ] Header is usable
- [ ] Anime detail page is single column
- [ ] Video player maintains 16:9 ratio
- [ ] Touch targets are adequate (44x44px)

---

## 🔍 Quick Error Checks

### Console Errors
- [ ] Open DevTools Console
- [ ] Navigate through site
- [ ] **Result**: No red errors (warnings OK)

### Network Errors
- [ ] Open DevTools Network tab
- [ ] Refresh page
- [ ] **Result**: All requests return 200 or 304
- [ ] **Result**: No 404 errors for assets

### API Integration
- [ ] Check Network tab for `shikimori.one/api` requests
- [ ] **Result**: Status 200
- [ ] **Result**: Response contains anime data

---

## 📱 Device Testing Matrix

| Device Type | Screen Size | Columns | Status |
|-------------|-------------|---------|--------|
| Mobile      | < 768px     | 2       | [ ]    |
| Tablet      | 768-1024px  | 4       | [ ]    |
| Desktop     | > 1024px    | 6       | [ ]    |

---

## ⚡ Performance Quick Check

### Lighthouse Audit (Chrome DevTools)
1. Open DevTools → Lighthouse
2. Select "Performance" only
3. Click "Analyze page load"

**Target Scores**:
- [ ] Performance: > 80
- [ ] FCP: < 1.8s
- [ ] LCP: < 2.5s

---

## 🔒 Security Quick Check

- [ ] View page source → no API keys visible
- [ ] Check localStorage → no sensitive data
- [ ] Login as User A, add favorite
- [ ] Login as User B → cannot see User A's favorites

---

## 🌐 Browser Compatibility

Test on at least 2 browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

**Result**: All features work in all tested browsers

---

## 📊 Environment Variables

Verify in Vercel Dashboard → Settings → Environment Variables:
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] Both are marked for Production environment

---

## 🎯 Critical Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Home page loads | [ ] | |
| Search works | [ ] | |
| Anime details load | [ ] | |
| Video player works | [ ] | |
| Registration works | [ ] | |
| Login works | [ ] | |
| Logout works | [ ] | |
| Add to favorites | [ ] | |
| Remove from favorites | [ ] | |
| View favorites | [ ] | |
| Mobile responsive | [ ] | |
| No console errors | [ ] | |

---

## 🚨 Red Flags (Stop and Fix)

If any of these occur, **DO NOT** proceed:
- ❌ Site doesn't load (blank page)
- ❌ Console full of errors
- ❌ Anime data doesn't load
- ❌ Authentication completely broken
- ❌ Database connection fails
- ❌ Video player never loads

**Action**: Check `POST_DEPLOYMENT_VERIFICATION.md` → Troubleshooting section

---

## ✅ Success Criteria

Deployment is successful when:
- ✅ All 12 critical features work
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Performance score > 80
- ✅ Authentication secure

---

## 📝 Next Steps

### If All Tests Pass ✅
1. Update README with production URL
2. Monitor Vercel Analytics for 24 hours
3. Collect user feedback
4. Plan next features

### If Tests Fail ❌
1. Document failing tests
2. Check Vercel deployment logs
3. Verify environment variables
4. Review `POST_DEPLOYMENT_VERIFICATION.md` for detailed troubleshooting
5. Fix issues and redeploy
6. Retest

---

## 🔗 Resources

- **Detailed Guide**: `POST_DEPLOYMENT_VERIFICATION.md`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Shikimori API**: https://shikimori.one/api/doc

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Review Vercel deployment logs
3. Check Supabase logs
4. Refer to troubleshooting section in detailed guide

---

**Estimated Time**: 15-20 minutes for quick verification
**Recommended**: Run full verification from `POST_DEPLOYMENT_VERIFICATION.md` before announcing to users

**Good luck! 🎉**
