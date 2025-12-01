'use client'

import { useState, useEffect } from 'react'

// Popular stocks list for stock portfolio
const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
  'UNH', 'JNJ', 'V', 'WMT', 'JPM', 'MA', 'PG', 'HD', 'DIS', 'BAC',
  'XOM', 'CVX', 'ABBV', 'PFE', 'AVGO', 'COST', 'NFLX', 'ADBE', 'CRM',
  'NKE', 'TMO', 'ABT', 'LLY', 'DHR', 'ACN', 'VZ', 'CMCSA', 'NEE', 'LIN',
  'AMD', 'INTC', 'QCOM', 'PYPL', 'SQ', 'SHOP', 'UBER', 'LYFT', 'SNAP', 'PINS'
]

interface Property {
  id: string
  address: string
  estimatedValue: number
}

interface StockHolding {
  id: string
  ticker: string
  shares: number
  purchasePrice: number
  currentPrice?: number
  totalValue: number
}

interface PhysicalAsset {
  id: string
  type: 'bank' | 'cash' | 'gold' | 'other'
  description: string
  value: number
}

interface CurrentSavingsManagerProps {
  isOpen: boolean
  onClose: () => void
  onSavingsUpdate: (totalSavings: number) => void
  initialSavings?: number
}

export default function CurrentSavingsManager({
  isOpen,
  onClose,
  onSavingsUpdate,
  initialSavings = 0,
}: CurrentSavingsManagerProps) {
  // Properties State
  const [properties, setProperties] = useState<Property[]>([])
  const [newPropertyAddress, setNewPropertyAddress] = useState('')
  const [newPropertyValue, setNewPropertyValue] = useState<number>(0)

  // Stock Portfolio State
  const [stockHoldings, setStockHoldings] = useState<StockHolding[]>([])
  const [selectedStock, setSelectedStock] = useState('')
  const [stockShares, setStockShares] = useState<number>(0)
  const [stockPurchasePrice, setStockPurchasePrice] = useState<number>(0)
  const [stockSearchQuery, setStockSearchQuery] = useState('')
  const [showStockDropdown, setShowStockDropdown] = useState(false)

  // Physical Assets State
  const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>([])
  const [newAssetType, setNewAssetType] = useState<'bank' | 'cash' | 'gold' | 'other'>('bank')
  const [newAssetDescription, setNewAssetDescription] = useState('')
  const [newAssetValue, setNewAssetValue] = useState<number>(0)

  // Active Tab
  const [activeTab, setActiveTab] = useState<'properties' | 'stocks' | 'assets'>('properties')


  // Calculate totals
  const propertyTotal = properties.reduce((sum, p) => sum + p.estimatedValue, 0)
  const stockTotal = stockHoldings.reduce((sum, s) => sum + s.totalValue, 0)
  const assetTotal = physicalAssets.reduce((sum, a) => sum + a.value, 0)
  const grandTotal = propertyTotal + stockTotal + assetTotal

  // Update parent when totals change
  useEffect(() => {
    onSavingsUpdate(grandTotal)
  }, [grandTotal, onSavingsUpdate])

  // Filter stocks based on search
  const filteredStocks = POPULAR_STOCKS.filter(
    stock => stock.toLowerCase().includes(stockSearchQuery.toLowerCase()) &&
    !stockHoldings.find(h => h.ticker === stock)
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Property Functions
  const addProperty = () => {
    if (!newPropertyAddress.trim()) return

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      address: newPropertyAddress,
      estimatedValue: newPropertyValue || 0,
    }
    setProperties(prev => [...prev, newProperty])
    setNewPropertyAddress('')
    setNewPropertyValue(0)
  }

  const updatePropertyValue = (id: string, value: number) => {
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, estimatedValue: value } : p))
    )
  }

  const removeProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  // Stock Functions
  const addStockHolding = () => {
    if (!selectedStock || stockShares <= 0 || stockPurchasePrice <= 0) return

    const newHolding: StockHolding = {
      id: `stock-${Date.now()}`,
      ticker: selectedStock,
      shares: stockShares,
      purchasePrice: stockPurchasePrice,
      totalValue: stockShares * stockPurchasePrice,
    }

    setStockHoldings(prev => [...prev, newHolding])
    setSelectedStock('')
    setStockShares(0)
    setStockPurchasePrice(0)
    setStockSearchQuery('')
  }

  const removeStockHolding = (id: string) => {
    setStockHoldings(prev => prev.filter(s => s.id !== id))
  }

  // Physical Asset Functions
  const addPhysicalAsset = () => {
    if (!newAssetDescription.trim() || newAssetValue <= 0) return

    const newAsset: PhysicalAsset = {
      id: `asset-${Date.now()}`,
      type: newAssetType,
      description: newAssetDescription,
      value: newAssetValue,
    }

    setPhysicalAssets(prev => [...prev, newAsset])
    setNewAssetDescription('')
    setNewAssetValue(0)
  }

  const removePhysicalAsset = (id: string) => {
    setPhysicalAssets(prev => prev.filter(a => a.id !== id))
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      case 'cash':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'gold':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-abyssal-blue rounded-2xl border border-gunmetal w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-signal-violet/20 to-data-blue/20 p-6 border-b border-gunmetal">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">💰</span>
                Current Savings Manager
              </h2>
              <p className="text-muted-steel mt-1">
                Track all your assets in one place
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gunmetal rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-muted-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Total Summary */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-500/30">
              <div className="text-emerald-300 text-xs font-medium mb-1">🏠 Properties</div>
              <div className="text-xl font-bold text-emerald-100">{formatCurrency(propertyTotal)}</div>
            </div>
            <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
              <div className="text-blue-300 text-xs font-medium mb-1">📈 Stocks</div>
              <div className="text-xl font-bold text-blue-100">{formatCurrency(stockTotal)}</div>
            </div>
            <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-500/30">
              <div className="text-amber-300 text-xs font-medium mb-1">💵 Cash & Assets</div>
              <div className="text-xl font-bold text-amber-100">{formatCurrency(assetTotal)}</div>
            </div>
            <div className="bg-signal-violet/30 rounded-xl p-4 border border-signal-violet/50">
              <div className="text-purple-300 text-xs font-medium mb-1">🎯 Total Savings</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(grandTotal)}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gunmetal">
          {[
            { id: 'properties', label: 'Properties', icon: '🏠', count: properties.length },
            { id: 'stocks', label: 'Stock Portfolio', icon: '📈', count: stockHoldings.length },
            { id: 'assets', label: 'Cash & Assets', icon: '💵', count: physicalAssets.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gunmetal/50 text-white border-b-2 border-signal-violet'
                  : 'text-muted-steel hover:text-white hover:bg-gunmetal/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-signal-violet/50 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-320px)]">
          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              {/* Add Property Form */}
              <div className="bg-gunmetal/30 rounded-xl p-5 border border-gunmetal">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🏠</span> Add Property
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newPropertyAddress}
                    onChange={(e) => setNewPropertyAddress(e.target.value)}
                    placeholder="Property address or description (e.g., 123 Main St, City, State)"
                    className="w-full px-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                        <input
                          type="number"
                          value={newPropertyValue || ''}
                          onChange={(e) => setNewPropertyValue(Number(e.target.value))}
                          placeholder="Property value"
                          className="w-full pl-8 pr-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet focus:border-transparent"
                          onKeyDown={(e) => e.key === 'Enter' && addProperty()}
                        />
                      </div>
                    </div>
                    <button
                      onClick={addProperty}
                      disabled={!newPropertyAddress.trim()}
                      className="px-6 py-3 bg-signal-violet hover:bg-signal-violet/80 disabled:bg-gunmetal disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Property
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-steel mt-3">
                  Enter your property address and estimated market value.
                </p>
              </div>

              {/* Properties List */}
              {properties.length === 0 ? (
                <div className="text-center py-12 text-muted-steel">
                  <div className="text-5xl mb-4">🏡</div>
                  <p className="text-lg">No properties added yet</p>
                  <p className="text-sm mt-1">Add your properties with their estimated values above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="bg-gunmetal/30 rounded-xl p-5 border border-gunmetal hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🏠</span>
                            <h4 className="font-semibold text-white">{property.address}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-muted-steel mb-1">Property Value</div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                              <input
                                type="number"
                                value={property.estimatedValue}
                                onChange={(e) => updatePropertyValue(property.id, parseFloat(e.target.value) || 0)}
                                className="w-40 pl-7 pr-3 py-2 bg-abyssal-blue border border-gunmetal rounded-lg text-white text-right font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeProperty(property.id)}
                            className="p-2 text-correction-red hover:bg-correction-red/20 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stocks Tab */}
          {activeTab === 'stocks' && (
            <div className="space-y-6">
              {/* Add Stock Form */}
              <div className="bg-gunmetal/30 rounded-xl p-5 border border-gunmetal">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📈</span> Add Stock Holding
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Stock Selector */}
                  <div className="relative">
                    <label className="block text-sm text-muted-steel mb-2">Stock Symbol</label>
                    <input
                      type="text"
                      value={stockSearchQuery || selectedStock}
                      onChange={(e) => {
                        setStockSearchQuery(e.target.value.toUpperCase())
                        setSelectedStock('')
                        setShowStockDropdown(true)
                      }}
                      onFocus={() => setShowStockDropdown(true)}
                      placeholder="Search stocks..."
                      className="w-full px-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
                    />
                    {showStockDropdown && stockSearchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-abyssal-blue border border-gunmetal rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredStocks.slice(0, 10).map((stock) => (
                          <button
                            key={stock}
                            onClick={() => {
                              setSelectedStock(stock)
                              setStockSearchQuery('')
                              setShowStockDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gunmetal transition-colors"
                          >
                            {stock}
                          </button>
                        ))}
                        {filteredStocks.length === 0 && (
                          <div className="px-4 py-2 text-muted-steel">No stocks found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Number of Shares */}
                  <div>
                    <label className="block text-sm text-muted-steel mb-2">Number of Shares</label>
                    <input
                      type="number"
                      value={stockShares || ''}
                      onChange={(e) => setStockShares(parseFloat(e.target.value) || 0)}
                      placeholder="100"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
                    />
                  </div>

                  {/* Purchase Price per Share */}
                  <div>
                    <label className="block text-sm text-muted-steel mb-2">Price per Share</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                      <input
                        type="number"
                        value={stockPurchasePrice || ''}
                        onChange={(e) => setStockPurchasePrice(parseFloat(e.target.value) || 0)}
                        placeholder="150.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-7 pr-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
                      />
                    </div>
                  </div>

                  {/* Add Button */}
                  <div className="flex items-end">
                    <button
                      onClick={addStockHolding}
                      disabled={!selectedStock || stockShares <= 0 || stockPurchasePrice <= 0}
                      className="w-full px-6 py-3 bg-data-blue hover:bg-data-blue/80 disabled:bg-gunmetal disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                      Add Stock
                    </button>
                  </div>
                </div>
                {selectedStock && stockShares > 0 && stockPurchasePrice > 0 && (
                  <div className="mt-3 text-sm text-muted-steel">
                    Total investment: <span className="text-white font-semibold">{formatCurrency(stockShares * stockPurchasePrice)}</span>
                  </div>
                )}
              </div>

              {/* Stock Holdings List */}
              {stockHoldings.length === 0 ? (
                <div className="text-center py-12 text-muted-steel">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-lg">No stock holdings added yet</p>
                  <p className="text-sm mt-1">Add your stock investments to track your portfolio</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-4 px-5 text-xs font-medium text-muted-steel uppercase">
                    <div>Symbol</div>
                    <div className="text-right">Shares</div>
                    <div className="text-right">Price/Share</div>
                    <div className="text-right">Total Value</div>
                    <div></div>
                  </div>
                  {stockHoldings.map((holding) => (
                    <div
                      key={holding.id}
                      className="grid grid-cols-5 gap-4 items-center bg-gunmetal/30 rounded-xl px-5 py-4 border border-gunmetal hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📈</span>
                        <span className="font-bold text-white">{holding.ticker}</span>
                      </div>
                      <div className="text-right text-white">{holding.shares.toLocaleString()}</div>
                      <div className="text-right text-white">{formatCurrency(holding.purchasePrice)}</div>
                      <div className="text-right text-lg font-bold text-blue-300">{formatCurrency(holding.totalValue)}</div>
                      <div className="text-right">
                        <button
                          onClick={() => removeStockHolding(holding.id)}
                          className="p-2 text-correction-red hover:bg-correction-red/20 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Physical Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              {/* Add Asset Form */}
              <div className="bg-gunmetal/30 rounded-xl p-5 border border-gunmetal">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💵</span> Add Cash or Physical Asset
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Asset Type */}
                  <div>
                    <label className="block text-sm text-muted-steel mb-2">Asset Type</label>
                    <select
                      value={newAssetType}
                      onChange={(e) => setNewAssetType(e.target.value as typeof newAssetType)}
                      className="w-full px-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-signal-violet"
                    >
                      <option value="bank">🏦 Bank Account</option>
                      <option value="cash">💵 Cash</option>
                      <option value="gold">🥇 Gold/Precious Metals</option>
                      <option value="other">💰 Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-muted-steel mb-2">Description</label>
                    <input
                      type="text"
                      value={newAssetDescription}
                      onChange={(e) => setNewAssetDescription(e.target.value)}
                      placeholder="e.g., Chase Checking Account"
                      className="w-full px-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
                    />
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm text-muted-steel mb-2">Value</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel">$</span>
                      <input
                        type="number"
                        value={newAssetValue || ''}
                        onChange={(e) => setNewAssetValue(parseFloat(e.target.value) || 0)}
                        placeholder="10000"
                        min="0"
                        className="w-full pl-7 pr-4 py-3 bg-abyssal-blue border border-gunmetal rounded-lg text-white placeholder-muted-steel focus:outline-none focus:ring-2 focus:ring-signal-violet"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={addPhysicalAsset}
                    disabled={!newAssetDescription.trim() || newAssetValue <= 0}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-600/80 disabled:bg-gunmetal disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    Add Asset
                  </button>
                </div>
              </div>

              {/* Assets List */}
              {physicalAssets.length === 0 ? (
                <div className="text-center py-12 text-muted-steel">
                  <div className="text-5xl mb-4">💰</div>
                  <p className="text-lg">No cash or physical assets added yet</p>
                  <p className="text-sm mt-1">Add your bank accounts, cash, gold, or other assets</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {physicalAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between bg-gunmetal/30 rounded-xl px-5 py-4 border border-gunmetal hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          asset.type === 'bank' ? 'bg-blue-600/20 text-blue-400' :
                          asset.type === 'cash' ? 'bg-green-600/20 text-green-400' :
                          asset.type === 'gold' ? 'bg-amber-600/20 text-amber-400' :
                          'bg-purple-600/20 text-purple-400'
                        }`}>
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{asset.description}</div>
                          <div className="text-sm text-muted-steel capitalize">{asset.type === 'gold' ? 'Gold/Precious Metals' : asset.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold text-amber-300">{formatCurrency(asset.value)}</div>
                        <button
                          onClick={() => removePhysicalAsset(asset.id)}
                          className="p-2 text-correction-red hover:bg-correction-red/20 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gunmetal bg-gunmetal/30 p-4 flex items-center justify-between">
          <div className="text-muted-steel">
            All values are synced to your retirement calculator
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-signal-violet hover:bg-signal-violet/80 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}



