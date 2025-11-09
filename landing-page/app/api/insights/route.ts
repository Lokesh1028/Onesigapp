import { NextRequest, NextResponse } from 'next/server'

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

// Generate realistic mock data for demonstration
// In Phase 2+, this will be replaced with real SEC API calls or database queries
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

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || '7' // Default to 7 days
    const days = parseInt(timeframe)

    // Validate timeframe
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be between 1 and 365 days.' },
        { status: 400 }
      )
    }

    // TODO Phase 2+: Replace with real SEC API calls or database queries
    // For now, generate mock data
    const insights = generateMockInsights(days)

    // Calculate summary statistics
    const buys = insights.filter(i => i.trade_type === 'Buy')
    const sales = insights.filter(i => i.trade_type === 'Sale')

    const totalBuyValue = buys.reduce((sum, i) => sum + i.total_value, 0)
    const totalSaleValue = sales.reduce((sum, i) => sum + i.total_value, 0)

    const response = {
      success: true,
      timeframe: days,
      count: insights.length,
      summary: {
        total_trades: insights.length,
        buys: buys.length,
        sales: sales.length,
        total_buy_value: totalBuyValue,
        total_sale_value: totalSaleValue,
      },
      insights: insights,
      note: 'Phase 1: Mock data for demonstration. Phase 2+ will use real SEC API data.'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
