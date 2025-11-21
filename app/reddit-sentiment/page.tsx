'use client'

import Navigation from '@/components/Navigation'
import RedditSentimentAnalyzer from '@/components/RedditSentimentAnalyzer'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'

export default function RedditSentimentPage() {
  return (
    <div className="min-h-screen bg-void-black text-text-white font-sans selection:bg-signal-violet/30 flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="glass-panel rounded-xl p-6 border border-gunmetal">
            <h1 className="text-3xl font-bold text-white mb-2">
              Reddit Wall Street
            </h1>
            <p className="text-muted-steel">
              Community sentiment from r/wallstreetbets. This reflects social media discussions and is not financial advice.
            </p>
          </div>

          {/* Content */}
          <div className="glass-panel rounded-xl p-6 border border-gunmetal min-h-[600px]">
            <RedditSentimentAnalyzer />
          </div>
        </div>
      </main>
    </div>
  )
}

