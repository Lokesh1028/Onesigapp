# Reddit Sentiment Analysis Setup Guide

This guide explains how to set up and use the Reddit Sentiment Analysis feature, which analyzes community sentiment from any Reddit subreddit using AI-powered sentiment analysis.

---

## 🎯 Overview

The Reddit Sentiment Analysis tool:
- Fetches posts from any public Reddit subreddit
- Optionally includes comments for deeper analysis
- Uses AI (Groq API) to analyze sentiment
- Provides detailed insights including sentiment score, themes, and key aspects

---

## 🔑 Prerequisites

### 1. Groq API Key

The Reddit Sentiment Analysis uses Groq API for AI-powered sentiment analysis. You'll need a Groq API key.

**If you already have Groq API set up:**
- Skip to the "Usage" section below

**If you need to set up Groq API:**
- Follow the [Groq API Setup Guide](./GROQ_API_SETUP.md)
- The same API key works for both Investment Advice and Reddit Sentiment Analysis

---

## 📝 Configuration

### Step 1: Verify Groq API Key

Make sure your `landing-page/.env.local` file contains:

```env
# Groq API for AI Analysis (used for Investment Advice and Reddit Sentiment)
GROQ_API_KEY=your_groq_api_key_here
```

### Step 2: Restart Development Server

```bash
# Stop the server (Ctrl+C) and restart
cd landing-page
npm run dev
```

---

## ✅ How It Works

### Data Collection

1. **Reddit Posts**: Fetches the top 25 "hot" posts from the specified subreddit
   - Uses Reddit's public JSON API (no authentication required for public subreddits)
   - Filters out removed/deleted posts
   - Includes post titles, content, scores, and comment counts

2. **Reddit Comments** (Optional): If enabled, fetches comments from top 5 posts
   - Adds more context for sentiment analysis
   - Slower but provides more comprehensive analysis

### Sentiment Analysis

1. **AI Processing**: Uses Groq API with Llama 3.1 70B model
2. **Analysis Output**:
   - Overall sentiment (positive/negative/neutral)
   - Sentiment score (-1 to +1)
   - Confidence level (0 to 1)
   - Summary of community sentiment
   - Key themes discussed
   - Positive and negative aspects
   - Sample posts with individual sentiment

---

## 🚀 Usage

### Step 1: Navigate to Reddit Sentiment Page

1. Go to the **"Reddit Sentiment"** page from the navigation menu
2. Or visit: `http://localhost:3000/reddit-sentiment`

### Step 2: Enter Subreddit Name

1. Enter the subreddit name in the input field
   - **Example**: `wallstreetbets`, `stocks`, `investing`
   - Don't include "r/" prefix (it's added automatically)
   - Subreddit must be public (not private or restricted)

### Step 3: Choose Analysis Options

- **Include Comments**: Check this box to analyze comments in addition to posts
  - More comprehensive but slower
  - Recommended for deeper insights

### Step 4: Analyze

1. Click **"Analyze Sentiment"** button
2. Wait for analysis to complete (typically 5-15 seconds)
3. Review the results

---

## 📊 Understanding Results

### Overall Sentiment

- **Positive**: Community sentiment is generally optimistic/positive
- **Negative**: Community sentiment is generally pessimistic/negative
- **Neutral**: Mixed or balanced sentiment

### Sentiment Score

- Range: **-1.0 to +1.0**
- **-1.0**: Very negative
- **0.0**: Neutral
- **+1.0**: Very positive

### Confidence Level

- Range: **0% to 100%**
- Higher confidence = more reliable analysis
- Based on clarity and consistency of sentiment in posts/comments

### Key Sections

1. **Summary**: Brief overview of community sentiment
2. **Key Themes**: Main topics discussed in the subreddit
3. **Positive Aspects**: What the community is optimistic about
4. **Negative Aspects**: What the community is concerned about
5. **Top Posts**: Sample posts analyzed with links to Reddit

---

## 💡 Use Cases

