import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface HistoricalPrice {
  date: string
  close: number
}

interface StockHistory {
  symbol: string
  currentPrice: number
  priceSevenDaysAgo: number
  change: number
  changePercent: number
  history: HistoricalPrice[]
}

// Fetch 7-day historical data from EODHD API
async function fetch7DayHistoryFromEODHD(symbols: string[], apiKey: string): Promise<StockHistory[]> {
  const results: StockHistory[] = []
  
  // Calculate date range (8 days ago to today to ensure we have 7 trading days)
  const toDate = new Date()
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - 10) // Get 10 days to ensure we have enough trading days
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0]
  
  for (const symbol of symbols) {
    try {
      // EODHD requires exchange suffix (using .US for US stocks)
      const tickerWithExchange = symbol.includes('.') ? symbol : `${symbol}.US`
      
      // Fetch end-of-day historical prices
      const url = `https://eodhd.com/api/eod/${tickerWithExchange}?from=${formatDate(fromDate)}&to=${formatDate(toDate)}&period=d&api_token=${apiKey}&fmt=json`
      
      const response = await fetch(url, {
        next: { revalidate: 3600 } // Cache for 1 hour
      })

      if (!response.ok) {
        console.error(`EODHD API error for ${symbol}: ${response.status}`)
        continue
      }

      const data = await response.json()
      
      if (!data || !Array.isArray(data) || data.length < 2) {
        console.error(`Insufficient historical data for ${symbol}`)
        continue
      }

      // Data is sorted oldest to newest
      const mostRecentData = data[data.length - 1]
      const currentPrice = mostRecentData.close
      
      // Get price from 7 trading days ago (or closest available)
      const sevenDaysAgoIndex = Math.max(0, data.length - 8)
      const priceSevenDaysAgo = data[sevenDaysAgoIndex].close
      
      // Calculate change
      const change = currentPrice - priceSevenDaysAgo
      const changePercent = (change / priceSevenDaysAgo) * 100

      // Build history array (most recent first)
      const history: HistoricalPrice[] = data.slice(-8).reverse().map((item: any) => ({
        date: item.date,
        close: parseFloat(item.close.toFixed(2))
      }))

      results.push({
        symbol: symbol.toUpperCase(),
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        priceSevenDaysAgo: parseFloat(priceSevenDaysAgo.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        history
      })
    } catch (error) {
      console.error(`Error fetching history for ${symbol}:`, error)
    }
  }
  
  return results
}

// Generate mock historical data for demo
function generateMockHistory(symbols: string[]): StockHistory[] {
  return symbols.map(symbol => {
    const currentPrice = 100 + Math.random() * 400
    const changePercent = (Math.random() - 0.5) * 20 // -10% to +10%
    const change = (currentPrice * changePercent) / 100
    const priceSevenDaysAgo = currentPrice - change
    
    const history: HistoricalPrice[] = []
    let price = priceSevenDaysAgo
    const today = new Date()
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Random daily change
      const dailyChange = (Math.random() - 0.5) * 0.05 * price
      price += dailyChange
      
      history.push({
        date: date.toISOString().split('T')[0],
        close: parseFloat(price.toFixed(2))
      })
    }
    
    // Ensure last price matches current
    history[history.length - 1].close = parseFloat(currentPrice.toFixed(2))
    
    return {
      symbol: symbol.toUpperCase(),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      priceSevenDaysAgo: parseFloat(priceSevenDaysAgo.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      history
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tickers } = body

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: 'Tickers array is required' },
        { status: 400 }
      )
    }

    if (tickers.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 tickers allowed' },
        { status: 400 }
      )
    }

    const apiKey = process.env.EODHD_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        stocks: generateMockHistory(tickers),
        note: 'Demo mode: Using mock data. Add your EODHD_API_KEY to .env.local for real data.',
      })
    }

    try {
      const history = await fetch7DayHistoryFromEODHD(tickers, apiKey)
      
      return NextResponse.json({
        success: true,
        stocks: history,
        note: 'Real 7-day historical data from EODHD API',
      })
    } catch (error) {
      console.error('Error fetching historical data:', error)
      return NextResponse.json({
        success: true,
        stocks: generateMockHistory(tickers),
        note: 'Using mock data due to API error.',
      })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
