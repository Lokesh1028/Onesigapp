# Insider insights: free API alternatives to FMP

This document compares free or free-tier APIs that can power “Latest Insider Trades” similar to the current Financial Modeling Prep (FMP) integration. It also outlines how to map their responses to the existing `InsightData` shape used by `landing-page/app/api/insights/route.ts`.

## Current contract (what the UI expects)

Fields in `InsightData`:
- filing_date: ISO date string (YYYY-MM-DD)
- ticker: stock symbol
- company_name: company name (fallback to ticker if missing)
- officer_name: insider’s name
- officer_title: insider’s title/role if known
- is_director: boolean
- is_officer: boolean
- trade_type: "Buy" | "Sale"
- shares: number (absolute shares transacted)
- price_per_share: number
- total_value: number (shares * price_per_share)
- transaction_code: Form 4 transaction code (e.g., P, S, A, D)
- sec_filing_url: URL to the Form 4 filing
- is_derivative: boolean (true for derivative transactions)

Filter logic to preserve:
- Only show significant trades: total_value >= $100,000
- Timeframe filter (N most recent days)
- Sort by total_value desc and take top 20

## Providers overview

Below are widely used options with free access paths. Always check each provider’s current rate limits and terms, which may change over time.

### 1) Finnhub
- Website: https://finnhub.io/docs/api
- Access: Requires free API key (developer tier available; rate limits apply)
- Relevant endpoints:
  - Insider Transactions (per symbol): GET /api/v1/stock/insider-transactions?symbol={SYMBOL}&token={API_KEY}
  - SEC Filings (filterable by form type): GET /api/v1/stock/filings?symbol={SYMBOL}&token={API_KEY} (use form=4 where supported)
- Notes:
  - Insider Transactions endpoint returns insider trades at the symbol level with fields like name, change (net shares), transactionPrice, transactionCode, filingDate/transactionDate.
  - You can derive Buy vs Sale from the sign/code of the transaction (e.g., P vs S). Total value is abs(change) * transactionPrice.
  - For a direct SEC link, pair with the SEC Filings endpoint (when available in your tier) or synthesize a link via accession number/CIK if provided.
- Mapping sketch to InsightData:
  - officer_name ← name
  - shares ← abs(change)
  - price_per_share ← transactionPrice
  - total_value ← abs(change) * transactionPrice
  - transaction_code ← transactionCode
  - filing_date ← filingDate (fallback to transactionDate)
  - trade_type ← derive from transactionCode or sign of change (P/A => Buy, S/D => Sale)
  - ticker, company_name ← from symbol and related fields
  - sec_filing_url ← from filings endpoint or constructed SEC URL if identifiers are present
  - is_director / is_officer ← often not provided; leave false unless role context is available
  - is_derivative ← infer from transactionCode or filings if available

### 2) Alpha Vantage
- Website: https://www.alphavantage.co/documentation/
- Access: Free API key required; throttling applies
- Relevant endpoint:
  - Insider Transactions (per symbol): function=INSIDER_TRANSACTIONS&symbol={SYMBOL}&apikey={KEY}
- Notes:
  - Returns transactions per symbol. You compute total_value from shares and price; derive Buy/Sale from transaction codes.
- Mapping sketch:
  - officer_name ← provided insider name field
  - shares ← shares transacted (absolute)
  - price_per_share ← transaction price
  - total_value ← shares * price_per_share
  - transaction_code ← provided code
  - filing_date ← filingDate
  - trade_type ← derive from transaction_code (P/A => Buy, S/D => Sale)
  - is_director / is_officer ← set based on any provided role fields; otherwise default false
  - sec_filing_url ← If not present, construct an SEC search URL for the ticker

### 3) SEC EDGAR (direct)
- Website: https://www.sec.gov/edgar/sec-api-documentation
- Access: No key needed, but you must:
  - Add a descriptive User-Agent header
  - Respect rate limits and fair-use policies
  - Note: No CORS — use server-side requests only (which our Next.js API route already does)
- Approach options:
  1) Company submissions API (per CIK): data.sec.gov/submissions/CIK##########.json → filter recent filings for forms 3/4/5 within timeframe; then fetch the Form 4 document (XML) and parse transactions.
  2) Bulk/indices: Use owner filing indices or search endpoints to locate Form 4 filings across the market for the timeframe, then parse.
- Pros/Cons:
  - Pros: 100% free, real-time, authoritative source.
  - Cons: Engineering effort to discover filings and parse Form 4 XML to extract transaction rows and roles.
