import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RedditPost {
  title: string
  selftext: string
  score: number
  num_comments: number
  created_utc: number
  author: string
  url: string
  permalink: string
}

interface RedditComment {
  body: string
  score: number
  author: string
  created_utc: number
}

interface SentimentResult {
  overall_sentiment: 'positive' | 'negative' | 'neutral'
  sentiment_score: number // -1 to 1
  confidence: number // 0 to 1
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

// Get Reddit OAuth access token
async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in your environment variables.')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'OneSig/1.0',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Failed to get Reddit access token: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

// Fetch Reddit posts from a subreddit using OAuth
async function fetchRedditPosts(subreddit: string, limit: number = 100): Promise<RedditPost[]> {
  try {
    // Remove 'r/' prefix if present
    const cleanSubreddit = subreddit.replace(/^r\//, '').trim()
    
    if (!cleanSubreddit) {
      throw new Error('Invalid subreddit name')
    }

    // Get OAuth access token
    const accessToken = await getRedditAccessToken()

    // Use Reddit's OAuth API
    const url = `https://oauth.reddit.com/r/${cleanSubreddit}/hot?limit=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'OneSig/1.0',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Subreddit "r/${cleanSubreddit}" not found or is private`)
      }
      if (response.status === 403) {
        throw new Error(`Subreddit "r/${cleanSubreddit}" is private or banned`)
      }
      throw new Error(`Reddit API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data.children) {
      throw new Error('Invalid Reddit API response')
    }

    const posts: RedditPost[] = data.data.children
      .map((child: any) => child.data)
      .filter((post: any) => post.title && post.selftext !== '[removed]' && post.selftext !== '[deleted]')
      .map((post: any) => ({
        title: post.title,
        selftext: post.selftext || '',
        score: post.score || 0,
        num_comments: post.num_comments || 0,
        created_utc: post.created_utc,
        author: post.author,
        url: post.url,
        permalink: `https://reddit.com${post.permalink}`,
      }))

    console.log(`[Reddit API] Successfully fetched ${posts.length} posts from r/${cleanSubreddit}`)
    return posts
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    throw error
  }
}

