import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  // Use service role key for server-side operations (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return supabase
}

// Check if email already exists in Supabase
async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned (not an error)
      console.error('Error checking email existence:', error)
      return false // Fail open - allow submission if check fails
    }

    return !!data
  } catch (error) {
    console.error('Error checking email existence:', error)
    return false // Fail open
  }
}

// Insert subscriber into Supabase
async function insertSubscriber(name: string, email: string, whatsapp?: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('subscribers')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp ? whatsapp.trim() : null,
      subscribed_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error inserting subscriber:', error)
    throw new Error(`Failed to save subscriber: ${error.message}`)
  }

  console.log(`Successfully added subscriber: ${name} (${email})${whatsapp ? ` - WhatsApp: ${whatsapp}` : ''}`)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, whatsapp } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Optional WhatsApp validation
    if (whatsapp && whatsapp.trim() && !/^\+?[1-9]\d{1,14}$/.test(whatsapp.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid WhatsApp number format. Please include country code (e.g., +1234567890)' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const exists = await checkEmailExists(email)
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed' },
        { status: 409 }
      )
    }

    // Insert into Supabase
    await insertSubscriber(name.trim(), email.trim().toLowerCase(), whatsapp?.trim())

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    })

  } catch (error) {
    console.error('Error in subscribe API:', error)
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    // Check if it's a configuration error
    if (error instanceof Error) {
      if (error.message.includes('environment variable') || error.message.includes('not configured')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Server configuration error. Please contact support.',
            details: error.message,
          },
          { status: 500 }
        )
      }
      
      // Check for Supabase-specific errors
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Database table not found. Please ensure the subscribers table exists in Supabase.',
            details: error.message,
          },
          { status: 500 }
        )
      }
      
      // Return the actual error message in development
      const isDevelopment = process.env.NODE_ENV === 'development'
      return NextResponse.json(
        {
          success: false,
          error: isDevelopment ? error.message : 'Failed to process subscription. Please try again later.',
          details: isDevelopment ? error.stack : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process subscription. Please try again later.',
      },
      { status: 500 }
    )
  }
}


