import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono, Merriweather } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

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
      <body className={`${jakarta.variable} ${jetbrains.variable} ${merriweather.variable} font-sans bg-void-black text-text-white`}>
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
