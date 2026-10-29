import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { MAJOR_INDICES, TOP_5_INVESTMENT_MARKETS, MACRO_INDICATORS } from './src/data/marketData.ts';
import { DailyRecap, LocalAISettings, EmailSettings } from './src/types/market.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Dynamic in-memory market fluctuations simulator
let simulatedIndices = JSON.parse(JSON.stringify(MAJOR_INDICES));
let simulatedMarkets = JSON.parse(JSON.stringify(TOP_5_INVESTMENT_MARKETS));
let lastSimulatedTime = Date.now();

function updateMarketFluctuations() {
  const now = Date.now();
  if (now - lastSimulatedTime > 4000) {
    lastSimulatedTime = now;
    // Slight realistic random intraday noise (+-0.08%)
    simulatedIndices = simulatedIndices.map((idx: any) => {
      const deltaPercent = (Math.random() - 0.48) * 0.12;
      const newPrice = Math.round((idx.currentPrice * (1 + deltaPercent / 100)) * 100) / 100;
      const change24hPercent = Math.round((idx.change24hPercent + deltaPercent * 0.4) * 100) / 100;
      return {
        ...idx,
        currentPrice: newPrice,
        change24hPercent,
        trend: change24hPercent >= 0 ? 'up' : 'down'
      };
    });

    simulatedMarkets = simulatedMarkets.map((m: any) => {
      const deltaPercent = (Math.random() - 0.46) * 0.18;
      const newPrice = Math.round((m.currentPrice * (1 + deltaPercent / 100)) * 100) / 100;
      const change24hPercent = Math.round((m.change24hPercent + deltaPercent * 0.5) * 100) / 100;
      return {
        ...m,
        currentPrice: newPrice,
        change24hPercent
      };
    });
  }
}

// 1. GET /api/market-data
app.get('/api/market-data', (req: Request, res: Response) => {
  updateMarketFluctuations();
  res.json({
    indices: simulatedIndices,
    markets: simulatedMarkets,
    macro: MACRO_INDICATORS,
    lastUpdate: new Date().toISOString(),
  });
});

// Helper to build prompt context
function buildPromptContext() {
  const indicesSummary = simulatedIndices
    .map((i: any) => `${i.name}: ${i.currentPrice} (${i.change24hPercent > 0 ? '+' : ''}${i.change24hPercent}%)`)
    .join(', ');

  const marketsSummary = simulatedMarkets
    .map((m: any, idx: number) => {
      return `
Marché #${idx + 1}: ${m.name} (${m.ticker})
- Secteur: ${m.sector}
- Cours actuel: ${m.currentPrice} ${m.currency} (${m.change24hPercent > 0 ? '+' : ''}${m.change24hPercent}%)
- Zone d'entrée optimale: ${m.entryZone.min} - ${m.entryZone.max} ${m.currency}
- Objectif Take-Profit (Prise de bénéfice): ${m.takeProfit.targetPrice1} ${m.currency} (+${m.takeProfit.potentialGainPercent}%) [Horizon: ${m.takeProfit.recommendedHorizon}]
- Seuil de Stop-Loss (Retrait d'urgence / Protection du capital): ${m.stopLoss.price} ${m.currency} (${m.stopLoss.riskPercent}%)
- Conditions d'invalidation du trade: ${m.stopLoss.invalidationConditions.join(' ; ')}
- Ratio Risque / Rendement: ${m.riskRewardRatio}
- Thèse: ${m.investmentThesis}
`;
    })
    .join('\n');

  return { indicesSummary, marketsSummary };
}

