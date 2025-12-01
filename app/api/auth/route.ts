import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const PROFILE_TABLE = 'user_profiles'

console.log('Supabase URL configured:', !!supabaseUrl)
console.log('Supabase Key configured:', !!supabaseServiceKey)
console.log('Using Service Role Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local',
      }, { status: 503 })
    }

    switch (action) {
      case 'signup': {
        const normalizedEmail = (email || '').trim().toLowerCase()
        const trimmedName = (name || '').trim()

        if (!normalizedEmail || !password || !trimmedName) {
          return NextResponse.json(
            { success: false, error: 'Name, email and password are required' },
            { status: 400 }
          )
        }

        console.log('Attempting signup for:', email)

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name: trimmedName },
          },
        })

        if (error) {
          console.error('Supabase signup error:', error.message, error)
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
          )
        }

        if (data.user) {
          const { error: profileError } = await supabase
            .from(PROFILE_TABLE)
            .upsert({
              user_id: data.user.id,
              email: normalizedEmail,
              name: trimmedName,
            }, { onConflict: 'user_id' })

          if (profileError) {
            console.error('Supabase profile upsert error:', profileError)
            return NextResponse.json(
              {
                success: false,
                error: 'Failed to save user profile. Please ensure the user_profiles table exists with columns user_id (uuid), email (text), and name (text).',
              },
              { status: 500 }
            )
          }
        }

        console.log('Signup successful:', data.user?.id)

        if (data.user) {
          const response = NextResponse.json({
            success: true,
            message: 'Account created successfully',
            user: { 
              id: data.user.id,
              email: data.user.email,
              name: trimmedName,
            },
          })

          // Set auth cookie
          if (data.session) {
            response.cookies.set('sb-access-token', data.session.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
            response.cookies.set('sb-refresh-token', data.session.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 30, // 30 days
            })
          }

          return response
        }

        return NextResponse.json({
          success: true,
          message: 'Please check your email to confirm your account',
        })
      }

      case 'login': {
        const normalizedEmail = (email || '').trim().toLowerCase()

        if (!normalizedEmail || !password) {
          return NextResponse.json(
            { success: false, error: 'Email and password are required' },
            { status: 400 }
          )
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

        if (error) {
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 401 }
          )
        }

        const profileName = data.user ? await fetchUserProfileName(data.user.id, data.user.user_metadata?.name) : null

        // Fetch user's retirement data
        const userData = await fetchUserData(data.user.id)

        const response = NextResponse.json({
          success: true,
          message: 'Logged in successfully',
          user: { 
            id: data.user.id,
            email: data.user.email,
            name: profileName,
          },
          data: userData,
        })

        // Set auth cookies
        if (data.session) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          })
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
          })
          response.cookies.set('sb-user-id', data.user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
          })
        }

        return response
      }

      case 'logout': {
        const response = NextResponse.json({
          success: true,
          message: 'Logged out successfully',
        })

        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        response.cookies.delete('sb-user-id')
        
        return response
      }

      case 'save': {
        const userId = request.cookies.get('sb-user-id')?.value
        
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Not authenticated' },
            { status: 401 }
          )
        }

        const { data: saveData } = body
        const saveResult = await saveUserData(userId, saveData)

        return NextResponse.json({
          success: true,
          message: 'Data saved successfully',
          details: saveResult,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const userId = request.cookies.get('sb-user-id')?.value
    
    if (!accessToken || !userId) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ authenticated: false })
    }

    const profileName = await fetchUserProfileName(user.id, user.user_metadata?.name)
    // Fetch user data
    const userData = await fetchUserData(user.id)

    return NextResponse.json({
      authenticated: true,
      user: { 
        id: user.id,
        email: user.email,
        name: profileName,
      },
      data: userData,
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

// Fetch all user data from Supabase
async function fetchUserProfileName(userId: string, fallback?: string | null): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .select('name')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Supabase profile fetch error:', error)
      return fallback || null
    }

    return data?.name || fallback || null
  } catch (error) {
    console.error('Error fetching profile name:', error)
    return fallback || null
  }
}

