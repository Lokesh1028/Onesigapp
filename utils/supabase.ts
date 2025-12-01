import { createClient } from '@supabase/supabase-js'

// Create Supabase client
// Add these to your .env.local:
// NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface RetirementPlan {
  id?: string
  user_id: string
  retirement_age: number
  desired_monthly_income: number
  current_age: number
  current_savings: number
  monthly_contribution: number
  annual_return: number
  inflation_rate: number
  created_at?: string
  updated_at?: string
}

export interface Property {
  id?: string
  user_id: string
  property_type: 'primary' | 'rental'
  address: string
  purchase_price: number
  current_value: number
  remaining_mortgage: number
  monthly_mortgage_payment: number
  years_left_to_pay: number
  monthly_rental_income: number
  monthly_expenses: number
  created_at?: string
  updated_at?: string
}

export interface StockHolding {
  id?: string
  user_id: string
  ticker: string
  shares: number
  price_per_share: number
  total_value?: number
  created_at?: string
  updated_at?: string
}

export interface CashAsset {
  id?: string
  user_id: string
  asset_type: 'bank' | 'cash' | 'gold' | 'other'
  description: string
  value: number
  created_at?: string
  updated_at?: string
}


