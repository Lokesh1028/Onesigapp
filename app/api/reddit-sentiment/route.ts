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
}

// Fetch Reddit posts from a subreddit
async function fetchRedditPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
  try {
    // Remove 'r/' prefix if present
    const cleanSubreddit = subreddit.replace(/^r\//, '').trim()
    
    if (!cleanSubreddit) {
      throw new Error('Invalid subreddit name')
    }

    // Use Reddit's public JSON API (no auth needed for public subreddits)
    const url = `https://www.reddit.com/r/${cleanSubreddit}/hot.json?limit=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OneSig/1.0; +https://onesig.com)',
        'Accept': 'application/json',
      },
      // Remove next: { revalidate } as it might cause issues in API routes
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

    return posts
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    throw error
  }
}

// Fetch comments from a post
async function fetchPostComments(permalink: string, limit: number = 10): Promise<RedditComment[]> {
  try {
    const url = `https://www.reddit.com${permalink}.json?limit=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OneSig/1.0; +https://onesig.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
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
    const topPosts = posts.slice(0, 15)
    const topComments = comments.slice(0, 30)
    
    const postsText = topPosts
      .map((post, idx) => `Post ${idx + 1}: "${post.title}" - ${post.selftext.substring(0, 200)}`)
      .join('\n\n')

    const commentsText = topComments
      .map((comment, idx) => `Comment ${idx + 1}: "${comment.body.substring(0, 150)}"`)
      .join('\n\n')

    const prompt = `Analyze the sentiment of Reddit posts and comments from a subreddit. 

POSTS:
${postsText}

COMMENTS:
${commentsText}

Perform a comprehensive sentiment analysis and provide:
1. Overall sentiment (positive, negative, or neutral)
2. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
3. Confidence level (0 to 1)
4. A brief summary (2-3 sentences) of the general sentiment
5. Key themes/topics discussed
6. Positive aspects mentioned
7. Negative aspects mentioned
8. Sample posts with their individual sentiment classifications

Format your response as JSON with this exact structure:
{
  "overall_sentiment": "positive|negative|neutral",
  "sentiment_score": -1.0 to 1.0,
  "confidence": 0.0 to 1.0,
  "summary": "brief summary text",
  "key_themes": ["theme1", "theme2", "theme3"],
  "positive_aspects": ["aspect1", "aspect2"],
  "negative_aspects": ["aspect1", "aspect2"],
  "sample_posts": [
    {
      "title": "post title",
      "sentiment": "positive|negative|neutral",
      "score": sentiment_score
    }
  ]
}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert sentiment analysis AI. Analyze Reddit content and provide accurate, detailed sentiment analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Can also use 'openai/gpt-oss-120b' or 'llama-3.3-70b-versatile'
      temperature: 0.3,
      max_tokens: 2000,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON from response
    let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                    responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                    [null, responseText]
    
    let parsedResponse
    try {
      const jsonText = jsonMatch[1] || jsonMatch[0] || responseText
      parsedResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      console.error('Response text:', responseText.substring(0, 500))
      // Try to extract basic sentiment from text if JSON parsing fails
      const sentimentMatch = responseText.match(/overall_sentiment["\s:]+(\w+)/i)
      const scoreMatch = responseText.match(/sentiment_score["\s:]+([-+]?\d*\.?\d+)/i)
      
      if (sentimentMatch || scoreMatch) {
        parsedResponse = {
          overall_sentiment: sentimentMatch ? sentimentMatch[1].toLowerCase() : 'neutral',
          sentiment_score: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
          confidence: 0.5,
          summary: 'Sentiment analysis completed but response format was unexpected.',
          key_themes: [],
          positive_aspects: [],
          negative_aspects: [],
          sample_posts: [],
        }
      } else {
        throw new Error(`Failed to parse sentiment analysis response. AI response: ${responseText.substring(0, 200)}`)
      }
    }

    // Validate and structure the response
    const result: SentimentResult = {
      overall_sentiment: parsedResponse.overall_sentiment || 'neutral',
      sentiment_score: parseFloat(parsedResponse.sentiment_score) || 0,
      confidence: parseFloat(parsedResponse.confidence) || 0.5,
      summary: parsedResponse.summary || 'Unable to analyze sentiment.',
      key_themes: Array.isArray(parsedResponse.key_themes) ? parsedResponse.key_themes : [],
      positive_aspects: Array.isArray(parsedResponse.positive_aspects) ? parsedResponse.positive_aspects : [],
      negative_aspects: Array.isArray(parsedResponse.negative_aspects) ? parsedResponse.negative_aspects : [],
      sample_posts: Array.isArray(parsedResponse.sample_posts) 
        ? parsedResponse.sample_posts.slice(0, 5)
        : topPosts.slice(0, 5).map(post => ({
            title: post.title,
            sentiment: 'neutral' as const,
            score: 0,
          })),
    }

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
      posts = await fetchRedditPosts(subreddit, 25)
      console.log(`[Reddit Sentiment] Fetched ${posts.length} posts`)
    } catch (redditError) {
      const errorMsg = redditError instanceof Error ? redditError.message : 'Failed to fetch Reddit posts'
      console.error('[Reddit Sentiment] Error fetching posts:', errorMsg)
      return NextResponse.json(
        {
          error: 'Failed to fetch Reddit posts',
          details: errorMsg,
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
        const topPosts = posts.slice(0, 5)
        const commentPromises = topPosts.map(post => 
          fetchPostComments(post.permalink.replace('https://reddit.com', ''), 5)
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
      posts: posts.slice(0, 10).map(post => ({
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

