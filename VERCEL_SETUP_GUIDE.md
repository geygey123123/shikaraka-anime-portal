# 🚀 Vercel Setup Guide - Task 20.2

## Overview

This guide provides step-by-step instructions for setting up your ShiKaraKa Anime Portal project on Vercel. This task requires manual actions through the Vercel web interface.

**Prerequisites:**
- ✅ Task 20.1 completed (GitHub repository created and code pushed)
- ✅ GitHub account with repository access
- ✅ Supabase project configured with credentials ready

**Time required:** ~10-15 minutes

---

## Step 1: Create Vercel Account

### 1.1 Sign Up for Vercel

1. Open your browser and navigate to: **https://vercel.com**
2. Click the **"Sign Up"** button in the top-right corner
3. Choose **"Continue with GitHub"** (recommended)
   - This allows seamless integration with your repositories
   - Vercel will request permission to access your GitHub account
4. Click **"Authorize Vercel"** when prompted by GitHub
5. Complete any additional verification steps if required

### 1.2 Verify Account Creation

After authorization, you should see:
- Vercel dashboard with "Welcome" message
- Option to create a new project
- Your GitHub account connected

> 💡 **Tip**: Vercel's free "Hobby" tier is perfect for this project and includes:
> - Unlimited deployments
> - Automatic HTTPS
> - Global CDN
> - 100GB bandwidth per month

---

## Step 2: Import Project from GitHub

### 2.1 Start Project Import

1. On the Vercel dashboard, click **"Add New..."** button
2. Select **"Project"** from the dropdown menu
3. You'll see the "Import Git Repository" page

### 2.2 Find Your Repository

1. Look for the **"Import Git Repository"** section
2. You should see a list of your GitHub repositories
3. Find **"shikaraka-anime-portal"** (or whatever you named it)
   
   **If you don't see your repository:**
   - Click **"Adjust GitHub App Permissions"**
   - Grant Vercel access to the specific repository
   - Return to the import page

4. Click **"Import"** next to your repository

### 2.3 Configure Import Settings

You'll be taken to the "Configure Project" page.

---

## Step 3: Configure Project Settings

### 3.1 Project Name

- **Project Name**: `shikaraka-anime-portal` (or customize)
- This will be part of your default URL: `shikaraka-anime-portal.vercel.app`
- You can change this later in project settings

### 3.2 Framework Preset

Vercel should **automatically detect** the framework:
- **Framework Preset**: `Vite`
- **Status**: ✅ Detected

**If not detected:**
1. Click the **"Framework Preset"** dropdown
2. Select **"Vite"** from the list

### 3.3 Root Directory

- **Root Directory**: Leave as `./` (default)
- The project is in the root of the repository

### 3.4 Build and Output Settings

Vercel will automatically configure these based on the `vercel.json` file:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Verification:**
- Click **"Build and Output Settings"** to expand
- Verify the commands match above
- If different, click **"Override"** and set manually

> ✅ **Note**: These settings are already configured in your `vercel.json` file, so Vercel should detect them automatically.

---

## Step 4: Configure Environment Variables

This is the **most critical step** for your application to work correctly.

### 4.1 Open Environment Variables Section

1. Scroll down to **"Environment Variables"** section
2. Click to expand if collapsed

### 4.2 Get Your Supabase Credentials

Before adding variables, retrieve your Supabase credentials:

1. Open a new browser tab
2. Go to: **https://app.supabase.com**
3. Select your ShiKaraKa project
4. Navigate to: **Settings** → **API**
5. Copy the following values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

> 💡 **Tip**: Keep this tab open - you'll need these values in the next step

### 4.3 Add Environment Variables

Add each variable one by one:

#### Variable 1: VITE_SUPABASE_URL

