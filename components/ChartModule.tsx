const ChartModule = () => {
    return (
        <div className="flex flex-col h-full w-full bg-abyssal-blue relative">
            {/* Chart Header */}
            <div className="flex items-center justify-between p-4 border-b border-gunmetal">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold">NVDA</div>
                        <div>
                            <div className="font-bold text-lg">NVIDIA Corp</div>
                            <div className="text-xs text-muted-steel">NASDAQ</div>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gunmetal mx-2" />
                    <div>
                        <div className="font-mono text-xl font-bold text-growth-green">$543.20</div>
                        <div className="text-xs font-mono text-growth-green flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +2.30%
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
                        <button
                            key={tf}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${tf === '1D' ? 'bg-signal-violet text-white' : 'text-muted-steel hover:text-white hover:bg-gunmetal'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Canvas Area (Mock) */}
            <div className="flex-1 relative p-4 overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="border-r border-b border-gunmetal/20" />
                    ))}
                </div>

                {/* Mock Chart Line */}
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00E396" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#00E396" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,200 Q100,150 200,180 T400,120 T600,160 T800,100 T1000,140 V300 H0 Z"
                        fill="url(#chartGradient)"
                    />
                    <path
                        d="M0,200 Q100,150 200,180 T400,120 T600,160 T800,100 T1000,140"
                        fill="none"
                        stroke="#00E396"
                        strokeWidth="2"
                    />
                </svg>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <h1 className="text-9xl font-bold tracking-tighter">OneSig</h1>
                </div>
            </div>
        </div>
    )
}

export default ChartModule
