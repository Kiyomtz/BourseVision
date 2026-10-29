export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  region: 'Europe' | 'US' | 'Asie' | 'Global';
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  trend: 'up' | 'down' | 'neutral';
  history1D: { time: string; price: number }[];
}

export interface InvestmentMarket {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  category: 'Actions / ETF' | 'Énergie & Tech' | 'Obligations' | 'Santé & Bio' | 'Matières Premières';
  currentPrice: number;
  currency: string;
  change24hPercent: number;
  change7dPercent: number;
  change30dPercent: number;
  volatility: 'Faible' | 'Modérée' | 'Élevée';
  rsi: number;
  investmentThesis: string;
  catalysts: string[];
  
  // Exit strategy details
  entryZone: {
    min: number;
    max: number;
    currentDistancePercent: number;
  };
  takeProfit: {
    targetPrice1: number; // Partiel (ex: 50%)
    targetPrice2: number; // Sortie totale
    potentialGainPercent: number;
    recommendedHorizon: string; // ex: "3 à 6 mois"
  };
  stopLoss: {
    price: number;
    riskPercent: number; // ex: -5.5%
    invalidationConditions: string[];
  };
  riskRewardRatio: string; // ex: "1:3.4"
  status: 'Achat Recommandé' | 'Accumulation' | 'Surveillance Renforcée' | 'Prise de Gains Proche';
  
  // Historical data for charts
  history: {
    '1D': { time: string; price: number }[];
    '1W': { time: string; price: number }[];
    '1M': { time: string; price: number }[];
    '1Y': { time: string; price: number }[];
  };
}

export interface MacroIndicator {
  name: string;
  symbol: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  impact: string;
}

export interface DailyRecap {
  generatedAt: string;
  marketSentiment: 'Fortement Haussier' | 'Haussier' | 'Neutre / Attentiste' | 'Prudent / Volatile' | 'Baissier';
  macroSummary: string;
  topOpportunitiesSummary: string;
  exitStrategyAlerts: string[];
  recommendationPlan: string[];
  provider: 'local-ai' | 'gemini-3.8-flash';
  modelUsed: string;
}

export interface LocalAISettings {
  provider: 'ollama' | 'lmstudio' | 'localai' | 'custom';
  endpointUrl: string;
  modelName: string;
  temperature: number;
  fallbackToGemini: boolean;
}

export interface EmailSettings {
  recipientEmail: string;
  sendHour: string; // "08:00"
  frequency: 'daily' | 'weekdays';
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  senderName: string;
}
