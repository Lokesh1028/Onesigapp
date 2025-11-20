# Deployment Checklist for OneSig Landing Page

## Pre-Deployment

### 1. Environment Variables
- [ ] Set `FMP_API_KEY` in deployment platform
- [ ] Set `GROQ_API_KEY` in deployment platform  
- [ ] Set `AINVEST_API_KEY` in deployment platform
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in deployment platform
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in deployment platform
- [ ] Set `NODE_ENV=production` in deployment platform

### 2. Code Quality
- [x] No TypeScript errors (`npm run type-check`)
- [x] No linting errors (`npm run lint`)
- [x] All API routes marked as dynamic
- [x] Navigation component properly handles SSR
- [x] Error pages configured

### 3. Build Test
- [ ] Run `npm run build` locally to test
- [ ] Check for any build warnings
- [ ] Verify all pages generate correctly

### 4. Configuration Files
- [x] `next.config.js` configured with proper settings
- [x] `netlify.toml` or `vercel.json` present
- [x] `.gitignore` includes `.env` files
- [x] `package.json` has correct dependencies

## Netlify Deployment

### Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 18+

### Environment Variables to Set
```
FMP_API_KEY=<your_key>
GROQ_API_KEY=<your_key>
AINVEST_API_KEY=<your_key>
NEXT_PUBLIC_SUPABASE_URL=<your_url>
SUPABASE_SERVICE_ROLE_KEY=<your_key>
NODE_ENV=production
```

### Netlify Plugin
- [ ] Install `@netlify/plugin-nextjs` plugin

## Vercel Deployment

### Project Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables
Same as Netlify above

## Post-Deployment

### 1. Verification
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Insider Trades page displays data (or demo message)
- [ ] Senate Trades page displays data (or demo message)
- [ ] Reddit Sentiment page works
- [ ] My Investments page functions
- [ ] Email signup form works (if Supabase configured)

### 2. Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify image optimization
- [ ] Test mobile responsiveness

### 3. SEO
- [ ] Meta tags present on all pages
- [ ] Open Graph tags configured
- [ ] Twitter cards configured
- [ ] robots.txt accessible

### 4. Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] API keys not exposed in client code
- [ ] No console.logs with sensitive data

## Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (e.g., Google Analytics, Plausible)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for API failures

## Common Issues & Solutions

### Build Fails with "useContext" Error
- ✅ Fixed: All pages marked as `force-dynamic`
- ✅ Fixed: Navigation uses dynamic import with `ssr: false`

### API Routes Return Static Generation Errors
- ✅ Fixed: All API routes marked as `force-dynamic` and `runtime: 'nodejs'`

### Missing Environment Variables
- Check deployment platform environment variables
- Ensure no typos in variable names
- Verify variables are available at build time

### Supabase Errors
- If not using Supabase, API will return appropriate error message
- Subscribers table must exist with correct schema (see SUPABASE_SETUP.md)

## Rollback Plan

If deployment fails:
1. Check deployment logs for specific errors
2. Verify environment variables are set correctly
3. Roll back to previous working commit if needed
4. Test locally with `npm run build` before redeploying

## Success Criteria

- ✅ Build completes without errors
- ✅ All pages load without console errors
- ✅ Navigation works correctly
- ✅ API endpoints respond (even with demo data)
- ✅ Mobile responsive
- ✅ Performance score > 90


