# Senate Trades Setup Guide

This guide explains how to set up and use the Senate Trades feature, which tracks trading activity from U.S. Senators and members of Congress.

---

## 🎯 Overview

The Senate Trades feature:
- Fetches trading data from U.S. Senators and members of Congress
- Uses Financial Modeling Prep (FMP) API for senate trading data
- Displays trades with timeframe filters (1 day, 7 days, 30 days)
- Shows summary statistics and detailed trade information
- Links to official financial disclosure documents

---

## 🔑 Prerequisites

### Financial Modeling Prep (FMP) API Key

The Senate Trades feature uses FMP API to fetch senate trading data. You'll need an FMP API key.

**If you already have FMP API set up:**
- The same API key works for both Insider Trades and Senate Trades
- Skip to the "Usage" section below

**If you need to set up FMP API:**
- Follow the [API Setup Guide](./API_SETUP.md)
- FMP offers a free tier with 250 API calls per day

---

## 📝 Configuration

### Step 1: Verify FMP API Key

Make sure your `landing-page/.env.local` file contains:

```env
# Financial Modeling Prep API (used for Insider Trades and Senate Trades)
FMP_API_KEY=your_fmp_api_key_here
```

### Step 2: Restart Development Server

```bash
# Stop the server (Ctrl+C) and restart
cd landing-page
npm run dev
```

---

## ✅ How It Works

### Data Source

1. **FMP Senate Trading API**: Fetches senate trading data from Financial Modeling Prep
   - Endpoint: `/api/v4/senate-trading`
   - Returns trades from U.S. Senators and members of Congress
   - Includes transaction dates, amounts, tickers, and disclosure links

2. **Data Processing**:
   - Filters trades by date range (1, 7, or 30 days)
   - Filters out small trades (less than $1,000)
   - Sorts by trade amount (descending)
   - Shows top 50 trades per timeframe

3. **Display**:
   - Summary statistics (total trades, buys, sales, buy value)
   - Detailed table/cards with trade information
   - Links to official financial disclosure documents (PTR links)

---

## 🚀 Usage

### Step 1: Navigate to Senate Trades Page

1. Go to the **"Senate Trades"** page from the navigation menu
2. Or visit: `http://localhost:3000/senate-trades`

### Step 2: View Trades

1. The page automatically loads trades for the last 7 days
2. Use timeframe buttons to filter:
   - **1 Day**: Trades from the last 24 hours
   - **7 Days**: Trades from the last week (default)
   - **30 Days**: Trades from the last month

### Step 3: Explore Trades

- View summary statistics at the top
- Browse detailed trade information in the table
- Click disclosure links to view official financial disclosure documents
- Data auto-refreshes every hour

---

## 📊 Understanding Results

### Summary Statistics

- **Total**: Total number of trades in the selected timeframe
- **Buys**: Number of purchase transactions
- **Sales**: Number of sale transactions
- **Buy Value**: Total value of all purchases

### Trade Information

Each trade shows:
- **Date**: Transaction date
- **Senator**: Name of the senator or member of Congress
- **Ticker**: Stock symbol
- **Company**: Company name
- **Type**: Buy or Sale
- **Amount**: Transaction amount in USD
- **Disclosure**: Link to official financial disclosure document

---

## 💡 Use Cases

### Track Congressional Trading
- Monitor which stocks senators are buying and selling
- Identify potential conflicts of interest
- Track trading patterns over time

### Investment Research
- See what stocks elected officials are investing in
- Understand market sentiment from congressional activity
- Research potential investment opportunities

### Transparency & Accountability
- Review financial disclosures from elected officials
- Track compliance with trading regulations
- Monitor for potential insider trading concerns

---

## 🔧 Troubleshooting

### "Demo mode: Using mock data"

**Cause**: FMP API key not configured or invalid

**Solutions**:
1. Verify `FMP_API_KEY` in `.env.local`
2. Check API key is valid in FMP dashboard
3. Restart development server
4. Verify you haven't exceeded daily API limit (250 calls/day)

### No trades showing

**Possible causes**:
1. No trades in the selected timeframe
2. API key not configured (using mock data)
3. API rate limit exceeded

**Solutions**:
1. Try a longer timeframe (30 days)
2. Check server console logs for errors
3. Verify API key is configured correctly
4. Check FMP API status

### Slow loading

- Data is cached for 1 hour to reduce API calls
- First load may take a few seconds
- Auto-refresh happens every hour

---

## 🔐 Security & Privacy

### API Keys
- **Never commit `.env.local`** to version control (already in `.gitignore`)
- **Never share your FMP API key** publicly
- **Rotate API keys** periodically for security

### Data Source
- Data comes from official financial disclosures
- All trades are publicly available information
- Links point to official government disclosure documents

---

## 📚 API Limits

### FMP API
- **Free Tier**: 250 API calls per day
- **Caching**: Results cached for 1 hour to reduce API calls
- **Rate Limits**: Respect FMP's rate limits

---

## 🎯 Best Practices

1. **Monitor API Usage**: Keep track of your daily API calls
2. **Use Caching**: The app caches data for 1 hour automatically
3. **Check Timeframes**: Try different timeframes if no data appears
4. **Review Disclosures**: Always check official disclosure documents for full details

---

## 📖 Related Features

- **Insider Trades**: Similar feature for company insider trading
- **My Investments**: Track your own stock portfolio
- **Reddit Sentiment**: Analyze community sentiment about stocks

---

## ✅ Setup Complete Checklist

- [ ] FMP API key configured (see [API Setup Guide](./API_SETUP.md))
- [ ] `FMP_API_KEY` added to `.env.local`
- [ ] Development server restarted
- [ ] Tested with different timeframes
- [ ] Verified trade data is displaying
- [ ] Checked disclosure links work

---

## 🆘 Need Help?

1. Check the [API Setup Guide](./API_SETUP.md) for FMP configuration
2. Verify your `.env.local` file has the correct API key
3. Check browser console and server logs for detailed error messages
4. Ensure you haven't exceeded FMP's daily API limit

---

## 📝 Note on Finnhub

**Note**: Finnhub API does not currently provide senate/congressional trading data. This implementation uses Financial Modeling Prep (FMP) API, which is the primary provider for senate trading data. If Finnhub adds this feature in the future, the code can be easily updated to support it.

---

**You're ready to track Senate trades! 🚀**

