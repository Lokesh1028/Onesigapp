'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/insider-trades', label: 'Insider Trades' },
  { href: '/senate-trades', label: 'Senate Trades' },
  // { href: '/reddit-sentiment', label: 'Reddit Sentiment' },
  // { href: '/investments', label: 'My Investments' },
]

export default function Navigation() {
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
      
      // Listen for route changes
      const handleRouteChange = () => {
        setCurrentPath(window.location.pathname)
      }
      
      window.addEventListener('popstate', handleRouteChange)
      
      // Also listen for Next.js route changes
      const observer = new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
          setCurrentPath(window.location.pathname)
        }
      })
      
      observer.observe(document.body, { childList: true, subtree: true })
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        observer.disconnect()
      }
    }
  }, [currentPath])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
            OneSig
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-4">
            {navItems.map((item) => {
              const isActive = currentPath === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCurrentPath(item.href)}
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
          </div>
        </div>
      </div>
    </nav>
  )
}

