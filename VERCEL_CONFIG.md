# Vercel Configuration Guide

## Overview

This document explains the Vercel deployment configuration for ShiKaraKa Anime Portal.

## Configuration File: vercel.json

### Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- **buildCommand**: Runs the Vite build process to create production bundle
- **outputDirectory**: Specifies where Vercel should look for built files (Vite outputs to `dist/`)
- **framework**: Tells Vercel this is a Vite project for optimized handling

### SPA Routing (Rewrites)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Critical for SPA**: This configuration ensures that all routes are handled by the React application:
- When a user visits `/anime/123` directly or refreshes the page
- Vercel will serve `index.html` instead of returning a 404
- React Router then handles the client-side routing

**Without this configuration**: Users would get 404 errors when:
- Refreshing any page other than the home page
- Accessing deep links directly
- Using browser back/forward buttons

### Caching Strategy

#### Static Assets (JavaScript, CSS, Images)

```json
{
  "source": "/assets/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

- **max-age=31536000**: Cache for 1 year (31,536,000 seconds)
- **immutable**: Files never change (Vite uses content hashing in filenames)
- **Result**: Optimal performance - assets are cached indefinitely

#### HTML Files (index.html)

```json
{
  "source": "/index.html",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=0, must-revalidate"
    }
  ]
}
```

- **max-age=0**: Don't cache the HTML file
- **must-revalidate**: Always check with server for updates
- **Result**: Users always get the latest version of the app

### Security Headers

#### X-Content-Type-Options

```json
{
  "key": "X-Content-Type-Options",
  "value": "nosniff"
}
```

Prevents browsers from MIME-sniffing responses, reducing XSS attack vectors.

#### X-Frame-Options

```json
{
  "key": "X-Frame-Options",
  "value": "SAMEORIGIN"
}
```

- Allows the site to be embedded in iframes only from the same origin
- Changed from `DENY` to `SAMEORIGIN` to allow video player iframes to work
- Protects against clickjacking attacks

#### X-XSS-Protection

```json
{
  "key": "X-XSS-Protection",
  "value": "1; mode=block"
}
```

Enables browser's built-in XSS filter and blocks the page if an attack is detected.

#### Referrer-Policy

```json
{
  "key": "Referrer-Policy",
  "value": "strict-origin-when-cross-origin"
}
```

Controls how much referrer information is sent with requests:
- Same-origin: Full URL
- Cross-origin HTTPS: Only origin
- Cross-origin HTTP: No referrer

#### Permissions-Policy

```json
{
  "key": "Permissions-Policy",
  "value": "camera=(), microphone=(), geolocation=()"
}
```

Disables unnecessary browser features to reduce attack surface.

## Deployment Process

### 1. Prerequisites

- GitHub repository with the code
- Vercel account (free tier is sufficient)
- Environment variables ready:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 2. Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Vite framework

### 3. Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add the following variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Make sure to add them for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy"
2. Vercel will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Run build command (`npm run build`)
   - Deploy the `dist/` folder to their CDN

### 5. Verify Deployment

Test the following:
- ✅ Home page loads
- ✅ Direct navigation to `/anime/123` works (no 404)
- ✅ Page refresh doesn't break routing
- ✅ Authentication works with Supabase
- ✅ API calls to Shikimori work
- ✅ Static assets load quickly (check Network tab)
- ✅ Mobile responsiveness

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

Each deployment gets a unique URL for testing.

## Performance Optimizations

### Automatic Optimizations by Vercel

1. **Global CDN**: Content served from edge locations worldwide
2. **Compression**: Automatic Gzip/Brotli compression
3. **HTTP/2**: Multiplexed connections for faster loading
4. **Smart Caching**: Intelligent cache invalidation

### Our Optimizations

1. **Code Splitting**: Vite automatically splits code by routes
2. **Asset Hashing**: Filenames include content hash for cache busting
3. **Tree Shaking**: Unused code is removed from bundle
4. **Lazy Loading**: Images and routes load on demand

## Monitoring

### Vercel Analytics

Enable in Project Settings to track:
- Page views
- Performance metrics (Core Web Vitals)
- Geographic distribution of users

### Error Tracking

Check Vercel logs for:
- Build errors
- Runtime errors
- API failures

## Troubleshooting

### Issue: 404 on Page Refresh

**Cause**: Missing or incorrect rewrite configuration

**Solution**: Verify `vercel.json` has the rewrite rule:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: Environment Variables Not Working

**Cause**: Variables not prefixed with `VITE_`

**Solution**: All environment variables must start with `VITE_` to be accessible in the client:
```
VITE_SUPABASE_URL=...  ✅
SUPABASE_URL=...       ❌
```

### Issue: Build Fails

**Cause**: Dependencies or TypeScript errors

**Solution**:
1. Run `npm run build` locally to reproduce
2. Fix any TypeScript errors
3. Ensure all dependencies are in `package.json`
4. Check Node.js version compatibility

### Issue: Slow Loading

**Cause**: Large bundle size or unoptimized assets

**Solution**:
1. Check bundle size: `npm run build` shows chunk sizes
2. Analyze with: `npx vite-bundle-visualizer`
3. Optimize images (use WebP format)
4. Enable lazy loading for routes

## Best Practices

1. **Always test locally first**: Run `npm run build && npm run preview`
2. **Use Preview Deployments**: Test changes in preview before merging to main
3. **Monitor bundle size**: Keep main bundle under 500KB
4. **Set up custom domain**: Improves SEO and branding
5. **Enable HTTPS**: Vercel provides free SSL certificates
6. **Use environment-specific variables**: Different values for dev/staging/prod

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router with Vercel](https://vercel.com/guides/deploying-react-with-vercel)