1. In the **"Key"** field, enter: `VITE_SUPABASE_URL`
2. In the **"Value"** field, paste your Supabase Project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`
3. In the **"Environment"** dropdown, select: **All** (Production, Preview, Development)
4. Click **"Add"**

#### Variable 2: VITE_SUPABASE_ANON_KEY

1. In the **"Key"** field, enter: `VITE_SUPABASE_ANON_KEY`
2. In the **"Value"** field, paste your Supabase anon/public key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. In the **"Environment"** dropdown, select: **All**
4. Click **"Add"**

### 4.4 Verify Environment Variables

After adding both variables, you should see:

```
✅ VITE_SUPABASE_URL          Production, Preview, Development
✅ VITE_SUPABASE_ANON_KEY     Production, Preview, Development
```

> ⚠️ **Critical**: Both variables MUST start with `VITE_` to be accessible in the client-side code!

> 🔒 **Security Note**: The `anon` key is safe to use in client-side code. Supabase's Row Level Security (RLS) protects your data.

---

## Step 5: Deploy!

### 5.1 Start Deployment

1. Review all settings one final time:
   - ✅ Framework: Vite
   - ✅ Build Command: `npm run build`
   - ✅ Output Directory: `dist`
   - ✅ Environment Variables: 2 added
2. Click the **"Deploy"** button

### 5.2 Monitor Build Process

Vercel will now:
1. **Clone** your repository from GitHub
2. **Install** dependencies (`npm install`)
3. **Build** your application (`npm run build`)
4. **Deploy** to their global CDN

You'll see a real-time build log showing:
```
Running "npm install"
Running "npm run build"
Building...
Uploading...
Deployment Ready
```

**Build time:** Usually 1-3 minutes

### 5.3 Handle Build Errors (if any)

If the build fails:

1. **Read the error message** in the build log
2. Common issues:
   - **TypeScript errors**: Fix in your code and push to GitHub
   - **Missing dependencies**: Ensure all packages are in `package.json`
   - **Environment variables**: Verify they're set correctly
3. After fixing, Vercel will automatically rebuild on your next push

---

## Step 6: Get Your Production URL

### 6.1 Deployment Success

After successful deployment, you'll see:
- 🎉 **"Congratulations!"** message
- Preview of your deployed site
- Production URL

### 6.2 Copy Your URL

Your production URL will be in this format:
```
https://shikaraka-anime-portal.vercel.app
```

Or if you chose a different name:
```
https://your-project-name.vercel.app
```

**Actions:**
1. Click **"Visit"** to open your deployed site
2. Copy the URL - you'll need it for Supabase configuration

### 6.3 Test Basic Functionality

Quickly verify:
- ✅ Site loads without errors
- ✅ Home page displays
- ✅ Anime cards are visible

> ⚠️ **Note**: Authentication won't work yet - we need to update Supabase URLs first!

---

## Step 7: Update Supabase Configuration

**Critical step** for authentication to work!

### 7.1 Open Supabase Dashboard

1. Go to: **https://app.supabase.com**
2. Select your ShiKaraKa project
3. Navigate to: **Authentication** → **URL Configuration**

### 7.2 Update Site URL

1. Find the **"Site URL"** field
2. Replace the current value with your Vercel URL:
   ```
   https://shikaraka-anime-portal.vercel.app
   ```
3. Click **"Save"**

### 7.3 Add Redirect URLs

1. Find the **"Redirect URLs"** section
2. Click **"Add URL"**
3. Add your Vercel URL with wildcard:
   ```
   https://shikaraka-anime-portal.vercel.app/**
   ```
4. Keep the localhost URL for development:
   ```
   http://localhost:5173/**
   ```
5. Click **"Save"**

### 7.4 Verify Configuration

Your URL Configuration should now show:

**Site URL:**
```
https://shikaraka-anime-portal.vercel.app
```

**Redirect URLs:**
```
http://localhost:5173/**
https://shikaraka-anime-portal.vercel.app/**
```

> ✅ **Important**: Without this configuration, users won't be able to log in or register!

---

## Step 8: Verification Testing

Now let's thoroughly test your deployed application.

### 8.1 Open Your Production Site

1. Navigate to your Vercel URL
2. Open browser DevTools (F12)
3. Check the Console tab for errors

### 8.2 Test Home Page

- [ ] **Hero section** displays "ShiKaraKa"
- [ ] **Anime cards** load and display
- [ ] **Skeleton screens** show during loading
- [ ] **Images** load correctly
- [ ] **Ratings and years** are visible
- [ ] **No console errors**

### 8.3 Test Search Functionality

1. Click on the search field in the header
2. Type: "Naruto"
3. Verify:
   - [ ] Search results appear
   - [ ] Results match the query
   - [ ] Cards display correctly
4. Clear the search
5. Verify:
   - [ ] Popular anime return

### 8.4 Test Authentication

#### Registration:
1. Click **"Войти"** (Login) button
2. Switch to **"Регистрация"** (Register) tab
3. Enter a test email and password
4. Click **"Зарегистрироваться"** (Register)
5. Verify:
   - [ ] Registration succeeds
   - [ ] User is logged in
   - [ ] Email appears in header
   - [ ] No errors in console

#### Login:
1. Log out (if logged in)
2. Click **"Войти"** button
3. Enter your credentials
4. Click **"Войти"**
5. Verify:
   - [ ] Login succeeds
   - [ ] User session is maintained
   - [ ] Email appears in header

> 💡 **Note**: If email confirmation is enabled in Supabase, check your email inbox.

### 8.5 Test Anime Details Page

1. Click on any anime card
2. Verify:
   - [ ] Detail page loads
   - [ ] Poster displays on the left
   - [ ] Genres, status, studio information visible
   - [ ] Video player initializes
   - [ ] "Добавить в список" button visible (if logged in)
   - [ ] URL changes to `/anime/:id`

### 8.6 Test Favorites Functionality

1. Ensure you're logged in
2. On an anime detail page, click **"Добавить в список"**
3. Verify:
   - [ ] Heart icon fills with color
   - [ ] Button text changes to "Удалить из списка"
   - [ ] No errors in console
4. Navigate to **"Избранное"** page
5. Verify:
   - [ ] Added anime appears in the list
6. Click **"Удалить из списка"**
7. Verify:
   - [ ] Anime is removed
   - [ ] Heart icon becomes empty

### 8.7 Test Mobile Responsiveness

1. Open DevTools (F12)
2. Click **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Test different devices:

   **iPhone SE (375px):**
   - [ ] 2-column grid
   - [ ] Header is responsive
   - [ ] Buttons are touchable (44x44px)
   - [ ] Text is readable

   **iPad (768px):**
   - [ ] 4-column grid
   - [ ] Layout adapts correctly

   **Desktop (1920px):**
   - [ ] 6-column grid
   - [ ] Full layout visible

### 8.8 Test Direct Navigation

1. Copy a deep link (e.g., `/anime/123`)
2. Open in a new browser tab
3. Verify:
   - [ ] Page loads correctly (no 404)
   - [ ] Content displays
   - [ ] React Router handles the route

4. Refresh the page (F5)
5. Verify:
   - [ ] Page reloads correctly
   - [ ] No 404 error
   - [ ] Content persists

> ✅ **This verifies**: The `vercel.json` rewrites configuration is working correctly!

### 8.9 Test Performance

1. Open DevTools → **Network** tab
2. Reload the page
3. Check:
   - [ ] Initial load < 3 seconds
   - [ ] Assets load from CDN
   - [ ] Images use lazy loading
   - [ ] No failed requests

4. Open DevTools → **Lighthouse** tab
5. Run audit for:
   - [ ] Performance > 80
   - [ ] Accessibility > 90
   - [ ] Best Practices > 80

---

## Step 9: Configure Custom Domain (Optional)

If you have a custom domain, you can configure it now.

### 9.1 Add Domain in Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Click **"Add"**
4. Enter your domain (e.g., `shikaraka.com`)
5. Click **"Add"**

### 9.2 Configure DNS

Vercel will provide DNS records to add:

**For apex domain (shikaraka.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 9.3 Update Supabase URLs

After domain is active:
1. Go to Supabase → Authentication → URL Configuration
2. Update Site URL to your custom domain
3. Add custom domain to Redirect URLs

---

## Step 10: Enable Automatic Deployments

Vercel automatically deploys on every push to GitHub!

### 10.1 How It Works

- **Production**: Push to `main` branch → deploys to production URL
- **Preview**: Push to other branches → creates preview deployment
- **Pull Requests**: Automatic preview deployments for each PR

### 10.2 Test Automatic Deployment

1. Make a small change to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test automatic deployment"
   git push
   ```
