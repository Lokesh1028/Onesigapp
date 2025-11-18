'use client'

import { useState } from 'react'

interface EmailSignupFormProps {
  variant?: 'light' | 'dark'
}

export default function EmailSignupForm({ variant = 'light' }: EmailSignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!name.trim()) {
      setStatus('error')
      setMessage('Please enter your name')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      // Send subscription data to API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus('success')
      setMessage(data.message || 'Successfully subscribed! Check your inbox for confirmation.')
      setName('')
      setEmail('')
    } catch (error) {
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Oops! Something went wrong. Please try again.'
      setMessage(errorMessage)
      console.error('Signup error:', error)
    }
  }

  const isDark = variant === 'dark'

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={`flex-1 px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-white text-gray-900 border-primary-300 placeholder:text-gray-500'
                : 'bg-white text-gray-900 border-gray-300 placeholder:text-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            required
            disabled={status === 'loading' || status === 'success'}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className={`flex-1 px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-white text-gray-900 border-primary-300 placeholder:text-gray-500'
                : 'bg-white text-gray-900 border-gray-300 placeholder:text-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            required
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
              isDark
                ? 'bg-white text-primary-600 hover:bg-gray-100'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark ? 'focus:ring-white' : 'focus:ring-primary-500'
            }`}
          >
            {status === 'loading' ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subscribing...
              </span>
            ) : status === 'success' ? (
              '✓ Subscribed!'
            ) : (
              'Subscribe'
            )}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`text-sm p-3 rounded-lg ${
              status === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
