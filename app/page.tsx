'use client'

import Navigation from '@/components/Navigation'
import EmailSignupForm from '@/components/EmailSignupForm'
import Link from 'next/link'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-cyan-500/30 flex flex-col overflow-x-hidden">
      <Navigation />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative">
        {/* Background Chart Graphics */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          {/* Deep Blue Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050b14] via-[#0a1628] to-[#050b14] opacity-90" />

          {/* Grid Lines */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

          {/* Chart SVG */}
          <svg className="absolute bottom-0 left-0 w-full h-[60vh] opacity-80" preserveAspectRatio="none" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Green Line (Growth/Spiky) */}
            <path d="M0 500 L 100 480 L 200 520 L 300 400 L 400 450 L 500 300 L 600 350 L 700 200 L 800 250 L 900 150 L 1000 180 L 1100 80 L 1200 120 L 1300 40 L 1440 0 V 600 H 0 V 500 Z" fill="url(#greenGradient)" fillOpacity="0.1" />
            <path d="M0 500 L 100 480 L 200 520 L 300 400 L 400 450 L 500 300 L 600 350 L 700 200 L 800 250 L 900 150 L 1000 180 L 1100 80 L 1200 120 L 1300 40 L 1440 0" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />

            {/* Red Line (Volatile/Dip) */}
            <path d="M0 550 L 150 520 L 250 580 L 400 450 L 500 500 L 650 400 L 800 480 L 950 350 L 1100 420 L 1250 300 L 1440 350" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />

            {/* Faint Candlesticks (Abstract representation - Updated colors) */}
            <rect x="100" y="450" width="4" height="40" fill="#22c55e" opacity="0.2" />
            <rect x="102" y="430" width="1" height="80" fill="#22c55e" opacity="0.2" />

            <rect x="250" y="480" width="4" height="30" fill="#ef4444" opacity="0.2" />
            <rect x="252" y="470" width="1" height="50" fill="#ef4444" opacity="0.2" />

            <rect x="800" y="250" width="4" height="60" fill="#22c55e" opacity="0.2" />
            <rect x="802" y="220" width="1" height="120" fill="#22c55e" opacity="0.2" />

            <rect x="1200" y="100" width="4" height="50" fill="#ef4444" opacity="0.2" />
            <rect x="1202" y="80" width="1" height="90" fill="#ef4444" opacity="0.2" />

            <defs>
              <linearGradient id="greenGradient" x1="720" y1="0" x2="720" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
          {/* Feature Buttons (As requested in image) */}
          <div className="flex flex-wrap justify-center gap-4 w-full">
            <FeatureButton
              href="/insider-trades"
              label="View Insider Trades"
            />
            <FeatureButton
              href="/senate-trades"
              label="View Senate Trades"
            />
            <FeatureButton
              href="/reddit-sentiment"
              label="Reddit Wall Street"
            />
          </div>

          {/* Newsletter Subscription - Card Style */}
          <div className="max-w-xl mx-auto w-full bg-[#111827]/80 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Subscribe to Newsletter</h2>
            <p className="text-sm text-gray-400 mb-6">
              Weekly market intelligence- key insider and senators trades, big moves, and next week's must-watch events - sent to your inbox and WhatsApp. Join below
            </p>
            <EmailSignupForm variant="dark" />
          </div>

          {/* Coming Soon Features */}
          <div className="flex flex-wrap justify-center gap-6 w-full max-w-3xl mx-auto">
            <ComingSoonBox
              title="Retirement Calculator"
              description="Track your assets in on place, understand your gaps, and build retirement confidence with daily bite-sized learning"
            />
            <ComingSoonBox
              title="Add Your Portfolio"
              description="Track hot trades, simulate in your play portfolio, and see if the greats like Buffett would approve your strategy."
            />
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 relative z-10">
        <p>© {new Date().getFullYear()} OneSig. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureButton({ href, label }: { href: string, label: string }) {
  return (
    <Link
      href={href}
      className="px-8 py-3 rounded-lg bg-[#0f172a]/60 border border-cyan-500/30 text-cyan-100 font-medium 
                 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] 
                 transition-all duration-300 backdrop-blur-sm"
    >
      {label}
    </Link>
  )
}

function ComingSoonBox({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex-1 min-w-[280px] max-w-[400px] bg-gradient-to-br from-[#0f172a]/40 to-[#1e293b]/30 
                    p-6 rounded-xl border border-gray-700/40 backdrop-blur-sm relative overflow-hidden group
                    hover:border-purple-500/40 transition-all duration-300">
      {/* Coming Soon Badge */}
      <div className="absolute top-3 right-3 px-3 py-1 bg-purple-500/20 border border-purple-400/30 
                      rounded-full text-xs font-semibold text-purple-300 backdrop-blur-sm">
        Coming Soon
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative space-y-3 mt-8">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
