import { MacroIndicator } from '../types/market.ts';

interface MacroStripProps {
  indicators: MacroIndicator[];
}

export function MacroStrip({ indicators }: MacroStripProps) {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Les 5 Moteurs Macroéconomiques du Jour
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ces 5 baromètres (taux d'intérêt, pétrole, or, indice de la peur) dictent la direction de la bourse.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {indicators.map((m) => {
          const isUp = m.trend === 'up';

          return (
            <div
              key={m.symbol}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold truncate">{m.name}</span>
                  <span className="font-mono text-[10px] text-slate-500">{m.symbol}</span>
                </div>

                <div className="flex items-baseline justify-between mb-2 font-mono tabular-nums">
                  <span className="text-base font-bold text-white">{m.value}</span>
                  <span className={`text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {m.change}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-2 text-[11px] text-slate-400 leading-snug">
                {m.impact}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
