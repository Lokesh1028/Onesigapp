'use client'

import Navigation from '@/components/Navigation'
import RedditSentimentAnalyzer from '@/components/RedditSentimentAnalyzer'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'

export default function RedditSentimentPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Reddit Wall Street
          </h1>
          <p className="text-lg text-gray-600">
            Community sentiment from r/wallstreetbets. This reflects social media discussions and is not financial advice.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="section-container py-12">
        <RedditSentimentAnalyzer />
      </section>
    </main>
  )
}

