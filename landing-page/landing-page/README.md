# OneSig Landing Page

A comprehensive financial intelligence platform featuring insider trading insights, congressional trading data, Reddit sentiment analysis, and investment tools.

## 🚀 Features

- **Dashboard**: Multi-page navigation with Home, Insider Trades, Senate Trades, Reddit Sentiment, and My Investments
- **Insider Trades**: Real-time tracking of significant company insider transactions
- **Senate Trades**: US Congress trading activity from AInvest API
- **Reddit Sentiment**: AI-powered sentiment analysis of Reddit subreddits
- **Investment Tools**: Stock selector with AI-powered investment advice
- **Retirement Calculator**: Financial freedom and retirement planning calculator

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (for newsletter subscriptions)
- **APIs**: 
  - Financial Modeling Prep (FMP) - Insider trades & stock quotes
  - Groq - AI investment advice & sentiment analysis
  - AInvest - US Congress trading data

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.production.example .env.local

# Edit .env.local with your API keys
# See setup guides in docs/ folder

# Run development server
npm run dev
```

## 🔑 Required API Keys

See individual setup guides:
- [API Setup Guide](../docs/API_SETUP.md) - FMP API
- [Groq API Setup](../docs/GROQ_API_SETUP.md) - Groq API
- [AInvest API Setup](../docs/AINVEST_API_SETUP.md) - AInvest API
- [Supabase Setup](./SUPABASE_SETUP.md) - Supabase

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `landing-page`
4. Add environment variables in Vercel dashboard
5. Deploy

See [Deployment Guide](../docs/DEPLOYMENT.md) for detailed instructions.

### Docker

```bash
# Build image
docker build -t onesig-landing .

# Run container
docker run -p 3000:3000 --env-file .env.local onesig-landing
```

## 📝 Environment Variables

Required environment variables (see `.env.production.example`):

- `FMP_API_KEY` - Financial Modeling Prep API key
- `GROQ_API_KEY` - Groq API key for AI features
- `AINVEST_API_KEY` - AInvest API key for Congress trades
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## 🧪 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📁 Project Structure

```
landing-page/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── insider-trades/    # Insider trades page
│   ├── senate-trades/     # Senate trades page
│   ├── reddit-sentiment/  # Reddit sentiment page
│   └── investments/       # My investments page
├── components/            # React components
├── utils/                 # Utility functions
└── docs/                  # Documentation
```

## 🔒 Security

- Never commit `.env.local` or `.env` files
- All API keys should be set as environment variables
- Use Vercel environment variables for production
- Keep API keys secure and rotate periodically

## 📚 Documentation

- [Deployment Guide](../docs/DEPLOYMENT.md)
- [API Setup](../docs/API_SETUP.md)
- [Groq Setup](../docs/GROQ_API_SETUP.md)
- [AInvest Setup](../docs/AINVEST_API_SETUP.md)
- [Reddit Sentiment Setup](../docs/REDDIT_SENTIMENT_SETUP.md)
- [Senate Trades Setup](../docs/SENATE_TRADES_SETUP.md)

## 📄 License

Private - All rights reserved