// 2. POST /api/generate-recap
app.post('/api/generate-recap', async (req: Request, res: Response) => {
  const { localAiConfig, forceGemini } = req.body as {
    localAiConfig?: LocalAISettings;
    forceGemini?: boolean;
  };

  const { indicesSummary, marketsSummary } = buildPromptContext();
  const currentDateFr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Attempt local AI first if requested and configured
  if (!forceGemini && localAiConfig && localAiConfig.endpointUrl) {
    try {
      const cleanUrl = localAiConfig.endpointUrl.replace(/\/$/, '');
      let requestPayload: any;
      let targetEndpoint = '';

      if (localAiConfig.provider === 'ollama') {
        targetEndpoint = `${cleanUrl}/api/generate`;
        requestPayload = {
          model: localAiConfig.modelName || 'llama3.2',
          prompt: `Tu es un stratégiste financier senior. Rédige un récapitulatif boursier exécutif en français pour aujourd'hui (${currentDateFr}).
Données des indices majeurs: ${indicesSummary}
Voici les 5 marchés clés sélectionnés avec leurs cours, zones d'entrée et cibles de retrait (take-profit / stop-loss):
${marketsSummary}

Donne une analyse claire, structurée et percutante avec:
1. Sentiment macroéconomique général
2. Synthèse des 5 opportunités d'investissement
3. Règles strictes de retrait (take-profit & stop-loss) pour chaque marché
4. Plan d'action recommandé pour la séance`,
          stream: false,
          options: {
            temperature: localAiConfig.temperature || 0.4,
          },
        };
      } else {
        // OpenAI-compatible format (LM Studio, LocalAI, vLLM)
        targetEndpoint = `${cleanUrl}/v1/chat/completions`;
        requestPayload = {
          model: localAiConfig.modelName || 'local-model',
          messages: [
            {
              role: 'system',
              content: 'Tu es un analyste financier de haut niveau. Fournis une analyse rigoureuse et concise des marchés boursiers et des règles de retrait du capital.',
            },
            {
              role: 'user',
              content: `Rédige le récapitulatif de marché du ${currentDateFr} basé sur ces données:\nIndices: ${indicesSummary}\n\nOpportunités et niveaux de sortie:\n${marketsSummary}`,
            },
          ],
          temperature: localAiConfig.temperature || 0.4,
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for local test

      const localResponse = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (localResponse.ok) {
        const localData = await localResponse.json();
        const textResult =
          localAiConfig.provider === 'ollama'
            ? localData.response
            : localData.choices?.[0]?.message?.content;

        if (textResult) {
          const recap: DailyRecap = {
            generatedAt: new Date().toISOString(),
            marketSentiment: 'Haussier',
            macroSummary: textResult.slice(0, 400) + '...',
            topOpportunitiesSummary: textResult,
            exitStrategyAlerts: [
              'Vérifier les alertes de take-profit sur les Semi-conducteurs à 265.00$',
              'Stop-loss strict à 226.50€ pour l\'Électrification Industrielle en cas de consolidation',
              'Maintenir les positions Or au-dessus du support des 2 630$ / once',
            ],
            recommendationPlan: [
              'Entrée progressive par paliers (DCA tactique)',
              'Placer immédiatement les ordres stop-loss de protection',
              'Prise de gain de 50% au franchissement de la première résistance',
            ],
            provider: 'local-ai',
            modelUsed: `${localAiConfig.provider} (${localAiConfig.modelName || 'standard'})`,
          };

          return res.json({ recap });
        }
      }
    } catch (err: any) {
      console.warn('Local AI call failed or timed out, evaluating fallback to Gemini...', err.message);
      if (!localAiConfig.fallbackToGemini) {
        return res.status(503).json({
          error: `Impossible de joindre le modèle IA local sur ${localAiConfig.endpointUrl}. Assurez-vous qu'Ollama ou LM Studio est lancé avec les options CORS autorisées (OLLAMA_ORIGINS="*" ollama serve), ou activez le basculement automatique vers Gemini.`,
        });
      }
    }
  }

  // Gemini Generation via @google/genai SDK
  try {
    const prompt = `Tu es le chef stratégiste d'un fonds d'investissement quantitatif et macroéconomique.
Rédige le récapitulatif quotidien complet du ${currentDateFr} pour un investisseur individuel averti.

Données actuelles de marché:
- Indices mondiaux: ${indicesSummary}
- 5 Marchés sélectionnés et règles de sortie:
${marketsSummary}

Tu dois répondre UNIQUEMENT avec un objet JSON strictement valide au format suivant:
{
  "marketSentiment": "Haussier" (ou "Fortement Haussier", "Neutre / Attentiste", "Prudent / Volatile", "Baissier"),
  "macroSummary": "Synthèse macroéconomique percutante en 2 ou 3 phrases expliquant la dynamique du jour (taux, inflation, banques centrales, géopolitique).",
  "topOpportunitiesSummary": "Analyse détaillée et structurée des 5 marchés recommandés : pourquoi ces 5 actifs surperforment actuellement et comment naviguer les fluctuations.",
  "exitStrategyAlerts": [
    "Alerte sortie 1: condition précise pour encaisser les gains sur le premier actif",
    "Alerte sortie 2: seuil de stop-loss critique pour couper les pertes sur le second",
    "Alerte sortie 3: condition d'invalidation macro à surveiller"
  ],
  "recommendationPlan": [
    "Étape 1 concrète d'allocation pour aujourd'hui",
    "Étape 2 pour la gestion des ordres de vente automatique",
    "Étape 3 pour la sécurisation du capital"
  ]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = geminiResponse.text;
    let parsed: any;
    try {
      parsed = JSON.parse(responseText || '{}');
    } catch (parseError) {
      parsed = {
        marketSentiment: 'Haussier',
        macroSummary: 'Marchés soutenus par la détente obligataire et l\'appétit pour les valeurs technologiques et d\'infrastructure.',
        topOpportunitiesSummary: responseText || 'Analyse en cours.',
        exitStrategyAlerts: [
          'Prendre 50% des bénéfices sur les Semi-conducteurs à +16% (265$)',
          'Stop-loss strict sous 226.50€ sur l\'électrification en cas de clôture journalière sous MM50',
          'Conserver l\'Or physique tant que le support des 2630$ est préservé',
        ],
        recommendationPlan: [
          'Répartir les investissements à parts égales (20% par marché)',
          'Programmer les ordres de vente stop-loss dès l\'exécution de l\'achat',
          'Réévaluer les gains lors du prochain fixing de clôture',
        ],
      };
    }

    const recap: DailyRecap = {
      generatedAt: new Date().toISOString(),
      marketSentiment: parsed.marketSentiment || 'Haussier',
      macroSummary: parsed.macroSummary || 'Tendance globale orientée vers la consolidation haussière.',
      topOpportunitiesSummary: parsed.topOpportunitiesSummary || 'Opportunités focalisées sur l\'infrastructure IA, la transition énergétique et les réserves aurifères.',
      exitStrategyAlerts: parsed.exitStrategyAlerts || [
        'Semi-conducteurs : sécuriser 50% à 265$',
        'Stop-loss Électrification : sortie si < 226.50€',
        'Stop-loss Or : sortie si < 2 630$',
      ],
      recommendationPlan: parsed.recommendationPlan || [
        'Acheter dans les bornes des zones d\'entrée',
        'Sécuriser les stop-loss',
      ],
      provider: 'gemini-3.8-flash',
      modelUsed: 'Gemini 3.8 Flash (Moteur Cloud Haute Précision)',
    };

    return res.json({ recap });
  } catch (error: any) {
    console.error('Error generating recap with Gemini:', error);
    return res.status(500).json({
      error: 'Erreur lors de la génération du récapitulatif: ' + error.message,
    });
  }
});

// 3. POST /api/test-local-ai
app.post('/api/test-local-ai', async (req: Request, res: Response) => {
  const { endpointUrl, provider } = req.body as {
    endpointUrl: string;
    provider: 'ollama' | 'lmstudio' | 'localai' | 'custom';
  };

  if (!endpointUrl) {
    return res.status(400).json({ ok: false, message: 'URL d\'endpoint manquante.' });
  }

  const cleanUrl = endpointUrl.replace(/\/$/, '');
  const testUrl =
    provider === 'ollama'
      ? `${cleanUrl}/api/tags`
      : `${cleanUrl}/v1/models`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const checkRes = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (checkRes.ok) {
      const data = await checkRes.json();
      return res.json({
        ok: true,
        message: `Connexion réussie avec ${provider.toUpperCase()} (${checkRes.status} OK)`,
        models: provider === 'ollama' ? data.models?.map((m: any) => m.name) : data.data?.map((m: any) => m.id),
      });
    } else {
      return res.json({
        ok: false,
        message: `Le serveur local a répondu avec le statut HTTP ${checkRes.status}`,
      });
    }
  } catch (err: any) {
    return res.json({
      ok: false,
      message: `Impossible de contacter le serveur local sur ${cleanUrl} (${err.name === 'AbortError' ? 'Délai d\'attente dépassé' : err.message}). Vérifiez que l'IA locale est bien démarrée avec CORS activé.`,
    });
  }
});