### Stock Market Analysis
- Analyze sentiment in stock-related subreddits (r/wallstreetbets, r/stocks)
- Understand community sentiment about specific stocks or market trends
- Track sentiment changes over time

### Product/Service Feedback
- Analyze customer sentiment in product-specific subreddits
- Understand user opinions and pain points
- Identify positive and negative aspects

### Community Monitoring
- Track sentiment in communities related to your interests
- Understand what topics are trending
- Identify key themes and discussions

---

## 🔧 Troubleshooting

### "Subreddit not found or is private"

**Possible causes:**
1. Subreddit name is misspelled
2. Subreddit is private or restricted
3. Subreddit doesn't exist

**Solutions:**
1. Verify subreddit name (check Reddit directly)
2. Try a different public subreddit
3. Make sure you're not including "r/" prefix

### "Groq API key not configured"

**Solutions:**
1. Verify `GROQ_API_KEY` in `.env.local`
2. Restart development server
3. Check [Groq API Setup Guide](./GROQ_API_SETUP.md)

### "Failed to analyze sentiment"

**Possible causes:**
1. Groq API rate limit exceeded
2. Network connectivity issues
3. Invalid API key

**Solutions:**
1. Wait a few minutes and try again
2. Check internet connection
3. Verify API key is valid in Groq Console

### Analysis seems inaccurate

- Try enabling "Include Comments" for more comprehensive analysis
- Some subreddits may have mixed sentiment (neutral is expected)
- Check the confidence level - lower confidence means less reliable results

### Slow analysis

- Analysis typically takes 5-15 seconds
- Including comments adds 5-10 seconds
- If consistently slow, check network connection and Groq API status

---

## 🔐 Security & Privacy

### Reddit Data
- Uses Reddit's public API (no authentication required)
- Only analyzes publicly available posts and comments
- Respects Reddit's rate limits and terms of service

### API Keys
- **Never commit `.env.local`** to version control (already in `.gitignore`)
- **Never share your Groq API key** publicly
- **Rotate API keys** periodically for security

---

## 📚 API Limits

### Reddit API
- **Public API**: No authentication required
- **Rate Limits**: 60 requests per minute per IP
- **Caching**: Results cached for 5 minutes

### Groq API
- **Free Tier**: Generous free tier with fast inference
- **Rate Limits**: Check [Groq Pricing](https://groq.com/pricing/) for current limits
- **Model**: `llama-3.1-70b-versatile` (fast and accurate)

---

## 🎯 Best Practices

1. **Start Simple**: Begin with posts-only analysis, then add comments if needed
2. **Choose Active Subreddits**: More active subreddits provide better analysis
3. **Verify Subreddit**: Make sure the subreddit is public before analyzing
4. **Monitor Rate Limits**: Don't spam requests (respect Reddit's rate limits)
5. **Interpret Results**: Use sentiment as one data point, not absolute truth

---

## 📖 Example Subreddits to Try

### Stock Market
- `wallstreetbets` - Meme stocks and high-risk trading
- `stocks` - General stock market discussion
- `investing` - Long-term investment strategies
- `StockMarket` - Market news and analysis

### Technology
- `technology` - Tech news and discussions
- `programming` - Software development
- `webdev` - Web development

### Finance
- `personalfinance` - Personal finance advice
- `FIREyFemmes` - Financial independence
- `cryptocurrency` - Crypto discussions

---

## ✅ Setup Complete Checklist

- [ ] Groq API key configured (see [Groq Setup Guide](./GROQ_API_SETUP.md))
- [ ] `GROQ_API_KEY` added to `.env.local`
- [ ] Development server restarted
- [ ] Tested with a public subreddit (e.g., `wallstreetbets`)
- [ ] Verified sentiment analysis results
- [ ] Tested with comments enabled

---

## 🆘 Need Help?

1. Check the [Groq API Setup Guide](./GROQ_API_SETUP.md) for API configuration
2. Verify your `.env.local` file has the correct API key
3. Check browser console and server logs for detailed error messages
4. Ensure the subreddit is public and exists

---

**You're ready to analyze Reddit sentiment! 🚀**

