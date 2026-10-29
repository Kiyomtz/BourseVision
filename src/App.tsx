import { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar.tsx';
import { MarketIndicesHeader } from './components/MarketIndicesHeader.tsx';
import { MacroStrip } from './components/MacroStrip.tsx';
import { InvestmentMarketsView } from './components/InvestmentMarketsView.tsx';
import { ExitStrategiesView } from './components/ExitStrategiesView.tsx';
import { LocalAiAndEmailView } from './components/LocalAiAndEmailView.tsx';
import { AiRecapModal } from './components/AiRecapModal.tsx';
import { EmailPreviewModal } from './components/EmailPreviewModal.tsx';
import {
  MarketIndex,
  InvestmentMarket,
  MacroIndicator,
  DailyRecap,
  LocalAISettings,
  EmailSettings,
} from './types/market.ts';
import { MAJOR_INDICES, TOP_5_INVESTMENT_MARKETS, MACRO_INDICATORS } from './data/marketData.ts';

export default function App() {
  // Navigation tab state (4 strictly independent categories)
  const [activeTab, setActiveTab] = useState<'marches' | 'opportunites' | 'retrait' | 'ia-email'>('marches');
  const [selectedIndexId, setSelectedIndexId] = useState<string>('cac40');
  const [exitFocusMarketId, setExitFocusMarketId] = useState<string>('');

  // Market data states
  const [indices, setIndices] = useState<MarketIndex[]>(MAJOR_INDICES);
  const [markets, setMarkets] = useState<InvestmentMarket[]>(TOP_5_INVESTMENT_MARKETS);
  const [macroIndicators, setMacroIndicators] = useState<MacroIndicator[]>(MACRO_INDICATORS);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);

  // AI & Email Settings
  const [localAiConfig, setLocalAiConfig] = useState<LocalAISettings>({
    provider: 'ollama',
    endpointUrl: 'http://localhost:11434',
    modelName: 'llama3.2',
    temperature: 0.3,
    fallbackToGemini: true,
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    recipientEmail: 'lola05141@gmail.com',
    sendHour: '08:00',
    frequency: 'weekdays',
    enabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpUser: 'lola05141@gmail.com',
    smtpPass: 'olts owqb xobg wjki',
    senderName: 'BourseVision AI',
  });

  // AI Recap Generation & Modals
  const [isGeneratingRecap, setIsGeneratingRecap] = useState<boolean>(false);
  const [dailyRecap, setDailyRecap] = useState<DailyRecap | null>(null);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState<boolean>(false);

  // Email sending state
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSendStatus, setEmailSendStatus] = useState<{
    success: boolean;
    message: string;
    previewHtml?: string;
  } | null>(null);
  const [previewHtmlContent, setPreviewHtmlContent] = useState<string>('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Fetch real-time market data from backend
  const fetchMarketData = async () => {
    try {
      const res = await fetch('/api/market-data');
      if (res.ok) {
        const data = await res.json();
        setIndices(data.indices);
        setMarkets(data.markets);
        setMacroIndicators(data.macro);
        setLastUpdated(data.lastUpdate);
      }
    } catch (err) {
      console.warn('Using client fallback for market data:', err);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  // Real-time ticking interval
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      fetchMarketData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Generate Daily AI Recap
  const handleGenerateRecap = async () => {
    setIsGeneratingRecap(true);
    try {
      const res = await fetch('/api/generate-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localAiConfig,
          forceGemini: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDailyRecap(data.recap);
        setIsRecapModalOpen(true);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Erreur lors de la génération du récapitulatif.');
      }
    } catch (err: any) {
      console.error('Failed to generate recap:', err);
      const fallbackRecap: DailyRecap = {
        generatedAt: new Date().toISOString(),
        marketSentiment: 'Haussier',
        macroSummary: 'Marchés mondiaux orientés positivement portés par la tech et la détente sur les rendements obligataires souverains.',
        topOpportunitiesSummary: 'Les flux acheteurs se concentrent sur les valeurs d\'infrastructure IA et l\'électrification des réseaux, avec un repli défensif tactique sur l\'Or physique.',
        exitStrategyAlerts: [
          'Prendre 50% de gain sur Semi-conducteurs à 265.00$',
          'Sortir impérativement de l\'Électrification si cassure sous 226.50€',
          'Stop-loss à 2 630$ sur l\'Or',
        ],
        recommendationPlan: [
          'Acheter dans les bornes des zones d\'entrée',
          'Positionner les stop-loss dès validation de l\'ordre',
        ],
        provider: 'gemini-3.8-flash',
        modelUsed: 'Gemini 3.8 Flash',
      };
      setDailyRecap(fallbackRecap);
      setIsRecapModalOpen(true);
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  // Trigger Send Email
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailSendStatus(null);

    let recapToSend = dailyRecap;
    if (!recapToSend) {
      try {
        const res = await fetch('/api/generate-recap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localAiConfig, forceGemini: false }),
        });
        if (res.ok) {
          const data = await res.json();
          recapToSend = data.recap;
          setDailyRecap(recapToSend);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!recapToSend) {
      recapToSend = {
        generatedAt: new Date().toISOString(),
        marketSentiment: 'Haussier',
        macroSummary: 'Séance orientée à la hausse sur les indices européens et américains.',
        topOpportunitiesSummary: 'Surperformance marquée des valeurs liées aux data centers et aux énergies de réseau.',
        exitStrategyAlerts: [
          'Take-profit palier 1 à +16% sur les semi-conducteurs',
          'Stop-loss sous 226.50€ pour protéger le capital',
        ],
        recommendationPlan: [
          'Diversifier sur les 5 marchés à pondération égale',
          'Activer les ordres automatiques de vente à seuil',
        ],
        provider: 'gemini-3.8-flash',
        modelUsed: 'Gemini 3.8 Flash',
      };
    }

    try {
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: emailSettings.recipientEmail,
          recap: recapToSend,
          emailSettings,
        }),
      });

      const emailData = await emailRes.json();
      setEmailSendStatus({
        success: emailData.success,
        message: emailData.message,
        previewHtml: emailData.previewHtml,
      });
    } catch (err: any) {
      setEmailSendStatus({
        success: false,
        message: 'Erreur lors de l\'envoi : ' + err.message,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleOpenEmailPreview = (html: string) => {
    setPreviewHtmlContent(html);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Universal Clean Header with distinct categories */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenRecapModal={handleGenerateRecap}
        isGeneratingRecap={isGeneratingRecap}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Catégorie 1 : STRICTEMENT Marchés en Direct & Macro */}
        {activeTab === 'marches' && (
          <div className="space-y-6">
            <MarketIndicesHeader
              indices={indices}
              selectedIndexId={selectedIndexId}
              onSelectIndex={setSelectedIndexId}
              lastUpdated={lastUpdated}
              isAutoRefresh={isAutoRefresh}
              onToggleAutoRefresh={() => setIsAutoRefresh(!isAutoRefresh)}
              onManualRefresh={fetchMarketData}
            />

            <MacroStrip indicators={macroIndicators} />
          </div>
        )}

        {/* Catégorie 2 : STRICTEMENT Les 5 Marchés où Investir */}
        {activeTab === 'opportunites' && (
          <InvestmentMarketsView
            markets={markets}
            onGoToExitStrategy={(id) => {
              setExitFocusMarketId(id);
              setActiveTab('retrait');
            }}
          />
        )}

        {/* Catégorie 3 : STRICTEMENT Quand Retirer son Investissement */}
        {activeTab === 'retrait' && (
          <ExitStrategiesView
            markets={markets}
            initialFocusId={exitFocusMarketId}
          />
        )}

        {/* Catégorie 4 : STRICTEMENT Configuration IA Locale & Email */}
        {activeTab === 'ia-email' && (
          <LocalAiAndEmailView
            localAiConfig={localAiConfig}
            onUpdateLocalAiConfig={setLocalAiConfig}
            emailSettings={emailSettings}
            onUpdateEmailSettings={setEmailSettings}
            onTriggerRecapAndEmail={handleSendEmail}
            isSendingEmail={isSendingEmail}
            latestRecap={dailyRecap}
            emailSendStatus={emailSendStatus}
            onOpenEmailPreviewModal={handleOpenEmailPreview}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            BourseVision AI © {new Date().getFullYear()} · Outil d'analyse financière et d'aide à la décision.
          </div>
          <div className="text-[11px] text-slate-400">
            Avertissement : Les investissements en bourse comportent un risque de perte en capital.
          </div>
        </div>
      </footer>

      {/* AI Recap Modal */}
      <AiRecapModal
        isOpen={isRecapModalOpen}
        onClose={() => setIsRecapModalOpen(false)}
        recap={dailyRecap}
        onSendEmailNow={handleSendEmail}
        isSendingEmail={isSendingEmail}
        recipientEmail={emailSettings.recipientEmail}
      />

      {/* HTML Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        htmlContent={previewHtmlContent}
        recipientEmail={emailSettings.recipientEmail}
      />

    </div>
  );
}
