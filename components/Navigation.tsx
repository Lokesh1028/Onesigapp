'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/insider-trades', label: 'Insider Trades' },
  { href: '/senate-trades', label: 'Senate Trades' },
  { href: '/reddit-sentiment', label: 'Reddit Sentiment' },
  { href: '/investments', label: 'My Investments' },
]

// Client-only component that uses usePathname - loaded only on client
const ClientNavigation = dynamic(
  () => import('./ClientNavigation'),
  { ssr: false }
)

export default function Navigation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
            OneSig
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-4">
            {mounted ? (
              <ClientNavigation />
            ) : (
              // Placeholder during SSR - no hooks called
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

