import { MarketIndex, InvestmentMarket, MacroIndicator } from '../types/market.js';

export const MAJOR_INDICES: MarketIndex[] = [
  {
    id: 'cac40',
    symbol: '^FCHI',
    name: 'CAC 40',
    region: 'Europe',
    currentPrice: 7984.62,
    change24h: 46.18,
    change24hPercent: 0.58,
    high24h: 8012.40,
    low24h: 7935.10,
    volume: '3.18 Md€',
    trend: 'up',
    history1D: [
      { time: '09:00', price: 7940.2 },
      { time: '10:30', price: 7962.5 },
      { time: '12:00', price: 7954.1 },
      { time: '13:30', price: 7975.8 },
      { time: '15:00', price: 7998.4 },
      { time: '16:30', price: 8009.2 },
      { time: '17:35', price: 7984.62 },
    ]
  },
  {
    id: 'sp500',
    symbol: '^GSPC',
    name: 'S&P 500',
    region: 'US',
    currentPrice: 5882.15,
    change24h: 31.40,
    change24hPercent: 0.54,
    high24h: 5898.30,
    low24h: 5845.20,
    volume: '38.4 Md$',
    trend: 'up',
    history1D: [
      { time: '15:30', price: 5850.1 },
      { time: '17:00', price: 5865.4 },
      { time: '18:30', price: 5878.9 },
      { time: '20:00', price: 5895.0 },
      { time: '21:30', price: 5882.15 },
    ]
  },
  {
    id: 'nasdaq',
    symbol: '^IXIC',
    name: 'Nasdaq 100',
    region: 'US',
    currentPrice: 20412.80,
    change24h: 184.20,
    change24hPercent: 0.91,
    high24h: 20485.10,
    low24h: 20210.00,
    volume: '22.8 Md$',
    trend: 'up',
    history1D: [
      { time: '15:30', price: 20230 },
      { time: '17:00', price: 20310 },
      { time: '18:30', price: 20380 },
      { time: '20:00', price: 20460 },
      { time: '21:30', price: 20412.8 },
    ]
  },
  {
    id: 'dax',
    symbol: '^GDAXI',
    name: 'DAX 40',
    region: 'Europe',
    currentPrice: 19488.75,
    change24h: 72.30,
    change24hPercent: 0.37,
    high24h: 19540.20,
    low24h: 19390.40,
    volume: '4.6 Md€',
    trend: 'up',
    history1D: [
      { time: '09:00', price: 19410 },
      { time: '11:00', price: 19450 },
      { time: '13:00', price: 19430 },
      { time: '15:30', price: 19520 },
      { time: '17:35', price: 19488.75 },
    ]
  },
  {
    id: 'eurostoxx',
    symbol: '^STOXX50E',
    name: 'Euro Stoxx 50',
    region: 'Europe',
    currentPrice: 4945.10,
    change24h: 19.80,
    change24hPercent: 0.40,
    high24h: 4962.30,
    low24h: 4920.80,
    volume: '6.2 Md€',
    trend: 'up',
    history1D: [
      { time: '09:00', price: 4925 },
      { time: '12:00', price: 4938 },
      { time: '15:00', price: 4958 },
      { time: '17:35', price: 4945.1 },
    ]
  },
  {
    id: 'nikkei',
    symbol: '^N225',
    name: 'Nikkei 225',
    region: 'Asie',
    currentPrice: 38920.40,
    change24h: -115.60,
    change24hPercent: -0.30,
    high24h: 39150.00,
    low24h: 38780.00,
    volume: '18.1 Md¥',
    trend: 'down',
    history1D: [
      { time: '02:00', price: 39050 },
      { time: '04:00', price: 38980 },
      { time: '06:00', price: 38810 },
      { time: '08:00', price: 38920.4 },
    ]
  }
];

