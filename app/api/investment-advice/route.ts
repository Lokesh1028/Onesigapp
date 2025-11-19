import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface InvestmentAdvice {
  investor: string
  recommendation: string
  reasoning: string
  riskLevel: 'Low' | 'Medium' | 'High'
  timeHorizon: string
  keyPoints: string[]
  isAIGenerated?: boolean
}

interface StockData {
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

// Investor personas and their investment philosophies
const INVESTOR_PHILOSOPHIES: Record<string, any> = {
  'warren-buffett': {
    name: 'Warren Buffett',
    focus: 'value investing, long-term holdings, competitive moats',
    style: 'conservative, fundamental analysis',
  },
  'cathie-wood': {
    name: 'Cathie Wood',
    focus: 'disruptive innovation, high-growth technology',
    style: 'aggressive growth, innovation-focused',
  },
  'bill-ackman': {
    name: 'Bill Ackman',
    focus: 'activist investing, value creation',
    style: 'strategic, value-oriented with activism',
  },
  'ray-dalio': {
    name: 'Ray Dalio',
    focus: 'all-weather portfolio, diversification, risk parity',
    style: 'balanced, macro-focused, diversified',
  },
}

export async function POST(request: NextRequest) {
  let stocks: string[] = []
  let investor: string = ''

  try {
    const body = await request.json()
    stocks = body.stocks
    investor = body.investor

    // Validation
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one stock' },
        { status: 400 }
      )
    }

    if (!investor || !INVESTOR_PHILOSOPHIES[investor]) {
      return NextResponse.json(
        { error: 'Invalid investor selected' },
        { status: 400 }
      )
    }

    // Fetch real-time stock data
    let stockData: StockData[] = []
    try {
      const symbolsParam = stocks.join(',')
      const stockResponse = await fetch(
        `${request.nextUrl.origin}/api/stock-quotes?symbols=${symbolsParam}`
      )
      
      if (stockResponse.ok) {
        const stockResult = await stockResponse.json()
        if (stockResult.success && stockResult.stocks) {
          stockData = stockResult.stocks
        }
      }
    } catch (error) {
      console.warn('Failed to fetch stock data, proceeding with basic info:', error)
    }

    // Generate advice using Groq API with real-time data
    const advice = await generateAdviceWithGroq(stocks, investor, stockData)

    return NextResponse.json({
      success: true,
      advice,
    })
  } catch (error) {
    console.error('Error generating investment advice:', error)
    
    // Fallback to basic advice if Groq fails
    if (stocks.length > 0 && investor) {
      try {
        const fallbackAdvice = generateAdvice(stocks, investor)
        return NextResponse.json({
          success: true,
          advice: fallbackAdvice,
          note: 'Using fallback advice due to API error',
        })
      } catch (fallbackError) {
        // Ignore fallback errors
      }
    }
    
    return NextResponse.json(
      {
        error: 'Failed to generate investment advice',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function generateAdviceWithGroq(
  stocks: string[],
  investorId: string,
  stockData: StockData[]
): Promise<InvestmentAdvice> {
  const apiKey = process.env.GROQ_API_KEY
  const philosophy = INVESTOR_PHILOSOPHIES[investorId]

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.warn('Groq API key not configured, using fallback advice')
    return generateAdvice(stocks, investorId)
  }

  try {
    const groq = new Groq({
      apiKey: apiKey,
    })

    // Prepare stock data summary for the prompt
    const stockSummary = stockData.length > 0
      ? stockData
          .map(
            (stock) =>
              `${stock.symbol} (${stock.name}): $${stock.price.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%), Market Cap: $${(stock.marketCap / 1e9).toFixed(2)}B, 52W Range: $${stock.yearLow.toFixed(2)} - $${stock.yearHigh.toFixed(2)}`
          )
          .join('\n')
      : stocks.join(', ')

    // Get investor-specific prompt
    const investorPrompt = getInvestorPrompt(investorId, stockSummary, philosophy.name)

    const prompt = `${investorPrompt}

Format your response as JSON with this exact structure:
{
  "recommendation": "your recommendation here (Buy/Hold/Sell/Reduce)",
  "reasoning": "detailed reasoning paragraph (150-200 words)",
  "riskLevel": "Low|Medium|High",
  "timeHorizon": "e.g., 3-5 years, 10+ years, etc.",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}

Use the real-time stock data provided to inform your analysis.`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are ${philosophy.name}, providing investment advice based on your proven investment philosophy and methodology.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'openai/gpt-oss-120b', // Using Groq's fast model
      temperature: 0.8, // Slightly higher for more creative/investor-specific responses
      max_tokens: 2000, // Increased for detailed analysis
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON from response (might have markdown code blocks)
    let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                    responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                    [null, responseText]
    
    let parsedResponse
    try {
      parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0] || responseText)
    } catch (parseError) {
      // If JSON parsing fails, try to extract structured data from text
      console.warn('Failed to parse JSON, extracting from text:', parseError)
      parsedResponse = extractAdviceFromText(responseText, philosophy.name)
    }

    // Validate and structure the response
    const advice: InvestmentAdvice = {
      investor: philosophy.name,
      recommendation: parsedResponse.recommendation || 'Review and Analyze',
      reasoning: parsedResponse.reasoning || responseText.substring(0, 500),
      riskLevel: (parsedResponse.riskLevel || 'Medium') as 'Low' | 'Medium' | 'High',
      timeHorizon: parsedResponse.timeHorizon || '5 years',
      keyPoints: Array.isArray(parsedResponse.keyPoints)
        ? parsedResponse.keyPoints
        : extractKeyPoints(responseText),
      isAIGenerated: true, // Mark as AI-generated
    }

    return advice
  } catch (error) {
    console.error('Error calling Groq API:', error)
    // Fallback to basic advice
    return generateAdvice(stocks, investorId)
  }
}

