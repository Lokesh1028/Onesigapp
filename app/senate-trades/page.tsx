'use client'

import Navigation from '@/components/Navigation'
import SenateTradesDisplay from '@/components/SenateTradesDisplay'

export default function SenateTradesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Senate Trades
          </h1>
          <p className="text-lg text-gray-600">
            Track trading activity from U.S. Senators and members of Congress as reported in their financial disclosures
          </p>
        </div>
      </div>

      {/* Senate Trades Display */}
      <section className="section-container py-12">
        <SenateTradesDisplay />
      </section>
    </main>
  )
}

