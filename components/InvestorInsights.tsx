'use client'

import { useState } from 'react'

interface InvestorInsightsProps {
  selectedStocks: string[]
}

interface Investor {
  id: string
  name: string
  title: string
  description: string
  avatar: string
  color: string
}

const INVESTORS: Investor[] = [
  {
    id: 'warren-buffett',
    name: 'Warren Buffett',
    title: 'Value Investor',
    description: 'Long-term value investing, focus on intrinsic value and competitive moats',
    avatar: '💰',
    color: 'bg-blue-500',
  },
  {
    id: 'cathie-wood',
    name: 'Cathie Wood',
    title: 'Growth & Innovation Investor',
    description: 'Disruptive innovation, high-growth technology companies',
    avatar: '🚀',
    color: 'bg-purple-500',
  },
  {
    id: 'bill-ackman',
    name: 'Bill Ackman',
    title: 'Activist Investor',
    description: 'Activist investing, value creation through strategic changes',
    avatar: '📊',
    color: 'bg-green-500',
  },
  {
    id: 'ray-dalio',
    name: 'Ray Dalio',
    title: 'Macro & Diversification Expert',
    description: 'All-weather portfolio, diversification and risk parity',
    avatar: '🌊',
    color: 'bg-orange-500',
  },
]

interface InvestmentAdvice {
  investor: string
  recommendation: string
  reasoning: string
  riskLevel: 'Low' | 'Medium' | 'High'
  timeHorizon: string
  keyPoints: string[]
  isAIGenerated?: boolean
}

export default function InvestorInsights({ selectedStocks }: InvestorInsightsProps) {
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null)
  const [advice, setAdvice] = useState<InvestmentAdvice | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGetAdvice = async () => {
    if (!selectedInvestor || selectedStocks.length === 0) return

    setLoading(true)
    setAdvice(null)

    try {
      const response = await fetch('/api/investment-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stocks: selectedStocks,
          investor: selectedInvestor,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get advice')
      }

      const data = await response.json()
      setAdvice(data.advice)
      
      // Log if using fallback
      if (data.note) {
        console.log('Note:', data.note)
      }
    } catch (error) {
      console.error('Error fetching advice:', error)
      // Fallback to mock advice for demo
      setAdvice(generateMockAdvice(selectedInvestor, selectedStocks))
    } finally {
      setLoading(false)
    }
  }

  const generateMockAdvice = (
    investorId: string,
    stocks: string[]
  ): InvestmentAdvice => {
    const investor = INVESTORS.find((inv) => inv.id === investorId)!
    
    const adviceMap: Record<string, Partial<InvestmentAdvice>> = {
      'warren-buffett': {
        recommendation: 'Hold and Monitor',
        reasoning: `Based on ${investor.name}'s value investing principles, these stocks show strong fundamentals. Focus on companies with durable competitive advantages and reasonable valuations.`,
        riskLevel: 'Low' as const,
        timeHorizon: '10+ years',
        keyPoints: [
          'Look for companies with strong moats',
          'Focus on long-term value creation',
          'Avoid overvalued growth stocks',
          'Diversify across industries',
        ],
      },
      'cathie-wood': {
        recommendation: 'Consider Adding More',
        reasoning: `These stocks align with ${investor.name}'s focus on disruptive innovation. Technology and growth companies with high potential for transformation.`,
        riskLevel: 'High' as const,
        timeHorizon: '5-10 years',
        keyPoints: [
          'Focus on innovation and disruption',
          'High growth potential',
          'Accept higher volatility',
          'Technology and biotech focus',
        ],
      },
      'bill-ackman': {
        recommendation: 'Strategic Review',
        reasoning: `${investor.name} would analyze these positions for value creation opportunities through strategic changes, management improvements, or restructuring.`,
        riskLevel: 'Medium' as const,
        timeHorizon: '3-5 years',
        keyPoints: [
          'Look for undervalued companies',
          'Potential for strategic improvements',
          'Management quality matters',
          'Activist opportunities',
        ],
      },
      'ray-dalio': {
        recommendation: 'Diversify Portfolio',
        reasoning: `${investor.name}'s all-weather approach suggests balancing these positions with other asset classes and ensuring proper diversification.`,
        riskLevel: 'Low' as const,
        timeHorizon: 'Long-term',
        keyPoints: [
          'Maintain portfolio balance',
          'Diversify across asset classes',
          'Risk parity approach',
          'Consider macro factors',
        ],
      },
    }

    return {
      investor: investor.name,
      ...adviceMap[investorId],
    } as InvestmentAdvice
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Get Insight from Top Investor Heads
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Select an investor persona to get personalized investment advice for your selected stocks
      </p>

      {/* Investor Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {INVESTORS.map((investor) => (
          <button
            key={investor.id}
            onClick={() => {
              setSelectedInvestor(investor.id)
              setAdvice(null) // Clear previous advice
            }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedInvestor === investor.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-12 h-12 rounded-full ${investor.color} flex items-center justify-center text-2xl`}
              >
                {investor.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{investor.name}</h3>
                <p className="text-sm text-gray-600">{investor.title}</p>
                <p className="text-xs text-gray-500 mt-1">{investor.description}</p>
              </div>
              {selectedInvestor === investor.id && (
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Get Advice Button */}
      {selectedInvestor && (
        <div className="mb-6">
          <button
            onClick={handleGetAdvice}
            disabled={loading || selectedStocks.length === 0}
            className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Getting Advice...
              </>
            ) : (
              'Get Investment Advice'
            )}
          </button>
        </div>
      )}

      {/* Advice Display */}
      {advice && (
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {advice.investor}'s Analysis
              </h3>
              {advice.isAIGenerated !== false && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI Powered
                </span>
              )}
            </div>
            <div
              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                advice.riskLevel === 'Low'
                  ? 'bg-green-100 text-green-800'
                  : advice.riskLevel === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {advice.riskLevel} Risk
            </div>
            <span className="ml-3 text-sm text-gray-600">
              Time Horizon: {advice.timeHorizon}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Recommendation:</h4>
            <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
              {advice.recommendation}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Reasoning:</h4>
            <p className="text-gray-700">{advice.reasoning}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Points:</h4>
            <ul className="space-y-2">
              {advice.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-2 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!selectedInvestor && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Select an investor above to get personalized investment advice
        </div>
      )}
    </div>
  )
}

