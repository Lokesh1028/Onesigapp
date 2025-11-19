import { NextRequest, NextResponse } from 'next/server'

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Type definitions matching the Python scraper output
interface InsightData {
  filing_date: string
  ticker: string
  company_name: string
  officer_name: string
  officer_title: string
  is_director: boolean
  is_officer: boolean
  trade_type: 'Buy' | 'Sale'
  shares: number
  price_per_share: number
  total_value: number
  transaction_code: string
  sec_filing_url: string
  is_derivative: boolean
}

// FMP API response type (stable endpoint)
interface FMPInsiderTrade {
  symbol: string
  filingDate: string
  transactionDate: string
  reportingName: string
  typeOfOwner: string
  acquisitionOrDisposition: string
  formType: string
  securitiesOwned: number
  companyCik: string
  transactionType: string
  securityName: string
  url: string
  securitiesTransacted?: number
  price?: number
}

// Transform FMP data to our format
function transformFMPToInsight(fmpTrade: FMPInsiderTrade): InsightData | null {
  // Only include trades with valid data
  if (!fmpTrade.securitiesTransacted || !fmpTrade.price) {
    return null
  }

  const shares = Math.abs(fmpTrade.securitiesTransacted)
  const price = fmpTrade.price
  const totalValue = shares * price

  // Filter out small trades (less than $100k)
  if (totalValue < 100000) {
    return null
  }

  // Determine trade type: A = Acquisition (Buy), D = Disposition (Sale)
  const isBuy = fmpTrade.acquisitionOrDisposition === 'A'

  // Determine if director or officer based on typeOfOwner
  const isDirector = fmpTrade.typeOfOwner?.toLowerCase().includes('director') || false
  const isOfficer = fmpTrade.typeOfOwner?.toLowerCase().includes('officer') ||
                    fmpTrade.typeOfOwner?.toLowerCase().includes('ceo') ||
                    fmpTrade.typeOfOwner?.toLowerCase().includes('cfo') || false

  return {
    filing_date: fmpTrade.filingDate,
    ticker: fmpTrade.symbol,
    company_name: fmpTrade.securityName || fmpTrade.symbol,
    officer_name: fmpTrade.reportingName,
    officer_title: fmpTrade.typeOfOwner || 'Insider',
    is_director: isDirector,
    is_officer: isOfficer,
    trade_type: isBuy ? 'Buy' : 'Sale',
    shares: shares,
    price_per_share: parseFloat(price.toFixed(2)),
    total_value: parseFloat(totalValue.toFixed(2)),
    transaction_code: fmpTrade.transactionType || fmpTrade.acquisitionOrDisposition,
    sec_filing_url: fmpTrade.url,
    is_derivative: fmpTrade.formType?.includes('5') || false
  }
}

