import { useState } from 'react';
import { LocalAISettings, EmailSettings, DailyRecap } from '../types/market.ts';

interface LocalAiAndEmailViewProps {
  localAiConfig: LocalAISettings;
  onUpdateLocalAiConfig: (config: LocalAISettings) => void;
  emailSettings: EmailSettings;
  onUpdateEmailSettings: (settings: EmailSettings) => void;
  onTriggerRecapAndEmail: () => void;
  isSendingEmail: boolean;
  latestRecap: DailyRecap | null;
  emailSendStatus: { success: boolean; message: string; previewHtml?: string } | null;
  onOpenEmailPreviewModal: (html: string) => void;
}

export function LocalAiAndEmailView({
  localAiConfig,
  onUpdateLocalAiConfig,
  emailSettings,
  onUpdateEmailSettings,
  onTriggerRecapAndEmail,
  isSendingEmail,
  emailSendStatus,
  onOpenEmailPreviewModal,
}: LocalAiAndEmailViewProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    models?: string[];
  } | null>(null);
  const [copiedCron, setCopiedCron] = useState(false);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-local-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: localAiConfig.endpointUrl,
          provider: localAiConfig.provider,
          modelName: localAiConfig.modelName,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: 'Impossible de joindre le serveur local : ' + err.message,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleDownloadScript = () => {
    const url = `/api/export-script?recipient=${encodeURIComponent(
      emailSettings.recipientEmail
    )}&provider=${localAiConfig.provider}&model=${encodeURIComponent(
      localAiConfig.modelName
    )}&endpoint=${encodeURIComponent(localAiConfig.endpointUrl)}`;
    window.location.href = url;
  };

  const cronExample = `0 8 * * 1-5 python3 ~/market_recap_cron.py`;

  const handleCopyCron = () => {
    navigator.clipboard.writeText(cronExample);
    setCopiedCron(true);
    setTimeout(() => setCopiedCron(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Configuration de l'IA & Envoi Quotidien par Email
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Configurez ici la réception de votre récapitulatif boursier tous les matins par email, et connectez votre IA locale (Ollama, LM Studio) ou utilisez l'IA cloud intégrée.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Step 1: Email recipient & schedule */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h3 className="text-base font-bold text-white">
              Votre Email & Heure de Réception
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Adresse email qui recevra le récapitulatif
              </label>
              <input
                type="email"
                value={emailSettings.recipientEmail}
                onChange={(e) =>
                  onUpdateEmailSettings({
                    ...emailSettings,
                    recipientEmail: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-sky-500"
                placeholder="lola05141@gmail.com"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Votre email est pré-configuré. Vous recevrez le mémo avec les 5 marchés et les seuils de sortie.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Heure d'envoi le matin
                </label>
                <select
                  value={emailSettings.sendHour}
                  onChange={(e) =>
                    onUpdateEmailSettings({
                      ...emailSettings,
                      sendHour: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="08:00">08:00 (Avant l'ouverture de Paris)</option>
                  <option value="08:30">08:30 (Cloche pré-marché)</option>
                  <option value="12:30">12:30 (Point de mi-journée)</option>
                  <option value="18:00">18:00 (Clôture européenne)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Fréquence
                </label>
                <select
                  value={emailSettings.frequency}
                  onChange={(e) =>
                    onUpdateEmailSettings({
                      ...emailSettings,
                      frequency: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="weekdays">Lundi au Vendredi (Jours de bourse)</option>
                  <option value="daily">Tous les jours (7j/7)</option>
                </select>
              </div>
            </div>

            {/* Gmail SMTP Confirmation Badge */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Serveur SMTP Gmail Configuré
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Port 465 (SSL)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Hôte SMTP</span>
                  <span className="text-white">{emailSettings.smtpHost || 'smtp.gmail.com'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Compte Expéditeur</span>
                  <span className="text-white truncate block">{emailSettings.smtpUser || 'lola05141@gmail.com'}</span>
                </div>
              </div>
            </div>

            {/* Test Email Action */}
            <div className="pt-2">
              <button
                onClick={onTriggerRecapAndEmail}
                disabled={isSendingEmail}
                className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-sky-500/20"
              >
                {isSendingEmail ? (
                  <span>Génération et Envoi de l'Email en cours...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Envoyer un Email de Test Maintenant</span>
                  </>
                )}
              </button>

              {emailSendStatus && (
                <div
                  className={`mt-3 p-3 rounded-lg border text-xs ${
                    emailSendStatus.success
                      ? 'bg-sky-950/30 border-sky-900/60 text-sky-200'
                      : 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-0.5">
                    {emailSendStatus.success ? '✓ Email Prêt' : 'Erreur'}
                  </div>
                  <p className="text-[11px] leading-relaxed">{emailSendStatus.message}</p>
                  {emailSendStatus.previewHtml && (
                    <button
                      onClick={() => onOpenEmailPreviewModal(emailSendStatus.previewHtml!)}
                      className="mt-2 text-xs font-semibold text-sky-400 hover:text-sky-300 underline cursor-pointer"
                    >
                      Voir l'aperçu de la newsletter HTML →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Local AI or Cloud AI configuration */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h3 className="text-base font-bold text-white">
              Connexion avec l'IA (Locale ou Cloud)
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Quel modèle d'IA souhaitez-vous utiliser ?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateLocalAiConfig({
                      ...localAiConfig,
                      provider: 'ollama',
                      endpointUrl: 'http://localhost:11434',
                      modelName: 'llama3.2',
                    })
                  }
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    localAiConfig.provider === 'ollama'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Ollama (Local)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Tourne sur votre machine (Llama 3, Mistral)</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateLocalAiConfig({
                      ...localAiConfig,
                      provider: 'lmstudio',
                      endpointUrl: 'http://localhost:1234',
                      modelName: 'local-model',
                    })
                  }
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    localAiConfig.provider === 'lmstudio'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-white">LM Studio (Local)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Interface graphique locale</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Adresse de votre IA Locale
              </label>
              <input
                type="text"
                value={localAiConfig.endpointUrl}
                onChange={(e) =>
                  onUpdateLocalAiConfig({ ...localAiConfig, endpointUrl: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                placeholder="http://localhost:11434"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Nom du modèle (ex. llama3.2, mistral, deepseek-r1)
              </label>
              <input
                type="text"
                value={localAiConfig.modelName}
                onChange={(e) =>
                  onUpdateLocalAiConfig({ ...localAiConfig, modelName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                placeholder="llama3.2"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="fallback"
                checked={localAiConfig.fallbackToGemini}
                onChange={(e) =>
                  onUpdateLocalAiConfig({
                    ...localAiConfig,
                    fallbackToGemini: e.target.checked,
                  })
                }
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <label htmlFor="fallback" className="text-slate-300 text-xs cursor-pointer">
                <span className="font-semibold block">Secours automatique activé (Recommandé)</span>
                <span className="text-slate-400 text-[11px]">
                  Si votre ordinateur est éteint ou que l'IA locale n'est pas joignable, Gemini 3.8 Flash prend automatiquement le relais pour que vous ne manquiez jamais votre récapitulatif du matin.
                </span>
              </label>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {testingConnection ? (
                <span>Test en cours...</span>
              ) : (
                <span>Tester la Connexion Locale</span>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  testResult.ok
                    ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-900/60 text-amber-300'
                }`}
              >
                <div className="font-bold mb-0.5">
                  {testResult.ok ? '✓ Connexion Locale Réussie !' : 'Statut de l\'IA Locale'}
                </div>
                <p className="text-[11px] leading-relaxed">{testResult.message}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Step 3: Local script download */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🚀</span> Comment faire tourner l'envoi tous les matins sur votre ordinateur ?
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Pour que votre PC interroge votre IA locale et vous envoie l'email tous les jours sans même ouvrir de navigateur, téléchargez le script autonome Python prêt à l'emploi.
            </p>
          </div>

          <button
            onClick={handleDownloadScript}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Télécharger market_recap_cron.py</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-white mb-1">1. Installez Ollama</div>
            <p className="text-[11px] text-slate-400 mb-2">
              Téléchargez Ollama et lancez un modèle en ligne de commande :
            </p>
            <code className="text-emerald-400 font-mono text-[11px] block bg-slate-900 p-2 rounded">
              ollama run llama3.2
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-white mb-1">2. Lancez le script</div>
            <p className="text-[11px] text-slate-400 mb-2">
              Exécutez le script téléchargé pour tester l'envoi immédiat :
            </p>
            <code className="text-emerald-400 font-mono text-[11px] block bg-slate-900 p-2 rounded">
              python3 market_recap_cron.py
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-white mb-1">3. Automatisation cron</div>
            <p className="text-[11px] text-slate-400 mb-2">
              Programmez l'exécution automatique à 08h00 du lundi au vendredi :
            </p>
            <div className="relative">
              <code className="text-emerald-400 font-mono text-[10px] block bg-slate-900 p-2 rounded pr-12 overflow-x-auto">
                {cronExample}
              </code>
              <button
                onClick={handleCopyCron}
                className="absolute right-1 top-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                {copiedCron ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
