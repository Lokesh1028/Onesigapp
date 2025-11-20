import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Cache for AInvest data (in-memory cache, resets on server restart)
let cachedCongressTrades: { trades: AInvestCongressTrade[], ticker: string }[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// AInvest API response structure
interface AInvestCongressTrade {
  name: string
  party: string
  state: string
  trade_date: string
  filing_date: string
  reporting_gap: string
  trade_type: string // 'buy' or 'sell'
  size: string // Size of trade (may be a range like "$1,000 - $15,000")
  ticker?: string // May be in query param or response
}

interface SenateTradeData {
  filing_date: string
  senator_name: string
  ticker: string
  company_name: string
  asset_description: string
  asset_type: string
  trade_type: 'Buy' | 'Sale'
  amount: number
  transaction_date: string
  disclosure_date: string
  ptr_link: string
  comment: string
}

interface SenateTradesResponse {
  success: boolean
  count: number
  summary: {
    total_trades: number
    buys: number
    sales: number
    total_buy_value: number
    total_sale_value: number
  }
  trades: SenateTradeData[]
  lastUpdated: string
  note?: string
}

// Transform AInvest Congress trade data to our format
function transformAInvestTrade(ainvestTrade: AInvestCongressTrade, ticker: string, companyName?: string): SenateTradeData | null {
  // Parse size/amount from AInvest format (may be "$1,000 - $15,000" or "$50,000")
  let numericAmount = 0
  if (ainvestTrade.size) {
    // Extract first number from string like "$1,000 - $15,000" or "$50,000"
    const match = ainvestTrade.size.replace(/[^0-9]/g, '')
    numericAmount = match ? parseInt(match) : 0
  }

  // Determine trade type from AInvest data
  const typeStr = (ainvestTrade.trade_type || '').toLowerCase()
  const isBuy = typeStr === 'buy' || typeStr === 'purchase' || typeStr === 'b'

  // Format dates
  const transactionDate = ainvestTrade.trade_date || new Date().toISOString().split('T')[0]
  const disclosureDate = ainvestTrade.filing_date || transactionDate

  // Use provided company name or fallback to ticker
  const finalCompanyName = companyName || ticker || 'N/A'

  return {
    filing_date: disclosureDate,
    senator_name: ainvestTrade.name || 'Unknown Congress Member',
    ticker: ticker || 'N/A',
    company_name: finalCompanyName,
    asset_description: `${finalCompanyName} Stock`,
    asset_type: 'Stock',
    trade_type: isBuy ? 'Buy' : 'Sale',
    amount: numericAmount,
    transaction_date: transactionDate,
    disclosure_date: disclosureDate,
    ptr_link: '', // AInvest doesn't provide PTR links
    comment: `${ainvestTrade.party} - ${ainvestTrade.state} | Reporting Gap: ${ainvestTrade.reporting_gap || 'N/A'}`,
  }
}

// Fetch Congress trades from AInvest API (with daily caching)
async function fetchCongressTrades(forceRefresh = false): Promise<{ trades: AInvestCongressTrade[], ticker: string }[]> {
  const apiKey = process.env.AINVEST_API_KEY

  if (!apiKey || apiKey === 'your_ainvest_api_key_here') {
    console.warn('[Senate Trades] AInvest API key not configured, returning empty array')
    return []
  }

  // Check cache first (unless force refresh)
  if (!forceRefresh && cachedCongressTrades !== null && cacheTimestamp !== null) {
    const now = Date.now()
    const cacheAge = now - cacheTimestamp
    
    if (cacheAge < CACHE_DURATION_MS) {
      const hoursRemaining = Math.floor((CACHE_DURATION_MS - cacheAge) / (60 * 60 * 1000))
      console.log(`[Senate Trades] Using cached data (${hoursRemaining} hours remaining until refresh)`)
      return cachedCongressTrades
    } else {
      console.log('[Senate Trades] Cache expired, fetching fresh data')
    }
  }

  try {
    // AInvest API endpoint for Congress trades
    const baseUrl = 'https://openapi.ainvest.com/open/ownership/congress'
    
    // Try fetching without ticker first (if API supports it)
    let allTrades: { trades: AInvestCongressTrade[], ticker: string }[] = []
    
    try {
      const url = `${baseUrl}?page=1&size=100`
      console.log('[Senate Trades] Attempting to fetch all Congress trades from AInvest (no ticker filter)...')
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        // No Next.js cache - we use our own 24-hour cache
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status_code === 0 && data.data && data.data.data && Array.isArray(data.data.data)) {
          // If ticker is in response, use it; otherwise use 'ALL' or extract from context
          const trades = data.data.data.map((trade: AInvestCongressTrade) => ({
            ...trade,
            ticker: trade.ticker || 'N/A',
          }))
          
          if (trades.length > 0) {
            allTrades.push({ trades, ticker: 'ALL' })
            console.log(`[Senate Trades] Received ${trades.length} trades from AInvest API (all trades)`)
            return allTrades
          }
        }
      }
    } catch (error) {
      console.log('[Senate Trades] Fetching without ticker not supported, falling back to ticker-specific queries')
    }
    
    // Fallback: Fetch trades for popular stocks if all-trades endpoint doesn't work
    const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ', 'WMT', 'MA', 'DIS', 'NFLX', 'AMD']
    
    // Fetch trades for multiple tickers to get comprehensive data
    for (const ticker of popularTickers) {
      try {
        const url = `${baseUrl}?ticker=${ticker}&page=1&size=50`
        
        console.log(`[Senate Trades] Fetching AInvest data for ${ticker}...`)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          // No Next.js cache - we use our own 24-hour cache
        })

        if (!response.ok) {
          console.warn(`[Senate Trades] AInvest API error for ${ticker}: ${response.status} ${response.statusText}`)
          continue
        }

        const data = await response.json()
        
        // AInvest response structure: { data: { data: [...] }, status_code: 0, status_msg: "success" }
        if (data.status_code === 0 && data.data && data.data.data && Array.isArray(data.data.data)) {
          const trades = data.data.data.map((trade: AInvestCongressTrade) => ({
            ...trade,
            ticker: ticker, // Add ticker to each trade
          }))
          
          if (trades.length > 0) {
            allTrades.push({ trades, ticker })
            console.log(`[Senate Trades] Received ${trades.length} trades for ${ticker} from AInvest API`)
          }
        }
      } catch (tickerError) {
        console.warn(`[Senate Trades] Error fetching ${ticker}:`, tickerError)
        continue
      }
    }

    const totalTrades = allTrades.reduce((sum, item) => sum + item.trades.length, 0)
    console.log(`[Senate Trades] Total trades fetched from AInvest: ${totalTrades}`)
    
    // Update cache
    cachedCongressTrades = allTrades
    cacheTimestamp = Date.now()
    console.log(`[Senate Trades] Data cached. Next refresh in 24 hours.`)
    
    return allTrades
  } catch (error) {
    console.error('[Senate Trades] Error fetching from AInvest API:', error)
    
    // Return cached data if available, even if expired
    if (cachedCongressTrades !== null) {
      console.log('[Senate Trades] API error, returning stale cached data')
      return cachedCongressTrades
    }
    
    return []
  }
}