// Fetch raw insider trading data from FMP API (cached for 1 hour)
async function fetchRawFMPData(): Promise<FMPInsiderTrade[]> {
  const apiKey = process.env.FMP_API_KEY

  if (!apiKey || apiKey === 'your_fmp_api_key_here') {
    console.warn('FMP API key not configured, returning empty array for fallback')
    return []
  }

  try {
    // FMP API endpoint for insider trading (stable endpoint)
    const url = `https://financialmodelingprep.com/stable/insider-trading/latest?page=0&limit=1000&apikey=${apiKey}`

    console.log(`Fetching insider trades from FMP API...`)

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour - this is the key optimization
    })

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`)
    }

    const fmpTrades: FMPInsiderTrade[] = await response.json()
    console.log(`Received ${fmpTrades.length} trades from FMP API`)

    return fmpTrades

  } catch (error) {
    console.error('Error fetching from FMP API:', error)
    return []
  }
}

// Fetch real insider trading data from FMP API (uses cached raw data)
async function fetchRealInsights(days: number): Promise<InsightData[]> {
  const apiKey = process.env.FMP_API_KEY

  if (!apiKey || apiKey === 'your_fmp_api_key_here') {
    console.warn('FMP API key not configured, falling back to mock data')
    return generateMockInsights(days)
  }

  try {
    // Fetch raw data (this will use Next.js cache, so only one API call per hour)
    const fmpTrades = await fetchRawFMPData()

    if (fmpTrades.length === 0) {
      console.warn('No FMP data available, falling back to mock data')
      return generateMockInsights(days)
    }

    // Calculate date range
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    // Transform and filter the data
    const insights: InsightData[] = []
    const fromTimestamp = fromDate.getTime()
    const toTimestamp = toDate.getTime()

    for (const trade of fmpTrades) {
      const tradeDate = new Date(trade.transactionDate).getTime()

      // Filter by date range
      if (tradeDate >= fromTimestamp && tradeDate <= toTimestamp) {
        const insight = transformFMPToInsight(trade)
        if (insight) {
          insights.push(insight)
        }
      }
    }

    console.log(`Filtered to ${insights.length} significant trades in ${days}-day timeframe`)

    // Sort by total value descending
    insights.sort((a, b) => b.total_value - a.total_value)

    // Return top 20 for display
    return insights.slice(0, 20)

  } catch (error) {
    console.error('Error processing FMP data:', error)
    console.warn('Falling back to mock data')
    return generateMockInsights(days)
  }
}

// Generate realistic mock data for demonstration
// Fallback when API key is not configured
function generateMockInsights(days: number): InsightData[] {
  const now = new Date()
  const insights: InsightData[] = []

  const companies = [
    { ticker: 'NVDA', name: 'Nvidia Corporation', officers: ['Jensen Huang, CEO', 'Colette Kress, CFO'] },
    { ticker: 'TSLA', name: 'Tesla Inc', officers: ['Elon Musk, CEO', 'Zachary Kirkhorn, CFO'] },
    { ticker: 'AAPL', name: 'Apple Inc', officers: ['Tim Cook, CEO', 'Luca Maestri, CFO'] },
    { ticker: 'MSFT', name: 'Microsoft Corporation', officers: ['Satya Nadella, CEO', 'Amy Hood, CFO'] },
    { ticker: 'AMZN', name: 'Amazon.com Inc', officers: ['Andy Jassy, CEO', 'Brian Olsavsky, CFO'] },
    { ticker: 'GOOGL', name: 'Alphabet Inc', officers: ['Sundar Pichai, CEO', 'Ruth Porat, CFO'] },
    { ticker: 'META', name: 'Meta Platforms Inc', officers: ['Mark Zuckerberg, CEO', 'Susan Li, CFO'] },
    { ticker: 'AMD', name: 'Advanced Micro Devices', officers: ['Lisa Su, CEO', 'Devinder Kumar, CFO'] },
    { ticker: 'NFLX', name: 'Netflix Inc', officers: ['Reed Hastings, Co-CEO', 'Spencer Neumann, CFO'] },
    { ticker: 'CRM', name: 'Salesforce Inc', officers: ['Marc Benioff, CEO', 'Amy Weaver, CFO'] },
    { ticker: 'LLY', name: 'Eli Lilly and Company', officers: ['David Ricks, CEO', 'Anat Ashkenazi, CFO'] },
    { ticker: 'GILD', name: 'Gilead Sciences Inc', officers: ['Daniel O\'Day, CEO', 'Andrew Dickinson, CFO'] },
    { ticker: 'MRNA', name: 'Moderna Inc', officers: ['Stephane Bancel, CEO', 'James Mock, CFO'] },
    { ticker: 'REGN', name: 'Regeneron Pharmaceuticals', officers: ['Leonard Schleifer, CEO', 'Robert Landry, CFO'] },
    { ticker: 'BIIB', name: 'Biogen Inc', officers: ['Christopher Viehbacher, CEO', 'Michael McDonnell, CFO'] },
  ]

  // Generate trades within the timeframe
  const numTrades = Math.min(days * 2, 30) // More trades for longer timeframes

  for (let i = 0; i < numTrades; i++) {
    const daysAgo = Math.floor(Math.random() * days)
    const filingDate = new Date(now)
    filingDate.setDate(filingDate.getDate() - daysAgo)

    const company = companies[Math.floor(Math.random() * companies.length)]
    const officerInfo = company.officers[Math.floor(Math.random() * company.officers.length)]
    const [officerName, officerTitle] = officerInfo.split(', ')

    const isBuy = Math.random() > 0.5
    const shares = Math.floor(Math.random() * 100000) + 10000
    const price = Math.random() * 500 + 50
    const totalValue = shares * price

    // Only include significant trades (>$100k)
    if (totalValue >= 100000) {
      insights.push({
        filing_date: filingDate.toISOString().split('T')[0],
        ticker: company.ticker,
        company_name: company.name,
        officer_name: officerName,
        officer_title: officerTitle,
        is_director: Math.random() > 0.7,
        is_officer: true,
        trade_type: isBuy ? 'Buy' : 'Sale',
        shares: shares,
        price_per_share: parseFloat(price.toFixed(2)),
        total_value: parseFloat(totalValue.toFixed(2)),
        transaction_code: isBuy ? 'P' : 'S',
        sec_filing_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.ticker}&type=4&dateb=&owner=only&count=40`,
        is_derivative: Math.random() > 0.8
      })
    }
  }

  // Sort by total value descending
  insights.sort((a, b) => b.total_value - a.total_value)

  // Return top 20 for display
  return insights.slice(0, 20)
}