export const MACRO_INDICATORS: MacroIndicator[] = [
  {
    name: 'Taux US 10 Ans (Treasuries)',
    symbol: 'US10Y',
    value: '4.21%',
    change: '-0.04 pt',
    trend: 'down',
    impact: 'Détente favorable aux valorisations d\'actifs risqués et technologiques.'
  },
  {
    name: 'Pétrole Brent (Baril)',
    symbol: 'BRENT',
    value: '74.85 $',
    change: '-1.12%',
    trend: 'down',
    impact: 'Modération des tensions sur l\'inflation globale.'
  },
  {
    name: 'Or au Comptant (Once)',
    symbol: 'XAU/USD',
    value: '2 748.20 $',
    change: '+0.42%',
    trend: 'up',
    impact: 'Recherche de couverture géopolitique et dédollarisation.'
  },
  {
    name: 'Volatilité Marché (VIX)',
    symbol: 'VIX',
    value: '14.82',
    change: '-0.75 pt',
    trend: 'down',
    impact: 'Régime de risque stable favorable aux prises de position.'
  },
  {
    name: 'Euro / Dollar',
    symbol: 'EUR/USD',
    value: '1.0825',
    change: '+0.15%',
    trend: 'up',
    impact: 'Consolidation autour des niveaux d\'équilibre post-BCE.'
  }
];

