'use client'

import { useState } from 'react'
import EmailSignupForm from '@/components/EmailSignupForm'
import FeatureCard from '@/components/FeatureCard'
import FAQItem from '@/components/FAQItem'

export default function Home() {
  const [subscriberCount] = useState(5) // Will be dynamic in Phase 2+

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="section-container !py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">OneSig</span>
              <span className="text-sm text-gray-500 hidden sm:inline">Insider Intelligence</span>
            </div>
            <a
              href="#signup"
              className="btn-primary text-sm px-4 py-2"
            >
              Subscribe Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="section-container text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Get Insider Trade Alerts{' '}
              <span className="text-primary-600">Before the Market Reacts</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Free weekly digest of the biggest insider buys and sells in tech & biotech.
              <span className="block mt-2 font-semibold text-gray-900">
                No fluff, just data.
              </span>
            </p>

            {/* Email Signup Form */}
            <div id="signup" className="max-w-md mx-auto">
              <EmailSignupForm />
            </div>

            {/* Social Proof */}
            <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Join <strong>{subscriberCount}+</strong> investors already subscribed</span>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">100%</div>
                <div className="text-sm text-gray-600">Free Forever</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">Weekly</div>
                <div className="text-sm text-gray-600">Thursday AM</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">SEC</div>
                <div className="text-sm text-gray-600">Official Data</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">Top 10</div>
                <div className="text-sm text-gray-600">Curated Picks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white">
        <div className="section-container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              emoji="📊"
              title="We Track"
              description="Every insider trade filed with the SEC (Form 4)"
            />
            <FeatureCard
              emoji="🔍"
              title="We Curate"
              description="Filter noise, surface the 10 most significant trades"
            />
            <FeatureCard
              emoji="💰"
              title="You Profit"
              description="Get insights delivered to your inbox every Thursday"
            />
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-gray-50">
        <div className="section-container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Why OneSig?
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="card mb-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-success mr-2">✓</span>
                Curated, Not Overwhelming
              </h3>
              <p className="text-gray-600">
                We send you the top 10 trades, not 1,000. Every trade includes context and analysis.
              </p>
            </div>

            <div className="card mb-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-success mr-2">✓</span>
                Free, No Catch
              </h3>
              <p className="text-gray-600">
                Competitors charge $30-100/month. We&apos;re completely free. No trial, no paywall, no BS.
              </p>
            </div>

            <div className="card mb-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-success mr-2">✓</span>
                Data + Analysis
              </h3>
              <p className="text-gray-600">
                Not just numbers. We explain why each trade matters and how to interpret the signals.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-success mr-2">✓</span>
                Transparent Methodology
              </h3>
              <p className="text-gray-600">
                All data from public SEC filings. No black boxes, no hidden algorithms. You know exactly what you&apos;re getting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Newsletter Preview */}
      <section className="bg-white">
        <div className="section-container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            What You&apos;ll Get Every Week
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 font-mono text-sm">
              <div className="space-y-4">
                <div className="text-gray-900 font-bold">
                  📈 This Week&apos;s Top 10 Insider Trades - Nov 14, 2025
                </div>

                <div className="border-t pt-4">
                  <div className="text-danger font-bold mb-2">🔥 TOP 3 INSIDER BUYS</div>

                  <div className="ml-4 space-y-3 text-gray-700">
                    <div>
                      <div className="font-semibold">1. NVDA - Nvidia Corporation</div>
                      <div className="ml-4 text-sm space-y-1">
                        <div>• Who: Jensen Huang, CEO</div>
                        <div>• What: Bought 50,000 shares at $134.22</div>
                        <div>• Value: $6,711,000</div>
                        <div>• Why it matters: First open-market buy by Huang in 2 years...</div>
                      </div>
                    </div>

                    <div className="text-gray-500">
                      2. LLY - Eli Lilly [...]
                    </div>
                    <div className="text-gray-500">
                      3. CRWD - CrowdStrike [...]
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-success-dark font-bold mb-2">📉 TOP 3 INSIDER SELLS</div>
                  <div className="ml-4 text-gray-500">[Similar format...]</div>
                </div>

                <div className="border-t pt-4">
                  <div className="font-bold mb-2">💡 THIS WEEK&apos;S INSIGHT</div>
                  <div className="ml-4 text-gray-700 italic">
                    &quot;Cluster buying in semiconductor stocks suggests insiders believe the AI cycle has more room to run...&quot;
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <a href="#signup" className="btn-primary inline-flex items-center">
                Get This in Your Inbox
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50">
        <div className="section-container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="How is this free?"
              answer="We'll eventually monetize through premium features and partners, but the core weekly digest will always be free. No strings attached."
            />

            <FAQItem
              question="Is this financial advice?"
              answer="No. We aggregate public data and provide educational analysis. Always consult a licensed advisor before investing. We're not registered financial advisors."
            />

            <FAQItem
              question="How do you pick which trades to highlight?"
              answer="We focus on open-market buys (not option exercises), trades >$100k, and cluster buying patterns. Full methodology documentation coming soon."
            />

            <FAQItem
              question="Can I trust this data?"
              answer="All data comes directly from SEC EDGAR filings (Form 4). Every trade includes a link to the original SEC filing for verification."
            />

            <FAQItem
              question="What sectors do you cover?"
              answer="Phase 1 focuses on tech & biotech insider trades. We'll expand to other sectors based on subscriber interest."
            />

            <FAQItem
              question="Can I unsubscribe anytime?"
              answer="Of course! Every email has a one-click unsubscribe link. No hassle, no questions asked."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join {subscriberCount}+ investors getting insider intelligence every week
          </p>

          <div className="max-w-md mx-auto">
            <EmailSignupForm variant="dark" />
          </div>

          <p className="mt-6 text-sm text-primary-200">
            Free forever. Unsubscribe anytime. We hate spam too.
          </p>
        </div>
      </section>
    </main>
  )
}
