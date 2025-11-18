# Groq API Setup Guide

This guide explains how to configure Groq API for AI-powered investment advice generation.

---

## 🔑 Getting a Free Groq API Key

### Step 1: Sign Up for Groq

1. Visit [Groq Console](https://console.groq.com/)
2. Click **"Sign Up"** or **"Get Started"**
3. Create an account with your email
4. Verify your email address

### Step 2: Create API Key

1. Once logged in, navigate to **"API Keys"** section
2. Click **"Create API Key"**
3. Give it a name (e.g., "OneSig Investment Advisor")
4. Copy the API key immediately (you won't be able to see it again)

---

## 📝 Configuration

### Step 1: Add API Key to Environment Variables

In your `landing-page/.env.local` file, add:

```env
# Groq API for AI Investment Advice
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

### With Groq API (Real AI Advice)

When `GROQ_API_KEY` is configured:
- ✅ Fetches real-time stock data for selected stocks
- ✅ Uses AI to generate personalized investment advice
- ✅ Analyzes stocks based on investor persona (Warren Buffett, Cathie Wood, etc.)
- ✅ Provides detailed reasoning and actionable insights
- ✅ Considers current prices, market cap, 52-week ranges, and more

### Without Groq API (Fallback)

If `GROQ_API_KEY` is not configured:
- Uses pre-defined investment advice templates
- Still functional but less personalized
- No real-time AI analysis

---

## 🎯 Features

### Real-Time Data Integration

The AI advisor receives:
- Current stock prices
- Price changes and percentages
- Market capitalization
- 52-week high/low ranges
- Trading volume

### Investor Personas

Each investor persona provides advice in their unique style:

1. **Warren Buffett** - Value investing, long-term focus
2. **Cathie Wood** - Disruptive innovation, high growth
3. **Bill Ackman** - Activist investing, value creation
4. **Ray Dalio** - All-weather portfolio, diversification

---

## 🚀 Usage

1. Go to **"My Investments"** page
2. Select up to 10 stocks
3. Choose an investor persona
4. Click **"Get Investment Advice"**
5. Receive AI-generated personalized advice based on:
   - Real-time stock data
   - Investor's philosophy
   - Current market conditions

---

## 📊 API Limits

**Groq Free Tier:**
- Generous free tier with fast inference
- Check [Groq Pricing](https://groq.com/pricing/) for current limits
- Model used: `llama-3.1-70b-versatile` (fast and accurate)

---

## 🔧 Troubleshooting

### "Using fallback advice due to API error"

**Possible causes:**
1. API key not set or incorrect
2. API rate limit exceeded
3. Network connectivity issues

**Solutions:**
1. Verify `GROQ_API_KEY` in `.env.local`
2. Check API key is valid in Groq Console
3. Restart development server
4. Check server console for detailed error messages

### Advice seems generic

- Make sure Groq API key is configured
- Check that real-time stock data is being fetched
- Verify the API key has proper permissions

### Slow response times

- Groq is typically very fast (< 1 second)
- If slow, check network connection
- Verify API key is valid

---

## 🔐 Security

- **Never commit `.env.local`** to version control (already in `.gitignore`)
- **Never share your API key** publicly
- **Rotate API keys** periodically for security
- Use environment variables in production deployments

---

## 📚 Additional Resources

- [Groq Documentation](https://groq.com/docs/)
- [Groq Console](https://console.groq.com/)
- [Groq Models](https://groq.com/models/)

---

## ✅ Setup Complete Checklist

- [ ] Groq account created
- [ ] API key generated
- [ ] `GROQ_API_KEY` added to `.env.local`
- [ ] Development server restarted
- [ ] Tested investment advice generation
- [ ] Verified real-time data integration

---

**You're ready to get AI-powered investment advice! 🚀**



