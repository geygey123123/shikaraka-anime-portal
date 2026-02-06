# Post-Deployment Verification Guide

## Overview

This comprehensive guide covers all verification steps needed after deploying ShiKaraKa Anime Portal to production. Follow each section systematically to ensure all features work correctly.

**Production URL**: `https://your-project.vercel.app` (replace with actual URL)

---

## Table of Contents

1. [Initial Deployment Verification](#1-initial-deployment-verification)
2. [Authentication Testing](#2-authentication-testing)
3. [API Integration Testing](#3-api-integration-testing)
4. [Core Features Testing](#4-core-features-testing)
5. [Mobile & Responsive Testing](#5-mobile--responsive-testing)
6. [Performance Testing](#6-performance-testing)
7. [Error Handling Testing](#7-error-handling-testing)
8. [Security & Privacy Testing](#8-security--privacy-testing)
9. [Browser Compatibility Testing](#9-browser-compatibility-testing)
10. [Final Checklist](#10-final-checklist)

---

## 1. Initial Deployment Verification

### 1.1 Basic Accessibility
- [ ] Open production URL in browser
- [ ] Verify site loads without errors
- [ ] Check browser console for errors (should be clean)
- [ ] Verify favicon appears in browser tab
- [ ] Check page title displays "ShiKaraKa"

### 1.2 Environment Variables
- [ ] Verify Supabase connection (no auth errors in console)
- [ ] Check Shikimori API integration (anime data loads)
- [ ] Confirm all environment variables are set in Vercel dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 1.3 Build Verification
- [ ] Check Network tab - verify assets load from CDN
- [ ] Verify CSS loads correctly (dark theme #0a0a0c background)
- [ ] Check JavaScript bundles load without 404 errors
- [ ] Verify images load correctly

**Expected Result**: Site loads completely with no console errors, dark theme applied, and all assets loading successfully.

---

## 2. Authentication Testing

### 2.1 User Registration
**Test Case**: New user registration

**Steps**:
1. Click "Войти" button in header
2. Switch to "Регистрация" tab
3. Enter test email: `test+[timestamp]@example.com`
4. Enter password: `testpass123`
5. Click "Зарегистрироваться"

**Expected Results**:
- [ ] Form validates email format
- [ ] Form validates password length (min 6 characters)
- [ ] Registration succeeds
- [ ] User is automatically logged in
- [ ] Modal closes
- [ ] Header shows user email
- [ ] No errors in console

**Validation Tests**:
- [ ] Invalid email format shows error: "Введите корректный email адрес"
- [ ] Password < 6 chars shows error: "Пароль должен содержать минимум 6 символов"
- [ ] Duplicate email shows error: "Пользователь с таким email уже существует"

### 2.2 User Login
**Test Case**: Existing user login

**Steps**:
1. Logout if logged in
2. Click "Войти" button
3. Enter registered email
4. Enter correct password
5. Click "Войти"

**Expected Results**:
- [ ] Login succeeds
- [ ] Session is established
- [ ] Header shows user email
- [ ] Modal closes
- [ ] User can access favorites

**Error Cases**:
- [ ] Wrong password shows error: "Неверный email или пароль"
- [ ] Non-existent email shows error: "Неверный email или пароль"

### 2.3 Session Persistence
**Test Case**: Session survives page refresh

**Steps**:
1. Login successfully
2. Refresh page (F5)
3. Check authentication state

**Expected Results**:
- [ ] User remains logged in after refresh
- [ ] Header still shows user email
- [ ] Favorites are accessible

### 2.4 Logout
**Test Case**: User logout

**Steps**:
1. While logged in, click user email in header
2. Click "Выйти"

**Expected Results**:
- [ ] User is logged out
- [ ] Session is cleared
- [ ] Header shows "Войти" button
- [ ] Favorites page redirects to home
- [ ] Favorite buttons disappear from anime pages

---

## 3. API Integration Testing

### 3.1 Shikimori API Connection
**Test Case**: Popular anime loading

**Steps**:
1. Open home page
2. Wait for anime grid to load

**Expected Results**:
- [ ] Skeleton screens appear during loading
- [ ] 24 anime cards load successfully
- [ ] Each card shows:
  - Poster image
  - Title (Russian or English)
  - Rating score
  - Release year
- [ ] No API errors in console
- [ ] Images load correctly

**Network Verification**:
- [ ] Check Network tab for request to `https://shikimori.one/api/animes`
- [ ] Verify response status: 200 OK
- [ ] Verify response contains anime data array

### 3.2 API Error Handling
**Test Case**: Graceful degradation on API failure

**Steps**:
1. Open DevTools > Network tab
2. Enable "Offline" mode
3. Refresh page

**Expected Results**:
- [ ] Error message displays: "Не удалось загрузить данные. Проверьте подключение к интернету."
- [ ] "Попробовать снова" button appears
- [ ] No app crash
- [ ] Error logged to console

### 3.3 API Rate Limiting
**Test Case**: Handle rate limits gracefully

**Steps**:
1. Rapidly search for different anime (10+ searches quickly)
2. Observe behavior

**Expected Results**:
- [ ] Debounce prevents excessive requests (300ms delay)
- [ ] No rate limit errors
- [ ] Searches complete successfully

---

## 4. Core Features Testing

### 4.1 Home Page - Popular Anime
**Test Case**: Main page functionality

**Steps**:
1. Navigate to home page
2. Observe anime grid

**Expected Results**:
- [ ] Hero section displays "ShiKaraKa" title
- [ ] Anime grid shows 24 popular anime
- [ ] Grid is responsive:
  - Desktop (>1024px): 6 columns
  - Tablet (768-1024px): 4 columns
  - Mobile (<768px): 2 columns
- [ ] Hover effects work on cards (lift + shadow)
- [ ] Cards are clickable

### 4.2 Search Functionality
**Test Case**: Anime search

**Steps**:
1. Click search field in header
2. Type "Naruto"
3. Wait for results

**Expected Results**:
- [ ] Search debounces (waits 300ms after typing stops)
- [ ] Skeleton screens appear during search
- [ ] Search results display matching anime
- [ ] Results show in grid format
- [ ] Each result is clickable

**Edge Cases**:
- [ ] Empty search returns to popular anime
- [ ] Search with no results shows: "Ничего не найдено"
- [ ] Search works with Russian text: "Наруто"
- [ ] Search works with English text: "Naruto"

### 4.3 Anime Detail Page
**Test Case**: Detailed anime information

**Steps**:
1. Click any anime card from home page
2. Wait for detail page to load

**Expected Results**:
- [ ] URL changes to `/anime/:id`
- [ ] Page loads without errors
- [ ] Left column shows:
  - Large poster image
  - Anime title
  - Rating score
  - Status (ongoing/completed)
  - Release year
  - Genres list
  - Studio name
- [ ] Right column shows:
  - Video player (16:9 aspect ratio)
  - Description
- [ ] Video player initializes with Kodik iframe
- [ ] Favorite button appears (if logged in)

**Mobile Layout**:
- [ ] On mobile (<768px), layout switches to single column
- [ ] Poster appears at top
- [ ] Video player maintains 16:9 ratio
- [ ] All information remains accessible

### 4.4 Video Player
**Test Case**: Video playback functionality

**Steps**:
1. Open any anime detail page
2. Observe video player

**Expected Results**:
- [ ] Iframe loads with Kodik player
- [ ] Player URL contains correct shikimori_id
- [ ] 16:9 aspect ratio maintained on all screen sizes
- [ ] Player controls are accessible
- [ ] Fullscreen button works

**Error Handling**:
- [ ] If video unavailable, shows fallback message
- [ ] "Попробовать другой плеер" button appears
- [ ] Link to Shikimori page provided as alternative
- [ ] No app crash on player error

### 4.5 Favorites Management
**Test Case**: Add/remove favorites (requires authentication)

**Prerequisites**: User must be logged in

**Steps - Add to Favorites**:
1. Login to account
2. Navigate to any anime detail page
3. Click "Добавить в список" button

**Expected Results**:
- [ ] Button shows loading state
- [ ] Request sent to Supabase
- [ ] Button changes to "Удалить из списка"
- [ ] Heart icon fills with color (#ff0055)
- [ ] No errors in console

**Steps - Remove from Favorites**:
1. On anime already in favorites
2. Click "Удалить из списка" button

**Expected Results**:
- [ ] Button shows loading state
- [ ] Record deleted from Supabase
- [ ] Button changes to "Добавить в список"
- [ ] Heart icon becomes outline only
- [ ] No errors in console

**Steps - View Favorites**:
1. Navigate to `/favorites` page

**Expected Results**:
- [ ] All favorited anime display in grid
- [ ] Grid uses same responsive layout as home
- [ ] Each card is clickable
- [ ] Empty state shows if no favorites: "У вас пока нет избранных аниме"

**Unauthenticated Behavior**:
- [ ] Favorite buttons hidden when not logged in
- [ ] `/favorites` page redirects to home or shows login prompt

---

## 5. Mobile & Responsive Testing

### 5.1 Mobile Devices (< 768px)
**Test on**: iPhone, Android phone, or browser DevTools mobile emulation

**Home Page**:
- [ ] Grid shows 2 columns
- [ ] Cards are appropriately sized
- [ ] Touch targets are at least 44x44px
- [ ] Scrolling is smooth
- [ ] No horizontal overflow

**Header**:
- [ ] Logo is visible
- [ ] Search field is accessible
- [ ] Auth buttons are tappable
- [ ] Mobile menu works (if implemented)

**Anime Detail Page**:
- [ ] Single column layout
- [ ] Poster displays at top
- [ ] Video player maintains 16:9 ratio
- [ ] All text is readable
- [ ] Buttons are easily tappable

**Touch Interactions**:
- [ ] Cards respond to tap
- [ ] Buttons have visible tap feedback
- [ ] No accidental double-taps
- [ ] Swipe gestures don't break layout

### 5.2 Tablet Devices (768px - 1024px)
**Test on**: iPad, Android tablet, or browser DevTools

**Expected Results**:
- [ ] Grid shows 4 columns
- [ ] Layout adapts smoothly
- [ ] Touch targets remain accessible
- [ ] Video player scales appropriately

### 5.3 Desktop (> 1024px)
**Test on**: Desktop browser

**Expected Results**:
- [ ] Grid shows 6 columns
- [ ] Hover effects work on cards
- [ ] Layout uses full width appropriately
- [ ] No wasted space

### 5.4 Orientation Changes
**Test Case**: Rotate device

**Steps**:
1. Open site on mobile device
2. Rotate from portrait to landscape
3. Rotate back to portrait

**Expected Results**:
- [ ] Layout adapts immediately
- [ ] No content cut off
- [ ] Video player adjusts correctly
- [ ] No layout breaks

---

## 6. Performance Testing

### 6.1 Page Load Speed
**Test Case**: Initial page load performance

**Tools**: Chrome DevTools > Lighthouse

**Steps**:
1. Open DevTools
2. Run Lighthouse audit (Performance)
3. Review metrics

**Target Metrics**:
- [ ] First Contentful Paint (FCP): < 1.8s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Time to Interactive (TTI): < 3.8s
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] Performance Score: > 80

### 6.2 Image Loading
**Test Case**: Lazy loading verification

**Steps**:
1. Open home page
2. Open Network tab
3. Scroll down slowly

**Expected Results**:
- [ ] Images load only when scrolling near them
- [ ] Skeleton screens appear before images load
- [ ] Smooth transition when images appear
- [ ] No layout shift when images load

### 6.3 Code Splitting
**Test Case**: Verify bundle optimization

**Steps**:
1. Open Network tab
2. Navigate between pages
3. Observe JavaScript files loaded

**Expected Results**:
- [ ] Separate chunks for each route
- [ ] Vendor code in separate bundle
- [ ] React Query in separate bundle
- [ ] Supabase in separate bundle
- [ ] Total bundle size reasonable (< 500KB gzipped)

### 6.4 Caching
**Test Case**: React Query cache utilization

**Steps**:
1. Visit anime detail page
2. Go back to home
3. Click same anime again

**Expected Results**:
- [ ] Second load is instant (no loading state)
- [ ] Data served from cache
- [ ] No duplicate API requests
- [ ] Cache expires after 5-10 minutes (staleTime)

### 6.5 Prefetching
**Test Case**: Hover prefetch optimization

**Steps**:
1. Open home page
2. Hover over anime card (don't click)
3. Wait 1 second
4. Click the card

**Expected Results**:
- [ ] Detail page loads instantly
- [ ] Data was prefetched on hover
- [ ] Network tab shows prefetch request
- [ ] Smooth user experience

---

## 7. Error Handling Testing

### 7.1 Network Errors
**Test Case**: Offline behavior

**Steps**:
1. Open DevTools > Network
2. Set to "Offline"
3. Try to load anime data

**Expected Results**:
- [ ] Error message displays
- [ ] "Попробовать снова" button appears
- [ ] Clicking retry attempts to reload
- [ ] No app crash
- [ ] Error logged to console

### 7.2 API Errors
**Test Case**: Simulate API failure

**Steps**:
1. Open DevTools > Network
2. Block requests to `shikimori.one`
3. Refresh page

**Expected Results**:
- [ ] Graceful error message
- [ ] Retry functionality available
- [ ] App remains functional
- [ ] Other features still work

### 7.3 Authentication Errors
**Test Case**: Invalid credentials

**Steps**:
1. Try to login with wrong password
2. Try to register with existing email

**Expected Results**:
- [ ] Clear error messages displayed
- [ ] Form remains usable
- [ ] No console errors
- [ ] User can retry

### 7.4 Video Player Errors
**Test Case**: Video unavailable

**Steps**:
1. Find anime with no available video
2. Observe player behavior

**Expected Results**:
- [ ] Fallback message displays
- [ ] Alternative options provided
- [ ] No iframe error in console
- [ ] Page remains functional

### 7.5 404 Errors
**Test Case**: Invalid routes

**Steps**:
1. Navigate to `/invalid-route`
2. Navigate to `/anime/999999` (non-existent ID)

**Expected Results**:
- [ ] 404 page displays
- [ ] User can navigate back
- [ ] No console errors
- [ ] App doesn't crash

### 7.6 Error Boundary
**Test Case**: React error boundary

**Steps**:
1. Trigger a React error (if possible)
2. Observe error boundary

**Expected Results**:
- [ ] Error boundary catches error
- [ ] Fallback UI displays
- [ ] "Перезагрузить страницу" button works
- [ ] Error logged to console

---

## 8. Security & Privacy Testing

### 8.1 Environment Variables
**Test Case**: Secrets not exposed

**Steps**:
1. View page source
2. Check JavaScript bundles
3. Inspect Network requests

**Expected Results**:
- [ ] No API keys in source code
- [ ] No secrets in JavaScript bundles
- [ ] Supabase anon key is public (expected)
- [ ] No sensitive data in localStorage

### 8.2 Row Level Security (RLS)
**Test Case**: Users can only access their own data

**Prerequisites**: Two different user accounts

**Steps**:
1. Login as User A
2. Add anime to favorites
3. Note the favorite ID in Network tab
4. Logout
5. Login as User B
6. Try to access User A's favorites

**Expected Results**:
- [ ] User B cannot see User A's favorites
- [ ] User B cannot delete User A's favorites
- [ ] Supabase RLS policies enforced
- [ ] No unauthorized data access

### 8.3 SQL Injection Protection
**Test Case**: Supabase protects against SQL injection

**Steps**:
1. Try to search for: `'; DROP TABLE favorites; --`
2. Try to login with SQL injection attempts

**Expected Results**:
- [ ] No SQL injection possible
- [ ] Supabase client sanitizes inputs
- [ ] No database errors
- [ ] App remains secure

### 8.4 XSS Protection
**Test Case**: Cross-site scripting prevention

**Steps**:
1. Try to add anime with name: `<script>alert('XSS')</script>`
2. Search for: `<img src=x onerror=alert('XSS')>`

**Expected Results**:
- [ ] Scripts don't execute
- [ ] React escapes HTML by default
- [ ] No XSS vulnerabilities
- [ ] Content displays safely

---

## 9. Browser Compatibility Testing

### 9.1 Chrome/Edge (Chromium)
**Test on**: Latest Chrome or Edge

**Expected Results**:
- [ ] All features work
- [ ] No console errors
- [ ] Smooth animations
- [ ] Video player works

### 9.2 Firefox
**Test on**: Latest Firefox

**Expected Results**:
- [ ] All features work
- [ ] No console errors
- [ ] Layout consistent with Chrome
- [ ] Video player works

### 9.3 Safari (Desktop)
**Test on**: Latest Safari (macOS)

**Expected Results**:
- [ ] All features work
- [ ] No console errors
- [ ] Webkit-specific CSS works
- [ ] Video player works

### 9.4 Safari (iOS)
**Test on**: iPhone Safari

**Expected Results**:
- [ ] Touch interactions work
- [ ] Video player works
- [ ] No layout issues
- [ ] Smooth scrolling

### 9.5 Older Browsers
**Test on**: Browsers from last 2 years

**Expected Results**:
- [ ] Core functionality works
- [ ] Graceful degradation if needed
- [ ] No critical errors

---

## 10. Final Checklist

### 10.1 Functional Requirements
- [ ] **Req 1**: Home page displays popular anime ✓
- [ ] **Req 2**: Search works with Russian/English ✓
- [ ] **Req 3**: Anime detail page shows all info + video ✓
- [ ] **Req 4**: Authentication (register/login/logout) works ✓
- [ ] **Req 5**: Favorites (add/remove/view) work ✓
- [ ] **Req 6**: Database stores users and favorites ✓
- [ ] **Req 7**: Shikimori API integration works ✓
- [ ] **Req 8**: Responsive design on all devices ✓
- [ ] **Req 9**: Error handling and loading states ✓
- [ ] **Req 10**: Performance optimized ✓
- [ ] **Req 11**: Deployed on Vercel ✓

### 10.2 User Experience
- [ ] Site loads quickly (< 3s)
- [ ] Navigation is intuitive
- [ ] Animations are smooth
- [ ] No layout shifts
- [ ] Touch targets are adequate
- [ ] Error messages are clear
- [ ] Loading states are visible

### 10.3 Technical Quality
- [ ] No console errors
- [ ] No 404 errors for assets
- [ ] All images load
- [ ] Video player works
- [ ] API requests succeed
- [ ] Caching works correctly
- [ ] Code splitting implemented

### 10.4 Security
- [ ] Environment variables secure
- [ ] RLS policies enforced
- [ ] No XSS vulnerabilities
- [ ] No SQL injection possible
- [ ] HTTPS enabled

### 10.5 Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Supabase logs accessible

---

## Troubleshooting Common Issues

### Issue: Site shows blank page
**Solution**:
1. Check browser console for errors
2. Verify environment variables in Vercel
3. Check Vercel deployment logs
4. Ensure `vercel.json` has correct rewrites

### Issue: Authentication doesn't work
**Solution**:
1. Verify Supabase URL and anon key
2. Check Supabase project is active
3. Verify RLS policies are enabled
4. Check browser console for auth errors

### Issue: Anime data doesn't load
**Solution**:
1. Check Shikimori API status
2. Verify network requests in DevTools
3. Check for CORS errors
4. Verify React Query configuration

### Issue: Video player doesn't work
**Solution**:
1. Check if Kodik player is accessible
2. Verify shikimori_id is correct
3. Try alternative player URL
4. Check for iframe blocking

### Issue: Mobile layout broken
**Solution**:
1. Verify Tailwind responsive classes
2. Check viewport meta tag
3. Test in real device (not just DevTools)
4. Verify CSS media queries

---

## Post-Verification Actions

### If All Tests Pass ✅
1. **Document Production URL**: Update README with live URL
2. **Share with Users**: Announce deployment
3. **Monitor Metrics**: Watch Vercel Analytics for first 24 hours
4. **Collect Feedback**: Set up feedback mechanism
5. **Plan Improvements**: Create backlog for future features

### If Tests Fail ❌
1. **Document Issues**: List all failing tests
2. **Prioritize Fixes**: Critical bugs first
3. **Fix and Redeploy**: Address issues systematically
4. **Retest**: Run verification again
5. **Iterate**: Repeat until all tests pass

---

## Continuous Monitoring

### Daily Checks (First Week)
- [ ] Check Vercel deployment status
- [ ] Review error logs
- [ ] Monitor API usage
- [ ] Check user registrations

### Weekly Checks (Ongoing)
- [ ] Review performance metrics
- [ ] Check for dependency updates
- [ ] Monitor Shikimori API changes
- [ ] Review user feedback

### Monthly Maintenance
- [ ] Update dependencies
- [ ] Review and optimize slow queries
- [ ] Analyze user behavior
- [ ] Plan feature improvements

---

## Success Criteria

The deployment is considered successful when:

✅ All 11 requirements are verified working
✅ No critical errors in production
✅ Performance metrics meet targets
✅ Mobile experience is smooth
✅ Authentication is secure and reliable
✅ API integration is stable
✅ Error handling is graceful
✅ User feedback is positive

---

## Conclusion

This verification guide ensures comprehensive testing of all ShiKaraKa features in production. Follow each section systematically, document any issues, and address them before considering the deployment complete.

**Remember**: Quality over speed. It's better to catch issues now than after users encounter them.

**Good luck with your deployment! 🚀**
