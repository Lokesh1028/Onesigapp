const NewsFeed = () => {
    const news = [
        {
            id: 1,
            title: "NVIDIA Announces Breakthrough in AI Chip Efficiency",
            source: "Bloomberg",
            time: "2m ago",
            sentiment: "bullish",
            tags: ["$NVDA", "AI", "Chips"]
        },
        {
            id: 2,
            title: "Fed Chair Powell Hints at Rate Cuts in Q3",
            source: "Reuters",
            time: "15m ago",
            sentiment: "bullish",
            tags: ["Macro", "Fed", "$SPY"]
        },
        {
            id: 3,
            title: "Tesla Recalls 200k Vehicles Over Autopilot Issue",
            source: "CNBC",
            time: "1h ago",
            sentiment: "bearish",
            tags: ["$TSLA", "EV", "Reg"]
        },
        {
            id: 4,
            title: "Bitcoin ETF Inflows Slow Down This Week",
            source: "CoinDesk",
            time: "2h ago",
            sentiment: "neutral",
            tags: ["$BTC", "Crypto", "ETF"]
        },
        {
            id: 5,
            title: "Apple Vision Pro Sales Exceed Expectations",
            source: "TechCrunch",
            time: "3h ago",
            sentiment: "bullish",
            tags: ["$AAPL", "VR", "Tech"]
        }
    ]

    return (
        <div className="flex flex-col h-full w-full bg-abyssal-blue">
            <div className="p-3 border-b border-gunmetal">
                <h3 className="text-sm font-bold text-muted-steel uppercase tracking-wider">Market News</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {news.map((item) => (
                    <div
                        key={item.id}
                        className="relative bg-gunmetal/20 rounded-lg p-3 hover:bg-gunmetal/40 transition-colors cursor-pointer group border border-transparent hover:border-gunmetal"
                    >
                        {/* Sentiment Stripe */}
                        <div
                            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${item.sentiment === 'bullish' ? 'bg-growth-green' :
                                    item.sentiment === 'bearish' ? 'bg-correction-red' : 'bg-neutral-amber'
                                }`}
                        />

                        <div className="pl-3">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs text-signal-violet font-medium">{item.source}</span>
                                <span className="text-xs text-muted-steel">{item.time}</span>
                            </div>

                            <h4 className="text-sm font-medium text-white leading-snug mb-2 group-hover:text-signal-violet transition-colors">
                                {item.title}
                            </h4>

                            <div className="flex flex-wrap gap-1.5">
                                {item.tags.map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-gunmetal rounded text-[10px] font-mono text-muted-steel border border-gunmetal/50">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NewsFeed