- Mapping sketch:
  - filing_date ← filingDate
  ️- officer_name / title ← reportingOwner table in Form 4 XML
  - shares / price_per_share / transaction_code ← nonDerivativeTable/derivativeTable sections
  - trade_type ← derive from code (P/A => Buy, S/D => Sale)
  - company_name / ticker / CIK ← from header metadata
  - sec_filing_url ← official SEC filing URL
  - is_director / is_officer ← from reportingOwner relationship flags in XML
  - is_derivative ← based on table parsed

### 4) Others (for awareness)
- QuiverQuant API: Offers insider and alternative datasets; access often gated or paid. Docs: https://api.quiverquant.com/docs/
- Polygon/Massive: Has extensive market data and filings endpoints on paid tiers; not generally free for filing/insider data. Docs: https://polygon.io/docs/stocks
- IEX Cloud: Broad market data; insider datasets often paid. Docs: https://iexcloud.io/ (see documentation after login)

## Minimal integration pattern

You can make the provider configurable via environment variables without changing the client contract:

- INSIGHTS_PROVIDER: FMP | FINNHUB | ALPHAVANTAGE | SEC
- FMP_API_KEY: existing
- FINNHUB_API_KEY: for Finnhub
- ALPHAVANTAGE_API_KEY: for Alpha Vantage
- SEC_USER_AGENT: your app’s contact string for SEC requests

Pseudo-selection in `route.ts`:
- If INSIGHTS_PROVIDER is set, call the corresponding fetcher.
- Else default to FMP (current behavior).
- On any provider error or missing key, fall back to mock data (already implemented).

## Example mapping stubs (TypeScript sketches)

These are implementation outlines only; keep them outside production flow until you’re ready to switch.

```ts
// Finnhub → InsightData
function transformFinnhubToInsight(t: any, symbol: string): InsightData | null {
  if (!t?.transactionPrice || t?.change == null) return null
  const shares = Math.abs(Number(t.change))
  const price = Number(t.transactionPrice)
  const total = shares * price
  if (!Number.isFinite(total) || total < 100000) return null
  const code = String(t.transactionCode || '').toUpperCase()
  const isBuy = code === 'P' || code === 'A' || (Number(t.change) > 0)
  return {
    filing_date: t.filingDate || t.transactionDate,
    ticker: symbol,
    company_name: t.companyName || symbol,
    officer_name: t.name || 'Insider',
    officer_title: t.title || 'Insider',
    is_director: false,
    is_officer: false,
    trade_type: isBuy ? 'Buy' : 'Sale',
    shares,
    price_per_share: Number(price.toFixed(2)),
    total_value: Number(total.toFixed(2)),
    transaction_code: code,
    sec_filing_url: t.filingUrl || '',
    is_derivative: code === 'D' // heuristic; refine if better signal available
  }
}

// Alpha Vantage → InsightData
function transformAlphaToInsight(t: any, symbol: string): InsightData | null {
  const shares = Math.abs(Number(t.transactionShares))
  const price = Number(t.transactionPrice)
  if (!shares || !price) return null
  const total = shares * price
  if (total < 100000) return null
  const code = String(t.transactionCode || '').toUpperCase()
  const isBuy = code === 'P' || code === 'A'
  return {
    filing_date: t.filingDate || t.transactionDate,
    ticker: symbol,
    company_name: t.companyName || symbol,
    officer_name: t.insiderName || 'Insider',
    officer_title: t.insiderTitle || 'Insider',
    is_director: false,
    is_officer: false,
    trade_type: isBuy ? 'Buy' : 'Sale',
    shares,
    price_per_share: Number(price.toFixed(2)),
    total_value: Number(total.toFixed(2)),
    transaction_code: code,
    sec_filing_url: t.filingUrl || '',
    is_derivative: code === 'D'
  }
}
```

## Recommendation
- Near-term: Finnhub or Alpha Vantage are the quickest swaps for symbol-level insights. If you only need a subset of large-cap tickers, you can iterate symbols within rate limits and merge the results to maintain the current UI.
- Longer-term: Build a small Form 4 harvester on top of SEC EDGAR for a fully free, market-wide feed. This gives you full control and avoids third-party limits, at the cost of engineering work and maintenance.

## Next steps
- Choose a primary and a fallback provider.
- Add `INSIGHTS_PROVIDER` and any needed API keys to `.env.local`.
- Implement a provider switch in `route.ts` using the mapping stubs above.
- Update `landing-page/API_SETUP.md` with the chosen provider and instructions.
