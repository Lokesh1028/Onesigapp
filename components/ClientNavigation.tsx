'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/insider-trades', label: 'Insider Trades' },
  { href: '/senate-trades', label: 'Senate Trades' },
  { href: '/reddit-sentiment', label: 'Reddit Sentiment' },
  { href: '/investments', label: 'My Investments' },
]

export default function ClientNavigation() {
  const pathname = usePathname()
  
  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

