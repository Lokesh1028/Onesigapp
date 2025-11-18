'use client'

import { useState } from 'react'

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
  const [subreddit, setSubreddit] = useState('')
  const [includeComments, setIncludeComments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!subreddit.trim()) {
      setError('Please enter a subreddit name')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

