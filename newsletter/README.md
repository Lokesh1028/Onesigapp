# OneSig Newsletter

Weekly curated insider trading intelligence newsletter.

---

## 📋 Overview

The OneSig newsletter is a free weekly digest sent every Thursday at 9 AM EST, featuring:
- Top 10 insider trades (buys and sells)
- Context and analysis for each trade
- Market insights and patterns
- Educational content on interpreting insider data

---

## 📅 Phase 1 Workflow (Manual Curation)

### Weekly Schedule

#### Monday: Data Collection (30 minutes)
```bash
cd data-collection
source venv/bin/activate
python sec_scraper.py --days 7 --output ../newsletter/data/weekly_$(date +%Y%m%d).csv
```

**Output:** CSV file with ~50-100 insider trades from past week

---

#### Tuesday: Manual Review & Selection (60-90 minutes)

1. **Open the generated CSV** in Excel or Google Sheets

2. **Initial filtering:**
   - Remove option exercises (transaction code "M")
   - Remove stock awards/grants (transaction code "A")
   - Remove trades with $0 price per share
   - Remove duplicate filings (same trade reported multiple times)

3. **Rank by total value** (already sorted by scraper)

4. **Review top 30 trades:**
   - Separate buys from sells
   - Look for cluster buying patterns (multiple insiders in same company or sector)
   - Prioritize CEO/CFO trades over other officers
   - Note any trades following significant stock price movements

5. **Research context for top 15-20 trades:**
   - Check recent news (Google News, Yahoo Finance)
   - Check stock price chart (last 3 months)
   - Look for earnings reports, product launches, FDA approvals, etc.
   - Check if insider has history of buying/selling

6. **Select final 10 trades:**
   - **Top 5 buys** (prioritize interesting stories)
   - **Top 5 sells** (usually less interesting, but include notable ones)
   - Balance: Mix of household names and lesser-known companies
   - Focus: Tech & biotech (Phase 1 focus)

7. **Identify 4 "notable mentions"** for quick bullets

---

#### Wednesday: Write Newsletter (60-90 minutes)

1. **Copy the template:**
   ```bash
   cp newsletter/templates/weekly-template.md newsletter/drafts/draft_$(date +%Y%m%d).md
   ```

2. **Fill in each trade:**
   - Copy data from CSV (ticker, company, officer, shares, price, value)
   - Write 1-2 sentence "Why it matters" analysis
   - Add chart link: `https://finance.yahoo.com/quote/[TICKER]`
   - Add SEC filing URL from CSV

3. **Write "This Week's Insight":**
   - Choose one pattern or interesting observation
   - 1-2 paragraphs with educational value
   - Examples:
     - Cluster buying in specific sector
     - Insider behavior ahead of earnings
     - Historical context for current trades
     - How to interpret a specific type of signal

4. **Fill in "By the Numbers":**
   - Calculate total buy/sell values from CSV
   - Calculate buy/sell ratio
   - Identify most active sector

5. **Write "Next Week" preview:**
   - Mention upcoming earnings for companies with recent insider activity
   - Note any sector trends to watch
   - Tease interesting analysis for next week

6. **Quality check:**
   - Run spell check
   - Verify all links work
   - Check numbers match source data
   - Ensure tone is conversational but professional
   - Confirm disclaimer is included

---

#### Thursday 8:30 AM EST: Final Review & Send (30 minutes)

1. **Copy newsletter to Beehiiv:**
   - Log into Beehiiv dashboard
   - Create new post
   - Paste newsletter content
   - Format with Beehiiv editor (headers, bold, links)

2. **Preview:**
   - Send test email to yourself
   - Check formatting on desktop and mobile
   - Verify all links work

3. **Schedule/Send:**
   - Set send time: 9:00 AM EST
   - Review recipient list (all subscribers)
   - Click "Send" or "Schedule"

4. **Archive:**
   ```bash
   mv newsletter/drafts/draft_$(date +%Y%m%d).md newsletter/sent/
   ```

---

#### Friday: Analytics Review (15 minutes)

1. **Check Beehiiv analytics:**
   - Open rate (target: >40%)
   - Click-through rate (target: >10%)
   - Unsubscribe rate (target: <2%)
   - Which links were clicked most?

