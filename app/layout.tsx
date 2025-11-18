import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OneSig - Insider Trading Intelligence Newsletter',
  description: 'Get curated insider trading insights delivered to your inbox. Free weekly digest of the most significant insider buys and sells in tech & biotech.',
  keywords: ['insider trading', 'stock market', 'SEC filings', 'investment newsletter', 'stock alerts'],
  authors: [{ name: 'OneSig' }],
  openGraph: {
    title: 'OneSig - Insider Trading Intelligence Newsletter',
    description: 'Get curated insider trading insights delivered to your inbox. Free weekly digest of the most significant insider buys and sells.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneSig - Insider Trading Intelligence Newsletter',
    description: 'Get curated insider trading insights delivered to your inbox. Free weekly digest.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        {/* Legal Disclaimer Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8 mt-20">
          <div className="section-container">
            <div className="text-center space-y-4">
              <p className="text-sm">
                <strong className="text-white">DISCLAIMER:</strong> OneSig aggregates publicly available data for informational purposes only.
                This is NOT investment advice. We are not registered financial advisors.
                Always consult a professional before making investment decisions.
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <a href="/legal/disclaimer" className="hover:text-white transition-colors">Disclaimer</a>
                <a href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/legal/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
              <p className="text-xs">
                © {new Date().getFullYear()} OneSig LLC. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