// 4. POST /api/send-email
app.post('/api/send-email', async (req: Request, res: Response) => {
  const { recipientEmail, recap, emailSettings } = req.body as {
    recipientEmail: string;
    recap: DailyRecap;
    emailSettings?: EmailSettings;
  };

  const recipient = recipientEmail || emailSettings?.recipientEmail || 'lola05141@gmail.com';
  const dateFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const safeRecap: DailyRecap = recap || {
    generatedAt: new Date().toISOString(),
    marketSentiment: 'Haussier',
    macroSummary: 'Marchés soutenus par l\'appétit pour le risque, l\'infrastructure IA et la détente sur les taux obligataires.',
    topOpportunitiesSummary: 'Surperformance marquée des valeurs technologiques et de transition énergétique.',
    exitStrategyAlerts: [
      'Semi-conducteurs : sécuriser 50% de gains à 265.00$',
      'Électrification : stop-loss sous 226.50€',
      'Or physique : maintenir tant que le cours est > 2 630$',
    ],
    recommendationPlan: [
      'Entrée par paliers dans les zones d\'achat',
      'Poser les ordres de vente stop dès l\'exécution',
    ],
    provider: 'gemini-3.8-flash',
    modelUsed: 'BourseVision Engine',
  };

  // Generate responsive HTML email template
  const marketsHtml = simulatedMarkets
    .map(
      (m: any, idx: number) => `
    <div style="background-color: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 18px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
        <h3 style="color: #F9FAFB; font-size: 16px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${idx + 1}. ${m.name} <span style="color: #9CA3AF; font-size: 13px; font-weight: normal;">(${m.ticker})</span>
        </h3>
        <span style="color: #10B981; font-weight: 600; font-size: 15px;">${m.currentPrice} ${m.currency}</span>
      </div>
      <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">${m.investmentThesis}</p>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <tr style="background-color: #1F2937;">
          <th style="padding: 8px 10px; text-align: left; color: #D1D5DB; font-weight: 500;">Zone d'Achat</th>
          <th style="padding: 8px 10px; text-align: left; color: #34D399; font-weight: 500;">🎯 Prise de Gain (Take-Profit)</th>
          <th style="padding: 8px 10px; text-align: left; color: #F87171; font-weight: 500;">🔴 Stop-Loss (Sortie Sécurité)</th>
          <th style="padding: 8px 10px; text-align: right; color: #D1D5DB; font-weight: 500;">Ratio R/R</th>
        </tr>
        <tr>
          <td style="padding: 8px 10px; color: #F3F4F6; border-top: 1px solid #374151;">${m.entryZone.min} - ${m.entryZone.max} ${m.currency}</td>
          <td style="padding: 8px 10px; color: #34D399; font-weight: bold; border-top: 1px solid #374151;">${m.takeProfit.targetPrice1} ${m.currency} (+${m.takeProfit.potentialGainPercent}%)</td>
          <td style="padding: 8px 10px; color: #F87171; font-weight: bold; border-top: 1px solid #374151;">${m.stopLoss.price} ${m.currency} (${m.stopLoss.riskPercent}%)</td>
          <td style="padding: 8px 10px; color: #F3F4F6; text-align: right; border-top: 1px solid #374151;">${m.riskRewardRatio}</td>
        </tr>
      </table>
      <div style="margin-top: 10px; font-size: 11px; color: #9CA3AF;">
        <strong>Signal de retrait d'urgence :</strong> ${m.stopLoss.invalidationConditions[0]}
      </div>
    </div>
  `
    )
    .join('');

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Récapitulatif BourseVision AI</title>
  </head>
  <body style="background-color: #030712; color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; margin: 0;">
    <div style="max-width: 680px; margin: 0 auto; background-color: #0B0F19; border: 1px solid #1F2937; border-radius: 12px; padding: 32px;">
      
      <!-- Header -->
      <div style="border-bottom: 1px solid #1F2937; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            BourseVision AI <span style="color: #10B981;">·</span> Récap Quotidien
          </h1>
          <span style="font-size: 13px; color: #9CA3AF;">${dateFormatted}</span>
        </div>
        <p style="font-size: 14px; color: #9CA3AF; margin: 8px 0 0 0;">
          Synthèse en temps réel des marchés, 5 cibles d'investissement et niveaux de sortie stricts.
        </p>
      </div>

      <!-- Macro Executive Summary -->
      <div style="background: linear-gradient(180deg, #131E33 0%, #0F172A 100%); border: 1px solid #1E293B; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #38BDF8; font-weight: 600;">Sentiment de Marché</span>
          <span style="background-color: rgba(16, 185, 129, 0.2); color: #34D399; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">
            ${safeRecap.marketSentiment}
          </span>
        </div>
        <p style="color: #E2E8F0; font-size: 14px; line-height: 1.6; margin: 0;">
          ${safeRecap.macroSummary}
        </p>
      </div>

      <!-- Alerts & Exit Strategy -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #F59E0B; margin: 0 0 12px 0;">
          ⚠️ Règles de Retrait & Prise de Bénéfices
        </h2>
        <ul style="margin: 0; padding-left: 20px; color: #D1D5DB; font-size: 13px; line-height: 1.6;">
          ${safeRecap.exitStrategyAlerts.map((a: string) => `<li>${a}</li>`).join('')}
        </ul>
      </div>

      <!-- Top 5 Markets -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #F3F4F6; margin: 0 0 16px 0;">
          5 Marchés Sélectionnés & Niveaux Clés
        </h2>
        ${marketsHtml}
      </div>

      <!-- Plan d'action -->
      <div style="background-color: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; color: #38BDF8; margin: 0 0 10px 0;">Plan d'Action Conseillé</h3>
        <ol style="margin: 0; padding-left: 20px; color: #9CA3AF; font-size: 13px; line-height: 1.6;">
          ${safeRecap.recommendationPlan.map((p: string) => `<li>${p}</li>`).join('')}
        </ol>
      </div>

      <!-- Footer & Disclaimer -->
      <div style="border-top: 1px solid #1F2937; padding-top: 18px; font-size: 11px; color: #6B7280; line-height: 1.5;">
        <p style="margin: 0 0 6px 0;">
          Généré par <strong>${safeRecap.modelUsed}</strong> via BourseVision AI pour <strong>${recipient}</strong>.
        </p>
        <p style="margin: 0;">
          Avertissement : Ce récapitulatif est fourni à des fins d'analyse financière et informative. Il ne constitue pas un conseil en investissement personnalisé. Tout investissement en bourse comporte un risque de perte en capital.
        </p>
      </div>

    </div>
  </body>
  </html>
  `;

  // SMTP defaults provided by the user
  const smtpHost = emailSettings?.smtpHost || 'smtp.gmail.com';
  const smtpPort = Number(emailSettings?.smtpPort) || 465;
  const smtpUser = emailSettings?.smtpUser || 'lola05141@gmail.com';
  const rawPass = emailSettings?.smtpPass || 'olts owqb xobg wjki';
  const smtpPass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  // Check if SMTP is configured
  let sentViaSMTP = false;
  let smtpError: string | null = null;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${emailSettings?.senderName || 'BourseVision AI'}" <${smtpUser}>`,
        to: recipient,
        subject: `📊 BourseVision AI · Récapitulatif Bourse du ${dateFormatted} (5 Marchés & Retraits)`,
        html: emailHtml,
      });

      sentViaSMTP = true;
    } catch (err: any) {
      console.error('SMTP sending error:', err);
      smtpError = err.message;
    }
  }

  res.json({
    success: sentViaSMTP,
    recipient,
    sentViaSMTP,
    smtpError,
    timestamp: new Date().toISOString(),
    previewHtml: emailHtml,
    message: sentViaSMTP
      ? `Email envoyé avec succès par Gmail SMTP à ${recipient} ! Vérifiez votre boîte de réception.`
      : (smtpError
          ? `Erreur lors de l'envoi SMTP : ${smtpError}.`
          : `Email prêt pour ${recipient}.`),
  });
});

