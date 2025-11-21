'use client'

import Navigation from '@/components/Navigation'
import SenateTradesDisplay from '@/components/SenateTradesDisplay'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'

export default function SenateTradesPage() {
  return (
    <div className="min-h-screen bg-void-black text-text-white font-sans selection:bg-signal-violet/30 flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="glass-panel rounded-xl p-6 border border-gunmetal">
            <h1 className="text-3xl font-bold text-white mb-2">
              Senate Trades
            </h1>
            <p className="text-muted-steel">
              Track trading activity from U.S. Senators and members of Congress as reported in their financial disclosures
            </p>
          </div>

          {/* Content */}
          <div className="glass-panel rounded-xl p-6 border border-gunmetal min-h-[600px]">
            <SenateTradesDisplay />
          </div>
        </div>
      </main>
    </div>
  )
}

