const MarketPulse = () => {
    return (
        <header className="h-16 border-b border-gunmetal bg-void-black/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Ticker - Simplified for now */}
            <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap mask-linear-fade flex-1 mr-8">
                <TickerItem symbol="SPX" price="4,783.45" change="+0.45%" isPositive />
                <TickerItem symbol="NDX" price="16,832.92" change="+0.12%" isPositive />
                <TickerItem symbol="BTC" price="43,291.00" change="-1.23%" isPositive={false} />
                <TickerItem symbol="ETH" price="2,314.50" change="-0.85%" isPositive={false} />
                <TickerItem symbol="NVDA" price="543.20" change="+2.30%" isPositive />
                <TickerItem symbol="TSLA" price="215.55" change="-3.10%" isPositive={false} />
            </div>

            {/* Command Palette Trigger */}
            <button className="flex items-center gap-3 px-4 py-2 bg-gunmetal/30 border border-gunmetal rounded-lg text-muted-steel hover:text-white hover:border-signal-violet/50 transition-all group min-w-[240px]">
                <SearchIcon />
                <span className="text-sm">Search assets...</span>
                <span className="ml-auto text-xs bg-gunmetal px-1.5 py-0.5 rounded text-muted-steel group-hover:text-white">⌘K</span>
            </button>
        </header>
    )
}

const TickerItem = ({ symbol, price, change, isPositive }: { symbol: string; price: string; change: string; isPositive: boolean }) => (
    <div className="flex items-center gap-2 font-mono text-sm">
        <span className="font-bold text-muted-steel">{symbol}</span>
        <span className="text-white">{price}</span>
        <span className={isPositive ? 'text-growth-green' : 'text-correction-red'}>{change}</span>
    </div>
)

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)

export default MarketPulse