3. Go to Vercel dashboard
4. Watch the deployment progress in real-time
5. Verify the change appears on your production site

### 10.3 Deployment Notifications

Configure notifications:
1. Go to Project Settings → **Notifications**
2. Enable:
   - [ ] Deployment Started
   - [ ] Deployment Ready
   - [ ] Deployment Failed
3. Choose notification method (Email, Slack, etc.)

---

## Troubleshooting

### Issue: Build Fails with TypeScript Errors

**Symptoms:**
- Build log shows TypeScript compilation errors
- Deployment fails

**Solution:**
1. Run locally: `npm run build`
2. Fix all TypeScript errors
3. Commit and push changes
4. Vercel will automatically retry

### Issue: Environment Variables Not Working

**Symptoms:**
- App loads but can't connect to Supabase
- Console shows "undefined" for environment variables

**Solution:**
1. Verify variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Check both variables are present
   - Ensure they start with `VITE_`
2. If you added/changed variables:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
3. Clear browser cache and reload

### Issue: Authentication Doesn't Work

**Symptoms:**
- Can't register or log in
- Supabase errors in console

**Solution:**
1. Check Supabase URL Configuration:
   - Site URL matches your Vercel URL
   - Redirect URLs include your Vercel URL with `/**`
2. Verify environment variables in Vercel
3. Check Supabase logs:
   - Go to Supabase → Logs → API Logs
   - Look for authentication errors

### Issue: 404 on Page Refresh

**Symptoms:**
- Direct navigation to `/anime/123` returns 404
- Page refresh breaks the app

