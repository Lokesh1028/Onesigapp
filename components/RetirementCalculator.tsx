'use client'

import { useState, useEffect, useCallback } from 'react'
import Navigation from '@/components/Navigation'

// Auth types
interface AuthState {
  isLoggedIn: boolean
  email: string | null
  isLoading: boolean
}

// Types
interface OnboardingData {
  retirementAge: number
  desiredMonthlyIncome: number
}

interface PrimaryHome {
  id: string
  address: string
  purchasePrice: number
  currentValue: number
  remainingMortgage: number
  monthlyMortgagePayment: number
  yearsLeftToPay: number
}

interface RentalProperty {
  id: string
  address: string
  purchasePrice: number
  currentValue: number
  remainingMortgage: number
  monthlyMortgagePayment: number
  yearsLeftToPay: number
  monthlyRentalIncome: number
  monthlyExpenses: number // taxes, insurance, maintenance
}

interface StockHolding {
  id: string
  ticker: string
  shares: number
  pricePerShare: number
  totalValue: number
}

interface CashAsset {
  id: string
  type: 'bank' | 'cash' | 'gold' | 'other'
  description: string
  value: number
}

interface CalculatorInputs {
  currentAge: number
  currentSavings: number
  monthlyContribution: number
  annualReturn: number
  inflationRate: number
}

interface CalculatorResults {
  yearsToRetirement: number
  totalNeededAtRetirement: number
  projectedLiquidAssets: number
  percentOnTrack: number
  gap: number
  monthlyRetirementIncome: number
  annualIncomeNeeded: number
  futureAnnualIncome: number
  futureMonthlyIncome: number
  futureValueOfSavings: number
  futureValueOfContributions: number
  effectiveMonthlyContribution: number
  additionalMonthlyNeeded: number
  guidance: string[]
  
  // Property breakdown
  primaryHomeEquity: number
  rentalPropertyEquity: number
  totalRentalIncome: number
  netRentalCashflow: number
}