function extractAdviceFromText(text: string, investorName: string): any {
  // Extract structured data from text if JSON parsing fails
  const recommendationMatch = text.match(/recommendation[:\-]\s*(.+?)(?:\n|$)/i)
  const reasoningMatch = text.match(/reasoning[:\-]\s*(.+?)(?:\n\n|\nkey|$)/is)
  const riskMatch = text.match(/risk[:\-]\s*(low|medium|high)/i)
  const horizonMatch = text.match(/time\s*horizon[:\-]\s*(.+?)(?:\n|$)/i)

  return {
    recommendation: recommendationMatch?.[1]?.trim() || 'Review and Analyze',
    reasoning: reasoningMatch?.[1]?.trim() || text.substring(0, 500),
    riskLevel: riskMatch?.[1]?.toLowerCase() || 'Medium',
    timeHorizon: horizonMatch?.[1]?.trim() || '5 years',
  }
}

function getInvestorPrompt(
  investorId: string,
  stockSummary: string,
  investorName: string
): string {
  switch (investorId) {
    case 'cathie-wood':
      return `You are Cathie Wood, founder of ARK Invest. Analyze portfolios through disruptive innovation lens:

- Exponential growth technologies (AI, genomics, blockchain, robotics)
- Innovation convergence and platform effects
- Long-term transformative potential over short-term volatility
- Conviction in breakthrough companies
- Future-focused, high-growth opportunities
- Willingness to embrace volatility for innovation exposure

Style: Visionary, conviction-driven, future-focused.

Stock Portfolio:
${stockSummary}

Provide your analysis emphasizing innovation and disruptive technology potential. Output: 150-200 words maximum.`

    case 'bill-ackman':
      return `You are Bill Ackman, activist investor and founder of Pershing Square. Analyze portfolios through concentrated value and activism lens:

- High-conviction concentrated positions
- Quality businesses with pricing power
- Catalyst-driven opportunities
- Management accountability and governance
- Downside protection through business quality
- Active engagement to unlock value

Style: Confident, analytical, focused on catalysts.

Stock Portfolio:
${stockSummary}

Provide your analysis emphasizing quality, concentration, and catalysts for value creation. Output: 150-200 words maximum.`

    case 'warren-buffett':
      return `You are Warren Buffett. Analyze portfolios through value investing principles:

- Business quality & competitive advantages (moats)
- Intrinsic value vs market price
- Long-term wealth creation potential
- Circle of competence considerations
- Management quality
- Avoid speculation and short-term thinking

Style: Folksy wisdom, simple analogies, practical advice.

Stock Portfolio:
${stockSummary}

Provide your analysis in a conversational tone as if speaking directly to the investor. Output: 150-200 words maximum.`

    case 'ray-dalio':
      return `You are Ray Dalio. Analyze portfolios through macro/risk parity principles:

- Economic scenarios (growth/inflation combinations)
- Risk-balanced diversification across asset classes
- Portfolio resilience across different regimes
- Correlation analysis between holdings
- All-Weather Portfolio approach
- Systematic risk management

Style: Systematic, principle-based, data-driven.

Stock Portfolio:
${stockSummary}

Provide your analysis focusing on risk balance and economic scenario planning. Output: 150-200 words maximum.`

    default:
      return `You are ${investorName}, a renowned investor. Analyze the following stocks:

${stockSummary}

Provide investment advice based on your investment philosophy.`
  }
}

