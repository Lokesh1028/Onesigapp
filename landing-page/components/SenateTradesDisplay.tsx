'use client'

import { useState, useEffect } from 'react'
import CompanyLogo from '@/components/CompanyLogo'

interface SenateTrade {
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
  trades: SenateTrade[]
  lastUpdated: string
  note?: string
}

export default function SenateTradesDisplay() {
  const [data, setData] = useState<SenateTradesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchTrades()
  }, [])

  const fetchTrades = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)

    try {
      const url = forceRefresh ? `/api/senate-trades?refresh=true` : `/api/senate-trades`
      const response = await fetch(url, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result: SenateTradesResponse = await response.json()
      setData(result)
      setLastUpdated(new Date(result.lastUpdated))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch senate trades')
      console.error('Error fetching senate trades:', err)
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Latest Senate Trading Activity
        </h2>
        {lastUpdated && (
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-500">
              Last updated: {formatTimeAgo(lastUpdated)}
            </p>
            <button
              onClick={() => fetchTrades(true)}
              disabled={loading}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium disabled:opacity-50"
              title="Force refresh data (bypasses 24-hour cache)"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        )}
        {data?.note && (
          <p className="text-xs text-gray-500 mt-1 italic">{data.note}</p>
        )}
        <p className="text-sm text-gray-600 mt-2">
          Showing the latest 10 Congress trades from AInvest API. Data refreshes once per day.
        </p>
      </div>

      {/* Summary Stats */}
      {data && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Total</div>
            <div className="text-2xl font-bold text-blue-900">
              {data.summary.total_trades}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Buys</div>
            <div className="text-2xl font-bold text-green-900">
              {data.summary.buys}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">Sales</div>
            <div className="text-2xl font-bold text-red-900">
              {data.summary.sales}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">
              Buy Value
            </div>
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
            <svg
              className="animate-spin h-8 w-8 text-primary-600"
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
            <span className="text-gray-600 font-medium">Loading senate trades...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">Error loading senate trades</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => fetchTrades()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {data && !loading && !error && data.trades.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Senate Trades Found
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {data?.note?.includes('not configured')
              ? 'Please configure FMP_API_KEY in .env.local to view senate trading data.'
              : 'No senate trades found. The FMP API may not have recent trading data available.'}
          </p>
          {data?.note && (
            <p className="text-xs text-gray-400 italic">{data.note}</p>
          )}
        </div>
      )}

      {/* Trades Table/Cards */}
      {data && !loading && !error && data.trades.length > 0 && (
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
                    Senator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Disclosure
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.trades.map((trade, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(trade.transaction_date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div>{trade.senator_name}</div>
                      {trade.comment && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {trade.comment.split('|')[0].trim()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600">
                      <div className="flex items-center space-x-2">
                        <CompanyLogo
                          symbol={trade.ticker}
                          companyName={trade.company_name}
                          size="sm"
                        />
                        <span>{trade.ticker}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {trade.company_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          trade.trade_type === 'Buy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {trade.trade_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(trade.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {trade.ptr_link && trade.ptr_link.startsWith('http') ? (
                        <a
                          href={trade.ptr_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 transition-colors"
                          title="View financial disclosure document"
                        >
                          <svg
                            className="w-5 h-5 inline-block"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400" title="Disclosure link not available">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {data.trades.map((trade, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <CompanyLogo
                      symbol={trade.ticker}
                      companyName={trade.company_name}
                      size="lg"
                    />
                    <div>
                      <div className="text-lg font-bold text-primary-600">
                        {trade.ticker}
                      </div>
                      <div className="text-sm text-gray-600">
                        {trade.company_name}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      trade.trade_type === 'Buy'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {trade.trade_type}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Congress Member:</span>
                    <span className="text-gray-900 font-medium">
                      {trade.senator_name}
                    </span>
                  </div>
                  {trade.comment && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Party & State:</span>
                      <span className="text-gray-900">
                        {trade.comment.split('|')[0].trim()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">
                      {formatDate(trade.transaction_date)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600 font-medium">Amount:</span>
                    <span className="text-gray-900 font-bold">
                      {formatCurrency(trade.amount)}
                    </span>
                  </div>
                </div>

                {trade.ptr_link && trade.ptr_link.startsWith('http') && (
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={trade.ptr_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center"
                      title="View financial disclosure document"
                    >
                      View Disclosure
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
                {(!trade.ptr_link || !trade.ptr_link.startsWith('http')) && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Disclosure link not available
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