// Pie Chart Component
function PieChart({ 
  projected, 
  needed, 
  percentOnTrack 
}: { 
  projected: number
  needed: number
  percentOnTrack: number 
}) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (Math.min(percentOnTrack, 100) / 100) * circumference
  const isOnTrack = percentOnTrack >= 100

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(75, 85, 99, 0.3)"
          strokeWidth="20"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={isOnTrack ? '#10B981' : '#F59E0B'}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${isOnTrack ? 'text-emerald-400' : 'text-amber-400'}`}>
          {Math.round(percentOnTrack)}%
        </span>
        <span className="text-sm text-muted-steel mt-1">On Track</span>
        {isOnTrack ? (
          <span className="text-xs text-emerald-400 mt-2">✓ Goal Achievable</span>
        ) : (
          <span className="text-xs text-amber-400 mt-2">Needs Adjustment</span>
        )}
      </div>
    </div>
  )
}

// Format currency helper
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function RetirementCalculator() {
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    retirementAge: 65,
    desiredMonthlyIncome: 5000,
  })

  // Main calculator inputs
  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentAge: 30,
    currentSavings: 50000,
    monthlyContribution: 1000,
    annualReturn: 7,
    inflationRate: 3,
  })

  // Property state
  const [primaryHome, setPrimaryHome] = useState<PrimaryHome | null>(null)
  const [rentalProperties, setRentalProperties] = useState<RentalProperty[]>([])
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [propertyModalType, setPropertyModalType] = useState<'primary' | 'rental'>('primary')

  // Stock holdings
  const [stockHoldings, setStockHoldings] = useState<StockHolding[]>([])
  const [showStockModal, setShowStockModal] = useState(false)

  // Cash assets
  const [cashAssets, setCashAssets] = useState<CashAsset[]>([])
  const [showCashModal, setShowCashModal] = useState(false)

  // Results
  const [results, setResults] = useState<CalculatorResults | null>(null)

  // Active section
  const [activeSection, setActiveSection] = useState<'overview' | 'properties' | 'stocks' | 'cash'>('overview')

  // Auth state
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, email: null, isLoading: true })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  // Auto prompt auth once when unauthenticated
  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) {
      setShowAuthModal(true)
    }
  }, [auth.isLoading, auth.isLoggedIn])

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth')
      const data = await res.json()
      if (data.authenticated) {
        setAuth({ isLoggedIn: true, email: data.user.email, isLoading: false })
        // Load saved data if available
        if (data.data) {
          loadSavedData(data.data)
        }
      } else {
        setAuth({ isLoggedIn: false, email: null, isLoading: false })
      }
    } catch {
      setAuth({ isLoggedIn: false, email: null, isLoading: false })
    }
  }

  const loadSavedData = (data: any) => {
    if (data.onboardingData) setOnboardingData(data.onboardingData)
    if (data.inputs) setInputs(data.inputs)
    if (data.primaryHome) setPrimaryHome(data.primaryHome)
    if (data.rentalProperties) setRentalProperties(data.rentalProperties)
    if (data.stockHoldings) setStockHoldings(data.stockHoldings)
    if (data.cashAssets) setCashAssets(data.cashAssets)
    if (data.showOnboarding !== undefined) setShowOnboarding(data.showOnboarding)
  }

  const saveData = async () => {
    if (!auth.isLoggedIn) {
      setShowAuthModal(true)
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const dataToSave = {
        onboardingData,
        inputs,
        primaryHome,
        rentalProperties,
        stockHoldings,
        cashAssets,
        showOnboarding,
      }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data: dataToSave }),
      })
      
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    setAuth({ isLoggedIn: false, email: null, isLoading: false })
  }

  // Calculate totals
  const stockTotal = stockHoldings.reduce((sum, s) => sum + s.totalValue, 0)
  const cashTotal = cashAssets.reduce((sum, a) => sum + a.value, 0)
  
  // Primary home equity (not counted as liquid)
  const primaryHomeEquity = primaryHome 
    ? Math.max(0, primaryHome.currentValue - primaryHome.remainingMortgage)
    : 0

  // Rental property equity (counted as liquid/investment)
  const rentalEquity = rentalProperties.reduce((sum, p) => 
    sum + Math.max(0, p.currentValue - p.remainingMortgage), 0
  )

  // Net rental cashflow (income - mortgage - expenses)
  const netRentalCashflow = rentalProperties.reduce((sum, p) => 
    sum + (p.monthlyRentalIncome - p.monthlyMortgagePayment - p.monthlyExpenses), 0
  )

  // Total liquid assets (excludes primary home)
  const totalLiquidAssets = inputs.currentSavings + stockTotal + cashTotal + rentalEquity

  // Calculate retirement projections
  useEffect(() => {
    if (showOnboarding) return

    const yearsToRetirement = onboardingData.retirementAge - inputs.currentAge
    const monthsToRetirement = yearsToRetirement * 12

    if (yearsToRetirement <= 0) {
      setResults(null)
      return
    }

    // Calculate total needed at retirement (25x annual expenses - 4% rule)
    const annualIncomeNeeded = onboardingData.desiredMonthlyIncome * 12
    const futureAnnualIncome = annualIncomeNeeded * Math.pow(1 + inputs.inflationRate / 100, yearsToRetirement)
    const totalNeededAtRetirement = futureAnnualIncome * 25

    // Calculate future value of current liquid savings
    const monthlyReturnRate = inputs.annualReturn / 100 / 12
    const futureValueOfSavings = totalLiquidAssets * Math.pow(1 + inputs.annualReturn / 100, yearsToRetirement)

    // Calculate future value of monthly contributions (including rental cashflow)
    const effectiveMonthlyContribution = inputs.monthlyContribution + Math.max(0, netRentalCashflow)
    let futureValueOfContributions = 0
    if (monthlyReturnRate > 0) {
      futureValueOfContributions = effectiveMonthlyContribution * 
        ((Math.pow(1 + monthlyReturnRate, monthsToRetirement) - 1) / monthlyReturnRate)
    } else {
      futureValueOfContributions = effectiveMonthlyContribution * monthsToRetirement
    }

    const projectedLiquidAssets = futureValueOfSavings + futureValueOfContributions

    // Calculate percentage on track
    const percentOnTrack = (projectedLiquidAssets / totalNeededAtRetirement) * 100
    const gap = Math.max(0, totalNeededAtRetirement - projectedLiquidAssets)
    const additionalMonthlyNeeded = gap / monthsToRetirement

    // Monthly retirement income based on projected savings
    const monthlyRetirementIncome = (projectedLiquidAssets * 0.04) / 12

    // Generate guidance
    const guidance: string[] = []
    if (percentOnTrack < 100) {
      guidance.push(`Increase monthly contribution by ${formatCurrency(additionalMonthlyNeeded)} to reach your goal`)
      
      if (inputs.annualReturn < 10) {
        guidance.push('Consider higher-return investments (with appropriate risk tolerance)')
      }
      
      if (rentalProperties.length === 0) {
        guidance.push('Rental properties could provide additional passive income')
      }
    } else {
      guidance.push('Great job! You\'re on track to meet your retirement goals')
      if (percentOnTrack > 120) {
        guidance.push('You may be able to retire earlier or increase your retirement lifestyle')
      }
    }

    setResults({
      yearsToRetirement,
      totalNeededAtRetirement,
      projectedLiquidAssets,
      percentOnTrack,
      gap,
      monthlyRetirementIncome,
      annualIncomeNeeded,
      futureAnnualIncome,
      futureMonthlyIncome: futureAnnualIncome / 12,
      futureValueOfSavings,
      futureValueOfContributions,
      effectiveMonthlyContribution,
      additionalMonthlyNeeded: percentOnTrack < 100 ? gap / monthsToRetirement : 0,
      guidance,
      primaryHomeEquity,
      rentalPropertyEquity: rentalEquity,
      totalRentalIncome: rentalProperties.reduce((sum, p) => sum + p.monthlyRentalIncome, 0),
      netRentalCashflow,
    })
  }, [inputs, onboardingData, totalLiquidAssets, netRentalCashflow, primaryHomeEquity, rentalEquity, rentalProperties, showOnboarding])

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const addStockHolding = (holding: Omit<StockHolding, 'id' | 'totalValue'>) => {
    const totalValue = holding.shares * holding.pricePerShare
    setStockHoldings(prev => [...prev, { ...holding, id: `stock-${Date.now()}`, totalValue }])
  }

  const removeStockHolding = (id: string) => {
    setStockHoldings(prev => prev.filter(s => s.id !== id))
  }

  const addCashAsset = (asset: Omit<CashAsset, 'id'>) => {
    setCashAssets(prev => [...prev, { ...asset, id: `cash-${Date.now()}` }])
  }

  const removeCashAsset = (id: string) => {
    setCashAssets(prev => prev.filter(c => c.id !== id))
  }

  const completeOnboarding = () => {
    setShowOnboarding(false)
  }

  // Gate the calculator until signed in
  if (!auth.isLoading && !auth.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050b14] text-white">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-center">
          <div className="bg-gunmetal/40 border border-gunmetal rounded-2xl p-8 shadow-2xl">
            <p className="text-sm text-signal-violet font-semibold mb-2">Retirement Calculator</p>
            <h1 className="text-3xl font-bold mb-3">Sign up to save and load your plan</h1>
            <p className="text-muted-steel mb-6">
              Create an account to store your goals, assets, and projections securely in Supabase.
              When you sign back in, we’ll automatically load your saved numbers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-signal-violet hover:bg-signal-violet/80 text-white font-semibold rounded-lg transition-colors"
              >
                Sign up / Log in
              </button>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={(email, data) => {
              setAuth({ isLoggedIn: true, email, isLoading: false })
              if (data) loadSavedData(data)
              setShowAuthModal(false)
            }}
          />
        )}
      </div>
    )
  }

  // Onboarding Flow
  if (showOnboarding) {
  return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-signal-violet/20 to-data-blue/20 rounded-2xl border border-gunmetal p-8">
          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= onboardingStep ? 'bg-signal-violet' : 'bg-gunmetal'
                }`}
              />
            ))}
          </div>

          {onboardingStep === 1 && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-white">Welcome to Your Retirement Planner</h2>
              <p className="text-muted-steel">
                Let's set up your personalized retirement plan in just a few steps.
              </p>
              <button
                onClick={() => setOnboardingStep(2)}
                className="px-8 py-4 bg-signal-violet hover:bg-signal-violet/80 text-white font-semibold rounded-xl transition-colors"
              >
                Get Started →
              </button>
          </div>
          )}

          {onboardingStep === 2 && (
        <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🏖️</div>
                <h2 className="text-2xl font-bold text-white">When do you want to retire?</h2>
                <p className="text-muted-steel mt-2">Set your target retirement age</p>
      </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-muted-steel">
                  Your Current Age
            </label>
            <input
              type="number"
              min="18"
              max="100"
              value={inputs.currentAge}
                  onChange={(e) => handleInputChange('currentAge', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-4 bg-gunmetal border border-gray-600 rounded-xl text-white text-xl text-center font-semibold focus:outline-none focus:ring-2 focus:ring-signal-violet"
            />
          </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-muted-steel">
              Desired Retirement Age
            </label>
            <input
              type="number"
                  min={inputs.currentAge + 1}
              max="100"
                  value={onboardingData.retirementAge}
                  onChange={(e) => setOnboardingData(prev => ({ 
                    ...prev, 
                    retirementAge: parseInt(e.target.value) || 65 
                  }))}
                  className="w-full px-4 py-4 bg-gunmetal border border-gray-600 rounded-xl text-white text-xl text-center font-semibold focus:outline-none focus:ring-2 focus:ring-signal-violet"
                />
                <p className="text-center text-muted-steel">
                  That's <span className="text-signal-violet font-semibold">
                    {onboardingData.retirementAge - inputs.currentAge} years
                  </span> from now
                </p>
          </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="flex-1 px-6 py-3 bg-gunmetal hover:bg-gunmetal/80 text-white font-medium rounded-xl transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="flex-1 px-6 py-3 bg-signal-violet hover:bg-signal-violet/80 text-white font-semibold rounded-xl transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">💰</div>
                <h2 className="text-2xl font-bold text-white">How much monthly income do you need?</h2>
                <p className="text-muted-steel mt-2">This is your desired spending in retirement</p>
          </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-muted-steel">
                  Desired Monthly Income in Retirement
            </label>
            <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-steel text-xl">$</span>
              <input
                type="number"
                    min="1000"
                    step="500"
                    value={onboardingData.desiredMonthlyIncome}
                    onChange={(e) => setOnboardingData(prev => ({ 
                      ...prev, 
                      desiredMonthlyIncome: parseInt(e.target.value) || 5000 
                    }))}
                    className="w-full pl-10 pr-4 py-4 bg-gunmetal border border-gray-600 rounded-xl text-white text-xl text-center font-semibold focus:outline-none focus:ring-2 focus:ring-signal-violet"
              />
            </div>
                <p className="text-center text-muted-steel">
                  Annual: <span className="text-emerald-400 font-semibold">
                    {formatCurrency(onboardingData.desiredMonthlyIncome * 12)}
                  </span>
                </p>
          </div>

              {/* Quick presets */}
              <div className="grid grid-cols-3 gap-3">
                {[3000, 5000, 8000, 10000, 15000, 20000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setOnboardingData(prev => ({ ...prev, desiredMonthlyIncome: amount }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      onboardingData.desiredMonthlyIncome === amount
                        ? 'bg-signal-violet text-white'
                        : 'bg-gunmetal text-muted-steel hover:text-white'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="flex-1 px-6 py-3 bg-gunmetal hover:bg-gunmetal/80 text-white font-medium rounded-xl transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={completeOnboarding}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-600/80 text-white font-semibold rounded-xl transition-colors"
                >
                  Start Planning ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main Calculator View
  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-gradient-to-r from-signal-violet/20 to-data-blue/20 rounded-2xl border border-gunmetal p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Your Retirement Plan</h2>
            <p className="text-muted-steel">
              Retire at {onboardingData.retirementAge} with {formatCurrency(onboardingData.desiredMonthlyIncome)}/month
            </p>
            </div>
          <div className="flex items-center gap-3">
            {/* Save Button */}
            <button
              onClick={saveData}
              disabled={isSaving}
              className={`px-4 py-2 ${saveSuccess ? 'bg-green-500' : 'bg-emerald-600 hover:bg-emerald-600/80'} disabled:bg-emerald-600/50 text-white rounded-lg transition-colors text-sm flex items-center gap-2`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save
                </>
              )}
            </button>

            {/* Auth Button */}
            {auth.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-steel">{auth.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-gunmetal hover:bg-gunmetal/80 text-muted-steel hover:text-white rounded-lg transition-colors text-sm"
                >
                  Logout
                </button>
          </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-signal-violet hover:bg-signal-violet/80 text-white rounded-lg transition-colors text-sm"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 bg-gunmetal hover:bg-gunmetal/80 text-muted-steel hover:text-white rounded-lg transition-colors text-sm"
            >
              Edit Goals
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <div className="bg-gunmetal/30 rounded-xl border border-gunmetal p-5">
            <h3 className="text-sm font-medium text-muted-steel mb-4">Current Assets</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-steel">Liquid Savings</span>
                <span className="font-semibold text-white">{formatCurrency(inputs.currentSavings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-steel">Stocks</span>
                <span className="font-semibold text-white">{formatCurrency(stockTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-steel">Cash Assets</span>
                <span className="font-semibold text-white">{formatCurrency(cashTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-steel">Rental Equity</span>
                <span className="font-semibold text-white">{formatCurrency(rentalEquity)}</span>
              </div>
              <div className="pt-3 border-t border-gunmetal flex justify-between items-center">
                <span className="text-white font-medium">Total Liquid</span>
                <span className="font-bold text-emerald-400 text-lg">{formatCurrency(totalLiquidAssets)}</span>
              </div>
              {primaryHome && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-steel">Home Equity (non-liquid)</span>
                  <span className="text-muted-steel">{formatCurrency(primaryHomeEquity)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Inputs */}
          <div className="bg-gunmetal/30 rounded-xl border border-gunmetal p-5 space-y-4">
            <h3 className="text-sm font-medium text-muted-steel">Monthly Inputs</h3>

          <div>
              <label className="block text-xs text-muted-steel mb-1">Current Savings</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
              <input
                type="number"
                  value={inputs.currentSavings}
                  onChange={(e) => handleInputChange('currentSavings', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-4 py-2 bg-abyssal-blue border border-gunmetal rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
              />
            </div>
          </div>

          <div>
              <label className="block text-xs text-muted-steel mb-1">Monthly Contribution</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
              <input
                type="number"
                  value={inputs.monthlyContribution}
                  onChange={(e) => handleInputChange('monthlyContribution', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-4 py-2 bg-abyssal-blue border border-gunmetal rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
              />
            </div>
              {netRentalCashflow > 0 && (
                <p className="text-xs text-emerald-400 mt-1">
                  +{formatCurrency(netRentalCashflow)}/mo from rentals
            </p>
              )}
          </div>

          <div>
              <label className="block text-xs text-muted-steel mb-1">Expected Annual Return</label>
              <div className="flex gap-2">
                {[4, 7, 10].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleInputChange('annualReturn', rate)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      inputs.annualReturn === rate
                        ? 'bg-signal-violet text-white'
                        : 'bg-abyssal-blue text-muted-steel hover:text-white border border-gunmetal'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
            </div>
            <p className="text-xs text-muted-steel mt-1">
                {inputs.annualReturn <= 4 ? 'Conservative' : inputs.annualReturn <= 7 ? 'Moderate' : 'Aggressive'}
            </p>
          </div>
        </div>

          {/* Property Quick Access */}
          <div className="bg-gunmetal/30 rounded-xl border border-gunmetal p-5 space-y-3">
            <h3 className="text-sm font-medium text-muted-steel">Properties</h3>
            
            {/* Primary Home */}
            {primaryHome ? (
              <div className="bg-abyssal-blue rounded-lg p-3 border border-gunmetal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>🏠</span>
                    <span className="text-white text-sm font-medium">Primary Home</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">{formatCurrency(primaryHomeEquity)}</span>
                </div>
                <p className="text-xs text-muted-steel mt-1">Equity (non-liquid)</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setPropertyModalType('primary')
                  setShowPropertyModal(true)
                }}
                className="w-full py-3 border-2 border-dashed border-gunmetal rounded-lg text-muted-steel hover:border-signal-violet hover:text-white transition-colors text-sm"
              >
                + Add Primary Home
              </button>
            )}

            {/* Rental Properties */}
            {rentalProperties.length > 0 ? (
              <div className="space-y-2">
                {rentalProperties.map((rental) => (
                  <div key={rental.id} className="bg-abyssal-blue rounded-lg p-3 border border-gunmetal">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span className="text-white text-sm font-medium truncate max-w-32">{rental.address}</span>
                      </div>
                      <span className="text-blue-400 font-semibold">{formatCurrency(rental.currentValue - rental.remainingMortgage)}</span>
            </div>
                    <p className="text-xs text-emerald-400 mt-1">
                      +{formatCurrency(rental.monthlyRentalIncome - rental.monthlyMortgagePayment - rental.monthlyExpenses)}/mo cashflow
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            
            <button
              onClick={() => {
                setPropertyModalType('rental')
                setShowPropertyModal(true)
              }}
              className="w-full py-2 bg-gunmetal hover:bg-gunmetal/80 rounded-lg text-muted-steel hover:text-white transition-colors text-sm"
            >
              + Add Rental Property
            </button>
          </div>

          {/* Stocks */}
          <div className="bg-gunmetal/30 rounded-xl border border-gunmetal p-5 space-y-3">
            <h3 className="text-sm font-medium text-muted-steel">Stocks</h3>
            {stockHoldings.length > 0 ? (
              <div className="space-y-2">
                {stockHoldings.map((stock) => (
                  <div key={stock.id} className="bg-abyssal-blue rounded-lg p-3 border border-gunmetal flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold uppercase tracking-tight">{stock.ticker}</p>
                      <p className="text-xs text-muted-steel">
                        {stock.shares} shares @ {formatCurrency(stock.pricePerShare)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-semibold">{formatCurrency(stock.totalValue)}</span>
                      <button
                        onClick={() => removeStockHolding(stock.id)}
                        className="text-muted-steel hover:text-red-400 transition-colors"
                        aria-label="Remove stock"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-steel">No stocks added yet.</p>
            )}
            <button
              onClick={() => setShowStockModal(true)}
              className="w-full py-2 bg-gunmetal hover:bg-gunmetal/80 rounded-lg text-muted-steel hover:text-white transition-colors text-sm"
            >
              + Add Stock
            </button>
          </div>

          {/* Cash Assets */}
          <div className="bg-gunmetal/30 rounded-xl border border-gunmetal p-5 space-y-3">
            <h3 className="text-sm font-medium text-muted-steel">Cash Assets</h3>
            {cashAssets.length > 0 ? (
              <div className="space-y-2">
                {cashAssets.map((asset) => (
                  <div key={asset.id} className="bg-abyssal-blue rounded-lg p-3 border border-gunmetal flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold capitalize">{asset.type}</p>
                      <p className="text-xs text-muted-steel">{asset.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-semibold">{formatCurrency(asset.value)}</span>
                      <button
                        onClick={() => removeCashAsset(asset.id)}
                        className="text-muted-steel hover:text-red-400 transition-colors"
                        aria-label="Remove cash asset"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-steel">No cash assets added yet.</p>
            )}
            <button
              onClick={() => setShowCashModal(true)}
              className="w-full py-2 bg-gunmetal hover:bg-gunmetal/80 rounded-lg text-muted-steel hover:text-white transition-colors text-sm"
            >
              + Add Cash Asset
            </button>
          </div>
        </div>

        {/* Right Column - Results with Pie Chart */}
        <div className="lg:col-span-2 space-y-6">
          {results && (
            <>
              {/* Main Visualization */}
              <div className="bg-gunmetal/30 rounded-2xl border border-gunmetal p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Pie Chart */}
                  <PieChart
                    projected={results.projectedLiquidAssets}
                    needed={results.totalNeededAtRetirement}
                    percentOnTrack={results.percentOnTrack}
                  />

                  {/* Key Numbers */}
                  <div className="space-y-4">
                    <div className="bg-abyssal-blue rounded-xl p-4 border border-gunmetal">
                      <div className="text-xs text-muted-steel mb-1">Total Needed at Retirement</div>
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(results.totalNeededAtRetirement)}
                      </div>
                      <div className="text-xs text-muted-steel">Based on 4% withdrawal rate</div>
                    </div>

                    <div className="bg-abyssal-blue rounded-xl p-4 border border-gunmetal">
                      <div className="text-xs text-muted-steel mb-1">Projected at Retirement</div>
                      <div className={`text-2xl font-bold ${results.percentOnTrack >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatCurrency(results.projectedLiquidAssets)}
                      </div>
                      <div className="text-xs text-muted-steel">In {results.yearsToRetirement} years</div>
                    </div>

                    {results.gap > 0 && (
                      <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                        <div className="text-xs text-red-300 mb-1">Gap to Target</div>
                        <div className="text-2xl font-bold text-red-400">
                          {formatCurrency(results.gap)}
                        </div>
                      </div>
                  )}
                </div>
                </div>
              </div>

              {/* Monthly Income Projection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 rounded-xl p-5 border border-emerald-500/30">
                  <div className="text-emerald-300 text-sm mb-1">Projected Monthly Income</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {formatCurrency(results.monthlyRetirementIncome)}
                  </div>
                  <div className="text-emerald-300/60 text-xs mt-1">Using 4% rule</div>
                </div>

                <div className={`rounded-xl p-5 border ${
                  results.monthlyRetirementIncome >= onboardingData.desiredMonthlyIncome
                    ? 'bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-blue-500/30'
                    : 'bg-gradient-to-br from-amber-900/30 to-amber-900/10 border-amber-500/30'
                }`}>
                  <div className={`text-sm mb-1 ${
                    results.monthlyRetirementIncome >= onboardingData.desiredMonthlyIncome
                      ? 'text-blue-300' : 'text-amber-300'
                  }`}>Your Goal</div>
                  <div className={`text-3xl font-bold ${
                    results.monthlyRetirementIncome >= onboardingData.desiredMonthlyIncome
                      ? 'text-blue-400' : 'text-amber-400'
                  }`}>
                    {formatCurrency(onboardingData.desiredMonthlyIncome)}
                  </div>
                  <div className={`text-xs mt-1 ${
                    results.monthlyRetirementIncome >= onboardingData.desiredMonthlyIncome
                      ? 'text-blue-300/60' : 'text-amber-300/60'
                  }`}>
                    {results.monthlyRetirementIncome >= onboardingData.desiredMonthlyIncome
                      ? '✓ Goal achieved!' : `${formatCurrency(onboardingData.desiredMonthlyIncome - results.monthlyRetirementIncome)} short`}
                  </div>
                </div>
              </div>

              {/* Guidance */}
              <div className="bg-gunmetal/30 rounded-xl border border-gunmetal p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span>💡</span> Recommendations
                </h3>
                <ul className="space-y-2">
                  {results.guidance.map((tip, idx) => (
                    <li key={idx} className={`text-sm flex items-start gap-2 ${
                      results.percentOnTrack >= 100 ? 'text-emerald-300' : 'text-amber-300'
                    }`}>
                      <span>{results.percentOnTrack >= 100 ? '✓' : '→'}</span>
                    {tip}
                  </li>
                ))}
              </ul>
              </div>

              {/* Calculation Breakdown */}
              <div className="bg-gunmetal/30 rounded-xl border border-gunmetal p-5 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span>🧮</span> How these numbers are calculated
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-steel">
                  <div className="bg-abyssal-blue rounded-lg border border-gunmetal p-3">
                    <p className="text-white font-semibold">Total needed at retirement</p>
                    <p className="mt-1">
                      Your target income is {formatCurrency(onboardingData.desiredMonthlyIncome)} / month today.
                      Adjusted for {inputs.inflationRate}% inflation over {results.yearsToRetirement} years that becomes
                      {` ${formatCurrency(results.futureMonthlyIncome)} / month`} (or {formatCurrency(results.futureAnnualIncome)} per year).
                      Using the 4% rule, you need about {formatCurrency(results.totalNeededAtRetirement)} (25× annual need).
                    </p>
                  </div>

                  <div className="bg-abyssal-blue rounded-lg border border-gunmetal p-3">
                    <p className="text-white font-semibold">Projected at retirement</p>
                    <p className="mt-1">
                      Current liquid assets grow to {formatCurrency(results.futureValueOfSavings)}.
                      Ongoing contributions ({formatCurrency(results.effectiveMonthlyContribution)}/mo incl. rental cashflow)
                      grow to {formatCurrency(results.futureValueOfContributions)}.
                      Combined projection: {formatCurrency(results.projectedLiquidAssets)}.
                    </p>
                  </div>

                  <div className="bg-abyssal-blue rounded-lg border border-gunmetal p-3">
                    <p className="text-white font-semibold">Gap to target</p>
                    <p className="mt-1">
                      Gap = Needed ({formatCurrency(results.totalNeededAtRetirement)}) – Projected ({formatCurrency(results.projectedLiquidAssets)})
                      = {formatCurrency(results.gap)}.
                      Closing this linearly over {results.yearsToRetirement} years is roughly
                      {` ${formatCurrency(results.additionalMonthlyNeeded)} per month`} (before investment growth).
                    </p>
                  </div>

                  <div className="bg-abyssal-blue rounded-lg border border-gunmetal p-3">
                    <p className="text-white font-semibold">Projected monthly income</p>
                    <p className="mt-1">
                      From projected savings, a 4% withdrawal yields
                      {` ${formatCurrency(results.monthlyRetirementIncome)} per month`} ({formatCurrency(results.projectedLiquidAssets)} × 4% ÷ 12).
                      Your goal is {formatCurrency(onboardingData.desiredMonthlyIncome)} / month.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                <p className="text-xs text-amber-200/80">
                  <strong>Disclaimer:</strong> This calculator provides estimates based on your inputs. 
                  Results are for informational purposes only and should not be considered financial advice. 
                  Consult with a qualified financial advisor for personalized recommendations.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <PropertyModal
          type={propertyModalType}
          onClose={() => setShowPropertyModal(false)}
          onSave={(property) => {
            if (propertyModalType === 'primary') {
              setPrimaryHome(property as PrimaryHome)
            } else {
              setRentalProperties(prev => [...prev, property as RentalProperty])
            }
            setShowPropertyModal(false)
          }}
        />
      )}

      {/* Stock Modal */}
      {showStockModal && (
        <StockModal
          onClose={() => setShowStockModal(false)}
          onSave={(stock) => {
            addStockHolding(stock)
            setShowStockModal(false)
          }}
        />
      )}

      {/* Cash Asset Modal */}
      {showCashModal && (
        <CashAssetModal
          onClose={() => setShowCashModal(false)}
          onSave={(asset) => {
            addCashAsset(asset)
            setShowCashModal(false)
          }}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(email, data) => {
            setAuth({ isLoggedIn: true, email, isLoading: false })
            if (data) loadSavedData(data)
            setShowAuthModal(false)
          }}
        />
      )}
    </div>
  )
}

// Property Modal Component
function PropertyModal({
  type,
  onClose,
  onSave,
}: {
  type: 'primary' | 'rental'
  onClose: () => void
  onSave: (property: PrimaryHome | RentalProperty) => void
}) {
  const [formData, setFormData] = useState({
    address: '',
    purchasePrice: 0,
    currentValue: 0,
    remainingMortgage: 0,
    monthlyMortgagePayment: 0,
    yearsLeftToPay: 0,
    monthlyRentalIncome: 0,
    monthlyExpenses: 0,
  })

  const handleSave = () => {
    if (!formData.address.trim()) return

    const baseProperty = {
      id: `${type}-${Date.now()}`,
      address: formData.address,
      purchasePrice: formData.purchasePrice,
      currentValue: formData.currentValue,
      remainingMortgage: formData.remainingMortgage,
      monthlyMortgagePayment: formData.monthlyMortgagePayment,
      yearsLeftToPay: formData.yearsLeftToPay,
    }

    if (type === 'rental') {
      onSave({
        ...baseProperty,
        monthlyRentalIncome: formData.monthlyRentalIncome,
        monthlyExpenses: formData.monthlyExpenses,
      } as RentalProperty)
    } else {
      onSave(baseProperty as PrimaryHome)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-abyssal-blue rounded-2xl border border-gunmetal w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gunmetal">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {type === 'primary' ? '🏠 Add Primary Home' : '🏢 Add Rental Property'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gunmetal rounded-lg transition-colors">
              <svg className="w-5 h-5 text-muted-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {type === 'primary' && (
            <p className="text-sm text-muted-steel mt-2">
              Primary home equity is tracked separately (non-liquid asset)
            </p>
          )}
          {type === 'rental' && (
            <p className="text-sm text-muted-steel mt-2">
              Rental properties count toward your liquid/investment assets
                  </p>
                )}
              </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted-steel mb-1">Property Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St, City, State"
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
            />
          </div>

              <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-steel mb-1">Purchase Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                <input
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-7 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
                />
                  </div>
                </div>

            <div>
              <label className="block text-sm text-muted-steel mb-1">Current Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                <input
                  type="number"
                  value={formData.currentValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-7 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
                />
                  </div>
                  </div>
                </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-steel mb-1">Remaining Mortgage</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                <input
                  type="number"
                  value={formData.remainingMortgage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, remainingMortgage: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-7 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
                />
                  </div>
            </div>

            <div>
              <label className="block text-sm text-muted-steel mb-1">Monthly Payment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                <input
                  type="number"
                  value={formData.monthlyMortgagePayment || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyMortgagePayment: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-7 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
                />
              </div>
                  </div>
                </div>

          <div>
            <label className="block text-sm text-muted-steel mb-1">Years Left to Pay</label>
            <input
              type="number"
              value={formData.yearsLeftToPay || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsLeftToPay: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
            />
                  </div>

          {type === 'rental' && (
            <>
              <div className="pt-4 border-t border-gunmetal">
                <h3 className="text-sm font-medium text-white mb-3">Rental Income</h3>
                  </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-steel mb-1">Monthly Rental Income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                    <input
                      type="number"
                      value={formData.monthlyRentalIncome || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyRentalIncome: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-7 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
                    />
                </div>
              </div>

                <div>
                  <label className="block text-sm text-muted-steel mb-1">Monthly Expenses</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                    <input
                      type="number"
                      value={formData.monthlyExpenses || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyExpenses: parseFloat(e.target.value) || 0 }))}
                      placeholder="taxes, insurance, etc"
                      className="w-full pl-7 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
                    />
                  </div>
                </div>
              </div>

              {formData.monthlyRentalIncome > 0 && (
                <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/30">
                  <div className="text-sm text-emerald-300">
                    Net Monthly Cashflow: <span className="font-bold">
                      {formatCurrency(formData.monthlyRentalIncome - formData.monthlyMortgagePayment - formData.monthlyExpenses)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Equity Preview */}
          {formData.currentValue > 0 && (
            <div className="bg-signal-violet/20 rounded-lg p-3 border border-signal-violet/30">
              <div className="text-sm text-purple-300">
                Estimated Equity: <span className="font-bold text-white">
                  {formatCurrency(Math.max(0, formData.currentValue - formData.remainingMortgage))}
                    </span>
                  </div>
                  </div>
          )}
                </div>

        <div className="p-6 border-t border-gunmetal flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gunmetal hover:bg-gunmetal/80 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.address.trim()}
            className="flex-1 px-4 py-3 bg-signal-violet hover:bg-signal-violet/80 disabled:bg-gunmetal disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Add Property
          </button>
              </div>
      </div>
    </div>
  )
}

// Stock Modal Component
function StockModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (stock: Omit<StockHolding, 'id' | 'totalValue'>) => void
}) {
  const [formData, setFormData] = useState({
    ticker: '',
    shares: 0,
    pricePerShare: 0,
  })

  const handleSave = () => {
    if (!formData.ticker.trim() || formData.shares <= 0 || formData.pricePerShare <= 0) return
    onSave({
      ticker: formData.ticker.trim().toUpperCase(),
      shares: formData.shares,
      pricePerShare: formData.pricePerShare,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-abyssal-blue rounded-2xl border border-gunmetal w-full max-w-md">
        <div className="p-6 border-b border-gunmetal flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">📈 Add Stock</h2>
          <button onClick={onClose} className="p-2 hover:bg-gunmetal rounded-lg transition-colors">
            <svg className="w-5 h-5 text-muted-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted-steel mb-1">Ticker</label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value }))}
              placeholder="AAPL"
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-steel mb-1">Shares</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.shares || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, shares: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-steel mb-1">Price per Share</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerShare || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerShare: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gunmetal flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gunmetal hover:bg-gunmetal/80 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.ticker.trim() || formData.shares <= 0 || formData.pricePerShare <= 0}
            className="flex-1 px-4 py-3 bg-signal-violet hover:bg-signal-violet/80 disabled:bg-gunmetal disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  )
}

// Cash Asset Modal Component
function CashAssetModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (asset: Omit<CashAsset, 'id'>) => void
}) {
  const [formData, setFormData] = useState({
    type: 'bank' as CashAsset['type'],
    description: '',
    value: 0,
  })

  const handleSave = () => {
    if (!formData.description.trim() || formData.value <= 0) return
    onSave({
      type: formData.type,
      description: formData.description.trim(),
      value: formData.value,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-abyssal-blue rounded-2xl border border-gunmetal w-full max-w-md">
        <div className="p-6 border-b border-gunmetal flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">💵 Add Cash Asset</h2>
          <button onClick={onClose} className="p-2 hover:bg-gunmetal rounded-lg transition-colors">
            <svg className="w-5 h-5 text-muted-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted-steel mb-1">Asset Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CashAsset['type'] }))}
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
            >
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
              <option value="gold">Gold</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-steel mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Savings account, money market, etc."
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-steel mb-1">Value</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gunmetal flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gunmetal hover:bg-gunmetal/80 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.description.trim() || formData.value <= 0}
            className="flex-1 px-4 py-3 bg-signal-violet hover:bg-signal-violet/80 disabled:bg-gunmetal disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Add Asset
          </button>
        </div>
      </div>
    </div>
  )
}

// Auth Modal Component
function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (email: string, data?: any) => void
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          name: mode === 'signup' ? name.trim() : undefined,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (data.success) {
        onSuccess(data.user?.email || email, data.data)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-abyssal-blue rounded-2xl border border-gunmetal w-full max-w-md">
        <div className="p-6 border-b border-gunmetal">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? '👋 Welcome Back' : '🚀 Create Account'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gunmetal rounded-lg transition-colors">
              <svg className="w-5 h-5 text-muted-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-muted-steel mt-2">
            {mode === 'login' 
              ? 'Sign in to save and access your retirement plan' 
                  : 'Create an account to save your progress'}
                  </p>
                </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm text-muted-steel mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required={mode === 'signup'}
                className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-muted-steel mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-steel mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
            />
            {mode === 'signup' && (
              <p className="text-xs text-muted-steel mt-1">Minimum 6 characters</p>
            )}
              </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-signal-violet hover:bg-signal-violet/80 disabled:bg-signal-violet/50 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="px-6 pb-6">
          <p className="text-center text-sm text-muted-steel">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
              }}
              className="text-signal-violet hover:text-signal-violet/80"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
