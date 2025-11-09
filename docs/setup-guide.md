# OneSig Setup Guide

Complete setup instructions for OneSig Phase 1 MVP.

---

## 📋 Overview

This guide will walk you through setting up the OneSig project from scratch, including:
- Development environment setup
- Python data collection system
- Next.js landing page
- Newsletter workflow
- Deployment

**Estimated Setup Time:** 2-3 hours

---

## ✅ Prerequisites

### Required Software

- **Git:** Version control
  - Install: https://git-scm.com/downloads
  - Verify: `git --version`

- **Python 3.11+:** For SEC data scraping
  - Install: https://www.python.org/downloads/
  - Verify: `python --version` or `python3 --version`

- **Node.js 18+:** For Next.js landing page
  - Install: https://nodejs.org/
  - Verify: `node --version`

- **npm 9+:** Node package manager
  - Comes with Node.js
  - Verify: `npm --version`

### Recommended Tools

- **VS Code:** Code editor
  - Download: https://code.visualstudio.com/
  - Extensions: Python, ESLint, Tailwind CSS IntelliSense

- **Google Sheets:** Data curation (Phase 1)
  - Account: https://sheets.google.com

- **Beehiiv Account:** Email newsletter service
  - Sign up: https://www.beehiiv.com/

---

## 🚀 Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd OneSig

# Verify you're on the correct branch
git branch
# Should show: claude/onesig-mvp-prd-implementation-011CUxJ4zYxs9oipqZua7LXt
```

---

### 2. Set Up Python Data Collection

#### 2.1 Create Virtual Environment

```bash
cd data-collection

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Verify activation (you should see "(venv)" in your prompt)
```

#### 2.2 Install Dependencies

```bash
# Install required packages
pip install -r requirements.txt

# Verify installation
pip list
# Should show: sec-edgar-downloader, pandas, requests, beautifulsoup4, etc.
```

#### 2.3 Test the Scraper

```bash
# Run a test scrape (1 day of data)
python sec_scraper.py --days 1 --top 5

# Expected output:
# - Log messages showing progress
# - CSV file created: insider_trades.csv
# - Top 5 trades printed to console
```

#### 2.4 Troubleshooting

**Error: "No module named 'X'"**
```bash
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "Rate limit exceeded"**
```bash
# Wait 10 minutes and retry
# SEC may be temporarily blocking requests
```

---

### 3. Set Up Next.js Landing Page

#### 3.1 Install Dependencies

```bash
# Navigate to landing page directory
cd ../landing-page

# Install Node.js packages
npm install

# This may take 2-5 minutes
```

#### 3.2 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your settings
# For Phase 1, default values are fine
nano .env.local  # or use your preferred editor
```

#### 3.3 Run Development Server

```bash
# Start the dev server
npm run dev

# Expected output:
# - Local: http://localhost:3000
# - Ready in X seconds
```

#### 3.4 View the Landing Page

Open your browser and navigate to:
```
http://localhost:3000
```

You should see:
- Hero section with "Get Insider Trade Alerts Before the Market Reacts"
- Email signup form
- "How It Works" section
- FAQ section

#### 3.5 Troubleshooting

**Error: "Cannot find module 'X'"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Use a different port
npm run dev -- -p 3001
# Or kill the process using port 3000
lsof -ti:3000 | xargs kill
```

**Error: TypeScript errors**
```bash
# Check TypeScript configuration
npm run type-check

# Fix errors and retry
```

---

## 🗂️ Project Structure Overview

```
OneSig/
├── data-collection/          # Python SEC scraper
│   ├── sec_scraper.py       # Main scraper script
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Virtual environment (created by you)
│
├── landing-page/            # Next.js landing page
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── EmailSignupForm.tsx
│   │   ├── FeatureCard.tsx
│   │   └── FAQItem.tsx
│   ├── package.json         # Node dependencies
│   └── node_modules/        # Installed packages (created by npm)
│
├── newsletter/              # Newsletter templates
│   ├── templates/           # Newsletter templates
│   ├── samples/             # Example newsletters
│   ├── drafts/              # Work in progress
│   ├── sent/                # Archived sent newsletters
│   └── data/                # CSV exports from scraper
│
├── legal/                   # Legal documents
│   ├── disclaimer.md
│   ├── privacy-policy.md
│   └── terms-of-service.md
│
├── docs/                    # Documentation
│   ├── setup-guide.md       # This file
│   └── PRD.md               # Product Requirements Doc
│
├── .gitignore              # Git ignore rules
└── README.md               # Project overview
```

