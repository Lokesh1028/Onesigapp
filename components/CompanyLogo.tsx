'use client'

import { useState } from 'react'
import { getCompanyLogoUrl } from '@/utils/companyLogos'

interface CompanyLogoProps {
  symbol: string
  companyName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

export default function CompanyLogo({
  symbol,
  companyName,
  size = 'md',
  className = '',
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const logoUrl = getCompanyLogoUrl(symbol)
  const initials = symbol.substring(0, 2).toUpperCase()
  const sizeClass = sizeClasses[size]

  if (imageError) {
    // Fallback: Show initials in a colored circle
    return (
      <div
        className={`${sizeClass} rounded flex-shrink-0 bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs ${className}`}
        title={companyName || symbol}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden relative ${className}`}>
      {!imageLoaded && !imageError && (
        <div className={`${sizeClass} absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse`}>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      )}
      <img
        src={logoUrl}
        alt={companyName || `${symbol} logo`}
        className={`${sizeClass} object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity relative z-10`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        title={companyName || symbol}
      />
    </div>
  )
}