export const TOP_5_INVESTMENT_MARKETS: InvestmentMarket[] = [
  {
    id: 'market-1-semiconductors',
    ticker: 'SOXX / NVDA',
    name: 'Semi-conducteurs & Puces IA Avancées',
    sector: 'Technologie & Hardware Haute Performance',
    category: 'Actions / ETF',
    currentPrice: 228.45,
    currency: '$',
    change24hPercent: 2.34,
    change7dPercent: 5.82,
    change30dPercent: 14.10,
    volatility: 'Élevée',
    rsi: 62.4,
    investmentThesis: 'Dépenses records en investissements matériels (CapEx) des géants du Cloud pour les data centers IA. Carnets de commandes saturés sur 18 mois avec pricing power élevé.',
    catalysts: [
      'Annonces de nouveaux serveurs ultra-denses et puces de nouvelle génération',
      'Marges brutes opérationnelles maintenues au-dessus de 70%',
      'Adoption massive dans la conduite autonome et le calcul scientifique'
    ],
    entryZone: {
      min: 220.00,
      max: 232.00,
      currentDistancePercent: 0.8
    },
    takeProfit: {
      targetPrice1: 265.00,
      targetPrice2: 290.00,
      potentialGainPercent: 26.9,
      recommendedHorizon: '3 à 6 mois (Swing Moyen Terme)'
    },
    stopLoss: {
      price: 212.00,
      riskPercent: -7.2,
      invalidationConditions: [
        'Clôture journalière sous la moyenne mobile 50 jours (212 $)',
        'Rupture ou ralentissement signalé des dépenses CapEx chez les hyperscalers',
        'Divergence baissière marquée sur le RSI au-dessus de 78'
      ]
    },
    riskRewardRatio: '1:3.7',
    status: 'Achat Recommandé',
    history: {
      '1D': [
        { time: '15:30', price: 223.10 },
        { time: '16:30', price: 225.40 },
        { time: '18:00', price: 227.15 },
        { time: '19:30', price: 226.80 },
        { time: '21:00', price: 228.45 },
      ],
      '1W': [
        { time: 'J-6', price: 215.80 },
        { time: 'J-5', price: 218.40 },
        { time: 'J-4', price: 216.90 },
        { time: 'J-3', price: 222.10 },
        { time: 'J-2', price: 224.50 },
        { time: 'J-1', price: 227.00 },
        { time: 'Auj', price: 228.45 },
      ],
      '1M': [
        { time: 'S-4', price: 200.20 },
        { time: 'S-3', price: 208.50 },
        { time: 'S-2', price: 214.30 },
        { time: 'S-1', price: 222.00 },
        { time: 'Auj', price: 228.45 },
      ],
      '1Y': [
        { time: 'T1', price: 155.00 },
        { time: 'T2', price: 178.40 },
        { time: 'T3', price: 195.20 },
        { time: 'T4', price: 228.45 },
      ]
    }
  },
  {
    id: 'market-2-electrification',
    ticker: 'SU.PA / ETN',
    name: 'Électrification Industrielle & Réseaux Intelligents',
    sector: 'Équipements Électriques & Transition Énergétique',
    category: 'Énergie & Tech',
    currentPrice: 242.10,
    currency: '€',
    change24hPercent: 1.15,
    change7dPercent: 3.42,
    change30dPercent: 8.75,
    volatility: 'Modérée',
    rsi: 56.8,
    investmentThesis: 'Le goulot d\'étranglement énergétique mondial oblige les opérateurs de réseaux et data centers à tripler leurs équipements de transformation, distribution et gestion thermique.',
    catalysts: [
      'Plans de relance européens et américains pour les smart grids',
      'Pénurie critique de transformateurs haute tension assurant une visibilité pluriannuelle',
      'Marges nettes en expansion continue avec contrats indexés sur l\'inflation'
    ],
    entryZone: {
      min: 236.00,
      max: 245.00,
      currentDistancePercent: 1.2
    },
    takeProfit: {
      targetPrice1: 275.00,
      targetPrice2: 295.00,
      potentialGainPercent: 21.8,
      recommendedHorizon: '6 à 12 mois (Tendance Fondamentale)'
    },
    stopLoss: {
      price: 226.50,
      riskPercent: -6.4,
      invalidationConditions: [
        'Cassure du support clé hebdomadaire à 226.50 €',
        'Contraction brutale des commandes B2B de gestion d\'énergie',
        'Blocage sur les chaînes de valeur de cuivre et matières de base'
      ]
    },
    riskRewardRatio: '1:3.4',
    status: 'Accumulation',
    history: {
      '1D': [
        { time: '09:00', price: 239.40 },
        { time: '11:30', price: 240.80 },
        { time: '14:00', price: 241.30 },
        { time: '16:00', price: 242.60 },
        { time: '17:35', price: 242.10 },
      ],
      '1W': [
        { time: 'J-6', price: 234.10 },
        { time: 'J-5', price: 236.00 },
        { time: 'J-4', price: 237.50 },
        { time: 'J-3', price: 238.20 },
        { time: 'J-2', price: 240.10 },
        { time: 'J-1', price: 241.00 },
        { time: 'Auj', price: 242.10 },
      ],
      '1M': [
        { time: 'S-4', price: 222.60 },
        { time: 'S-3', price: 228.10 },
        { time: 'S-2', price: 233.40 },
        { time: 'S-1', price: 238.90 },
        { time: 'Auj', price: 242.10 },
      ],
      '1Y': [
        { time: 'T1', price: 182.00 },
        { time: 'T2', price: 204.50 },
        { time: 'T3', price: 219.00 },
        { time: 'T4', price: 242.10 },
      ]
    }
  },
  {
    id: 'market-3-gold-safehaven',
    ticker: 'XAU / GDX',
    name: 'Or Physique & Producteurs Aurifères de Premier Rang',
    sector: 'Actifs Tangibles & Réserves Stratégiques',
    category: 'Matières Premières',
    currentPrice: 2748.20,
    currency: '$',
    change24hPercent: 0.42,
    change7dPercent: 1.88,
    change30dPercent: 6.94,
    volatility: 'Faible',
    rsi: 67.2,
    investmentThesis: 'Achats ininterrompus des banques centrales des pays émergents pour diversifier leurs réserves hors dollar, couplés aux déficits budgétaires structurels des grandes puissances.',
    catalysts: [
      'Poursuite des baisses de taux directeurs qui abaissent le coût d\'opportunité de détenir de l\'or',
      'Tensions géopolitiques persistantes créant une prime de sécurité',
      'Flux entrants dans les ETF aurifères physiques après 2 ans de décollecte'
    ],
    entryZone: {
      min: 2710.00,
      max: 2750.00,
      currentDistancePercent: 0.1
    },
    takeProfit: {
      targetPrice1: 2950.00,
      targetPrice2: 3100.00,
      potentialGainPercent: 12.8,
      recommendedHorizon: '3 à 9 mois (Protection & Performance)'
    },
    stopLoss: {
      price: 2630.00,
      riskPercent: -4.3,
      invalidationConditions: [
        'Enfoncement du support technique majeur à 2 630 $ / once',
        'Flambée imprévue du dollar américain (DXY dépassant 107.50)',
        'Hausse inattendue des rendements réels obligataires au-dessus de 2.50%'
      ]
    },
    riskRewardRatio: '1:3.0',
    status: 'Achat Recommandé',
    history: {
      '1D': [
        { time: '08:00', price: 2736.0 },
        { time: '11:00', price: 2741.2 },
        { time: '14:00', price: 2744.5 },
        { time: '17:00', price: 2746.8 },
        { time: '20:00', price: 2748.2 },
      ],
      '1W': [
        { time: 'J-6', price: 2697.5 },
        { time: 'J-5', price: 2712.0 },
        { time: 'J-4', price: 2724.8 },
        { time: 'J-3', price: 2735.0 },
        { time: 'J-2', price: 2739.4 },
        { time: 'J-1', price: 2744.0 },
        { time: 'Auj', price: 2748.2 },
      ],
      '1M': [
        { time: 'S-4', price: 2570.0 },
        { time: 'S-3', price: 2620.5 },
        { time: 'S-2', price: 2675.0 },
        { time: 'S-1', price: 2718.0 },
        { time: 'Auj', price: 2748.2 },
      ],
      '1Y': [
        { time: 'T1', price: 2040.0 },
        { time: 'T2', price: 2310.0 },
        { time: 'T3', price: 2515.0 },
        { time: 'T4', price: 2748.2 },
      ]
    }
  },
  {
    id: 'market-4-biotech-glp1',
    ticker: 'LLY / NOVO-B',
    name: 'Biopharma Cardiométabolique & Molécules GLP-1',
    sector: 'Santé, Traitements Métaboliques & R&D Clinique',
    category: 'Santé & Bio',
    currentPrice: 835.60,
    currency: '$',
    change24hPercent: 1.82,
    change7dPercent: 4.15,
    change30dPercent: 11.20,
    volatility: 'Modérée',
    rsi: 59.1,
    investmentThesis: 'Révolution médicale des agonistes des récepteurs GLP-1 s\'étendant au-delà du diabète et de l\'obésité vers les pathologies cardiaques, rénales, le sommeil et la stéatose hépatique (MASH).',
    catalysts: [
      'Résultats positifs des essais cliniques de phase 3 sur les indications cardiovasculaires',
      'Investissements massifs dans les usines de production résolvant les ruptures d\'approvisionnement',
      'Remboursement progressif accordé par les assureurs et systèmes de santé'
    ],
    entryZone: {
      min: 815.00,
      max: 840.00,
      currentDistancePercent: 0.6
    },
    takeProfit: {
      targetPrice1: 960.00,
      targetPrice2: 1040.00,
      potentialGainPercent: 24.4,
      recommendedHorizon: '4 à 8 mois (Croissance Fondamentale)'
    },
    stopLoss: {
      price: 780.00,
      riskPercent: -6.6,
      invalidationConditions: [
        'Cassure du support des 780 $ confirmée en clôture de semaine',
        'Effet indésirable inattendu ou rejet d\'extension d\'indication par la FDA/EMA',
        'Guerre des prix agressive par des biosimilaires plus tôt que prévu'
      ]
    },
    riskRewardRatio: '1:3.7',
    status: 'Achat Recommandé',
    history: {
      '1D': [
        { time: '15:30', price: 822.0 },
        { time: '17:00', price: 828.4 },
        { time: '18:30', price: 831.0 },
        { time: '20:00', price: 837.2 },
        { time: '21:30', price: 835.6 },
      ],
      '1W': [
        { time: 'J-6', price: 802.0 },
        { time: 'J-5', price: 812.5 },
        { time: 'J-4', price: 818.0 },
        { time: 'J-3', price: 825.4 },
        { time: 'J-2', price: 830.0 },
        { time: 'J-1', price: 832.5 },
        { time: 'Auj', price: 835.6 },
      ],
      '1M': [
        { time: 'S-4', price: 751.0 },
        { time: 'S-3', price: 775.2 },
        { time: 'S-2', price: 805.0 },
        { time: 'S-1', price: 820.0 },
        { time: 'Auj', price: 835.6 },
      ],
      '1Y': [
        { time: 'T1', price: 590.0 },
        { time: 'T2', price: 710.0 },
        { time: 'T3', price: 790.0 },
        { time: 'T4', price: 835.6 },
      ]
    }
  },
  {
    id: 'market-5-sovereign-bonds',
    ticker: 'TLT / VETY',
    name: 'Obligations d\'État Long Terme (20+ Ans Sovereign Bonds)',
    sector: 'Rente Fixe & Sensibilité Taux Directeur',
    category: 'Obligations',
    currentPrice: 94.20,
    currency: '$',
    change24hPercent: 0.65,
    change7dPercent: 1.40,
    change30dPercent: 3.10,
    volatility: 'Faible',
    rsi: 48.5,
    investmentThesis: 'Rendement coupon élevé avec un puissant effet de levier sur le capital lors des phases de baisse des taux par la FED et la BCE. Rôle d\'amortisseur de choc en cas de ralentissement économique.',
    catalysts: [
      'Rythme régulier de baisse de 25 bps lors des prochaines réunions de politique monétaire',
      'Normalisation des courbes de taux inversées',
      'Flux défensifs institutionnels recherchant des coupons fixes garantis par l\'État'
    ],
    entryZone: {
      min: 91.50,
      max: 95.00,
      currentDistancePercent: 0.5
    },
    takeProfit: {
      targetPrice1: 104.50,
      targetPrice2: 112.00,
      potentialGainPercent: 18.9,
      recommendedHorizon: '6 à 18 mois (Cycle Macro Monétaire)'
    },
    stopLoss: {
      price: 89.80,
      riskPercent: -4.7,
      invalidationConditions: [
        'Rupture des 89.80 $ si le taux US 10 ans franchit durablement les 4.60%',
        'Surprise haussière persistante sur les chiffres de l\'inflation CPI > 3.5%',
        'Émission massive de dette souveraine dégradant la prime de terme'
      ]
    },
    riskRewardRatio: '1:4.0',
    status: 'Accumulation',
    history: {
      '1D': [
        { time: '15:30', price: 93.6 },
        { time: '17:00', price: 93.9 },
        { time: '18:30', price: 94.1 },
        { time: '20:00', price: 94.4 },
        { time: '21:30', price: 94.2 },
      ],
      '1W': [
        { time: 'J-6', price: 92.9 },
        { time: 'J-5', price: 93.2 },
        { time: 'J-4', price: 93.0 },
        { time: 'J-3', price: 93.5 },
        { time: 'J-2', price: 93.8 },
        { time: 'J-1', price: 94.0 },
        { time: 'Auj', price: 94.2 },
      ],
      '1M': [
        { time: 'S-4', price: 91.4 },
        { time: 'S-3', price: 92.2 },
        { time: 'S-2', price: 93.1 },
        { time: 'S-1', price: 93.7 },
        { time: 'Auj', price: 94.2 },
      ],
      '1Y': [
        { time: 'T1', price: 92.0 },
        { time: 'T2', price: 88.5 },
        { time: 'T3', price: 91.0 },
        { time: 'T4', price: 94.2 },
      ]
    }
  }
];
