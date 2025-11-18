'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import StockSelector from '@/components/StockSelector'
import SelectedStocksDisplay from '@/components/SelectedStocksDisplay'
import InvestorInsights from '@/components/InvestorInsights'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function InvestmentsPage() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])

  const handleStockSelect = (stocks: string[]) => {
    setSelectedStocks(stocks)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            My Investments
          </h1>
          <p className="text-lg text-gray-600">
            Select up to 10 stocks to monitor and get insights from top investors
          </p>
        </div>
      </div>

      {/* Stock Selector Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StockSelector
          selectedStocks={selectedStocks}
          onStocksChange={handleStockSelect}
          maxStocks={10}
        />
      </div>

      {/* Main Content: Selected Stocks + Investor Insights */}
      {selectedStocks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side: Selected Stocks Display */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <SelectedStocksDisplay stocks={selectedStocks} />
            </div>

            {/* Right Side: Investor Insights */}
            <div>
              <InvestorInsights selectedStocks={selectedStocks} />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedStocks.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No stocks selected
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Select up to 10 stocks above to start monitoring and get investment insights
            </p>
          </div>
        </div>
      )}
    </main>
  )
}




