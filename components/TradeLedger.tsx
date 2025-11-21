const TradeLedger = () => {
    const trades = [
        { id: 'TX-8923', time: '10:42:15', type: 'BUY', price: '543.15', amount: '100', total: '54,315.00' },
        { id: 'TX-8924', time: '10:42:18', type: 'SELL', price: '543.10', amount: '50', total: '27,155.00' },
        { id: 'TX-8925', time: '10:42:22', type: 'BUY', price: '543.20', amount: '200', total: '108,640.00' },
        { id: 'TX-8926', time: '10:42:25', type: 'BUY', price: '543.25', amount: '75', total: '40,743.75' },
        { id: 'TX-8927', time: '10:42:30', type: 'SELL', price: '543.18', amount: '150', total: '81,477.00' },
        { id: 'TX-8928', time: '10:42:35', type: 'BUY', price: '543.22', amount: '300', total: '162,966.00' },
        { id: 'TX-8929', time: '10:42:40', type: 'SELL', price: '543.15', amount: '25', total: '13,578.75' },
    ]

    return (
        <div className="flex flex-col h-full w-full bg-abyssal-blue overflow-hidden">
            <div className="p-3 border-b border-gunmetal flex justify-between items-center">
                <h3 className="text-sm font-bold text-muted-steel uppercase tracking-wider">Recent Trades</h3>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-growth-green animate-pulse" />
                    <span className="text-xs text-growth-green">Live</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-abyssal-blue z-10">
                        <tr className="text-xs text-muted-steel border-b border-gunmetal">
                            <th className="p-3 font-medium">Time</th>
                            <th className="p-3 font-medium">Type</th>
                            <th className="p-3 font-medium text-right">Price</th>
                            <th className="p-3 font-medium text-right">Amount</th>
                            <th className="p-3 font-medium text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {trades.map((trade, i) => (
                            <tr
                                key={trade.id}
                                className={`
                  hover:bg-gunmetal/30 transition-colors cursor-pointer group
                  ${i % 2 === 0 ? 'bg-abyssal-blue' : 'bg-[#1A1C28]'}
                `}
                            >
                                <td className="p-3 text-muted-steel">{trade.time}</td>
                                <td className={`p-3 font-bold ${trade.type === 'BUY' ? 'text-growth-green' : 'text-correction-red'}`}>
                                    {trade.type}
                                </td>
                                <td className="p-3 text-right text-white">{trade.price}</td>
                                <td className="p-3 text-right text-white">{trade.amount}</td>
                                <td className="p-3 text-right text-muted-steel group-hover:text-white">{trade.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TradeLedger
