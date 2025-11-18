'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import EmailSignupForm from '@/components/EmailSignupForm'
import RetirementCalculator from '@/components/RetirementCalculator'

// Prevent static generation - this page uses client-side hooks
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

      {/* Features Section */}
      <section className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Insider Trades</h3>
            <p className="text-gray-600">
              Track significant trades by company executives, directors, and officers. Filter by timeframe and see detailed transaction information.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Senate Trades</h3>
            <p className="text-gray-600">
              Monitor trading activity from U.S. Senators and members of Congress as reported in their financial disclosures.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Investments</h3>
            <p className="text-gray-600">
              Select stocks to monitor and get personalized investment insights from top investor personas.
            </p>
          </div>
        </div>
      </section>

      {/* Retirement Calculator Section */}
      <section className="section-container py-12">
        <RetirementCalculator />
      </section>

      {/* Newsletter Subscription Section */}
      <section id="newsletter" className="bg-white border-t border-b">
        <div className="section-container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Subscribe to Newsletter
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get weekly insider trading updates delivered to your inbox.
            </p>
            <EmailSignupForm />
          </div>
        </div>
      </section>
    </main>
  )
}