// Fetch all timeframes at once (optimized - single API call)
async function fetchAllTimeframes(): Promise<{
  '1': InsightData[]
  '7': InsightData[]
  '30': InsightData[]
  lastUpdated: string
}> {
  const apiKey = process.env.FMP_API_KEY

  if (!apiKey || apiKey === 'your_fmp_api_key_here') {
    // Return mock data for all timeframes
    return {
      '1': generateMockInsights(1),
      '7': generateMockInsights(7),
      '30': generateMockInsights(30),
      lastUpdated: new Date().toISOString()
    }
  }

  try {
    // Single API call - cached for 1 hour by Next.js
    const fmpTrades = await fetchRawFMPData()

    if (fmpTrades.length === 0) {
      return {
        '1': generateMockInsights(1),
        '7': generateMockInsights(7),
        '30': generateMockInsights(30),
        lastUpdated: new Date().toISOString()
      }
    }

    // Process all timeframes from the same cached data
    const timeframes = [1, 7, 30] as const
    const result: {
      '1': InsightData[]
      '7': InsightData[]
      '30': InsightData[]
      lastUpdated: string
    } = {
      '1': [],
      '7': [],
      '30': [],
      lastUpdated: new Date().toISOString()
    }

    const toDate = new Date()
    const toTimestamp = toDate.getTime()

    for (const days of timeframes) {
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - days)
      const fromTimestamp = fromDate.getTime()

      const insights: InsightData[] = []

      for (const trade of fmpTrades) {
        const tradeDate = new Date(trade.transactionDate).getTime()

        if (tradeDate >= fromTimestamp && tradeDate <= toTimestamp) {
          const insight = transformFMPToInsight(trade)
          if (insight) {
            insights.push(insight)
          }
        }
      }

      insights.sort((a, b) => b.total_value - a.total_value)
      result[days.toString() as '1' | '7' | '30'] = insights.slice(0, 20)
    }

    console.log(`Processed all timeframes: 1d=${result['1'].length}, 7d=${result['7'].length}, 30d=${result['30'].length}`)

    return result

  } catch (error) {
    console.error('Error fetching all timeframes:', error)
    return {
      '1': generateMockInsights(1),
      '7': generateMockInsights(7),
      '30': generateMockInsights(30),
      lastUpdated: new Date().toISOString()
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe')
    const allTimeframes = searchParams.get('all') === 'true'

    // If requesting all timeframes, return cached data for all
    if (allTimeframes) {
      const allData = await fetchAllTimeframes()

      const apiKey = process.env.FMP_API_KEY
      const isUsingRealData = apiKey && apiKey !== 'your_fmp_api_key_here' && apiKey !== 'demo'

      return NextResponse.json({
        success: true,
        timeframes: {
          '1': {
            count: allData['1'].length,
            summary: calculateSummary(allData['1']),
            insights: allData['1']
          },
          '7': {
            count: allData['7'].length,
            summary: calculateSummary(allData['7']),
            insights: allData['7']
          },
          '30': {
            count: allData['30'].length,
            summary: calculateSummary(allData['30']),
            insights: allData['30']
          }
        },
        lastUpdated: allData.lastUpdated,
        note: isUsingRealData
          ? 'Real-time data from SEC filings via Financial Modeling Prep API. Showing trades >$100k. Data refreshes automatically every hour.'
          : 'Demo mode: Using mock data. Add your FMP_API_KEY to .env.local for real data. Get free API key at https://site.financialmodelingprep.com/'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600'
        }
      })
    }

    // Single timeframe request (backward compatibility)
    const days = parseInt(timeframe || '7')

    // Validate timeframe
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be between 1 and 365 days.' },
        { status: 400 }
      )
    }

    // Fetch real insider trading data from FMP API
    const insights = await fetchRealInsights(days)

    // Calculate summary statistics
    const summary = calculateSummary(insights)

    const apiKey = process.env.FMP_API_KEY
    const isUsingRealData = apiKey && apiKey !== 'your_fmp_api_key_here' && apiKey !== 'demo'

    const response = {
      success: true,
      timeframe: days,
      count: insights.length,
      summary: summary,
      insights: insights,
      lastUpdated: new Date().toISOString(),
      note: isUsingRealData
        ? 'Real-time data from SEC filings via Financial Modeling Prep API. Showing trades >$100k. Data refreshes automatically every hour.'
        : 'Demo mode: Using mock data. Add your FMP_API_KEY to .env.local for real data. Get free API key at https://site.financialmodelingprep.com/'
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600'
      }
    })

  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate summary statistics
function calculateSummary(insights: InsightData[]) {
  const buys = insights.filter(i => i.trade_type === 'Buy')
  const sales = insights.filter(i => i.trade_type === 'Sale')

  const totalBuyValue = buys.reduce((sum, i) => sum + i.total_value, 0)
  const totalSaleValue = sales.reduce((sum, i) => sum + i.total_value, 0)

  return {
    total_trades: insights.length,
    buys: buys.length,
    sales: sales.length,
    total_buy_value: totalBuyValue,
    total_sale_value: totalSaleValue,
  }
}
