'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import EmailSignupForm from '@/components/EmailSignupForm'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="section-container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Track Insider & Congressional Trading
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get real-time insights into significant trades by company insiders and U.S. Senators
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/insider-trades"
                className="btn-primary text-center"
              >
                View Insider Trades
              </Link>
              <Link
                href="/senate-trades"
                className="btn-secondary text-center"
              >
                View Senate Trades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section id="newsletter" className="bg-white border-t border-b">
        <div className="section-container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Subscribe to Newsletter
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Weekly market intelligence- key insider and senators trades, big moves, and next week’s must-watch events - sent to your inbox and WhatsApp. Join below
            </p>
            <EmailSignupForm />
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="section-container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-sm border border-primary-200 p-8 text-center">
              <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 opacity-60">
                <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">My Investments</h3>
              <p className="text-gray-700 mb-4">
                Select stocks to monitor and get personalized investment insights from top investor personas.
              </p>
              <span className="inline-block px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 opacity-60">
                <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Retirement Calculator</h3>
              <p className="text-gray-700 mb-4">
                Calculate your path to financial freedom and determine when you can retire comfortably.
              </p>
              <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
