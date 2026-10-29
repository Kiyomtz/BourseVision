import { useState } from 'react';
import { InvestmentMarket } from '../types/market.ts';

interface ExitStrategiesViewProps {
  markets: InvestmentMarket[];
  initialFocusId?: string;
}

export function ExitStrategiesView({
  markets,
  initialFocusId,
}: ExitStrategiesViewProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialFocusId || markets[0]?.id || '');
  const [capitalAmount, setCapitalAmount] = useState<number>(5000);

  const selectedMarket = markets.find((m) => m.id === selectedAssetId) || markets[0];

  const potentialGainEuro = selectedMarket
    ? Math.round(capitalAmount * (selectedMarket.takeProfit.potentialGainPercent / 100))
    : 0;
  const maxLossEuro = selectedMarket
    ? Math.round(capitalAmount * (Math.abs(selectedMarket.stopLoss.riskPercent) / 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Quand Retirer son Investissement ?
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Savoir quand vendre est la clé pour ne pas perdre son argent en bourse. Il existe deux types de retraits : <strong>encaisser ses gains</strong> au bon moment (Take-Profit), et <strong>couper une position</strong> si le scénario ne se déroule pas comme prévu (Stop-Loss).
        </p>
      </div>

      {/* Simulator: How much do I win / How much do I risk? */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>💶</span> Simulateur Simple de Retrait
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Choisissez votre montant et voyez exactement combien vous encaissez à l'objectif de vente, et le montant maximal que vous risquez.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Montant que vous souhaitez investir (€)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={capitalAmount}
                onChange={(e) => setCapitalAmount(Math.max(50, Number(e.target.value) || 0))}
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 tabular-nums"
                placeholder="5000"
              />
            </div>
            {/* Quick buttons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500">Montants rapides :</span>
              {[1000, 3000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  onClick={() => setCapitalAmount(val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border ${
                    capitalAmount === val
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {val.toLocaleString('fr-FR')} €
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choisissez le marché
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {markets.map((m, i) => (
                <option key={m.id} value={m.id}>
                  0{i + 1}. {m.name} ({m.ticker})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Cours actuel : {selectedMarket?.currentPrice} {selectedMarket?.currency}
            </span>
          </div>
        </div>

        {/* Visual Outcome Cards */}
        {selectedMarket && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            
            {/* Gain Card */}
            <div className="p-5 rounded-xl bg-emerald-950/25 border border-emerald-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎯</span> 1. Quand Encaisser vos Bénéfices
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    +{selectedMarket.takeProfit.potentialGainPercent}%
                  </span>
                </div>

                <div className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
                  +{(potentialGainEuro).toLocaleString('fr-FR')} € de gain
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Votre capital atteindra <strong>{(capitalAmount + potentialGainEuro).toLocaleString('fr-FR')} €</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-900/30 text-xs text-emerald-200/90 leading-relaxed">
                <strong>Conseil de retrait :</strong> Vendez la moitié (50%) de vos titres dès que le prix atteint <strong>{selectedMarket.takeProfit.targetPrice1} {selectedMarket.currency}</strong>. Cela vous assure un gain garanti sans stress pour la suite.
              </div>
            </div>

            {/* Safety Loss Card */}
            <div className="p-5 rounded-xl bg-rose-950/25 border border-rose-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔴</span> 2. Quand Couper pour Vous Protéger
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-300">
                    {selectedMarket.stopLoss.riskPercent}% max
                  </span>
                </div>

                <div className="text-2xl font-bold font-mono text-rose-300 tabular-nums">
                  -{(maxLossEuro).toLocaleString('fr-FR')} € max de perte
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Votre capital restant garanti est de <strong>{(capitalAmount - maxLossEuro).toLocaleString('fr-FR')} €</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-900/30 text-xs text-rose-200/90 leading-relaxed">
                <strong>Seuil de sortie impératif :</strong> Si le prix baisse sous <strong>{selectedMarket.stopLoss.price} {selectedMarket.currency}</strong>, vendez tout immédiatement sans hésiter pour éviter une perte plus importante.
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 5 Clear Strategy Cards (1 for each market) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Feuille de Route Détaillée pour Chaque Marché
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((m, index) => (
            <div
              key={m.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono text-emerald-400">Marché #0{index + 1}</span>
                  <span className="font-mono">{m.ticker}</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-2">{m.name}</h4>

                <div className="space-y-2 text-xs">
                  {/* Take profit */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      🎯 Vendre pour encaisser (Objectif)
                    </span>
                    <span className="text-sm font-mono font-bold text-white">
                      {m.takeProfit.targetPrice1} {m.currency}{' '}
                      <span className="text-emerald-400 text-xs">(+{m.takeProfit.potentialGainPercent}%)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Horizon : {m.takeProfit.recommendedHorizon}
                    </span>
                  </div>

                  {/* Stop loss */}
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30">
                    <span className="text-[11px] text-rose-400 font-semibold block">
                      🔴 Couper pour sécuriser (Stop-Loss)
                    </span>
                    <span className="text-sm font-mono font-bold text-white">
                      {m.stopLoss.price} {m.currency}{' '}
                      <span className="text-rose-400 text-xs">({m.stopLoss.riskPercent}%)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-300">
                <span className="font-semibold text-amber-400 block mb-0.5">⚠️ Signal d'alerte de sortie :</span>
                <span>{m.stopLoss.invalidationConditions[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 2 Rules Everyone Should Follow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Règle N°1 : Encaisser 50% au Premier Palier
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Lorsque votre investissement atteint son premier objectif de gain, retirez la moitié de votre position. Cela vous permet de récupérer une partie de votre mise et de regarder la suite évoluer l'esprit totalement serein.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
            Règle N°2 : Respecter Toujours le Seuil Stop-Loss
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            La plus grande erreur en bourse est d'attendre qu'une action qui baisse "remonte un jour". Si le seuil de sécurité est franchi, sortez sans hésitation. Vous préservez votre argent pour la prochaine opportunité.
          </p>
        </div>
      </div>

    </div>
  );
}
