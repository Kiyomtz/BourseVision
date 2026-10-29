import { useState } from 'react';
import { InvestmentMarket } from '../types/market.ts';
import { MarketChart } from './MarketChart.tsx';

interface InvestmentMarketsViewProps {
  markets: InvestmentMarket[];
  onGoToExitStrategy: (marketId: string) => void;
}

const MARKET_ICONS: Record<string, string> = {
  'market-1-semiconductors': '🧠',
  'market-2-electrification': '⚡',
  'market-3-gold-safehaven': '🪙',
  'market-4-biotech-glp1': '💊',
  'market-5-sovereign-bonds': '🏛️',
};

const SIMPLE_PITCH: Record<string, string> = {
  'market-1-semiconductors': 'Les fabricants de puces indispensables qui font tourner l\'intelligence artificielle dans le monde entier.',
  'market-2-electrification': 'Les équipements électriques et réseaux nécessaires pour alimenter la transition verte et les centres de données.',
  'market-3-gold-safehaven': 'La valeur refuge ultime achetée massivement par les banques centrales pour se protéger.',
  'market-4-biotech-glp1': 'Les géants de la pharmacie qui développent les nouveaux traitements de santé et du métabolisme.',
  'market-5-sovereign-bonds': 'Des emprunts d\'État ultra-sûrs qui profitent directement du cycle de baisse des taux des banques centrales.',
};

export function InvestmentMarketsView({
  markets,
  onGoToExitStrategy,
}: InvestmentMarketsViewProps) {
  const [selectedMarketId, setSelectedMarketId] = useState<string>(markets[0]?.id || '');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');

  const selectedMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];
  if (!selectedMarket) return null;

  const currentChartData = selectedMarket.history[timeframe] || [];
  const isPositive24h = selectedMarket.change24hPercent >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">
          5 Marchés Sélectionnés pour Investir
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Ces 5 marchés ont été rigoureusement analysés pour offrir un potentiel de gain élevé tout en maintenant un risque strictement contrôlé. Cliquez sur un marché pour voir ses détails.
        </p>
      </div>

      {/* 5 Cards Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {markets.map((m, index) => {
          const isSelected = m.id === selectedMarket.id;
          const isUp = m.change24hPercent >= 0;
          const icon = MARKET_ICONS[m.id] || '📈';

          return (
            <button
              key={m.id}
              onClick={() => setSelectedMarketId(m.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-[11px] font-mono font-medium text-slate-400">
                    {m.ticker}
                  </span>
                </div>

                <div className="text-xs font-bold text-white mb-1 line-clamp-1">
                  0{index + 1}. {m.name}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {SIMPLE_PITCH[m.id] || m.sector}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between font-mono text-xs tabular-nums">
                <span className="font-bold text-white">
                  {m.currentPrice} {m.currency}
                </span>
                <span
                  className={`font-semibold ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? '+' : ''}{m.change24hPercent.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Pane for the Chosen Market */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
        
        {/* Title and Key Figures */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="text-lg">{MARKET_ICONS[selectedMarket.id] || '📈'}</span>
              <span className="font-semibold text-emerald-400">{selectedMarket.status}</span>
              <span aria-hidden="true">·</span>
              <span>Secteur : {selectedMarket.sector}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {selectedMarket.name}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Ticker : {selectedMarket.ticker}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {SIMPLE_PITCH[selectedMarket.id]}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400">Prix Actuel du Marché</div>
              <div className="text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                {selectedMarket.currentPrice.toLocaleString('fr-FR')} {selectedMarket.currency}
              </div>
            </div>

            <div className="text-right font-mono text-xs tabular-nums">
              <div className={`font-semibold text-sm ${isPositive24h ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive24h ? '+' : ''}{selectedMarket.change24hPercent.toFixed(2)}% aujourd'hui
              </div>
              <div className="text-slate-400 mt-0.5">
                +{selectedMarket.change7dPercent.toFixed(2)}% sur 7 jours
              </div>
              <div className="text-slate-400">
                +{selectedMarket.change30dPercent.toFixed(2)}% sur 30 jours
              </div>
            </div>
          </div>
        </div>

        {/* Fluctuation Chart with simplified controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Fluctuation du Cours dans le Temps
              </div>
              <div className="text-[11px] text-slate-400">
                Survolez la courbe pour voir l'historique des prix.
              </div>
            </div>

            {/* Timeframe switch */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {[
                { key: '1D', label: '1 Jour' },
                { key: '1W', label: '1 Semaine' },
                { key: '1M', label: '1 Mois' },
                { key: '1Y', label: '1 An' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTimeframe(t.key as any)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    timeframe === t.key
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <MarketChart
              data={currentChartData}
              entryZoneMin={selectedMarket.entryZone.min}
              entryZoneMax={selectedMarket.entryZone.max}
              takeProfitPrice={selectedMarket.takeProfit.targetPrice1}
              stopLossPrice={selectedMarket.stopLoss.price}
              currency={selectedMarket.currency}
              height={180}
              color="#10B981"
              showLevels={true}
            />

            <div className="flex flex-wrap items-center justify-center gap-5 mt-3 pt-3 border-t border-slate-900 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                <span>Zone d'Achat ({selectedMarket.entryZone.min} - {selectedMarket.entryZone.max} {selectedMarket.currency})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Objectif de Revente ({selectedMarket.takeProfit.targetPrice1} {selectedMarket.currency})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Seuil de Sécurité ({selectedMarket.stopLoss.price} {selectedMarket.currency})</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2 Clear Action Columns: Why Invest & Link to Exit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Why Invest Card */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Pourquoi Investir Maintenant ?
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedMarket.investmentThesis}
            </p>

            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Facteurs clés de croissance :
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {selectedMarket.catalysts.map((cat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">✔</span>
                    <span>{cat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Snapshot of Exit Targets + Direct Button */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Niveaux Cibles & Sécurité
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-900/40">
                  <span className="text-[11px] text-emerald-400 font-medium block">Objectif de Gain Visé</span>
                  <span className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
                    +{selectedMarket.takeProfit.potentialGainPercent}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Sortie à {selectedMarket.takeProfit.targetPrice1} {selectedMarket.currency}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-rose-950/25 border border-rose-900/40">
                  <span className="text-[11px] text-rose-400 font-medium block">Protection Anti-Perte</span>
                  <span className="text-lg font-bold font-mono text-rose-300 tabular-nums">
                    {selectedMarket.stopLoss.riskPercent}% max
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Sortie si &lt; {selectedMarket.stopLoss.price} {selectedMarket.currency}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Retirez votre capital dès que l'objectif est atteint ou coupez immédiatement la position en cas de franchissement du seuil de sécurité.
              </p>
            </div>

            <button
              onClick={() => onGoToExitStrategy(selectedMarket.id)}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Accéder au Simulateur de Retrait pour ce Marché</span>
              <span>→</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