// Fetch company names for tickers using stock quotes API
async function getCompanyNames(tickers: string[], requestOrigin: string): Promise<Record<string, string>> {
  const companyNames: Record<string, string> = {}
  
  if (tickers.length === 0) return companyNames

  try {
    const symbolsParam = [...new Set(tickers)].join(',')
    const stockResponse = await fetch(`${requestOrigin}/api/stock-quotes?symbols=${symbolsParam}`)
    
    if (stockResponse.ok) {
      const stockResult = await stockResponse.json()
      if (stockResult.success && stockResult.stocks) {
        for (const stock of stockResult.stocks) {
          companyNames[stock.symbol] = stock.name || stock.symbol
        }
      }
    }
  } catch (error) {
    console.warn('[Senate Trades] Failed to fetch company names:', error)
  }

  return companyNames
}

// Fetch latest Congress trades from AInvest API (ONLY real data, no mock data)
// Returns the latest 10 trades sorted by date (most recent first)
// Uses daily caching - only fetches from API once per day
async function fetchLatestSenateTrades(requestOrigin?: string, forceRefresh = false): Promise<SenateTradeData[]> {
  const apiKey = process.env.AINVEST_API_KEY

  if (!apiKey || apiKey === 'your_ainvest_api_key_here') {
    console.warn('[Senate Trades] AInvest API key not configured. Returning empty array.')
    return []
  }

  try {
    const tickerGroups = await fetchCongressTrades(forceRefresh)

    if (tickerGroups.length === 0) {
      console.warn('[Senate Trades] No trades received from AInvest API')
      return []
    }

    // Collect all unique tickers to fetch company names
    const allTickers = [...new Set(tickerGroups.map(g => g.ticker).filter(t => t !== 'ALL' && t !== 'N/A'))]
    
    // Fetch company names if request origin is provided
    let companyNames: Record<string, string> = {}
    if (requestOrigin) {
      companyNames = await getCompanyNames(allTickers, requestOrigin)
    }

    // Transform all trades
    const senateTrades: SenateTradeData[] = []

    console.log(`[Senate Trades] Processing trades from AInvest`)

    for (const group of tickerGroups) {
      for (const trade of group.trades) {
        const transformed = transformAInvestTrade(trade, group.ticker, companyNames[group.ticker])
        if (transformed) {
          senateTrades.push(transformed)
        }
      }
    }

    console.log(`[Senate Trades] Successfully transformed ${senateTrades.length} trades from AInvest`)

    // Sort by transaction date descending (most recent first)
    senateTrades.sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime()
      const dateB = new Date(b.transaction_date).getTime()
      return dateB - dateA
    })

    // Remove duplicates (same senator, ticker, date)
    const uniqueTrades = senateTrades.filter((trade, index, self) =>
      index === self.findIndex((t) => 
        t.senator_name === trade.senator_name &&
        t.ticker === trade.ticker &&
        t.transaction_date === trade.transaction_date
      )
    )

    // Return latest 10 trades
    const latestTrades = uniqueTrades.slice(0, 10)
    console.log(`[Senate Trades] Returning latest ${latestTrades.length} unique trades from AInvest API`)

    return latestTrades
  } catch (error) {
    console.error('[Senate Trades] Error processing AInvest data:', error)
    return []
  }
}

