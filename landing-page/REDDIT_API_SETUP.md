# Reddit Sentiment Analysis - Setup Guide

## Issue
Reddit blocks server-side requests from many hosting providers (Vercel, Netlify, etc.) to prevent scraping. This causes the "Subreddit is private or banned" error even though your GROQ_API_KEY is correct.

## Solution Implemented
We've added:
1. **Multiple fallback endpoints** - tries www.reddit.com, old.reddit.com, and api.reddit.com
2. **Better browser-like headers** - mimics real browser requests
3. **Improved error handling** - provides clearer error messages

## Environment Variables Required

### On Your Hosting Platform (Vercel/Netlify/etc.)

You need to set this environment variable in your hosting dashboard:

```
GROQ_API_KEY=your_actual_groq_api_key_here
```

### How to Set Environment Variables:

#### On Vercel:
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - Name: `GROQ_API_KEY`
   - Value: Your actual Groq API key from https://console.groq.com/
   - Environment: Production (and Preview if needed)
4. Click "Save"
5. Redeploy your application

#### On Netlify:
1. Go to your site dashboard
2. Click "Site settings" → "Environment variables"
3. Click "Add a variable"
4. Add:
   - Key: `GROQ_API_KEY`
   - Value: Your actual Groq API key
5. Click "Save"
6. Trigger a new deployment

## Alternative Solution: Use Reddit OAuth API

If the public API continues to be blocked, you can set up Reddit's official OAuth API:

1. Go to https://www.reddit.com/prefs/apps
2. Create a new app (script type)
3. Get your CLIENT_ID and CLIENT_SECRET
4. Add these to your environment variables:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   ```

## Testing Locally

Create a `.env.local` file in the `landing-page` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Then run:
```bash
npm run dev
```

## Troubleshooting

### Still getting blocked?
- Reddit may be rate-limiting or blocking your hosting provider's IP range
- Consider using Reddit's official OAuth API (see above)
- Alternatively, use a proxy service or serverless function with rotating IPs

### Check your deployment logs:
Look for messages like:
- `[Reddit API] Trying https://...` - shows which endpoints are being tried
- `[Reddit API] Successfully fetched X posts` - confirms success
- `HTTP 403` or `HTTP 429` - indicates blocking or rate limiting

## After Deployment

Once you've set the environment variables and redeployed:
1. Visit your Reddit Wall Street page
2. It should now fetch data successfully
3. Check browser console and server logs for any issues

