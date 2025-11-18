/**
 * Utility functions for fetching company logos
 */

// Map of stock symbols to their company domains for Clearbit Logo API
const COMPANY_DOMAINS: Record<string, string> = {
  // Tech Giants
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  GOOGL: 'google.com',
  AMZN: 'amazon.com',
  NVDA: 'nvidia.com',
  META: 'meta.com',
  TSLA: 'tesla.com',
  NFLX: 'netflix.com',
  ADBE: 'adobe.com',
  CRM: 'salesforce.com',
  AVGO: 'broadcom.com',
  
  // Finance
  'BRK.B': 'berkshirehathaway.com',
  JPM: 'jpmorganchase.com',
  BAC: 'bankofamerica.com',
  V: 'visa.com',
  MA: 'mastercard.com',
  
  // Healthcare
  UNH: 'unitedhealthgroup.com',
  JNJ: 'jnj.com',
  ABBV: 'abbvie.com',
  PFE: 'pfizer.com',
  TMO: 'thermofisher.com',
  ABT: 'abbott.com',
  LLY: 'lilly.com',
  DHR: 'danaher.com',
  
  // Consumer
  WMT: 'walmart.com',
  COST: 'costco.com',
  HD: 'homedepot.com',
  NKE: 'nike.com',
  PG: 'pg.com',
  DIS: 'thewaltdisneycompany.com',
  
  // Energy
  XOM: 'exxonmobil.com',
  CVX: 'chevron.com',
  NEE: 'nexteraenergy.com',
  
  // Other
  ACN: 'accenture.com',
  VZ: 'verizon.com',
  CMCSA: 'comcast.com',
  LIN: 'linde.com',
  
  // Additional tech
  AMD: 'amd.com',
  INTC: 'intel.com',
  QCOM: 'qualcomm.com',
  ORCL: 'oracle.com',
  CSCO: 'cisco.com',
  IBM: 'ibm.com',
  
  // Additional finance
  GS: 'goldmansachs.com',
  MS: 'morganstanley.com',
  WFC: 'wellsfargo.com',
  C: 'citigroup.com',
  
  // Additional consumer
  TGT: 'target.com',
  LOW: 'lowes.com',
  SBUX: 'starbucks.com',
  MCD: 'mcdonalds.com',
}

/**
 * Get logo URL for a stock symbol
 * Uses Clearbit Logo API (free, no API key required)
 */
export function getCompanyLogoUrl(symbol: string): string {
  const domain = COMPANY_DOMAINS[symbol.toUpperCase()]
  
  if (domain) {
    return `https://logo.clearbit.com/${domain}`
  }
  
  // Fallback: try to construct domain from symbol (may not always work)
  // For unknown symbols, return a placeholder
  return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`
}

/**
 * Get company domain for a stock symbol
 */
export function getCompanyDomain(symbol: string): string | null {
  return COMPANY_DOMAINS[symbol.toUpperCase()] || null
}

/**
 * Check if we have a known domain for a symbol
 */
export function hasKnownLogo(symbol: string): boolean {
  return symbol.toUpperCase() in COMPANY_DOMAINS
}

