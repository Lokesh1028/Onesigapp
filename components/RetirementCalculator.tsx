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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Retirement Calculator
        </h2>
        <p className="text-gray-600">
          Calculate your path to financial freedom and determine when you can
          retire comfortably
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Your Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Savings
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                className="input-field pl-8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                className="input-field pl-8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="input-field"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Historical S&P 500 average: ~10% (use 7% for conservative)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Expenses in Retirement
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                className="input-field pl-8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="input-field"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Historical average: ~3%
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Your Retirement Projection
          </h3>

          {results && (
            <>
              {/* FIRE Status */}
              <div
                className={`rounded-lg p-4 border-2 ${
                  results.canRetire
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
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
                  <p className="text-sm text-gray-700">
                    You're projected to reach your FIRE number by retirement
                    age!
                  </p>
                ) : (
                  <p className="text-sm text-gray-700">
                    You'll need {formatCurrency(results.shortfall)} more to
                    reach financial freedom.
                  </p>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    Years to Retirement
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {results.yearsToRetirement}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-xs text-purple-600 font-medium mb-1">
                    FIRE Number
                  </div>
                  <div className="text-lg font-bold text-purple-900">
                    {formatCurrency(results.fireNumber)}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-xs text-green-600 font-medium mb-1">
                    Projected Savings
                  </div>
                  <div className="text-lg font-bold text-green-900">
                    {formatCurrency(results.projectedSavings)}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-xs text-orange-600 font-medium mb-1">
                    Monthly Income
                  </div>
                  <div className="text-lg font-bold text-orange-900">
                    {formatCurrency(results.monthlyRetirementIncome)}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Contributions:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(results.totalContributions)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth from Returns:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(
                        results.projectedSavings -
                          inputs.currentSavings -
                          results.totalContributions
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-semibold">
                      Projected Total:
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(results.projectedSavings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* FIRE Timeline */}
              {!results.canRetire && results.yearsUntilFire < results.yearsToRetirement && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🎯 FIRE Timeline
                  </h4>
                  <p className="text-sm text-gray-700">
                    At your current savings rate, you could reach financial
                    freedom in approximately{' '}
                    <span className="font-bold text-indigo-900">
                      {results.yearsUntilFire} years
                    </span>{' '}
                    (age {inputs.currentAge + results.yearsUntilFire}).
                  </p>
                </div>
              )}

              {/* Insights */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Insights</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>
                    • Your monthly retirement income would be{' '}
                    <span className="font-semibold">
                      {formatCurrency(results.monthlyRetirementIncome)}
                    </span>{' '}
                    (using the 4% rule)
                  </li>
                  {results.monthlyRetirementIncome < inputs.monthlyExpenses && (
                    <li className="text-orange-700">
                      • Consider increasing contributions or adjusting retirement
                      age to meet your expense goals
                    </li>
                  )}
                  {results.monthlyRetirementIncome >= inputs.monthlyExpenses && (
                    <li className="text-green-700">
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

