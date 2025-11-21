'use client'

import { useState, useEffect } from 'react'
import { getCachedData, setCachedData } from '@/utils/apiCache'

interface SentimentResult {
  overall_sentiment: 'positive' | 'negative' | 'neutral'
  sentiment_score: number
  confidence: number
  summary: string
  key_themes: string[]
  positive_aspects: string[]
  negative_aspects: string[]
  sample_posts: Array<{
    title: string
    sentiment: 'positive' | 'negative' | 'neutral'
    score: number
  }>
  positive_stocks: Array<{
    ticker: string
    company_name: string
    sentiment_score: number
    prediction: 'increase' | 'decrease' | 'neutral'
    confidence: number
    reasons: string[]
  }>
  negative_stocks: Array<{
    ticker: string
    company_name: string
    sentiment_score: number
    prediction: 'increase' | 'decrease' | 'neutral'
    confidence: number
    reasons: string[]
  }>
}

interface AnalysisResponse {
  success: boolean
  subreddit: string
  posts_analyzed: number
  comments_analyzed: number
  sentiment: SentimentResult
  posts: Array<{
    title: string
    score: number
    num_comments: number
    url: string
    permalink: string
  }>
  error?: string
  details?: string
}

export default function RedditSentimentAnalyzer() {
  const [subreddit, setSubreddit] = useState('wallstreetbets')
  const [includeComments, setIncludeComments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState<{ ticker: string, sentiment_score: number, prediction: string, reasons: string[], type: 'positive' | 'negative' } | null>(null)
  const [stockPriceChange, setStockPriceChange] = useState<{ [key: string]: { change: number, changePercent: number } } | null>(null)

  // Debug modal state
  useEffect(() => {
    if (selectedStock) {
      console.log('[Modal] Selected ticker:', selectedStock.ticker)
      console.log('[Modal] Available tickers:', stockPriceChange ? Object.keys(stockPriceChange) : 'Loading...')
      console.log('[Modal] Full stockPriceChange:', stockPriceChange)
    }
  }, [selectedStock, stockPriceChange])

  const handleAnalyze = async () => {
    if (!subreddit.trim()) {
      setError('Please enter a subreddit name')
      return
    }

    const cacheKey = `reddit_sentiment_${subreddit.trim().toLowerCase()}_${includeComments}`

    // Try to load from cache first
    const { data: cachedData, shouldRefresh } = getCachedData<AnalysisResponse>(cacheKey)

    if (cachedData) {
      setResults(cachedData)
      console.log('Loaded sentiment analysis from cache')

      if (!shouldRefresh) {
        return
      }
      console.log('Cache is stale, refreshing in background...')
    } else {
      setLoading(true)
    }

    setError(null)
    // Don't clear results if we have cached data (for background refresh)
    if (!cachedData) {
      setResults(null)
    }

    try {
      const response = await fetch('/api/reddit-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddit: subreddit.trim(),
          includeComments,
        }),
      })

      const data: AnalysisResponse = await response.json()

      if (!response.ok) {
        // Build detailed error message
        let errorMsg = data.error || 'Failed to analyze sentiment'
        if (data.details) {
          errorMsg += `: ${data.details}`
        }
        if ((data as any).hint) {
          errorMsg += ` (${(data as any).hint})`
        }
        throw new Error(errorMsg)
      }

      setResults(data)
      setCachedData(cacheKey, data)
    } catch (err) {
      // If we have cached data, show error as a toast or log it, but keep showing data
      if (!cachedData) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } else {
        console.error('Background refresh failed:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  // Auto-analyze on component mount
  useEffect(() => {
    if (subreddit) {
      handleAnalyze()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPriceChanges = async (tickers: string[]) => {
    try {
      // Normalize tickers to uppercase and remove $ prefix
      const normalizedTickers = tickers.map(t => t.replace(/^\$/, '').toUpperCase())
      console.log('[Stock History] Original tickers:', tickers)
      console.log('[Stock History] Normalized tickers:', normalizedTickers)

      // Fetch 7-day historical prices from FMP API
      const response = await fetch('/api/stock-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: normalizedTickers })
      })
      const data = await response.json()
      console.log('[Stock History] Response:', data)

      if (data.success && data.stocks && Array.isArray(data.stocks)) {
        const changes: { [key: string]: { change: number, changePercent: number } } = {}
        data.stocks.forEach((stock: any) => {
          if (stock.symbol && stock.change !== undefined && stock.changePercent !== undefined) {
            // Store with uppercase key for consistency
            changes[stock.symbol.toUpperCase()] = {
              change: stock.change,
              changePercent: stock.changePercent
            }
          }
        })
        console.log('[Stock History] Setting price changes:', changes)
        console.log('[Stock History] Object keys:', Object.keys(changes))
        setStockPriceChange(changes)
      } else {
        console.warn('[Stock History] Invalid response format:', data)
      }
    } catch (err) {
      console.error('[Stock History] Failed to fetch price changes:', err)
    }
  }

  // Fetch price changes when results are available
  useEffect(() => {
    if (results?.sentiment) {
      const allTickers = [
        ...(results.sentiment.positive_stocks?.map(s => s.ticker) || []),
        ...(results.sentiment.negative_stocks?.map(s => s.ticker) || [])
      ]
      if (allTickers.length > 0) {
        fetchPriceChanges(allTickers)
      }
    }
  }, [results])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSentimentScoreColor = (score: number) => {
    if (score > 0.3) return 'text-green-600'
    if (score < -0.3) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="w-full space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-yellow-800">Reddit Wall Street - Community Sentiment Analysis</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This analysis is based on community discussions from Reddit's r/wallstreetbets. The information provided reflects social media sentiment and should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Stock Info Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStock(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">${selectedStock.ticker}</h3>
                  <p className="text-sm text-gray-600 mt-1">Algorithm Analysis Details</p>
                </div>
                <button onClick={() => setSelectedStock(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* How Algorithm Works */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  How the Algorithm Works
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                  <p><strong>1. Data Collection:</strong> AI analyzes 100 posts and their comments from r/wallstreetbets</p>
                  <p><strong>2. Sentiment Extraction:</strong> Advanced NLP identifies stock mentions and associated sentiment (positive/negative language, emojis, context)</p>
                  <p><strong>3. Scoring:</strong> Each mention is scored based on sentiment intensity, post engagement (upvotes, comments), and recency</p>
                  <p><strong>4. Prediction:</strong> Machine learning model predicts likely price movement based on historical correlation between Reddit sentiment and actual price changes</p>
                </div>
              </div>

              {/* Sentiment Score Explanation */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Understanding the Score</h4>
                <div className="bg-gradient-to-r from-red-100 via-gray-100 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-red-700">-1.0 (Very Bearish)</span>
                    <span className="text-xs font-medium text-gray-700">0.0 (Neutral)</span>
                    <span className="text-xs font-medium text-green-700">+1.0 (Very Bullish)</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                      className={`absolute h-2 rounded-full ${selectedStock.type === 'positive' ? 'bg-green-600' : 'bg-red-600'}`}
                      style={{
                        left: selectedStock.sentiment_score < 0 ? `${50 + (selectedStock.sentiment_score * 50)}%` : '50%',
                        right: selectedStock.sentiment_score > 0 ? `${50 - (selectedStock.sentiment_score * 50)}%` : '50%'
                      }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <span className={`text-2xl font-bold ${selectedStock.type === 'positive' ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedStock.sentiment_score > 0 ? '+' : ''}{selectedStock.sentiment_score.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.abs(selectedStock.sentiment_score) > 0.7 ? 'Very Strong' :
                        Math.abs(selectedStock.sentiment_score) > 0.4 ? 'Strong' : 'Moderate'} {selectedStock.type === 'positive' ? 'Bullish' : 'Bearish'} Sentiment
                    </p>
                  </div>
                </div>
              </div>

              {/* Prediction */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Price Prediction</h4>
                <div className={`rounded-lg p-4 ${selectedStock.prediction === 'increase' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl">{selectedStock.prediction === 'increase' ? '📈' : '📉'}</span>
                  </div>
                  <p className="text-center font-semibold text-lg">
                    Expected to <span className={selectedStock.prediction === 'increase' ? 'text-green-700' : 'text-red-700'}>{selectedStock.prediction === 'increase' ? 'INCREASE' : 'DECREASE'}</span>
                  </p>
                </div>
              </div>

              {/* 7-Day Price Movement */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Performance (7 Days)</h4>
                {!stockPriceChange ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Loading price data...</p>
                  </div>
                ) : stockPriceChange[selectedStock.ticker] ? (
                  <div className={`rounded-lg p-4 ${stockPriceChange[selectedStock.ticker].change >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">7-Day Change</p>
                        <p className={`text-2xl font-bold ${stockPriceChange[selectedStock.ticker].change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {stockPriceChange[selectedStock.ticker].change >= 0 ? '+' : ''}{stockPriceChange[selectedStock.ticker].changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-5xl">
                        {stockPriceChange[selectedStock.ticker].change >= 0 ? '📈' : '📉'}
                      </div>
                    </div>
                    <div className={`mt-3 pt-3 border-t ${stockPriceChange[selectedStock.ticker].change >= 0 ? 'border-green-200' : 'border-red-200'}`}>
                      <p className="text-xs text-gray-600">
                        <strong>Analysis:</strong> The stock has {stockPriceChange[selectedStock.ticker].change >= 0 ? 'moved up' : 'moved down'} by {Math.abs(stockPriceChange[selectedStock.ticker].changePercent).toFixed(2)}% in the past week.
                        {(selectedStock.prediction === 'increase' && stockPriceChange[selectedStock.ticker].change >= 0) ||
                          (selectedStock.prediction === 'decrease' && stockPriceChange[selectedStock.ticker].change < 0)
                          ? ' ✅ This aligns with the sentiment prediction.'
                          : ' ⚠️ This differs from the sentiment prediction - market factors may be at play.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    <p className="text-sm">Price data unavailable for {selectedStock.ticker}</p>
                    <p className="text-xs mt-2">This may be due to API limits or the stock symbol not being recognized.</p>
                  </div>
                )}
              </div>

              {/* Key Reasons */}
              {selectedStock.reasons && selectedStock.reasons.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Why This Sentiment?</h4>
                  <ul className="space-y-2">
                    {selectedStock.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700 bg-gray-50 rounded p-2">
                        <span className={`${selectedStock.type === 'positive' ? 'text-green-600' : 'text-red-600'} mr-2 mt-0.5`}>•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  ⚠️ <strong>Disclaimer:</strong> This analysis is based on Reddit sentiment and should not be considered financial advice. Always do your own research before making investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg
              className="animate-spin h-12 w-12 text-primary-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg font-semibold text-gray-900">Analyzing r/{subreddit}...</p>
            <p className="text-sm text-gray-600 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium text-lg">Error</p>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm text-red-700 font-medium mb-2">Troubleshooting:</p>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
              <li>Check that the subreddit is public and accessible</li>
              <li>Verify your GROQ_API_KEY is set in .env.local</li>
              <li>Check the browser console for more details</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      )}

      {/* Input Section - Hidden */}
      <div className="hidden">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Reddit Sentiment Analysis
        </h2>
        <p className="text-gray-600 mb-6">
          Analyze the sentiment of any Reddit subreddit to understand community
          opinions and discussions.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subreddit Name
            </label>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                r/
              </span>
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                placeholder="wallstreetbets"
                className="flex-1 input-field rounded-l-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleAnalyze()
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter subreddit name without "r/" prefix (e.g., "wallstreetbets")
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeComments"
              checked={includeComments}
              onChange={(e) => setIncludeComments(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="includeComments" className="ml-2 text-sm text-gray-700">
              Include comments in analysis (slower but more comprehensive)
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !subreddit.trim()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Sentiment'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs text-red-700 font-medium mb-1">Troubleshooting:</p>
              <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                <li>Check that the subreddit name is correct and the subreddit is public</li>
                <li>Verify your GROQ_API_KEY is set in .env.local</li>
                <li>Check the browser console and server logs for more details</li>
                <li>Try again in a few moments (rate limits may apply)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Overall Sentiment Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Overall Sentiment: r/{results.subreddit}
              </h3>
              <span
                className={`px-4 py-2 rounded-full font-semibold border ${getSentimentColor(
                  results.sentiment.overall_sentiment
                )}`}
              >
                {results.sentiment.overall_sentiment.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-1">
                  Sentiment Score
                </div>
                <div
                  className={`text-2xl font-bold ${getSentimentScoreColor(
                    results.sentiment.sentiment_score
                  )}`}
                >
                  {results.sentiment.sentiment_score.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Range: -1 (negative) to +1 (positive)
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium mb-1">
                  Confidence
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {(results.sentiment.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 font-medium mb-1">
                  Posts Analyzed
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.posts_analyzed}
                </div>
                {results.comments_analyzed > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    + {results.comments_analyzed} comments
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700">{results.sentiment.summary}</p>
            </div>
          </div>

          {/* Key Themes */}
          {results.sentiment.key_themes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Key Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.sentiment.key_themes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock Sentiment Analysis */}
          {(results.sentiment.positive_stocks?.length > 0 || results.sentiment.negative_stocks?.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Stock Sentiment & Price Predictions</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Positive Stocks */}
                {results.sentiment.positive_stocks?.length > 0 && (
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Bullish Stocks ({results.sentiment.positive_stocks.length})
                    </h4>
                    <div className="space-y-3">
                      {results.sentiment.positive_stocks.map((stock, idx) => (
                        <div key={idx} className="border border-green-300 rounded-lg p-3 bg-white relative">
                          <button
                            onClick={() => setSelectedStock({ ticker: stock.ticker.replace(/^\$/, '').toUpperCase(), sentiment_score: stock.sentiment_score, prediction: stock.prediction, reasons: stock.reasons, type: 'positive' })}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                            title="View detailed analysis"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div className="flex items-start justify-between mb-2 pr-8">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-green-900 text-lg">${stock.ticker}</span>
                                {stock.company_name && (
                                  <span className="text-sm text-gray-600">{stock.company_name}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full font-medium">
                                  {stock.prediction === 'increase' ? '📈 Expected to Increase' :
                                    stock.prediction === 'decrease' ? '📉 Expected to Decrease' : '➡️ Neutral'}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {(stock.confidence * 100).toFixed(0)}% confidence
                                </span>
                                <span className="text-xs font-semibold text-green-700">
                                  Score: {stock.sentiment_score > 0 ? '+' : ''}{stock.sentiment_score.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {stock.reasons && stock.reasons.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-green-200">
                              <p className="text-xs text-gray-600 font-medium mb-1">Why:</p>
                              <ul className="space-y-1">
                                {stock.reasons.map((reason, ridx) => (
                                  <li key={ridx} className="text-xs text-gray-700 flex items-start">
                                    <span className="text-green-600 mr-1 mt-0.5">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Negative Stocks */}
                {results.sentiment.negative_stocks?.length > 0 && (
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                      </svg>
                      Bearish Stocks ({results.sentiment.negative_stocks.length})
                    </h4>
                    <div className="space-y-3">
                      {results.sentiment.negative_stocks.map((stock, idx) => (
                        <div key={idx} className="border border-red-300 rounded-lg p-3 bg-white relative">
                          <button
                            onClick={() => setSelectedStock({ ticker: stock.ticker.replace(/^\$/, '').toUpperCase(), sentiment_score: stock.sentiment_score, prediction: stock.prediction, reasons: stock.reasons, type: 'negative' })}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                            title="View detailed analysis"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div className="flex items-start justify-between mb-2 pr-8">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-red-900 text-lg">${stock.ticker}</span>
                                {stock.company_name && (
                                  <span className="text-sm text-gray-600">{stock.company_name}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded-full font-medium">
                                  {stock.prediction === 'decrease' ? '📉 Expected to Decrease' :
                                    stock.prediction === 'increase' ? '📈 Expected to Increase' : '➡️ Neutral'}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {(stock.confidence * 100).toFixed(0)}% confidence
                                </span>
                                <span className="text-xs font-semibold text-red-700">
                                  Score: {stock.sentiment_score.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {stock.reasons && stock.reasons.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-red-200">
                              <p className="text-xs text-gray-600 font-medium mb-1">Why:</p>
                              <ul className="space-y-1">
                                {stock.reasons.map((reason, ridx) => (
                                  <li key={ridx} className="text-xs text-gray-700 flex items-start">
                                    <span className="text-red-600 mr-1 mt-0.5">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Positive & Negative Aspects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.sentiment.positive_aspects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Positive Aspects
                </h3>
                <ul className="space-y-2">
                  {results.sentiment.positive_aspects.map((aspect, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <span className="text-green-600 mr-2">•</span>
                      <span>{aspect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.sentiment.negative_aspects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Negative Aspects
                </h3>
                <ul className="space-y-2">
                  {results.sentiment.negative_aspects.map((aspect, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <span className="text-red-600 mr-2">•</span>
                      <span>{aspect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sample Posts */}
          {results.posts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Top Posts Analyzed
              </h3>
              <div className="space-y-3">
                {results.posts.map((post, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>⬆️ {post.score} upvotes</span>
                          <span>💬 {post.num_comments} comments</span>
                        </div>
                      </div>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-primary-600 hover:text-primary-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

