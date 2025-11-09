# OneSig Data Collection

Python-based system for collecting and processing SEC Form 4 insider trading data.

---

## 📋 Overview

This module scrapes insider trading data from SEC EDGAR (Electronic Data Gathering, Analysis, and Retrieval system), focusing on Form 4 filings which report insider transactions.

### What Data Do We Collect?

- **Officer/Director Information:** Name, title, role
- **Trade Details:** Type (buy/sell), shares, price per share, total value
- **Company Information:** Ticker symbol, company name
- **Filing Information:** Date, SEC filing URL
- **Transaction Codes:** SEC codes indicating transaction type

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
```

### 2. Run the Scraper

```bash
# Collect last 7 days of insider trades (default)
python sec_scraper.py

# Collect last 14 days
python sec_scraper.py --days 14

# Export to custom file
python sec_scraper.py --output my_trades.csv

# Filter for trades >$500k
python sec_scraper.py --min-value 500000

# Get only top 20 trades
python sec_scraper.py --top 20
```

### 3. View Results

The scraper will create a CSV file (default: `insider_trades.csv`) with all trades matching your criteria.

---

## 📊 Output Format

### CSV Columns

| Column | Description | Example |
|--------|-------------|---------|
| `filing_date` | Date the trade was reported | 2025-11-08 |
| `ticker` | Stock ticker symbol | NVDA |
| `company_name` | Company name | Nvidia Corporation |
| `officer_name` | Name of the insider | Jensen Huang |
| `officer_title` | Title/position | CEO |
| `is_director` | Is a board director? | True |
| `is_officer` | Is an officer? | True |
| `trade_type` | Buy or Sell | Buy |
| `shares` | Number of shares | 50000 |
| `price_per_share` | Price per share | 134.22 |
| `total_value` | Total transaction value | 6711000.00 |
| `transaction_code` | SEC transaction code | P |
| `sec_filing_url` | Link to SEC filing | https://sec.gov/... |

### Transaction Codes

- **P:** Open market purchase (Buy)
- **S:** Open market sale (Sell)
- **A:** Award/grant (filtered out)
- **D:** Sale to issuer (Sell)
- **M:** Option exercise (filtered out)

---

## ⚙️ Configuration

### Command Line Arguments

```bash
python sec_scraper.py [OPTIONS]

Options:
  --days DAYS           Number of days to look back (default: 7)
  --output FILE         Output CSV filename (default: insider_trades.csv)
  --min-value VALUE     Minimum trade value in USD (default: 100000)
  --top N               Limit to top N trades (default: all)
  --help                Show help message
```

### Examples

```bash
# Weekly newsletter curation (Phase 1 workflow)
python sec_scraper.py --days 7 --min-value 100000 --output weekly_trades.csv

# Focus on large trades only
python sec_scraper.py --days 7 --min-value 1000000 --top 50

# Deep dive for monthly analysis
python sec_scraper.py --days 30 --min-value 50000
```

---

## 🔒 SEC Compliance

This scraper follows SEC EDGAR access guidelines:

- **Rate Limiting:** 1 request/second (SEC allows 10/sec, we're conservative)
- **User-Agent:** Identifies as "OneSig contact@onesig.co"
- **Attribution:** All data linked back to original SEC filings
- **Non-Commercial Use:** Data is publicly available from SEC

### SEC EDGAR Rules

From [SEC EDGAR Guidelines](https://www.sec.gov/os/accessing-edgar-data):
- Declare a User-Agent header (✅ implemented)
- Rate limit to 10 requests/second maximum (✅ we use 1/sec)
- Do not scrape data you don't need (✅ targeted queries)

---

## 📖 Usage in Phase 1 Workflow

### Monday: Data Collection

```bash
# Activate environment
cd data-collection
source venv/bin/activate

# Run scraper for last 7 days
python sec_scraper.py --days 7 --output ../newsletter/data/weekly_$(date +%Y%m%d).csv

# Review the output file
cat ../newsletter/data/weekly_*.csv
```

### Tuesday-Wednesday: Manual Curation

1. Open the generated CSV in Excel/Google Sheets
2. Review top 20-30 trades by value
3. Remove:
   - Option exercises (transaction code "M")
   - Stock awards (transaction code "A")
   - Trades with $0 price
4. Research context for top 10 trades:
   - Recent company news
   - Stock price movements
   - Multiple insiders buying (cluster effect)
5. Select final 10 trades for newsletter

---

## 🐛 Troubleshooting

### Common Issues

**Error: "Rate limit exceeded"**
```
Solution: The script automatically handles rate limiting. If you see this,
the SEC server may be temporarily blocking requests. Wait 10 minutes and retry.
```

**Error: "No XML document found"**
```
Solution: Some Form 4 filings are in HTML format. These are currently skipped.
This is normal and affects ~5% of filings.
```

**Warning: "No trades found matching criteria"**
```
Solution: Lower the --min-value threshold or increase --days. Some weeks have
fewer significant insider trades than others.
```

**Empty CSV output**
```
Check:
1. Internet connection is active
2. SEC EDGAR website is accessible: https://www.sec.gov
3. Virtual environment is activated
4. All dependencies are installed: pip list
```

---

## 🧪 Testing

### Run Unit Tests

```bash
pytest tests/
```

### Manual Test

```bash
# Test with 1 day of data
python sec_scraper.py --days 1 --top 5

# Should output 5 trades (or fewer if quiet week)
```

---

## 🔮 Future Enhancements (Phase 2+)

### Planned Features

- **Automated Scheduling:** GitHub Actions cron job
- **Database Integration:** Store in Supabase PostgreSQL
- **Data Enrichment:**
  - Stock price at trade date
  - % of shares owned after trade
  - Historical insider activity for same officer
- **Filtering:**
  - Focus on S&P 500 + NASDAQ 100 only
  - Tech & biotech sectors only
- **Deduplication:** Same trade reported multiple times
- **Sentiment Analysis:** Cluster buying detection

### Phase 2 Architecture

```
GitHub Actions (daily cron)
    ↓
sec_scraper.py
    ↓
Supabase PostgreSQL
    ↓
Next.js Dashboard (auto-refresh)
```

---

## 📚 Resources

- **SEC EDGAR:** https://www.sec.gov/edgar/searchedgar/companysearch.html
- **Form 4 Guide:** https://www.sec.gov/files/form4.pdf
- **Transaction Codes:** https://www.sec.gov/about/forms/form4data.pdf
- **Python SEC Library:** https://github.com/jadchaar/sec-edgar-downloader

---

## 🤝 Contributing

Contributions welcome in Phase 2+. For now, this is a solo project.

---

## 📄 License

Proprietary - OneSig LLC

---

**Last Updated:** November 2025