---

## 🔧 Configuration

### Beehiiv Setup (Email Newsletter)

#### 1. Create Account

1. Go to https://www.beehiiv.com/
2. Sign up for free account
3. Create a new publication
   - Name: OneSig
   - Description: Curated insider trading intelligence

#### 2. Configure Publication

**Settings → General:**
- Publication name: OneSig
- Description: Get curated insider trading insights delivered to your inbox
- Website: https://onesig.co (or your domain)

**Settings → Email:**
- From name: OneSig
- From email: newsletter@onesig.co (or your domain)
- Reply-to: contact@onesig.co

**Settings → Subscription:**
- Enable double opt-in: ✅ Yes (recommended)
- Welcome email: Create a welcome message

#### 3. Create Landing Page (Beehiiv)

**Option A: Use Beehiiv landing page (simpler)**
- Dashboard → Landing Page
- Customize design
- Add email capture form
- Publish

**Option B: Use Next.js landing page (more control)**
- Deploy Next.js landing page (see Deployment section)
- Embed Beehiiv signup form or use API

#### 4. Get API Keys (Phase 2+)

For API integration:
- Dashboard → Settings → API
- Generate API key
- Add to `.env.local`

---

### Domain Setup (Optional - Phase 2)

#### 1. Purchase Domain

Recommended registrars:
- **Namecheap:** https://www.namecheap.com/ (~$10-15/year)
- **Cloudflare:** https://www.cloudflare.com/ (~$9-10/year)
- **Google Domains:** https://domains.google.com/ (~$12/year)

Suggested domains:
- onesig.co
- onesig.app
- onesig.io
- getonesig.com

#### 2. Configure DNS

If using Vercel for landing page:
1. Add domain in Vercel dashboard
2. Copy DNS records provided by Vercel
3. Add records to your domain registrar
4. Wait for DNS propagation (up to 48 hours)

---

## 📧 Phase 1 Weekly Workflow

### Monday: Data Collection (30 min)

```bash
cd data-collection
source venv/bin/activate
python sec_scraper.py --days 7 --output ../newsletter/data/weekly_$(date +%Y%m%d).csv
deactivate
```

### Tuesday: Manual Review (60-90 min)

1. Open CSV in Google Sheets or Excel
2. Filter and rank trades
3. Research top 15-20 trades
4. Select final 10 for newsletter
5. Identify 4 notable mentions

See: `newsletter/README.md` for detailed workflow

### Wednesday: Write Newsletter (60-90 min)

1. Copy template:
   ```bash
   cp newsletter/templates/weekly-template.md newsletter/drafts/draft_$(date +%Y%m%d).md
   ```
2. Fill in trade data and analysis
3. Write "This Week's Insight"
4. Proofread and spell-check

### Thursday 8:30 AM: Send Newsletter (30 min)

1. Log into Beehiiv dashboard
2. Create new post
3. Paste newsletter content
4. Preview on desktop and mobile
5. Schedule for 9:00 AM EST
6. Archive draft:
   ```bash
   mv newsletter/drafts/draft_$(date +%Y%m%d).md newsletter/sent/
   ```

### Friday: Analytics Review (15 min)

1. Check Beehiiv analytics
2. Read subscriber replies
3. Note improvements for next week

---

## 🚀 Deployment

### Deploy Landing Page (Vercel)

#### 1. Create Vercel Account

1. Go to https://vercel.com/
2. Sign up with GitHub
3. No credit card required for free tier

#### 2. Deploy from GitHub

```bash
# From project root
cd landing-page

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 3. Connect to Vercel

1. Vercel Dashboard → New Project
2. Import from GitHub
3. Select OneSig repository
4. Configure:
   - Framework: Next.js
   - Root directory: `landing-page`
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add environment variables (if any)
6. Click "Deploy"

#### 4. Verify Deployment

- Your site will be live at: `https://your-project.vercel.app`
- Test all features:
  - Email signup form
  - Navigation links
  - Mobile responsiveness
  - Legal documents

