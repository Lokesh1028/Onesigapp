'use client'

import { useState, useEffect, useCallback } from 'react'
import CompanyLogo from '@/components/CompanyLogo'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

interface SelectedStocksDisplayProps {
  stocks: string[]
}

interface ApiResponse {
  success: boolean
  stocks: StockData[]
  note?: string
}

export default function SelectedStocksDisplay({ stocks }: SelectedStocksDisplayProps) {
  const [stocksData, setStocksData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRealData, setIsRealData] = useState(false)

  const fetchStocksData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch real-time stock data from API
      const symbolsParam = stocks.join(',')
      const response = await fetch(`/api/stock-quotes?symbols=${symbolsParam}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (!data.success || !data.stocks) {
        throw new Error('Invalid response from API')
      }

      // Check if using real data (FMP API) or mock data
      const usingRealData = data.note?.includes('Real-time data') || false
      setIsRealData(usingRealData)

      // Transform API response to our format
      const transformedData: StockData[] = data.stocks.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap,
      }))

      setStocksData(transformedData)
    } catch (err) {
      setError('Failed to fetch stock data')
      console.error('Error fetching stocks:', err)
      setIsRealData(false) // Mark as demo data on error
      // Fallback to mock data on error
      const mockData: StockData[] = stocks.map((symbol) => ({
        symbol,
        name: getStockName(symbol),
        price: Math.random() * 500 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000),
        marketCap: Math.random() * 1000000000000,
      }))
      setStocksData(mockData)
    } finally {
      setLoading(false)
    }
  }, [stocks])

  useEffect(() => {
    if (stocks.length === 0) {
      setStocksData([])
      setLoading(false)
      return
    }

    fetchStocksData()

    // Set up auto-refresh every 60 seconds for real-time updates
    const interval = setInterval(() => {
      if (stocks.length > 0) {
        fetchStocksData()
      }
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [stocks, fetchStocksData])

  const getStockName = (symbol: string): string => {
    const names: Record<string, string> = {
      AAPL: 'Apple Inc.',
      MSFT: 'Microsoft Corporation',
      GOOGL: 'Alphabet Inc.',
      AMZN: 'Amazon.com Inc.',
      NVDA: 'NVIDIA Corporation',
      META: 'Meta Platforms Inc.',
      TSLA: 'Tesla Inc.',
      'BRK.B': 'Berkshire Hathaway Inc.',
    }
    return names[symbol] || `${symbol} Corporation`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Selected Stocks</h2>
        <div className="space-y-4">
          {stocks.map((symbol) => (
            <div key={symbol} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Selected Stocks</h2>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Selected Stocks</h2>
        {!loading && stocksData.length > 0 && (
          <div className="flex items-center space-x-2 text-xs">
            {isRealData ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Live (FMP API)</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-600">Demo Data</span>
              </>
            )}
          </div>
        )}
      </div>
      <div className="space-y-4">
        {stocksData.map((stock) => (
          <div
            key={stock.symbol}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start space-x-3 flex-1">
                <CompanyLogo symbol={stock.symbol} companyName={stock.name} size="lg" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
                  <p className="text-sm text-gray-600">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(stock.price)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stock.change >= 0 ? '+' : ''}
                  {formatCurrency(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Volume</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatNumber(stock.volume)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Market Cap</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatNumber(stock.marketCap)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

