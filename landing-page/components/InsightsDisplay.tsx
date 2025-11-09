'use client'

import { useState, useEffect } from 'react'

interface Insight {
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

interface ApiResponse {
  success: boolean
  timeframe: number
  count: number
  summary: {
    total_trades: number
    buys: number
    sales: number
    total_buy_value: number
    total_sale_value: number
  }
  insights: Insight[]
  note?: string
}

type Timeframe = 1 | 7 | 30

export default function InsightsDisplay() {
  const [timeframe, setTimeframe] = useState<Timeframe>(7)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [timeframe])

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/insights?timeframe=${timeframe}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')
      console.error('Error fetching insights:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="w-full">
      {/* Timeframe Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          Recent Insider Trades
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe(1)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeframe === 1
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Day
          </button>
          <button
            onClick={() => setTimeframe(7)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeframe === 7
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeframe(30)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeframe === 30
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {data && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Total Trades</div>
            <div className="text-2xl font-bold text-blue-900">{data.summary.total_trades}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Buys</div>
            <div className="text-2xl font-bold text-green-900">{data.summary.buys}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">Sales</div>
            <div className="text-2xl font-bold text-red-900">{data.summary.sales}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">Buy Volume</div>
            <div className="text-lg font-bold text-purple-900">
              {formatCurrency(data.summary.total_buy_value)}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600 font-medium">Loading insights...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">Error loading insights</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchInsights}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Insights Table/Cards */}
      {data && !loading && !error && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Insider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SEC Filing
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.insights.map((insight, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(insight.filing_date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600">
                      {insight.ticker}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {insight.company_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{insight.officer_name}</div>
                      <div className="text-xs text-gray-500">{insight.officer_title}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        insight.trade_type === 'Buy'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {insight.trade_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                      {formatNumber(insight.shares)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      ${insight.price_per_share.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(insight.total_value)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={insight.sec_filing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {data.insights.map((insight, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-lg font-bold text-primary-600">{insight.ticker}</div>
                    <div className="text-sm text-gray-600">{insight.company_name}</div>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    insight.trade_type === 'Buy'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {insight.trade_type}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insider:</span>
                    <span className="text-gray-900 font-medium">{insight.officer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="text-gray-900">{insight.officer_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{formatDate(insight.filing_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shares:</span>
                    <span className="text-gray-900 font-medium">{formatNumber(insight.shares)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="text-gray-900">${insight.price_per_share.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600 font-medium">Total Value:</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(insight.total_value)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <a
                    href={insight.sec_filing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center"
                  >
                    View SEC Filing
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Phase 1 Note */}
          {data.note && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> {data.note}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
