'use client'

import { useState, useEffect, useRef } from 'react'
import CompanyLogo from '@/components/CompanyLogo'

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

interface TimeframeData {
  count: number
  summary: {
    total_trades: number
    buys: number
    sales: number
    total_buy_value: number
    total_sale_value: number
  }
  insights: Insight[]
}

interface AllTimeframesResponse {
  success: boolean
  timeframes: {
    '1': TimeframeData
    '7': TimeframeData
    '30': TimeframeData
  }
  lastUpdated: string
  note?: string
}

type Timeframe = 1 | 7 | 30

export default function InsightsDisplay() {
  const [timeframe, setTimeframe] = useState<Timeframe>(7)
  const [allData, setAllData] = useState<AllTimeframesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshCountdown, setRefreshCountdown] = useState<number | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateRefreshCountdown = () => {
    if (!lastUpdated) {
      setRefreshCountdown(null)
      return
    }
    const nextRefresh = new Date(lastUpdated.getTime() + 3600000) // +1 hour
    const now = new Date()
    const diffMs = nextRefresh.getTime() - now.getTime()
    const diffMins = Math.ceil(diffMs / 60000)
    setRefreshCountdown(diffMins > 0 ? diffMins : 0)
  }

  // Fetch all timeframes at once on mount and set up auto-refresh
  useEffect(() => {
    fetchAllInsights()

    // Set up automatic refresh every hour (3600000 ms)
    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-refreshing insights data...')
      fetchAllInsights(true) // Silent refresh
    }, 3600000) // 1 hour

    // Set up countdown timer that updates every minute
    countdownIntervalRef.current = setInterval(() => {
      updateRefreshCountdown()
    }, 60000) // Update every minute

    // Cleanup intervals on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Update countdown when lastUpdated changes
  useEffect(() => {
    updateRefreshCountdown()
  }, [lastUpdated])

  const fetchAllInsights = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch(`/api/insights?all=true`, {
        cache: 'no-store' // Always check for fresh data
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result: AllTimeframesResponse = await response.json()
      setAllData(result)
      setLastUpdated(new Date(result.lastUpdated))
      
      if (!silent) {
        console.log('All timeframes loaded successfully')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')
      console.error('Error fetching insights:', err)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  // Get current timeframe data
  const getCurrentData = (): TimeframeData | null => {
    if (!allData) return null
    return allData.timeframes[timeframe.toString() as '1' | '7' | '30']
  }

  const data = getCurrentData()

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

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours === 1) return '1h ago'
    if (diffHours > 1) return `${diffHours}h ago`
    return 'Just now'
  }


  return (
    <div className="w-full">
      {/* Timeframe Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Stock Listings
          </h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatTimeAgo(lastUpdated)}
              {refreshCountdown !== null && refreshCountdown > 0 && (
                <span className="ml-2">• Auto-refresh in {refreshCountdown}m</span>
              )}
              {refreshCountdown === 0 && (
                <span className="ml-2 text-primary-600">• Refreshing...</span>
              )}
            </p>
          )}
        </div>

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
            <div className="text-sm text-blue-600 font-medium mb-1">Total</div>
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
            <div className="text-sm text-purple-600 font-medium mb-1">Buy Value</div>
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
            onClick={() => fetchAllInsights()}
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
                      <div className="flex items-center space-x-2">
                        <CompanyLogo symbol={insight.ticker} companyName={insight.company_name} size="sm" />
                        <span>{insight.ticker}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <CompanyLogo symbol={insight.ticker} companyName={insight.company_name} size="sm" />
                        <span>{insight.company_name}</span>
                      </div>
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
                  <div className="flex items-start space-x-3 flex-1">
                    <CompanyLogo symbol={insight.ticker} companyName={insight.company_name} size="lg" />
                    <div>
                      <div className="text-lg font-bold text-primary-600">{insight.ticker}</div>
                      <div className="text-sm text-gray-600">{insight.company_name}</div>
                    </div>
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

        </>
      )}
    </div>
  )
}