2. **Read subscriber replies:**
   - Respond to feedback
   - Note feature requests
   - Note stocks people want tracked

3. **Document learnings:**
   - What content resonated?
   - What didn't work?
   - Adjust next week's approach

---

## 📁 Directory Structure

```
newsletter/
├── README.md                 # This file
├── templates/
│   └── weekly-template.md    # Newsletter template with instructions
├── samples/
│   └── sample-newsletter-*.md # Example newsletters
├── drafts/                   # Work-in-progress newsletters (not sent)
├── sent/                     # Archive of sent newsletters
└── data/                     # CSV exports from scraper
```

---

## ✍️ Writing Guidelines

### Tone & Style

**Do:**
- ✅ Be conversational but professional
- ✅ Lead with data, not hype
- ✅ Explain why trades matter (context)
- ✅ Educate readers on interpretation
- ✅ Be transparent about limitations
- ✅ Use clear, simple language

**Don't:**
- ❌ Use phrases like "hot stock tip" or "can't lose"
- ❌ Make predictions or recommendations
- ❌ Hype up trades without context
- ❌ Use jargon without explanation
- ❌ Copy-paste from sources without attribution
- ❌ Skip the disclaimer

### Analysis Tips

**What makes a trade interesting:**
- First buy/sell by this insider in X months/years
- Buying after significant stock drop (10%+)
- Multiple insiders buying (cluster effect)
- CEO/CFO trade (highest conviction)
- Trade against prevailing sentiment
- Trade before/after major news

**Good analysis example:**
> "First open-market buy by Huang in over 2 years. Comes after stock dipped 15% from all-time highs on AI growth concerns. Strong vote of confidence from CEO during correction."

**Bad analysis example:**
> "Huang bought 50,000 shares. This is bullish. Stock will probably go up."

---

## 📊 Quality Metrics

### Newsletter Performance Targets

| Metric | Target | Industry Avg |
|--------|--------|--------------|
| Open Rate | >40% | 20-30% |
| Click Rate | >10% | 2-5% |
| Unsubscribe Rate | <2% | 0.5-1% |
| Reply Rate | >1% | <0.1% |

### Content Quality Checklist

Before sending, verify:
- [ ] All 10 trades have analysis (not just data)
- [ ] All links tested and working
- [ ] All numbers double-checked
- [ ] "This Week's Insight" provides educational value
- [ ] Tone is data-driven, not hype-driven
- [ ] Disclaimer included and prominent
- [ ] Unsubscribe link working
- [ ] Subject line compelling but not clickbait
- [ ] Preview text (first line) is engaging
- [ ] Mobile formatting checked
- [ ] Spelling and grammar reviewed

---

## 🚀 Phase 2 Improvements (Month 3-4)

**Planned Automation:**
- Automated trade ranking algorithm
- Auto-generated draft newsletter (80% complete)
- Template pre-filled with data
- Manual review reduced to 30-45 minutes
- Analysis still human-written (AI assistance considered)

**Enhanced Content:**
- Breaking news alerts (trades >$5M)
- Historical insider activity for same ticker
- Price performance tracking (did insiders' bets pay off?)

---

## 📚 Resources

### Research Tools
- **SEC EDGAR:** https://www.sec.gov/edgar/searchedgar/companysearch.html
- **Yahoo Finance:** https://finance.yahoo.com (charts, news)
- **Google News:** https://news.google.com (company news)
- **TradingView:** https://www.tradingview.com (advanced charts)

### Email Best Practices
- **Beehiiv Docs:** https://help.beehiiv.com
- **Email Subject Lines:** https://www.beehiiv.com/resources/email-subject-lines
- **Newsletter Design:** https://www.beehiiv.com/resources/newsletter-design

### Writing Guides
- **Plain Language:** https://www.plainlanguage.gov/guidelines/
- **CAN-SPAM Compliance:** https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business

---

## 🤝 Contributing

Currently a solo project (Phase 1). Will open to contributions in Phase 2+.

---

## 📄 License

Proprietary - OneSig LLC

---

**Last Updated:** November 2025
