'use client'

import Navigation from '@/components/Navigation'
import RetirementCalculator from '@/components/RetirementCalculator'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'

export default function RetirementCalculatorPage() {
  return (
    <div className="min-h-screen bg-void-black text-text-white font-sans selection:bg-signal-violet/30 flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="glass-panel rounded-xl p-6 border border-gunmetal">
            <h1 className="text-3xl font-bold text-white mb-2">
              Retirement Calculator
            </h1>
            <p className="text-muted-steel">
              Plan your financial future with our comprehensive retirement calculator. Track your assets, understand your gaps, and build retirement confidence with daily bite-sized learning.
            </p>
          </div>

          {/* Content */}
          <div className="glass-panel rounded-xl p-6 border border-gunmetal min-h-[600px]">
            <RetirementCalculator />
          </div>
        </div>
      </main>
    </div>
  )
}