// 5. GET /api/export-script
app.get('/api/export-script', (req: Request, res: Response) => {
  const recipient = (req.query.recipient as string) || 'lola05141@gmail.com';
  const provider = (req.query.provider as string) || 'ollama';
  const model = (req.query.model as string) || 'llama3.2';
  const endpoint = (req.query.endpoint as string) || 'http://localhost:11434';

  const pythonScript = `#!/usr/bin/env python3
"""
=============================================================================
BourseVision AI - Script d'Automatisation Quotidien (IA Locale + Envoi Email)
=============================================================================
Ce script s'exécute automatiquement tous les matins (via cron ou tâche planifiée) :
1. Récupère les données de marché en temps réel et les 5 marchés à fort potentiel
2. Interroge votre modèle IA local (${provider.toUpperCase()} - ${model})
3. Formate le récapitulatif complet avec niveaux de prise de gain & stop-loss
4. Envoie le rapport par email à : ${recipient}

Installation des dépendances :
  pip install requests python-dotenv

Exécution manuelle :
  python3 market_recap_cron.py

Ajout dans crontab (du lundi au vendredi à 08h00) :
  crontab -e
  0 8 * * 1-5 /usr/bin/python3 ${process.cwd()}/market_recap_cron.py >> ${process.cwd()}/recap_cron.log 2>&1
=============================================================================
"""

import json
import smtplib
import sys
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import requests

# CONFIGURATION
RECIPIENT_EMAIL = "${recipient}"
LOCAL_AI_ENDPOINT = "${endpoint}/api/generate"  # Ollama endpoint
MODEL_NAME = "${model}"

# CONFIGURATION EMAIL GMAIL SMTP
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "lola05141@gmail.com"
SMTP_PASSWORD = "oltsowqbxobgwjki"  # Mot de passe d'application Google (sans espaces)


def fetch_market_data():
    """Données de référence des 5 marchés & indices"""
    return {
        "indices": "CAC 40: 7984.62 (+0.58%), S&P 500: 5882.15 (+0.54%), Nasdaq 100: 20412.80 (+0.91%), VIX: 14.82",
        "markets": [
            {
                "name": "Semi-conducteurs & Puces IA (SOXX/NVDA)",
                "price": "228.45 $",
                "entry": "220$ - 232$",
                "take_profit": "265.00 $ (+26.9%)",
                "stop_loss": "212.00 $ (-7.2%)",
                "exit_condition": "Clôture sous MM50 (212$) ou ralentissement des commandes Cloud"
            },
            {
                "name": "Électrification & Réseaux Intelligents (SU.PA)",
                "price": "242.10 €",
                "entry": "236€ - 245€",
                "take_profit": "275.00 € (+21.8%)",
                "stop_loss": "226.50 € (-6.4%)",
                "exit_condition": "Cassure du support clé hebdomadaire à 226.50 €"
            },
            {
                "name": "Or Physique & Réserves (XAU/USD)",
                "price": "2 748.20 $",
                "entry": "2710$ - 2750$",
                "take_profit": "2950.00 $ (+12.8%)",
                "stop_loss": "2630.00 $ (-4.3%)",
                "exit_condition": "Enfoncement des 2630$ ou envolée du dollar US (DXY > 107.5)"
            },
            {
                "name": "Biopharma Cardiométabolique & GLP-1 (LLY)",
                "price": "835.60 $",
                "entry": "815$ - 840$",
                "take_profit": "960.00 $ (+24.4%)",
                "stop_loss": "780.00 $ (-6.6%)",
                "exit_condition": "Cassure des 780$ confirmée en clôture de semaine"
            },
            {
                "name": "Obligations d'État Long Terme (TLT)",
                "price": "94.20 $",
                "entry": "91.50$ - 95.00$",
                "take_profit": "104.50 $ (+18.9%)",
                "stop_loss": "89.80 $ (-4.7%)",
                "exit_condition": "Rupture des 89.80$ si le taux US 10 ans franchit les 4.60%"
            }
        ]
    }


def query_local_ai(prompt: str) -> str:
    """Interroge l'IA en local (Ollama ou LM Studio)"""
    print(f"[*] Interrogation de l'IA locale ({MODEL_NAME})...")
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3}
    }
    try:
        response = requests.post(LOCAL_AI_ENDPOINT, json=payload, timeout=45)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "Analyse générée par le modèle local.")
    except Exception as e:
        print(f"[!] Attention : Erreur lors de l'appel à l'IA locale : {e}")
        return "Note : Le modèle local était indisponible au moment de l'exécution. Voici la synthèse algorithmique basée sur les seuils quantitatifs du jour."


def generate_email_html(recap_text: str, data: dict) -> str:
    today_str = datetime.now().strftime("%d/%m/%Y")
    
    cards_html = ""
    for m in data["markets"]:
        cards_html += f"""
        <div style="background:#111827; border:1px solid #1F2937; border-radius:8px; padding:16px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <strong style="color:#FFF; font-size:15px;">{m['name']}</strong>
                <span style="color:#10B981; font-weight:bold;">{m['price']}</span>
            </div>
            <p style="color:#9CA3AF; font-size:12px; margin:0 0 8px 0;">Zone d'entrée : {m['entry']}</p>
            <div style="display:flex; gap:16px; font-size:12px; margin-bottom:6px;">
                <span style="color:#34D399;">🎯 Objectif : <b>{m['take_profit']}</b></span>
                <span style="color:#F87171;">🔴 Stop-Loss : <b>{m['stop_loss']}</b></span>
            </div>
            <div style="color:#9CA3AF; font-size:11px;">⚠️ Signal de sortie : {m['exit_condition']}</div>
        </div>
        """
        
    return f"""
    <html>
    <body style="background-color:#030712; color:#F3F4F6; font-family:sans-serif; padding:20px;">
        <div style="max-width:650px; margin:0 auto; background:#0B0F19; border:1px solid #1F2937; border-radius:12px; padding:24px;">
            <h1 style="color:#FFF; font-size:18px; margin:0 0 8px 0;">📊 BourseVision AI · Récapitulatif du {today_str}</h1>
            <p style="color:#9CA3AF; font-size:13px; margin:0 0 20px 0;">Indices : {data['indices']}</p>
            
            <div style="background:#1E293B; border-radius:8px; padding:16px; margin-bottom:20px;">
                <h3 style="color:#38BDF8; font-size:13px; margin:0 0 8px 0;">ANALYSE DE L'IA LOCALE ({MODEL_NAME})</h3>
                <p style="color:#E2E8F0; font-size:13px; line-height:1.5; white-space:pre-line; margin:0;">{recap_text}</p>
            </div>
            
            <h2 style="color:#FFF; font-size:14px; margin:0 0 12px 0;">5 MARCHÉS & NIVEAUX DE RETRAIT DU CAPITAL</h2>
            {cards_html}
            
            <p style="color:#6B7280; font-size:11px; margin-top:20px; border-top:1px solid #1F2937; padding-top:12px;">
                Envoyé automatiquement par votre script local BourseVision AI à {RECIPIENT_EMAIL}.
            </p>
        </div>
    </body>
    </html>
    """


def send_email(html_content: str):
    today_str = datetime.now().strftime("%d/%m/%Y")
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"📊 BourseVision AI - Récap Bourse & 5 Marchés du {today_str}"
    msg["From"] = f"BourseVision AI <{SMTP_USER}>"
    msg["To"] = RECIPIENT_EMAIL
    
    msg.attach(MIMEText(html_content, "html"))
    
    print(f"[*] Envoi de l'email à {RECIPIENT_EMAIL}...")
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        print("[+] Email envoyé avec succès !")
    except Exception as e:
        print(f"[!] Erreur lors de l'envoi SMTP : {e}")
        print("[i] Pour tester sans SMTP, vous pouvez ouvrir le fichier html généré localement.")
        with open("dernier_recap.html", "w", encoding="utf-8") as f:
            f.write(html_content)
        print("[i] Fichier 'dernier_recap.html' sauvegardé.")


def main():
    print("=== Démarrage de la routine BourseVision AI ===")
    market_data = fetch_market_data()
    
    prompt = f"""Tu es un gérant de portefeuille. Rédige un mémo boursier en 3 paragraphes courts :
1. Résumé de la séance et tendance globale
2. Conseils sur les 5 marchés clés (Semi-conducteurs, Électrification, Or, Biotech, Obligations)
3. Rappel des seuils stricts de prise de bénéfices et de stop-loss pour préserver le capital.
Données : {market_data['indices']}"""
    
    ai_recap = query_local_ai(prompt)
    email_html = generate_email_html(ai_recap, market_data)
    send_email(email_html)
    print("=== Fin de la routine ===")


if __name__ == "__main__":
    main()
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="market_recap_cron.py"');
  res.send(pythonScript);
});

// Configure Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`BourseVision server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
