import { NextRequest, NextResponse } from 'next/server'

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  previousClose: number
  dayLow: number
  dayHigh: number
  yearLow: number
  yearHigh: number
}

interface FMPQuoteResponse {
  symbol: string
  name: string
  price: number
  changesPercentage: number
  change: number
  dayLow: number
  dayHigh: number
  yearHigh: number
  yearLow: number
  marketCap: number
  priceAvg50: number
  priceAvg200: number
  volume: number
  avgVolume: number
  exchange: string
  previousClose: number
  eps: number
  pe: number
  earningsAnnouncement: string
  sharesOutstanding: number
  timestamp: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbols = searchParams.get('symbols')

    if (!symbols) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      )
    }

    const symbolList = symbols.split(',').map((s) => s.trim().toUpperCase())
    
    if (symbolList.length === 0 || symbolList.length > 10) {
      return NextResponse.json(
        { error: 'Please provide 1-10 stock symbols' },
        { status: 400 }
      )
    }

    const apiKey = process.env.FMP_API_KEY

    if (!apiKey || apiKey === 'your_fmp_api_key_here') {
      // Return mock data if API key not configured
      return NextResponse.json({
        success: true,
        stocks: generateMockQuotes(symbolList),
        note: 'Demo mode: Using mock data. Add your FMP_API_KEY to .env.local for real data.',
      })
    }

    try {
      // Fetch real-time quotes from FMP API
      const quotes = await fetchRealTimeQuotes(symbolList, apiKey)
      
      return NextResponse.json({
        success: true,
        stocks: quotes,
        note: 'Real-time data from Financial Modeling Prep API',
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' // Cache for 1 minute
        }
      })
    } catch (error) {
      console.error('Error fetching real-time quotes:', error)
      // Fallback to mock data on error
      return NextResponse.json({
        success: true,
        stocks: generateMockQuotes(symbolList),
        note: 'Using mock data due to API error. Check your FMP_API_KEY configuration.',
      })
    }
  } catch (error) {
    console.error('Error in stock-quotes API:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch stock quotes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function fetchRealTimeQuotes(
  symbols: string[],
  apiKey: string
): Promise<StockQuote[]> {
  // FMP API endpoint for real-time quotes
  // Using batch endpoint to fetch multiple symbols at once
  const symbolsParam = symbols.join(',')
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsParam}?apikey=${apiKey}`

  console.log(`Fetching real-time quotes for: ${symbolsParam}`)

  const response = await fetch(url, {
    next: { revalidate: 60 } // Cache for 1 minute
  })

  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`)
  }

  const fmpQuotes: FMPQuoteResponse[] = await response.json()

  if (!Array.isArray(fmpQuotes) || fmpQuotes.length === 0) {
    throw new Error('No data returned from FMP API')
  }

  // Transform FMP response to our format
  const quotes: StockQuote[] = fmpQuotes.map((quote) => ({
    symbol: quote.symbol,
    name: quote.name || quote.symbol,
    price: quote.price || 0,
    change: quote.change || 0,
    changePercent: quote.changesPercentage || 0,
    volume: quote.volume || 0,
    marketCap: quote.marketCap || 0,
    previousClose: quote.previousClose || quote.price || 0,
    dayLow: quote.dayLow || 0,
    dayHigh: quote.dayHigh || 0,
    yearLow: quote.yearLow || 0,
    yearHigh: quote.yearHigh || 0,
  }))

  console.log(`Successfully fetched ${quotes.length} stock quotes`)

  return quotes
}

function generateMockQuotes(symbols: string[]): StockQuote[] {
  const names: Record<string, string> = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    GOOGL: 'Alphabet Inc.',
    AMZN: 'Amazon.com Inc.',
    NVDA: 'NVIDIA Corporation',
    META: 'Meta Platforms Inc.',
    TSLA: 'Tesla Inc.',
    'BRK.B': 'Berkshire Hathaway Inc.',
    UNH: 'UnitedHealth Group Inc.',
    JNJ: 'Johnson & Johnson',
    V: 'Visa Inc.',
    WMT: 'Walmart Inc.',
    JPM: 'JPMorgan Chase & Co.',
    MA: 'Mastercard Inc.',
    PG: 'Procter & Gamble Co.',
    HD: 'The Home Depot Inc.',
    DIS: 'The Walt Disney Company',
    BAC: 'Bank of America Corp.',
    XOM: 'Exxon Mobil Corporation',
    CVX: 'Chevron Corporation',
  }

  return symbols.map((symbol) => {
    const basePrice = Math.random() * 500 + 50
    const change = (Math.random() - 0.5) * 10
    const changePercent = (change / basePrice) * 100

    return {
      symbol,
      name: names[symbol] || `${symbol} Corporation`,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.random() * 1000000000000,
      previousClose: parseFloat((basePrice - change).toFixed(2)),
      dayLow: parseFloat((basePrice - Math.abs(change) * 1.5).toFixed(2)),
      dayHigh: parseFloat((basePrice + Math.abs(change) * 1.5).toFixed(2)),
      yearLow: parseFloat((basePrice * 0.7).toFixed(2)),
      yearHigh: parseFloat((basePrice * 1.3).toFixed(2)),
    }
  })
}




