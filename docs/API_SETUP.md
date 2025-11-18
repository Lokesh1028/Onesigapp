# API Setup Guide - Real Insider Trading Data

This guide explains how to configure the OneSig landing page to fetch real insider trading data using free APIs.

## 🔑 Getting a Free API Key

### Option 1: Financial Modeling Prep (Recommended)

**Free Tier:** 250 API calls per day

1. Visit [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs)
2. Click "Get your Free API Key today!" or sign up
3. Create a free account with your email
4. Verify your email address
5. Once logged in, you'll see your API key in the dashboard
6. Copy your API key

### Option 2: Use Demo Mode

The application works in demo mode with mock data if no API key is configured. This is useful for:
- Testing the UI without API limits
- Development without internet connection
- Understanding the data structure

## 📝 Configuration

### Step 1: Create Environment File

In the `landing-page` directory, you should already have a `.env.local` file. If not, create one:

```bash
cd landing-page
cp .env.example .env.local
```

### Step 2: Add Your API Key

Edit `.env.local` and replace the demo key with your actual API key:

```env
# Financial Modeling Prep API
FMP_API_KEY=your_actual_api_key_here
```

### Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

The application will automatically detect your API key and start fetching real data.

## ✅ Verifying Real Data

### Check the UI

1. Open [http://localhost:3000](http://localhost:3000)
2. Scroll to the "Latest Insider Trades" section
3. Look at the note at the bottom:
   - **Real data:** "Real-time data from SEC filings via Financial Modeling Prep API. Showing trades >$100k."
   - **Demo mode:** "Demo mode: Using mock data..."

### Test the API Endpoint

```bash
# Check the note field
curl -s "http://localhost:3000/api/insights?timeframe=7" | jq '.note'

# View sample data
curl -s "http://localhost:3000/api/insights?timeframe=7" | jq '.insights[0]'
```

## 📊 API Features

### Timeframe Options

The API supports three timeframe options:
- `1` day - Most recent insider trades
- `7` days - Last week (default)
- `30` days - Last month

### Data Filtering

The API automatically filters trades to show:
- ✅ Trades with value > $100,000
- ✅ Buys and sales from company insiders
- ✅ Directors and officers only
- ✅ Sorted by total value (highest first)
- ✅ Top 20 most significant trades

### Response Format

```json
{
  "success": true,
  "timeframe": 7,
  "count": 20,
  "summary": {
    "total_trades": 20,
    "buys": 12,
    "sales": 8,
    "total_buy_value": 15000000,
    "total_sale_value": 8500000
  },
  "insights": [
    {
      "filing_date": "2025-11-10",
      "ticker": "NVDA",
      "company_name": "Nvidia Corporation",
      "officer_name": "Jensen Huang",
      "officer_title": "CEO",
      "is_director": false,
      "is_officer": true,
      "trade_type": "Buy",
      "shares": 50000,
      "price_per_share": 134.22,
      "total_value": 6711000,
      "transaction_code": "P",
      "sec_filing_url": "https://www.sec.gov/...",
      "is_derivative": false
    }
  ],
  "note": "Real-time data from SEC filings..."
}
```

## 🚀 Rate Limits & Caching

### Free Tier Limits
- **FMP:** 250 API calls per day
- **Cache:** API responses are cached for 1 hour

### Optimization Tips

1. **Caching:** The API automatically caches responses for 1 hour to minimize API calls
2. **Timeframe:** Use the appropriate timeframe to get the data you need
3. **Demo Mode:** Test UI changes in demo mode to save API calls

## 🔧 Troubleshooting

### "Demo mode" message persists after adding API key

1. Verify the API key in `.env.local` is correct
2. Restart the development server
3. Clear your browser cache
4. Check the server console for error messages

### API returns errors

1. **Check your API key:**
   ```bash
   grep FMP_API_KEY landing-page/.env.local
   ```

2. **Test the API key directly:**
   ```bash
   curl "https://financialmodelingprep.com/api/v4/insider-trading?page=0&limit=10&apikey=YOUR_KEY"
   ```

3. **Check rate limits:** You may have exceeded the daily limit (250 calls)

### No data showing

1. Check browser console for errors
2. Check server console logs
3. Verify the API endpoint is returning data:
   ```bash
   curl "http://localhost:3000/api/insights?timeframe=7"
   ```

## 📚 Additional Resources

- [FMP API Documentation](https://site.financialmodelingprep.com/developer/docs)
- [FMP Insider Trading API](https://site.financialmodelingprep.com/developer/docs/stable/latest-insider-trade)
- [SEC Form 4 Filings](https://www.sec.gov/forms)
 - [Free alternatives to FMP for insider data](../docs/insights-providers.md)

## 💡 Tips

1. **Development:** Use demo mode during development to save API calls
2. **Production:** Always use a real API key in production
3. **Monitoring:** Monitor your API usage in the FMP dashboard
4. **Backup:** Consider implementing a fallback to demo data if the API fails

## 🔐 Security

- Never commit `.env.local` to version control (it's in `.gitignore`)
- Never share your API key publicly
- Rotate your API key if you suspect it's been compromised
- Use environment variables in production deployments