async function fetchUserData(userId: string) {
  try {
    // Fetch retirement plan
    const { data: plan } = await supabase
      .from('retirement_plans')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Fetch properties
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)

    // Fetch stock holdings
    const { data: stocks } = await supabase
      .from('stock_holdings')
      .select('*')
      .eq('user_id', userId)

    // Fetch cash assets
    const { data: cashAssets } = await supabase
      .from('cash_assets')
      .select('*')
      .eq('user_id', userId)

    // Transform to match frontend data structure
    const primaryHome = properties?.find(p => p.property_type === 'primary')
    const rentalProperties = properties?.filter(p => p.property_type === 'rental') || []

    return {
      onboardingData: plan ? {
        retirementAge: plan.retirement_age,
        desiredMonthlyIncome: plan.desired_monthly_income,
      } : null,
      inputs: plan ? {
        currentAge: plan.current_age,
        currentSavings: plan.current_savings,
        monthlyContribution: plan.monthly_contribution,
        annualReturn: plan.annual_return,
        inflationRate: plan.inflation_rate,
      } : null,
      primaryHome: primaryHome ? {
        id: primaryHome.id,
        address: primaryHome.address,
        purchasePrice: primaryHome.purchase_price,
        currentValue: primaryHome.current_value,
        remainingMortgage: primaryHome.remaining_mortgage,
        monthlyMortgagePayment: primaryHome.monthly_mortgage_payment,
        yearsLeftToPay: primaryHome.years_left_to_pay,
      } : null,
      rentalProperties: rentalProperties.map(r => ({
        id: r.id,
        address: r.address,
        purchasePrice: r.purchase_price,
        currentValue: r.current_value,
        remainingMortgage: r.remaining_mortgage,
        monthlyMortgagePayment: r.monthly_mortgage_payment,
        yearsLeftToPay: r.years_left_to_pay,
        monthlyRentalIncome: r.monthly_rental_income,
        monthlyExpenses: r.monthly_expenses,
      })),
      stockHoldings: stocks?.map(s => ({
        id: s.id,
        ticker: s.ticker,
        shares: s.shares,
        pricePerShare: s.price_per_share,
        totalValue: s.shares * s.price_per_share,
      })) || [],
      cashAssets: cashAssets?.map(a => ({
        id: a.id,
        type: a.asset_type,
        description: a.description,
        value: a.value,
      })) || [],
      showOnboarding: !plan,
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

// Save all user data to Supabase
async function saveUserData(userId: string, data: any) {
  try {
    const { onboardingData, inputs, primaryHome, rentalProperties, stockHoldings, cashAssets } = data
    const mutations: string[] = []

    // Upsert retirement plan
    if (onboardingData && inputs) {
      const { error } = await supabase
        .from('retirement_plans')
        .upsert({
          user_id: userId,
          retirement_age: onboardingData.retirementAge,
          desired_monthly_income: onboardingData.desiredMonthlyIncome,
          current_age: inputs.currentAge,
          current_savings: inputs.currentSavings,
          monthly_contribution: inputs.monthlyContribution,
          annual_return: inputs.annualReturn,
          inflation_rate: inputs.inflationRate,
        }, {
          onConflict: 'user_id',
        })
      if (error) throw error
      mutations.push('retirement_plans')
    }

    // Handle properties - delete old ones first, then insert new
    const { error: deletePropertiesError } = await supabase
      .from('properties')
      .delete()
      .eq('user_id', userId)
    if (deletePropertiesError) throw deletePropertiesError

    const propertiesToInsert = []
    
    if (primaryHome) {
      propertiesToInsert.push({
        user_id: userId,
        property_type: 'primary',
        address: primaryHome.address,
        purchase_price: primaryHome.purchasePrice,
        current_value: primaryHome.currentValue,
        remaining_mortgage: primaryHome.remainingMortgage,
        monthly_mortgage_payment: primaryHome.monthlyMortgagePayment,
        years_left_to_pay: primaryHome.yearsLeftToPay,
        monthly_rental_income: 0,
        monthly_expenses: 0,
      })
    }

    if (rentalProperties?.length > 0) {
      rentalProperties.forEach((rental: any) => {
        propertiesToInsert.push({
          user_id: userId,
          property_type: 'rental',
          address: rental.address,
          purchase_price: rental.purchasePrice,
          current_value: rental.currentValue,
          remaining_mortgage: rental.remainingMortgage,
          monthly_mortgage_payment: rental.monthlyMortgagePayment,
          years_left_to_pay: rental.yearsLeftToPay,
          monthly_rental_income: rental.monthlyRentalIncome,
          monthly_expenses: rental.monthlyExpenses,
        })
      })
    }

    if (propertiesToInsert.length > 0) {
      const { error } = await supabase
        .from('properties')
        .insert(propertiesToInsert)
      if (error) throw error
      mutations.push('properties')
    }

    // Handle stock holdings
    const { error: deleteStocksError } = await supabase
      .from('stock_holdings')
      .delete()
      .eq('user_id', userId)
    if (deleteStocksError) throw deleteStocksError

    if (stockHoldings?.length > 0) {
      const { error } = await supabase
        .from('stock_holdings')
        .insert(stockHoldings.map((stock: any) => ({
          user_id: userId,
          ticker: stock.ticker,
          shares: stock.shares,
          price_per_share: stock.pricePerShare,
        })))
      if (error) throw error
      mutations.push('stock_holdings')
    }

    // Handle cash assets
    const { error: deleteCashError } = await supabase
      .from('cash_assets')
      .delete()
      .eq('user_id', userId)
    if (deleteCashError) throw deleteCashError

    if (cashAssets?.length > 0) {
      const { error } = await supabase
        .from('cash_assets')
        .insert(cashAssets.map((asset: any) => ({
          user_id: userId,
          asset_type: asset.type,
          description: asset.description,
          value: asset.value,
        })))
      if (error) throw error
      mutations.push('cash_assets')
    }

    return { mutated: mutations }
  } catch (error) {
    console.error('Error saving user data:', error)
    throw error
  }
}
