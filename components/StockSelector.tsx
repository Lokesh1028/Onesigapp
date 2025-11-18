'use client'

import { useState, useEffect } from 'react'

interface StockSelectorProps {
  selectedStocks: string[]
  onStocksChange: (stocks: string[]) => void
  maxStocks: number
}

// Popular stocks list
const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
  'UNH', 'JNJ', 'V', 'WMT', 'JPM', 'MA', 'PG', 'HD', 'DIS', 'BAC',
  'XOM', 'CVX', 'ABBV', 'PFE', 'AVGO', 'COST', 'NFLX', 'ADBE', 'CRM',
  'NKE', 'TMO', 'ABT', 'LLY', 'DHR', 'ACN', 'VZ', 'CMCSA', 'NEE', 'LIN'
]

export default function StockSelector({
  selectedStocks,
  onStocksChange,
  maxStocks,
}: StockSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredStocks, setFilteredStocks] = useState(POPULAR_STOCKS)

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStocks(POPULAR_STOCKS)
    } else {
      const query = searchQuery.toUpperCase().trim()
      setFilteredStocks(
        POPULAR_STOCKS.filter(
          (stock) =>
            stock.includes(query) &&
            !selectedStocks.includes(stock)
        )
      )
    }
  }, [searchQuery, selectedStocks])

  const handleStockToggle = (ticker: string) => {
    if (selectedStocks.includes(ticker)) {
      // Remove stock
      onStocksChange(selectedStocks.filter((s) => s !== ticker))
    } else {
      // Add stock (if under limit)
      if (selectedStocks.length < maxStocks) {
        onStocksChange([...selectedStocks, ticker])
        setSearchQuery('') // Clear search after selection
      }
    }
  }

  const handleRemoveStock = (ticker: string) => {
    onStocksChange(selectedStocks.filter((s) => s !== ticker))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Select Your Investments
        </h2>
        <p className="text-sm text-gray-600">
          Choose up to {maxStocks} stocks to monitor ({selectedStocks.length}/{maxStocks} selected)
        </p>
      </div>

      {/* Selected Stocks */}
      {selectedStocks.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedStocks.map((ticker) => (
              <span
                key={ticker}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
              >
                {ticker}
                <button
                  onClick={() => handleRemoveStock(ticker)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                  aria-label={`Remove ${ticker}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for stocks (e.g., AAPL, TSLA)..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={selectedStocks.length >= maxStocks}
        />
      </div>

      {/* Stock List */}
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        <div className="p-2">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              {searchQuery
                ? `No stocks found matching "${searchQuery}"`
                : 'All popular stocks are selected'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {filteredStocks.map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => handleStockToggle(ticker)}
                  disabled={selectedStocks.length >= maxStocks}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedStocks.includes(ticker)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${
                    selectedStocks.length >= maxStocks &&
                    !selectedStocks.includes(ticker)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {ticker}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Limit Warning */}
      {selectedStocks.length >= maxStocks && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Maximum of {maxStocks} stocks reached. Remove a stock to add another.
          </p>
        </div>
      )}
    </div>
  )
}




