import { MarketIndex } from '../types/market.ts';
import { MarketChart } from './MarketChart.tsx';

interface MarketIndicesHeaderProps {
  indices: MarketIndex[];
  selectedIndexId: string;
  onSelectIndex: (id: string) => void;
  lastUpdated: string;
  isAutoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onManualRefresh: () => void;
}

const INDEX_DESCRIPTIONS: Record<string, string> = {
  cac40: 'Les 40 fleurons français (LVMH, TotalEnergies, Sanofi, L\'Oréal)',
  sp500: 'L\'indice de référence mondial regroupant les 500 piliers de l\'économie US',
  nasdaq: 'Le baromètre mondial de l\'innovation et des géants technologiques',
  dax: 'L\'indice phare de l\'industrie et des exportations allemandes',
  eurostoxx: 'Les 50 plus grandes capitalisations boursières de la zone Euro',
  nikkei: 'La place financière majeure d\'Asie et de l\'électronique japonaise',
};

export function MarketIndicesHeader({
  indices,
  selectedIndexId,
  onSelectIndex,
  lastUpdated,
  isAutoRefresh,
  onToggleAutoRefresh,
  onManualRefresh,
}: MarketIndicesHeaderProps) {
  const formattedTime = new Date(lastUpdated).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const selectedIndex = indices.find((i) => i.id === selectedIndexId) || indices[0];
  const isSelectedUp = selectedIndex.change24hPercent >= 0;

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Les Grands Marchés Boursiers en Direct
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Suivez la santé économique mondiale et la tendance générale avant de prendre vos décisions d'investissement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isAutoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span>{isAutoRefresh ? 'Mise à jour en temps réel' : 'Pause'} ({formattedTime})</span>
          </div>

          <button
            onClick={onToggleAutoRefresh}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            {isAutoRefresh ? 'Mettre en pause' : 'Reprendre le direct'}
          </button>

          <button
            onClick={onManualRefresh}
            title="Rafraîchir"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid of indices selection cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {indices.map((idx) => {
          const isSelected = selectedIndexId === idx.id;
          const isPositive = idx.change24hPercent >= 0;

          return (
            <button
              key={idx.id}
              onClick={() => onSelectIndex(idx.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white">{idx.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{idx.region}</span>
              </div>

              <div className="text-base font-bold font-mono text-white tabular-nums mb-1">
                {idx.currentPrice.toLocaleString('fr-FR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </div>

              <div
                className={`text-xs font-mono font-semibold tabular-nums ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {idx.change24hPercent.toFixed(2)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Index Detailed Canvas */}
      {selectedIndex && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Région : {selectedIndex.region}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{selectedIndex.symbol}</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {selectedIndex.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {INDEX_DESCRIPTIONS[selectedIndex.id] || 'Indice boursier représentatif.'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-400">Niveau Actuel</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {selectedIndex.currentPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} pts
                </div>
              </div>

              <div
                className={`text-right font-mono text-sm font-bold tabular-nums ${
                  isSelectedUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <div>{isSelectedUp ? '+' : ''}{selectedIndex.change24hPercent.toFixed(2)}%</div>
                <div className="text-xs font-normal text-slate-400">
                  {isSelectedUp ? '+' : ''}{selectedIndex.change24h.toFixed(1)} pts
                </div>
              </div>
            </div>
          </div>

          {/* High, Low, Volume metrics strip */}
          <div className="grid grid-cols-3 gap-3 py-2 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">Plus Haut du Jour</span>
              <span className="font-mono font-semibold text-white text-sm">{selectedIndex.high24h.toLocaleString('fr-FR')}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">Plus Bas du Jour</span>
              <span className="font-mono font-semibold text-white text-sm">{selectedIndex.low24h.toLocaleString('fr-FR')}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-0.5">Volume de Titres Échangés</span>
              <span className="font-mono font-semibold text-white text-sm">{selectedIndex.volume}</span>
            </div>
          </div>

          {/* Intraday Chart */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Courbe de fluctuation de la journée
            </div>
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <MarketChart
                data={selectedIndex.history1D}
                height={170}
                color={isSelectedUp ? '#10B981' : '#F43F5E'}
                showLevels={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
