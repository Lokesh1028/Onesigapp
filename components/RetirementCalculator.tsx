'use client'

import { useState, useEffect } from 'react'

interface CalculatorInputs {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyContribution: number
  annualReturn: number
  monthlyExpenses: number
  inflationRate: number
}

interface CalculatorResults {
  yearsToRetirement: number
  totalContributions: number
  projectedSavings: number
  fireNumber: number
  monthlyRetirementIncome: number
  canRetire: boolean
  shortfall: number
  yearsUntilFire: number
}

export default function RetirementCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    annualReturn: 7,
    monthlyExpenses: 5000,
    inflationRate: 3,
  })

  const [results, setResults] = useState<CalculatorResults | null>(null)

  useEffect(() => {
    calculateRetirement()
  }, [inputs])

  const calculateRetirement = () => {
    const {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      annualReturn,
      monthlyExpenses,
      inflationRate,
    } = inputs

    const yearsToRetirement = retirementAge - currentAge
    const monthsToRetirement = yearsToRetirement * 12

    // Calculate future value of current savings
    const monthlyReturnRate = annualReturn / 100 / 12
    const futureValueOfCurrentSavings =
      currentSavings * Math.pow(1 + annualReturn / 100, yearsToRetirement)

    // Calculate future value of monthly contributions (annuity)
    let futureValueOfContributions = 0
    if (monthlyReturnRate > 0) {
      futureValueOfContributions =
        monthlyContribution *
        ((Math.pow(1 + monthlyReturnRate, monthsToRetirement) - 1) /
          monthlyReturnRate)
    } else {
      futureValueOfContributions = monthlyContribution * monthsToRetirement
    }

    const projectedSavings =
      futureValueOfCurrentSavings + futureValueOfContributions

    // Calculate FIRE number (25x annual expenses using 4% rule)
    const annualExpenses = monthlyExpenses * 12
    const fireNumber = annualExpenses * 25

    // Adjust for inflation
    const futureAnnualExpenses =
      annualExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement)
    const adjustedFireNumber = futureAnnualExpenses * 25

    // Calculate monthly retirement income (4% rule)
    const monthlyRetirementIncome = (projectedSavings * 0.04) / 12

    // Check if can retire
    const canRetire = projectedSavings >= adjustedFireNumber
    const shortfall = Math.max(0, adjustedFireNumber - projectedSavings)

    // Calculate years until FIRE (if not already there)
    let yearsUntilFire = yearsToRetirement
    if (!canRetire && monthlyContribution > 0) {
      // Iterative calculation to find FIRE date
      let testSavings = currentSavings
      let testYears = 0
      const targetFire = adjustedFireNumber

      while (testSavings < targetFire && testYears < 100) {
        testSavings =
          testSavings * (1 + annualReturn / 100) +
          monthlyContribution * 12
        testYears++

        // Recalculate target with inflation
        const newTargetFire =
          annualExpenses *
          Math.pow(1 + inflationRate / 100, testYears) *
          25

        if (testSavings >= newTargetFire) {
          break
        }
      }

      yearsUntilFire = testYears
    }

    setResults({
      yearsToRetirement,
      totalContributions: monthlyContribution * monthsToRetirement,
      projectedSavings,
      fireNumber: adjustedFireNumber,
      monthlyRetirementIncome,
      canRetire,
      shortfall,
      yearsUntilFire: Math.min(yearsUntilFire, yearsToRetirement),
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-yellow-800">Financial Planning Tool</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This calculator provides estimates based on your inputs and assumptions. Results are for informational purposes only and should not be considered financial advice. Consult with a qualified financial advisor for personalized recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-gunmetal pb-2">
            Your Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-muted-steel mb-2">
              Current Age
            </label>
            <input
              type="number"
              min="18"
              max="100"
              value={inputs.currentAge}
              onChange={(e) =>
                handleInputChange('currentAge', parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-steel mb-2">
              Desired Retirement Age
            </label>
            <input
              type="number"
              min={inputs.currentAge}
              max="100"
              value={inputs.retirementAge}
              onChange={(e) =>
                handleInputChange(
                  'retirementAge',
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-steel mb-2">
              Current Savings
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-steel">
                $
              </span>
              <input
                type="number"
                min="0"
                value={inputs.currentSavings}
                onChange={(e) =>
                  handleInputChange(
                    'currentSavings',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full pl-8 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-steel mb-2">
              Monthly Contribution
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-steel">
                $
              </span>
              <input
                type="number"
                min="0"
                value={inputs.monthlyContribution}
                onChange={(e) =>
                  handleInputChange(
                    'monthlyContribution',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full pl-8 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-steel mb-2">
              Expected Annual Return (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={inputs.annualReturn}
                onChange={(e) =>
                  handleInputChange(
                    'annualReturn',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent transition-colors"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-steel">
                %
              </span>
            </div>
            <p className="text-xs text-muted-steel mt-1">
              Historical S&P 500 average: ~10% (use 7% for conservative)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-steel mb-2">
              Monthly Expenses in Retirement
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-steel">
                $
              </span>
              <input
                type="number"
                min="0"
                value={inputs.monthlyExpenses}
                onChange={(e) =>
                  handleInputChange(
                    'monthlyExpenses',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full pl-8 pr-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-steel mb-2">
              Expected Inflation Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={inputs.inflationRate}
                onChange={(e) =>
                  handleInputChange(
                    'inflationRate',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-4 py-3 bg-gunmetal border border-gray-600 rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent transition-colors"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-steel">
                %
              </span>
            </div>
            <p className="text-xs text-muted-steel mt-1">
              Historical average: ~3%
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-gunmetal pb-2">
            Your Retirement Projection
          </h3>

          {results && (
            <>
              {/* FIRE Status */}
              <div
                className={`rounded-lg p-4 border-2 ${
                  results.canRetire
                    ? 'bg-green-900/20 border-green-500/50'
                    : 'bg-yellow-900/20 border-yellow-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">
                    Financial Freedom Status
                  </span>
                  {results.canRetire ? (
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                      ✓ On Track
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded-full">
                      Needs Work
                    </span>
                  )}
                </div>
                {results.canRetire ? (
                  <p className="text-sm text-green-100">
                    You're projected to reach your FIRE number by retirement
                    age!
                  </p>
                ) : (
                  <p className="text-sm text-yellow-100">
                    You'll need {formatCurrency(results.shortfall)} more to
                    reach financial freedom.
                  </p>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="text-xs text-blue-300 font-medium mb-1">
                    Years to Retirement
                  </div>
                  <div className="text-2xl font-bold text-blue-100">
                    {results.yearsToRetirement}
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-xs text-purple-300 font-medium mb-1">
                    FIRE Number
                  </div>
                  <div className="text-lg font-bold text-purple-100">
                    {formatCurrency(results.fireNumber)}
                  </div>
                </div>

                <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-xs text-green-300 font-medium mb-1">
                    Projected Savings
                  </div>
                  <div className="text-lg font-bold text-green-100">
                    {formatCurrency(results.projectedSavings)}
                  </div>
                </div>

                <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
                  <div className="text-xs text-orange-300 font-medium mb-1">
                    Monthly Income
                  </div>
                  <div className="text-lg font-bold text-orange-100">
                    {formatCurrency(results.monthlyRetirementIncome)}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-gunmetal/50 rounded-lg p-4 border border-gunmetal">
                <h4 className="font-semibold text-white mb-3">
                  Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-steel">Total Contributions:</span>
                    <span className="font-medium text-white">
                      {formatCurrency(results.totalContributions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-steel">Growth from Returns:</span>
                    <span className="font-medium text-white">
                      {formatCurrency(
                        results.projectedSavings -
                          inputs.currentSavings -
                          results.totalContributions
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gunmetal">
                    <span className="text-white font-semibold">
                      Projected Total:
                    </span>
                    <span className="font-bold text-white">
                      {formatCurrency(results.projectedSavings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* FIRE Timeline */}
              {!results.canRetire && results.yearsUntilFire < results.yearsToRetirement && (
                <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                  <h4 className="font-semibold text-white mb-2">
                    🎯 FIRE Timeline
                  </h4>
                  <p className="text-sm text-indigo-100">
                    At your current savings rate, you could reach financial
                    freedom in approximately{' '}
                    <span className="font-bold text-indigo-200">
                      {results.yearsUntilFire} years
                    </span>{' '}
                    (age {inputs.currentAge + results.yearsUntilFire}).
                  </p>
                </div>
              )}

              {/* Insights */}
              <div className="bg-gunmetal/50 rounded-lg p-4 border border-gunmetal">
                <h4 className="font-semibold text-white mb-2">💡 Insights</h4>
                <ul className="space-y-1 text-sm">
                  <li className="text-muted-steel">
                    • Your monthly retirement income would be{' '}
                    <span className="font-semibold text-white">
                      {formatCurrency(results.monthlyRetirementIncome)}
                    </span>{' '}
                    (using the 4% rule)
                  </li>
                  {results.monthlyRetirementIncome < inputs.monthlyExpenses && (
                    <li className="text-orange-300">
                      • Consider increasing contributions or adjusting retirement
                      age to meet your expense goals
                    </li>
                  )}
                  {results.monthlyRetirementIncome >= inputs.monthlyExpenses && (
                    <li className="text-green-300">
                      • Your projected income covers your expected expenses!
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