**Solution:**
1. Verify `vercel.json` exists in repository root
2. Check it contains the rewrite rule:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
3. If missing, add it and push to GitHub
4. Vercel will automatically redeploy

### Issue: Images Not Loading

**Symptoms:**
- Anime posters don't display
- Broken image icons

**Solution:**
1. Check browser console for CORS errors
2. Verify Shikimori API is accessible
3. Check Network tab for failed image requests
4. Ensure images are using HTTPS URLs

### Issue: Slow Performance

**Symptoms:**
- Pages take > 5 seconds to load
- Poor Lighthouse scores

**Solution:**
1. Check bundle size:
   - Run locally: `npm run build`
   - Look at chunk sizes in output
2. Verify caching headers:
   - Check Network tab → Response Headers
   - Assets should have `Cache-Control: max-age=31536000`
3. Enable Vercel Analytics:
   - Project Settings → Analytics
   - Monitor Core Web Vitals

### Issue: Deployment Stuck

**Symptoms:**
- Build runs for > 10 minutes
- No progress in logs

**Solution:**
1. Cancel the deployment:
   - Go to Deployments tab
   - Click "..." → "Cancel"
2. Check for infinite loops in build process
3. Verify no long-running commands in build
4. Redeploy

---

## Monitoring and Maintenance

### Vercel Dashboard

Access your project dashboard at:
```
https://vercel.com/your-username/shikaraka-anime-portal
```

**Key sections:**
- **Deployments**: View all deployments and their status
- **Analytics**: Monitor traffic and performance
- **Logs**: View runtime and build logs
- **Settings**: Manage environment variables and domains

### Enable Vercel Analytics

1. Go to Project Settings → **Analytics**
2. Click **"Enable Web Analytics"** (free)
3. Monitor:
   - Page views
   - Unique visitors
   - Top pages
   - Devices and browsers
   - Core Web Vitals

### Monitor Supabase Usage

1. Go to Supabase dashboard
2. Navigate to **Reports**
3. Monitor:
   - API requests
   - Database size
   - Active users
   - Authentication events

### Set Up Alerts

**Vercel:**
- Project Settings → Notifications
- Enable deployment failure alerts

**Supabase:**
- Project Settings → Notifications
- Enable database usage alerts

---

## Success Checklist

Before marking Task 20.2 as complete, verify:

### Vercel Configuration
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Framework detected as Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added (2 total)
- [ ] First deployment successful
- [ ] Production URL accessible

### Supabase Configuration
- [ ] Site URL updated to Vercel URL
- [ ] Redirect URLs include Vercel URL
- [ ] Configuration saved

### Functionality Testing
- [ ] Home page loads
- [ ] Anime cards display
- [ ] Search works
- [ ] Authentication works (register + login)
- [ ] Anime detail pages load
- [ ] Video player initializes
- [ ] Favorites can be added/removed
- [ ] Mobile responsive
- [ ] Direct navigation works (no 404)
- [ ] Page refresh works

### Performance
- [ ] Initial load < 3 seconds
- [ ] No console errors
- [ ] Images load correctly
- [ ] Lighthouse score > 80

### Deployment
- [ ] Automatic deployments enabled
- [ ] GitHub integration working
- [ ] Deployment notifications configured

---

## Next Steps

After completing Task 20.2:

### Task 20.3: Post-Deployment Verification

Comprehensive testing of the production deployment:
- Full user flow testing
- Cross-browser testing
- Mobile device testing
- Performance optimization
- Error monitoring setup

### Future Enhancements

Consider these improvements:
- Custom domain setup
- Vercel Analytics for detailed insights
- Error tracking (Sentry integration)
- Performance monitoring
- SEO optimization
- Social media meta tags

---

## Additional Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

### Support
- [Vercel Discord](https://discord.gg/vercel)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/yourusername/shikaraka-anime-portal/issues)

### Useful Commands

**Redeploy from CLI:**
```bash
npm install -g vercel
vercel --prod
```

**View logs:**
```bash
vercel logs
```

**Check deployment status:**
```bash
vercel ls
```

---

## Summary

✅ **Task 20.2 Complete When:**
- Vercel project is configured
- Environment variables are set
- First deployment is successful
- Supabase URLs are updated
- All functionality is verified

🎯 **Validates**: Requirements 11.2 (Vercel deployment from GitHub)

📋 **Time Investment**: ~10-15 minutes for setup + 5-10 minutes for testing

🚀 **Result**: Production-ready anime portal accessible worldwide via Vercel's global CDN!

---

**Congratulations!** 🎉 

Your ShiKaraKa Anime Portal is now live on the internet!

Share your production URL and let users enjoy discovering and watching anime!
