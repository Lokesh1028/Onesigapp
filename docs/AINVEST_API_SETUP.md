# AInvest API Setup Guide

This guide explains how to configure AInvest API for US Congress trading data.

---

## 🔑 Getting an AInvest API Key

### Step 1: Sign Up for AInvest

1. Visit [AInvest](https://ainvest.com/) or [AInvest API Documentation](https://docs.ainvest.com/)
2. Sign up for an account
3. Navigate to API section or dashboard

### Step 2: Create API Key

1. Once logged in, navigate to **"API Keys"** or **"Developer"** section
2. Click **"Create API Key"** or **"Generate Token"**
3. Give it a name (e.g., "OneSig Congress Trades")
4. Copy the API key/token immediately (you won't be able to see it again)

---

## 📝 Configuration

### Step 1: Add API Key to Environment Variables

In your `landing-page/.env.local` file, add:

```env
# AInvest API for US Congress Trading Data
AINVEST_API_KEY=your_ainvest_api_key_here
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

The Senate Trades feature uses AInvest's Congress Trading API:
- **Endpoint**: `https://openapi.ainvest.com/open/ownership/congress`
- **Method**: GET
- **Authentication**: Bearer token in Authorization header
- **Returns**: US Congress members' trading data

### Data Fields

AInvest provides:
- **name**: Politician's name
- **party**: Party affiliation (Democrat, Republican, etc.)
- **state**: State representation
- **trade_date**: Date of the trade
- **filing_date**: Date the trade was filed
- **reporting_gap**: Time between trade and disclosure
- **trade_type**: Type of trade (buy/sell)
- **size**: Size of trade (may be a range like "$1,000 - $15,000")

### Data Fetching Strategy

1. **First Attempt**: Tries to fetch all Congress trades without ticker filter
2. **Fallback**: If that's not supported, fetches trades for popular stocks:
   - AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, JPM, V, JNJ, WMT, MA, DIS, NFLX, AMD
3. **Processing**: 
   - Transforms AInvest data to our format
   - Sorts by date (most recent first)
   - Removes duplicates
   - Returns latest 10 trades

---

## 🚀 Usage

### Step 1: Navigate to Senate Trades Page

1. Go to the **"Senate Trades"** page from the navigation menu
2. Or visit: `http://localhost:3000/senate-trades`

### Step 2: View Latest Trades

- The page automatically loads the latest 10 Congress trades
- Shows politician name, party, state, ticker, trade type, and amount
- Includes reporting gap information

---

## 📊 Understanding Results

### Trade Information

Each trade shows:
- **Date**: Transaction date
- **Senator**: Name of the Congress member
- **Party & State**: Political affiliation and state
- **Ticker**: Stock symbol
- **Type**: Buy or Sale
- **Amount**: Trade size (parsed from AInvest's size field)
- **Comment**: Includes party, state, and reporting gap

### Summary Statistics

- **Total**: Total number of trades displayed
- **Buys**: Number of purchase transactions
- **Sales**: Number of sale transactions
- **Buy Value**: Total value of all purchases

---

## 🔧 Troubleshooting

### "AINVEST_API_KEY not configured"

**Solutions:**
1. Verify `AINVEST_API_KEY` in `.env.local`
2. Check API key is valid in AInvest dashboard
3. Restart development server
4. Ensure the key starts with "Bearer " if required (our code handles this)

### No trades showing

**Possible causes:**
1. API key not configured or invalid
2. API rate limit exceeded
3. No recent trades available
4. Network connectivity issues

**Solutions:**
1. Check server console logs for detailed error messages
2. Verify API key is correct
3. Check AInvest API status
4. Try again after a few moments

### API rate limits

- AInvest may have rate limits on their API
- The code caches responses for 1 hour to reduce API calls
- If you hit rate limits, wait before retrying

---

## 🔐 Security

- **Never commit `.env.local`** to version control (already in `.gitignore`)
- **Never share your AInvest API key** publicly
- **Rotate API keys** periodically for security
- Use environment variables in production deployments

---

## 📚 API Documentation

- [AInvest API Docs](https://docs.ainvest.com/)
- [Congress Trading Endpoint](https://docs.ainvest.com/reference/ownership/congress)

---

## ✅ Setup Complete Checklist

- [ ] AInvest account created
- [ ] API key generated
- [ ] `AINVEST_API_KEY` added to `.env.local`
- [ ] Development server restarted
- [ ] Tested Senate Trades page
- [ ] Verified trades are displaying

---

## 💡 Notes

- AInvest API requires a ticker parameter for some endpoints
- The code tries to fetch all trades first, then falls back to ticker-specific queries
- Trades are sorted by date (most recent first)
- Only the latest 10 unique trades are displayed
- Data is cached for 1 hour to reduce API calls

---

**You're ready to track US Congress trades! 🚀**

