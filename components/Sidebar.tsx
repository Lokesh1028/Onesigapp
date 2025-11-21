import Link from 'next/link'

const Sidebar = () => {
    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-panel border-r border-gunmetal z-50">
            <div className="p-6 border-b border-gunmetal">
                <h1 className="text-2xl font-bold tracking-tighter text-white">
                    One<span className="text-signal-violet">Sig</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-steel uppercase tracking-wider mb-4 px-2">
                    Market Pulse
                </div>

                <NavLink href="/" icon={<ChartIcon />} label="Dashboard" active />
                <NavLink href="/insider-trades" icon={<UserIcon />} label="Insider Trades" />
                <NavLink href="/senate-trades" icon={<BuildingIcon />} label="Senate Trades" />
                <NavLink href="/reddit-sentiment" icon={<TrendingIcon />} label="WallStreetBets" />

                <div className="my-6 border-t border-gunmetal" />

                <div className="text-xs font-semibold text-muted-steel uppercase tracking-wider mb-4 px-2">
                    Account
                </div>
                <NavLink href="/settings" icon={<CogIcon />} label="Settings" />
            </nav>

            <div className="p-4 border-t border-gunmetal">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gunmetal/50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-signal-violet to-data-blue" />
                    <div>
                        <div className="text-sm font-medium text-white">Trader</div>
                        <div className="text-xs text-muted-steel">Free Plan</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

const NavLink = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${active
                ? 'bg-signal-violet/10 text-signal-violet border border-signal-violet/20'
                : 'text-muted-steel hover:text-white hover:bg-gunmetal/30'
            }`}
    >
        <span className={`${active ? 'text-signal-violet' : 'text-muted-steel group-hover:text-white'}`}>
            {icon}
        </span>
        <span className="font-medium text-sm">{label}</span>
    </Link>
)

// Icons
const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
)

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
)

const BuildingIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
)

const TrendingIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
)

const CogIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

export default Sidebar