// Fetch comments from a post using OAuth
async function fetchPostComments(permalink: string, limit: number = 10, accessToken: string): Promise<RedditComment[]> {
  try {
    // Remove the /r/subreddit prefix and add to oauth endpoint
    const cleanPermalink = permalink.replace(/^\/r\/[^\/]+\/comments\//, '')
    const url = `https://oauth.reddit.com/comments/${cleanPermalink}?limit=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'OneSig/1.0',
      },
    })

    if (!response.ok) {
      console.warn(`Failed to fetch comments from ${permalink}: ${response.status}`)
      return [] // Return empty array if comments can't be fetched
    }

    const data = await response.json()
    
    if (!data[1] || !data[1].data || !data[1].data.children) {
      return []
    }

    const comments: RedditComment[] = data[1].data.children
      .map((child: any) => child.data)
      .filter((comment: any) => comment.body && comment.body !== '[removed]' && comment.body !== '[deleted]')
      .map((comment: any) => ({
        body: comment.body,
        score: comment.score || 0,
        author: comment.author,
        created_utc: comment.created_utc,
      }))

    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

// Perform sentiment analysis using Groq API
async function analyzeSentimentWithGroq(
  posts: RedditPost[],
  comments: RedditComment[]
): Promise<SentimentResult> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured. Please set GROQ_API_KEY in your environment variables.')
  }

  try {
    const groq = new Groq({
      apiKey: apiKey,
    })

    // Prepare content for analysis (limit to avoid token limits)
    const topPosts = posts.slice(0, 50)
    const topComments = comments.slice(0, 50)
    
    const postsText = topPosts
      .map((post, idx) => `Post ${idx + 1}: "${post.title}" - ${post.selftext.substring(0, 200)}`)
      .join('\n\n')

    const commentsText = topComments
      .map((comment, idx) => `Comment ${idx + 1}: "${comment.body.substring(0, 150)}"`)
      .join('\n\n')

    const prompt = `Analyze the sentiment of the following Reddit posts and comments from r/wallstreetbets.

POSTS:
${postsText}

COMMENTS:
${commentsText}

Provide a comprehensive sentiment analysis including stock-specific insights. You must respond with ONLY valid JSON, no other text before or after.

JSON structure (use this exact format):
{
  "overall_sentiment": "positive" or "negative" or "neutral",
  "sentiment_score": number between -1.0 and 1.0,
  "confidence": number between 0.0 and 1.0,
  "summary": "2-3 sentence summary of the general sentiment",
  "key_themes": ["theme1", "theme2", "theme3"],
  "positive_aspects": ["aspect1", "aspect2"],
  "negative_aspects": ["aspect1", "aspect2"],
  "sample_posts": [
    {"title": "post title", "sentiment": "positive", "score": 0.5}
  ],
  "positive_stocks": [
    {
      "ticker": "AAPL",
      "company_name": "Apple Inc",
      "sentiment_score": 0.8,
      "prediction": "increase",
      "confidence": 0.7,
      "reasons": ["Strong earnings", "New product launch"]
    }
  ],
  "negative_stocks": [
    {
      "ticker": "TSLA",
      "company_name": "Tesla Inc",
      "sentiment_score": -0.6,
      "prediction": "decrease",
      "confidence": 0.65,
      "reasons": ["Concerns about deliveries", "CEO controversies"]
    }
  ]
}

For stocks:
- Extract all stock tickers mentioned (e.g., TSLA, AAPL, NVDA, SPY, etc.)
- Determine sentiment score (-1.0 to 1.0) based on the overall tone
- For prediction, ALIGN with the sentiment score:
  * If sentiment_score > 0.3: predict "increase" (bullish stocks should predict increase)
  * If sentiment_score < -0.3: predict "decrease" (bearish stocks should predict decrease)
  * If sentiment_score between -0.3 and 0.3: predict "neutral"
  * DO NOT predict "decrease" for stocks with positive sentiment scores
  * DO NOT predict "increase" for stocks with negative sentiment scores
- Confidence should reflect how strong the sentiment is:
  * Strong sentiment (score > 0.6 or < -0.6): confidence 0.7-0.8
  * Moderate sentiment (score 0.3-0.6 or -0.3 to -0.6): confidence 0.5-0.7
  * Weak sentiment (score -0.3 to 0.3): confidence 0.3-0.5
- List key reasons for the sentiment
- Include up to 10 stocks in each category
- Positive_stocks array should contain stocks with POSITIVE sentiment and "increase" predictions
- Negative_stocks array should contain stocks with NEGATIVE sentiment and "decrease" predictions

Respond with ONLY the JSON object, nothing else.`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial sentiment analyst. Analyze Reddit content and ensure predictions ALIGN with sentiment scores: positive sentiment → increase prediction, negative sentiment → decrease prediction. Always respond with valid JSON only, no markdown formatting or additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON from response
    let parsedResponse
    try {
      // Try direct parse first (response_format: json_object should give us clean JSON)
      parsedResponse = JSON.parse(responseText)
    } catch (directParseError) {
      // Fallback: try to extract JSON from markdown code blocks
      console.warn('Direct JSON parse failed, trying to extract from markdown:', directParseError)
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          parsedResponse = JSON.parse(jsonMatch[1])
        } catch (markdownParseError) {
          console.error('Failed to parse JSON from markdown block:', markdownParseError)
          throw new Error(`Failed to parse AI response as JSON. Response snippet: ${responseText.substring(0, 200)}`)
        }
      } else {
        // Last resort: try to extract values with regex
        console.error('No JSON block found in response:', responseText.substring(0, 500))
        const sentimentMatch = responseText.match(/["']?overall_sentiment["']?\s*:\s*["']?(\w+)["']?/i)
        const scoreMatch = responseText.match(/["']?sentiment_score["']?\s*:\s*([-+]?\d*\.?\d+)/i)
        const confidenceMatch = responseText.match(/["']?confidence["']?\s*:\s*(\d*\.?\d+)/i)
        
        if (sentimentMatch) {
          parsedResponse = {
            overall_sentiment: sentimentMatch[1].toLowerCase(),
            sentiment_score: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
            confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
            summary: 'Sentiment analysis completed (partial data extracted from malformed response).',
            key_themes: [],
            positive_aspects: [],
            negative_aspects: [],
            sample_posts: [],
          }
          console.warn('Used fallback parsing, results may be incomplete')
        } else {
          throw new Error(`Could not extract sentiment data from AI response. Response: ${responseText.substring(0, 300)}`)
        }
      }
    }

    // Validate and structure the response
    const result: SentimentResult = {
      overall_sentiment: (parsedResponse.overall_sentiment || 'neutral').toLowerCase() as 'positive' | 'negative' | 'neutral',
      sentiment_score: typeof parsedResponse.sentiment_score === 'number' ? parsedResponse.sentiment_score : parseFloat(parsedResponse.sentiment_score) || 0,
      confidence: typeof parsedResponse.confidence === 'number' ? parsedResponse.confidence : parseFloat(parsedResponse.confidence) || 0.5,
      summary: parsedResponse.summary || 'Unable to analyze sentiment.',
      key_themes: Array.isArray(parsedResponse.key_themes) ? parsedResponse.key_themes.filter((t: any) => t) : [],
      positive_aspects: Array.isArray(parsedResponse.positive_aspects) ? parsedResponse.positive_aspects.filter((a: any) => a) : [],
      negative_aspects: Array.isArray(parsedResponse.negative_aspects) ? parsedResponse.negative_aspects.filter((a: any) => a) : [],
      sample_posts: Array.isArray(parsedResponse.sample_posts) && parsedResponse.sample_posts.length > 0
        ? parsedResponse.sample_posts.slice(0, 5).map((p: any) => ({
            title: p.title || 'Untitled',
            sentiment: (p.sentiment || 'neutral').toLowerCase() as 'positive' | 'negative' | 'neutral',
            score: typeof p.score === 'number' ? p.score : 0,
          }))
        : topPosts.slice(0, 5).map(post => ({
            title: post.title,
            sentiment: 'neutral' as const,
            score: 0,
          })),
      positive_stocks: Array.isArray(parsedResponse.positive_stocks) 
        ? parsedResponse.positive_stocks.slice(0, 10).map((s: any) => ({
            ticker: (s.ticker || '').toUpperCase(),
            company_name: s.company_name || '',
            sentiment_score: typeof s.sentiment_score === 'number' ? s.sentiment_score : parseFloat(s.sentiment_score) || 0,
            prediction: (s.prediction || 'neutral').toLowerCase() as 'increase' | 'decrease' | 'neutral',
            confidence: typeof s.confidence === 'number' ? s.confidence : parseFloat(s.confidence) || 0.5,
            reasons: Array.isArray(s.reasons) ? s.reasons.filter((r: any) => r) : [],
          }))
        : [],
      negative_stocks: Array.isArray(parsedResponse.negative_stocks)
        ? parsedResponse.negative_stocks.slice(0, 10).map((s: any) => ({
            ticker: (s.ticker || '').toUpperCase(),
            company_name: s.company_name || '',
            sentiment_score: typeof s.sentiment_score === 'number' ? s.sentiment_score : parseFloat(s.sentiment_score) || 0,
            prediction: (s.prediction || 'neutral').toLowerCase() as 'increase' | 'decrease' | 'neutral',
            confidence: typeof s.confidence === 'number' ? s.confidence : parseFloat(s.confidence) || 0.5,
            reasons: Array.isArray(s.reasons) ? s.reasons.filter((r: any) => r) : [],
          }))
        : [],
    }

    console.log('[Reddit Sentiment] Successfully parsed sentiment result:', {
      sentiment: result.overall_sentiment,
      score: result.sentiment_score,
      confidence: result.confidence,
      themes_count: result.key_themes.length,
    })

    return result
  } catch (error) {
    console.error('Error analyzing sentiment with Groq:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subreddit, includeComments = false } = body

    if (!subreddit || typeof subreddit !== 'string') {
      return NextResponse.json(
        { error: 'Subreddit name is required' },
        { status: 400 }
      )
    }

    console.log(`[Reddit Sentiment] Starting analysis for r/${subreddit}`)

    // Fetch Reddit posts
    let posts: RedditPost[]
    try {
      posts = await fetchRedditPosts(subreddit, 100)
      console.log(`[Reddit Sentiment] Fetched ${posts.length} posts`)
    } catch (redditError) {
      const errorMsg = redditError instanceof Error ? redditError.message : 'Failed to fetch Reddit posts'
      console.error('[Reddit Sentiment] Error fetching posts:', errorMsg)
      
      const isAuthError = errorMsg.includes('credentials not configured') || errorMsg.includes('access token')
      
      return NextResponse.json(
        {
          error: 'Failed to fetch Reddit posts',
          details: errorMsg,
          hint: isAuthError 
            ? 'Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in Vercel environment variables. Get them from https://www.reddit.com/prefs/apps'
            : 'Check server logs for more details',
        },
        { status: 500 }
      )
    }

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No posts found in this subreddit. It may be empty or private.' },
        { status: 404 }
      )
    }

    // Optionally fetch comments from top posts
    let comments: RedditComment[] = []
    if (includeComments) {
      try {
        const accessToken = await getRedditAccessToken()
        const topPosts = posts.slice(0, 5)
        const commentPromises = topPosts.map(post => 
          fetchPostComments(post.permalink.replace('https://reddit.com', ''), 5, accessToken)
        )
        const commentArrays = await Promise.all(commentPromises)
        comments = commentArrays.flat()
        console.log(`[Reddit Sentiment] Fetched ${comments.length} comments`)
      } catch (commentError) {
        console.warn('[Reddit Sentiment] Error fetching comments, continuing without them:', commentError)
        // Continue without comments if they fail
      }
    }

    // Perform sentiment analysis
    let sentimentResult: SentimentResult
    try {
      console.log('[Reddit Sentiment] Starting Groq API analysis...')
      sentimentResult = await analyzeSentimentWithGroq(posts, comments)
      console.log('[Reddit Sentiment] Analysis complete')
    } catch (groqError) {
      const errorMsg = groqError instanceof Error ? groqError.message : 'Failed to analyze sentiment'
      console.error('[Reddit Sentiment] Error in Groq analysis:', errorMsg)
      return NextResponse.json(
        {
          error: 'Failed to analyze sentiment',
          details: errorMsg,
          hint: groqError instanceof Error && errorMsg.includes('API key') 
            ? 'Please check your GROQ_API_KEY in .env.local' 
            : 'Check server logs for more details',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subreddit: subreddit.replace(/^r\//, ''),
      posts_analyzed: posts.length,
      comments_analyzed: comments.length,
      sentiment: sentimentResult,
      posts: posts.slice(0, 20).map(post => ({
        title: post.title,
        score: post.score,
        num_comments: post.num_comments,
        url: post.url,
        permalink: post.permalink,
      })),
    })
  } catch (error) {
    console.error('[Reddit Sentiment] Unexpected error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      {
        error: 'Failed to analyze Reddit sentiment',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

