# Reddit OAuth API Setup for Vercel

## Why This Is Needed
Reddit blocks server-side requests from hosting providers like Vercel. To get real Reddit data, you must use Reddit's official OAuth API.

## Step 1: Create a Reddit App

1. Go to https://www.reddit.com/prefs/apps
2. Scroll down and click **"create another app..."** or **"are you a developer? create an app..."**
3. Fill in the form:
   - **name**: `OneSig` (or any name you want)
   - **App type**: Select **"script"**
   - **description**: (optional)
   - **about url**: (optional)
   - **redirect uri**: Enter `http://localhost` (required but not used for script apps)
4. Click **"create app"**

## Step 2: Get Your Credentials

After creating the app, you'll see:
- **CLIENT_ID**: The random string directly under the app name (looks like: `abc123XYZ`)
- **CLIENT_SECRET**: Labeled as "secret" (looks like: `xyz789ABC-def456`)

## Step 3: Add to Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   - Name: `REDDIT_CLIENT_ID`
   - Value: [paste your CLIENT_ID]
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Name: `REDDIT_CLIENT_SECRET`
   - Value: [paste your CLIENT_SECRET]
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. Click **Save** for each

## Step 4: Redeploy

**Important:** Environment variables only take effect after a new deployment.

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Wait for the deployment to complete (~1-2 minutes)

## Step 5: Test

1. Visit your website
2. Go to the **Reddit Wall Street** page
3. It should now load real data from r/wallstreetbets

## Already Have GROQ_API_KEY?

Make sure your `GROQ_API_KEY` is also set in Vercel environment variables. You need BOTH:
- `GROQ_API_KEY` (for sentiment analysis)
- `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` (for fetching Reddit data)

## Troubleshooting

### Error: "Reddit API credentials not configured"
- Make sure you added both `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` to Vercel
- Make sure you redeployed after adding them

### Error: "Failed to get Reddit access token"
- Double-check your CLIENT_ID and CLIENT_SECRET are correct
- Make sure there are no extra spaces when copying/pasting

### Error: "Failed to analyze sentiment"
- This means `GROQ_API_KEY` is missing or incorrect
- Add it to Vercel environment variables

## Local Development

For local testing, create a `.env.local` file in the `landing-page` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

Then run: `npm run dev`

