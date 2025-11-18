'use client'

import Navigation from '@/components/Navigation'
import InsightsDisplay from '@/components/InsightsDisplay'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function InsiderTradesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Insider Trades
          </h1>
          <p className="text-lg text-gray-600">
            Track significant insider trading activity from company executives and directors
          </p>
        </div>
      </div>

      {/* Stock Listings Section */}
      <section className="section-container py-12">
        <InsightsDisplay />
      </section>
    </main>
  )
}

