# OneSig 📈

**Curated stock intelligence newsletter providing actionable insider trading insights**

OneSig is a lean MVP that democratizes insider trading data, making it accessible and actionable for retail investors through a free weekly newsletter.

---

## 🎯 Vision

Build a curated stock intelligence newsletter that provides actionable insider trading insights, starting with a small community and growing organically before investing in infrastructure.

## 📊 Current Phase: Phase 1 (Manual MVP)

**Goal:** Validate demand with 25 engaged subscribers

**Timeline:** Weeks 1-8

**Budget:** $0/month

---

## 🚀 Features

### Phase 1 (Current)
- ✅ Python script for SEC Form 4 data collection
- ✅ Simple landing page with email capture
- ✅ Weekly newsletter template
- ✅ Manual curation workflow (2-3 hours/week)

### Phase 2 (Planned - Month 3-4)
- ⏳ Automated data collection (GitHub Actions)
- ⏳ Supabase database integration
- ⏳ Semi-automated newsletter generation
- ⏳ 100 subscribers target

### Phase 3 (Planned - Month 5-6)
- ⏳ Interactive web dashboard
- ⏳ Searchable insider trade database
- ⏳ Senator holdings tracker
- ⏳ 500 subscribers target

### Phase 4 (Planned - Month 7+)
- ⏳ Premium newsletter tier ($10/month)
- ⏳ Monetization (ads, affiliates, sponsorships)
- ⏳ 1,000+ subscribers target

---

## 🛠️ Tech Stack

### Phase 1
- **Data Collection:** Python 3.11+ (SEC EDGAR API)
- **Landing Page:** Next.js 14 (App Router) + Tailwind CSS
- **Email:** Beehiiv (external service)
- **Data Storage:** Google Sheets (temporary)
- **Hosting:** Vercel (free tier)

### Phase 2+
- **Database:** Supabase PostgreSQL
- **Automation:** GitHub Actions
- **Analytics:** Plausible Analytics

---

## 📁 Project Structure

```
OneSig/
├── data-collection/          # Python scripts for SEC data scraping
│   ├── sec_scraper.py       # Main scraper for Form 4 filings
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # Data collection documentation
├── landing-page/            # Next.js landing page
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── public/              # Static assets
│   └── package.json         # Node.js dependencies
├── newsletter/              # Newsletter templates and samples
│   ├── templates/           # Email templates
│   └── samples/             # Sample newsletters
├── legal/                   # Legal documents
│   ├── disclaimer.md
│   ├── privacy-policy.md
│   └── terms-of-service.md
├── docs/                    # Documentation
│   ├── PRD.md              # Product Requirements Document
│   └── setup-guide.md      # Development setup guide
└── README.md               # This file
```

---

## 🚦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Setup Instructions

#### 1. Clone the repository
```bash
git clone <repository-url>
cd OneSig
```

#### 2. Set up Python data collection
```bash
cd data-collection
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Set up Next.js landing page
```bash
cd landing-page
npm install
npm run dev
```

#### 4. Configure environment variables
```bash
# Create .env.local in landing-page/
cp .env.example .env.local
# Edit .env.local with your configuration
```

---

## 📖 Usage

### Collecting Insider Trade Data

```bash
cd data-collection
python sec_scraper.py
```

This will:
1. Pull last 7 days of SEC Form 4 filings
2. Parse key fields (officer, ticker, shares, value)
3. Rank trades by dollar value
4. Export to CSV/Google Sheets

### Running the Landing Page

```bash
cd landing-page
npm run dev
```

Visit `http://localhost:3000` to see the landing page.

---

## 📧 Newsletter Workflow (Phase 1)

**Weekly Schedule:**
1. **Monday:** Run Python script to collect insider trades
2. **Tuesday:** Manually review and select top 10 trades
3. **Wednesday:** Write analysis and context
4. **Thursday 9 AM EST:** Send newsletter via Beehiiv
5. **Friday:** Review analytics and subscriber feedback

**Time Commitment:** 2-3 hours/week

---

## 📈 Success Criteria

### Phase 1 Complete When:
- ✅ 25 email subscribers
- ✅ 4+ newsletters sent
- ✅ >35% open rate
- ✅ <5% unsubscribe rate
- ✅ Positive user feedback
- ✅ Automated data collection script working

---

## ⚖️ Legal & Compliance

**Important Disclaimers:**
- This is NOT investment advice
- We are not registered financial advisors
- All data is aggregated from public SEC filings
- Users should always consult professionals before investing

See `legal/` directory for full disclaimer, privacy policy, and terms of service.

---

## 🤝 Contributing

This is currently a solo founder project. Contributions are welcome in Phase 2+.

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Contact

- Website: [onesig.co](https://onesig.co) (coming soon)
- Email: contact@onesig.co
- Twitter: [@onesighq](https://twitter.com/onesighq) (coming soon)

---

## 🗺️ Roadmap

| Phase | Timeline | Goal | Status |
|-------|----------|------|--------|
| Phase 1 | Weeks 1-8 | 25 subscribers, manual workflow | 🟡 In Progress |
| Phase 2 | Month 3-4 | 100 subscribers, semi-automated | ⚪ Planned |
| Phase 3 | Month 5-6 | 500 subscribers, full dashboard | ⚪ Planned |
| Phase 4 | Month 7+ | 1,000+ subscribers, monetization | ⚪ Planned |

---

**Last Updated:** November 2025