// Mock data generation removed - only real FMP API data is used

// Calculate summary statistics
function calculateSummary(trades: SenateTradeData[]) {
  const buys = trades.filter(t => t.trade_type === 'Buy')
  const sales = trades.filter(t => t.trade_type === 'Sale')

  return {
    total_trades: trades.length,
    buys: buys.length,
    sales: sales.length,
    total_buy_value: buys.reduce((sum, t) => sum + t.amount, 0),
    total_sale_value: sales.reduce((sum, t) => sum + t.amount, 0),
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if force refresh is requested (for manual refresh)
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Fetch latest 10 Congress trades from AInvest API
    // Uses daily caching - only calls API once per day unless forceRefresh=true
    const requestOrigin = request.nextUrl.origin
    const trades = await fetchLatestSenateTrades(requestOrigin, forceRefresh)
    const summary = calculateSummary(trades)
    
    // Calculate cache info
    const cacheInfo = cacheTimestamp 
      ? {
          cached: true,
          cacheAge: Date.now() - cacheTimestamp,
          nextRefresh: new Date(cacheTimestamp + CACHE_DURATION_MS).toISOString(),
        }
      : { cached: false }

    const cacheMessage = cacheInfo.cached 
      ? ` Data cached. Next refresh: ${new Date(cacheInfo.nextRefresh!).toLocaleString()}.`
      : ''
    
    const result: SenateTradesResponse = {
      success: true,
      count: trades.length,
      summary,
      trades,
      lastUpdated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : new Date().toISOString(),
      note: process.env.AINVEST_API_KEY && process.env.AINVEST_API_KEY !== 'your_ainvest_api_key_here'
        ? `Real-time data from US Congress financial disclosures via AInvest API. Showing latest 10 trades.${cacheMessage}`
        : 'AINVEST_API_KEY not configured. Please set AINVEST_API_KEY in .env.local to view congressional trading data.',
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Senate Trades] Error fetching senate trades:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch senate trades',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