#### 5. Add Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

---

## 🧪 Testing

### Test Data Collection

```bash
cd data-collection
source venv/bin/activate

# Test with 1 day of data
python sec_scraper.py --days 1 --top 5

# Verify output:
# - insider_trades.csv created
# - Contains valid data
# - Top 5 trades printed

deactivate
```

### Test Landing Page

```bash
cd landing-page

# Run type checking
npm run type-check

# Run linter
npm run lint

# Start dev server
npm run dev
```

**Manual Testing Checklist:**
- [ ] Page loads without errors
- [ ] Email signup form accepts valid emails
- [ ] Email signup form rejects invalid emails
- [ ] All navigation links work
- [ ] FAQ items expand/collapse
- [ ] Mobile responsive design works
- [ ] Legal links in footer work

### Test Newsletter Workflow

1. Run scraper and generate CSV
2. Open CSV and verify data
3. Copy template and fill in
4. Proofread newsletter
5. Send test email to yourself (via Beehiiv)
6. Verify formatting on desktop and mobile

---

## 🐛 Common Issues & Solutions

### Python Issues

**"pip: command not found"**
```bash
# Use pip3 instead
pip3 install -r requirements.txt
```

**"Permission denied"**
```bash
# Don't use sudo with virtual environment
# Make sure venv is activated
```

### Node.js Issues

**"Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Out of memory"**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Git Issues

**"Permission denied (publickey)"**
```bash
# Set up SSH key for GitHub
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add public key to GitHub Settings → SSH Keys
```

---

## 📚 Next Steps

After setup is complete:

1. **Run your first data collection**
   ```bash
   cd data-collection
   source venv/bin/activate
   python sec_scraper.py --days 7
   ```

2. **Create your first newsletter draft**
   - Use the generated CSV
   - Follow the weekly workflow
   - Practice with template

3. **Deploy landing page** (optional for Phase 1)
   - Push to Vercel
   - Test email signup
   - Share with initial 5 subscribers

4. **Set up Beehiiv**
   - Create account
   - Configure publication
   - Send test newsletter to yourself

5. **Send your first newsletter** 🎉
   - Manually to your 5 initial subscribers
   - Get feedback
   - Iterate on format

---

## 🤝 Getting Help

### Documentation

- **Project README:** `/README.md`
- **Data Collection:** `/data-collection/README.md`
- **Newsletter Workflow:** `/newsletter/README.md`
- **Legal Docs:** `/legal/README.md`
- **PRD:** `/docs/PRD.md`

### External Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Python Docs:** https://docs.python.org/3/
- **SEC EDGAR:** https://www.sec.gov/edgar
- **Beehiiv Help:** https://help.beehiiv.com/

### Contact

- **Technical Issues:** Create GitHub issue
- **Questions:** contact@onesig.co
- **Legal Questions:** legal@onesig.co

---

## ✅ Setup Complete Checklist

Before launching:

### Development Environment
- [ ] Python 3.11+ installed and verified
- [ ] Node.js 18+ installed and verified
- [ ] Git installed and configured
- [ ] VS Code or preferred editor set up

### Python Data Collection
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Scraper tested successfully
- [ ] Test CSV generated

### Landing Page
- [ ] Dependencies installed
- [ ] Dev server runs without errors
- [ ] Page displays correctly in browser
- [ ] Mobile responsive tested
- [ ] Type checking passes

### Newsletter Setup
- [ ] Beehiiv account created
- [ ] Publication configured
- [ ] Test email sent successfully
- [ ] Template customized

### Legal & Compliance
- [ ] Legal documents reviewed
- [ ] Disclaimer added to website
- [ ] Physical address added to emails (before public launch)
- [ ] Unsubscribe link tested

### Deployment (Optional for Phase 1)
- [ ] Landing page deployed to Vercel
- [ ] Custom domain configured (Phase 2)
- [ ] All links working in production

---

**You're ready to launch OneSig Phase 1! 🚀**

---

**Last Updated: November 9, 2025**
