interface TopBarProps {
  activeTab: 'marches' | 'opportunites' | 'retrait' | 'ia-email';
  onSelectTab: (tab: 'marches' | 'opportunites' | 'retrait' | 'ia-email') => void;
  onOpenRecapModal: () => void;
  isGeneratingRecap: boolean;
}

export function TopBar({
  activeTab,
  onSelectTab,
  onOpenRecapModal,
  isGeneratingRecap,
}: TopBarProps) {
  const tabs = [
    {
      id: 'marches' as const,
      label: 'Marchés en Direct',
      desc: 'Indices mondiaux & macro',
    },
    {
      id: 'opportunites' as const,
      label: '5 Marchés où Investir',
      desc: 'Opportunités sélectionnées',
    },
    {
      id: 'retrait' as const,
      label: 'Quand Retirer son Argent',
      desc: 'Objectifs de gain & stop-loss',
    },
    {
      id: 'ia-email' as const,
      label: 'IA & Envoi Quotidien',
      desc: 'Configuration email & script',
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 py-3.5">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('marches')}
              className="text-left cursor-pointer group"
            >
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                <span>BourseVision</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Guide d'investissement & récap quotidien
              </div>
            </button>
          </div>

          {/* Navigation Tabs - Distinct and Accessible */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenRecapModal}
              disabled={isGeneratingRecap}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              {isGeneratingRecap ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-slate-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Génération du récap...</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Générer le Récap IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex lg:hidden overflow-x-auto gap-2 py-2 border-t border-slate-900 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