function extractKeyPoints(text: string): string[] {
  // Extract bullet points or numbered points
  const points = text.match(/[-•*]\s*(.+?)(?:\n|$)/g) || 
                 text.match(/\d+[\.\)]\s*(.+?)(?:\n|$)/g) ||
                 []
  
  return points
    .map((point) => point.replace(/^[-•*\d+\.\)]\s*/, '').trim())
    .filter((point) => point.length > 10)
    .slice(0, 6)
}

function generateAdvice(
  stocks: string[],
  investorId: string
): InvestmentAdvice {
  const philosophy = INVESTOR_PHILOSOPHIES[investorId]
  const stockList = stocks.join(', ')

  // Generate advice based on investor persona
  switch (investorId) {
    case 'warren-buffett':
      return {
        investor: philosophy.name,
        recommendation: 'Hold and Monitor - Focus on Long-Term Value',
        reasoning: `Based on ${philosophy.name}'s value investing principles, your selected stocks (${stockList}) should be evaluated for their intrinsic value, competitive advantages, and long-term growth potential. Look for companies with strong moats, consistent earnings, and reasonable valuations relative to their fundamentals.`,
        riskLevel: 'Low',
        timeHorizon: '10+ years',
        keyPoints: [
          'Evaluate each company\'s competitive moat and market position',
          'Focus on businesses you understand with predictable earnings',
          'Avoid overpaying - wait for reasonable valuations',
          'Diversify across different industries but stay within your circle of competence',
          'Hold for the long term - avoid frequent trading',
        ],
      }

    case 'cathie-wood':
      return {
        investor: philosophy.name,
        recommendation: 'Consider Adding More - High Growth Potential',
        reasoning: `These stocks (${stockList}) align with ${philosophy.name}'s focus on disruptive innovation. Technology and innovation-driven companies have the potential to transform industries and deliver outsized returns over the next 5-10 years. However, be prepared for higher volatility.`,
        riskLevel: 'High',
        timeHorizon: '5-10 years',
        keyPoints: [
          'Focus on companies disrupting traditional industries',
          'Look for innovation in AI, genomics, energy storage, and robotics',
          'Accept higher volatility for potential high returns',
          'Diversify across multiple innovation themes',
          'Monitor closely as these are higher-risk positions',
        ],
      }

    case 'bill-ackman':
      return {
        investor: philosophy.name,
        recommendation: 'Strategic Review - Look for Value Creation Opportunities',
        reasoning: `${philosophy.name} would analyze these positions (${stockList}) for value creation opportunities. This could involve strategic changes, management improvements, capital allocation optimization, or restructuring potential. Focus on undervalued companies with catalysts for change.`,
        riskLevel: 'Medium',
        timeHorizon: '3-5 years',
        keyPoints: [
          'Identify undervalued companies with strong fundamentals',
          'Look for opportunities for strategic improvements or activism',
          'Evaluate management quality and capital allocation',
          'Consider companies that could benefit from restructuring',
          'Focus on value creation catalysts',
        ],
      }

    case 'ray-dalio':
      return {
        investor: philosophy.name,
        recommendation: 'Diversify Portfolio - Balance Risk Across Asset Classes',
        reasoning: `Based on ${philosophy.name}'s all-weather portfolio approach, these stocks (${stockList}) should be part of a well-diversified portfolio. Balance equity positions with other asset classes, consider macro factors, and ensure proper risk parity across your investments.`,
        riskLevel: 'Low',
        timeHorizon: 'Long-term',
        keyPoints: [
          'Maintain balance across different asset classes',
          'Diversify across industries, geographies, and asset types',
          'Consider macro-economic factors in your allocation',
          'Use risk parity principles - balance risk, not just capital',
          'Rebalance periodically to maintain target allocations',
        ],
      }

    default:
      return {
        investor: 'Investment Advisor',
        recommendation: 'Review and Analyze',
        reasoning: `Review your selected stocks (${stockList}) based on your investment goals and risk tolerance.`,
        riskLevel: 'Medium',
        timeHorizon: '5 years',
        keyPoints: [
          'Diversify your portfolio',
          'Consider your risk tolerance',
          'Review regularly',
        ],
      }
  }
}

