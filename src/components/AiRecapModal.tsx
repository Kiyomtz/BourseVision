import { useState } from 'react';
import { DailyRecap } from '../types/market.ts';

interface AiRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  recap: DailyRecap | null;
  onSendEmailNow: () => void;
  isSendingEmail: boolean;
  recipientEmail: string;
}

export function AiRecapModal({
  isOpen,
  onClose,
  recap,
  onSendEmailNow,
  isSendingEmail,
  recipientEmail,
}: AiRecapModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !recap) return null;

  const formattedDate = new Date(recap.generatedAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = () => {
    const text = `
BOURSEVISION AI · RÉCAPITULATIF QUOTIDIEN (${formattedDate})
Sentiment : ${recap.marketSentiment}
Moteur : ${recap.modelUsed}

RÉSUMÉ MACRO :
${recap.macroSummary}

OPPORTUNITÉS & FLUCTUATIONS :
${recap.topOpportunitiesSummary}

ALERTES DE RETRAIT & STOP-LOSS :
${recap.exitStrategyAlerts.map((a) => '• ' + a).join('\n')}

PLAN D'ACTION CONSEILLÉ :
${recap.recommendationPlan.map((p, i) => `${i + 1}. ${p}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-emerald-400">BourseVision AI</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{formattedDate}</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Récapitulatif Financier Exécutif
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {recap.modelUsed}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          
          {/* Market Sentiment Banner */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
                Sentiment Global de Marché
              </span>
              <div className="text-lg font-bold text-white mt-0.5">
                {recap.marketSentiment}
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Activité Favorable
            </div>
          </div>

          {/* Macro Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              1. Contexte Macroéconomique & Tendance des Taux
            </h4>
            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 text-slate-200 leading-relaxed text-xs">
              {recap.macroSummary}
            </div>
          </div>

          {/* Top Opportunities */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              2. Analyse des 5 Marchés & Dynamique de Fluctuation
            </h4>
            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 text-slate-200 leading-relaxed text-xs whitespace-pre-line">
              {recap.topOpportunitiesSummary}
            </div>
          </div>

          {/* Exit Strategy Alerts */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span> 3. Alertes Critiques de Sortie (Prise de Gains & Stop-Loss)
            </h4>
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-2 text-xs">
              {recap.exitStrategyAlerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 text-amber-200">
                  <span className="text-amber-400 mt-0.5 font-bold">▪</span>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              4. Plan d'Exécution Conseillé pour la Séance
            </h4>
            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2 text-xs">
              {recap.recommendationPlan.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-4 h-4 rounded bg-slate-800 text-emerald-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400">
            Destinataire configuré : <span className="text-white font-mono">{recipientEmail}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? '✓ Texte Copié' : 'Copier le Texte'}
            </button>

            <button
              onClick={onSendEmailNow}
              disabled={isSendingEmail}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSendingEmail ? (
                <span>Envoi en cours...</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Envoyer par Email</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
