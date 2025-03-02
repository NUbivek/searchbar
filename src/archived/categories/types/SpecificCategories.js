/**
 * Specific category definitions for search results
 * These are targeted categories that are evaluated based on query relevance
 */

import { CategoryBase, createCategory } from './CategoryBase';

/**
 * Market Intelligence Category
 */
export const MarketIntelligenceCategory = createCategory(
  'market-intelligence',
  'Market Intelligence',
  'Insights on industry trends, competitive dynamics, and market positioning',
  [
    'industry trends', 'market trends', 'disruption', 'competitive dynamics', 
    'market positioning', 'competitive landscape', 'market intelligence',
    'strategic positioning', 'market opportunity', 'market threat',
    'competitive analysis', 'competitor analysis', 'market maturity',
    'emerging trends', 'market shift', 'industry evolution'
  ],
  {
    color: '#4285F4', // Blue
    icon: 'binoculars',
    priority: 3
  }
);

/**
 * Growth Strategy Category
 */
export const GrowthStrategyCategory = createCategory(
  'growth-strategy',
  'Growth Strategy',
  'Approaches to customer acquisition, market expansion, and business growth',
  [
    'TAM', 'total addressable market', 'market segmentation', 'customer acquisition', 
    'retention', 'growth levers', 'growth strategy', 'expansion strategy',
    'market penetration', 'market development', 'product development',
    'diversification', 'user acquisition', 'customer retention',
    'churn reduction', 'expansion', 'scaling', 'growth tactics'
  ],
  {
    color: '#0F9D58', // Green
    icon: 'chart-line',
    priority: 3
  }
);

/**
 * Investment Strategy Category
 */
export const InvestmentStrategyCategory = createCategory(
  'investment-strategy',
  'Investment Strategy',
  'Approaches to capital allocation, value creation, and portfolio management',
  [
    'value creation', 'strategic investment', 'portfolio construction', 
    'risk-adjusted return', 'investment strategy', 'capital allocation',
    'investment thesis', 'investment approach', 'portfolio management',
    'diversification strategy', 'asset allocation', 'investment focus',
    'investment criteria', 'investment philosophy', 'alpha generation'
  ],
  {
    color: '#F4B400', // Yellow
    icon: 'money-bill-trend-up',
    priority: 3
  }
);

/**
 * Financial Performance Category
 */
export const FinancialPerformanceCategory = createCategory(
  'financial-performance',
  'Financial Performance',
  'Revenue, unit economics, cost structure, and profitability metrics',
  [
    'revenue', 'unit economics', 'cost structure', 'cash flow', 'profitability',
    'gross margin', 'operating margin', 'net margin', 'earnings', 'EBITDA',
    'financial results', 'financial metrics', 'financial performance',
    'profit and loss', 'income statement', 'balance sheet', 'cash flow statement'
  ],
  {
    color: '#DB4437', // Red
    icon: 'chart-simple',
    priority: 3,
    formatContent: (content) => {
      if (!content || typeof content !== 'string') return '';
      // Emphasize financial figures
      return content.replace(/(\$\d+(\.\d+)?(M|B|K)?|\d+(\.\d+)?%)/g, '<strong>$1</strong>');
    }
  }
);

/**
 * Valuation & Benchmarking Category
 */
export const ValuationBenchmarkingCategory = createCategory(
  'valuation-benchmarking',
  'Valuation & Benchmarking',
  'Valuation methodologies, comparable analysis, and performance benchmarks',
  [
    'DCF', 'comparables', 'multiples', 'benchmarks', 'Rule of 40', 'CAC/LTV',
    'valuation', 'enterprise value', 'market cap', 'EV/EBITDA', 'P/E',
    'discounted cash flow', 'terminal value', 'growth rate', 'discount rate',
    'comparable companies', 'trading multiples', 'valuation metrics'
  ],
  {
    color: '#4285F4', // Blue
    icon: 'scale-balanced',
    priority: 4
  }
);

/**
 * Exit & Liquidity Category
 */
export const ExitLiquidityCategory = createCategory(
  'exit-liquidity',
  'Exit & Liquidity',
  'Exit pathways, M&A opportunities, and liquidity options',
  [
    'M&A', 'exit pathways', 'strategic buyer', 'IPO readiness', 
    'secondary transactions', 'liquidity event', 'exit strategy',
    'acquisition target', 'merger', 'public offering', 'exit valuation',
    'exit multiples', 'exit timing', 'buyer landscape', 'exit options'
  ],
  {
    color: '#F4B400', // Yellow
    icon: 'door-open',
    priority: 4
  }
);

/**
 * M&A & Consolidation Category
 */
export const MAConsolidationCategory = createCategory(
  'ma-consolidation',
  'M&A & Consolidation',
  'Market consolidation, roll-up strategies, and deal structures',
  [
    'fragmentation', 'roll-up', 'consolidation', 'deal structures', 'synergy',
    'acquisition', 'merger', 'integration', 'transaction', 'deal value',
    'deal multiples', 'acquisition strategy', 'buy-and-build', 'add-on acquisition',
    'platform acquisition', 'acquisition target', 'buyer', 'seller'
  ],
  {
    color: '#DB4437', // Red
    icon: 'handshake',
    priority: 4
  }
);

/**
 * Technology & Digital Category
 */
export const TechnologyDigitalCategory = createCategory(
  'technology-digital',
  'Technology & Digital',
  'Digital transformation, technology adoption, and innovation',
  [
    'AI', 'automation', 'digitization', 'data-driven', 'analytics', 'infrastructure',
    'digital transformation', 'technology adoption', 'technology stack',
    'innovation', 'machine learning', 'cloud computing', 'SaaS',
    'digital strategy', 'tech enablement', 'emerging technology'
  ],
  {
    color: '#0F9D58', // Green
    icon: 'microchip',
    priority: 4
  }
);

/**
 * Operational Efficiency Category
 */
export const OperationalEfficiencyCategory = createCategory(
  'operational-efficiency',
  'Operational Efficiency',
  'Cost optimization, margin expansion, and operational improvement',
  [
    'cost optimization', 'margin expansion', 'scalability', 'execution', 'supply chain',
    'operational excellence', 'process improvement', 'efficiency gains',
    'productivity improvement', 'cost reduction', 'economies of scale',
    'lean operations', 'operating model', 'resource allocation'
  ],
  {
    color: '#F4B400', // Yellow
    icon: 'gears',
    priority: 5
  }
);

/**
 * Data Strategy Category
 */
export const DataStrategyCategory = createCategory(
  'data-strategy',
  'Data Strategy',
  'Data governance, infrastructure, and monetization approaches',
  [
    'data governance', 'interoperability', 'infrastructure', 'monetization', 'AI',
    'data management', 'data architecture', 'data security', 'data privacy',
    'data analytics', 'big data', 'data platform', 'data lake', 'data warehouse',
    'data visualization', 'business intelligence', 'data-driven decision making'
  ],
  {
    color: '#4285F4', // Blue
    icon: 'database',
    priority: 5
  }
);

/**
 * Platform Economics Category
 */
export const PlatformEconomicsCategory = createCategory(
  'platform-economics',
  'Platform Economics',
  'Network effects, platform strategies, and value chain positioning',
  [
    'network effects', 'virality', 'defensibility', 'partnerships', 'value chain',
    'platform strategy', 'platform business model', 'ecosystem', 'marketplace',
    'multi-sided platform', 'supply-side', 'demand-side', 'platform governance',
    'platform regulation', 'platform monetization', 'platform adoption'
  ],
  {
    color: '#0F9D58', // Green
    icon: 'network-wired',
    priority: 5
  }
);

/**
 * Customer & Market Category
 */
export const CustomerMarketCategory = createCategory(
  'customer-market',
  'Customer & Market',
  'Brand strategy, customer engagement, and market differentiation',
  [
    'brand strategy', 'customer engagement', 'differentiation', 'pricing', 'market share',
    'customer experience', 'customer journey', 'customer loyalty', 'customer satisfaction',
    'brand positioning', 'brand equity', 'market positioning', 'value proposition',
    'competitive advantage', 'price positioning', 'target market', 'customer segment'
  ],
  {
    color: '#DB4437', // Red
    icon: 'users',
    priority: 5
  }
);

/**
 * Risk & Compliance Category
 */
export const RiskComplianceCategory = createCategory(
  'risk-compliance',
  'Risk & Compliance',
  'Regulatory considerations, compliance requirements, and risk management',
  [
    'regulatory', 'compliance', 'downside protection', 'risk hedging', 'governance',
    'risk management', 'regulatory compliance', 'legal requirements',
    'enterprise risk', 'operational risk', 'financial risk', 'reputational risk',
    'risk assessment', 'risk mitigation', 'internal controls'
  ],
  {
    color: '#F4B400', // Yellow
    icon: 'shield-halved',
    priority: 6
  }
);

/**
 * Sustainability & ESG Category
 */
export const SustainabilityESGCategory = createCategory(
  'sustainability-esg',
  'Sustainability & ESG',
  'Environmental, social, and governance considerations and reporting',
  [
    'ESG compliance', 'reporting', 'stakeholder', 'sustainability', 'impact investing',
    'environmental impact', 'social responsibility', 'corporate governance',
    'carbon footprint', 'carbon neutral', 'green initiatives', 'social impact',
    'board diversity', 'executive compensation', 'shareholder rights'
  ],
  {
    color: '#0F9D58', // Green
    icon: 'leaf',
    priority: 6
  }
);

/**
 * Capital Markets Category
 */
export const CapitalMarketsCategory = createCategory(
  'capital-markets',
  'Capital Markets',
  'Fundraising, investor targeting, and financing strategies',
  [
    'fundraising', 'investor targeting', 'financing', 'debt', 'equity', 'leverage',
    'capital raising', 'investor relations', 'private placement', 'public offering',
    'venture capital', 'private equity', 'growth equity', 'debt financing',
    'equity financing', 'capital structure', 'cost of capital'
  ],
  {
    color: '#4285F4', // Blue
    icon: 'landmark',
    priority: 6
  }
);

/**
 * Economic Trends Category
 */
export const EconomicTrendsCategory = createCategory(
  'economic-trends',
  'Economic Trends',
  'Macroeconomic factors, business cycles, and economic environment',
  [
    'macroeconomic', 'business cycle', 'interest rate', 'inflation', 'economic environment',
    'GDP growth', 'recession', 'economic expansion', 'monetary policy', 'fiscal policy',
    'economic outlook', 'economic forecast', 'economic indicators', 'leading indicators',
    'consumer confidence', 'business sentiment', 'unemployment'
  ],
  {
    color: '#DB4437', // Red
    icon: 'chart-line',
    priority: 6
  }
);

/**
 * Performance Metrics Category
 */
export const PerformanceMetricsCategory = createCategory(
  'performance-metrics',
  'Performance Metrics',
  'KPIs, return metrics, and performance measurement',
  [
    'KPIs', 'IRR', 'MOIC', 'J-curve', 'capital deployment', 'attribution analysis',
    'key performance indicators', 'internal rate of return', 'multiple on invested capital',
    'performance measurement', 'performance attribution', 'fund performance',
    'investment performance', 'benchmarking', 'performance evaluation'
  ],
  {
    color: '#F4B400', // Yellow
    icon: 'gauge-high',
    priority: 6
  }
);

/**
 * Competitive Advantage Category
 */
export const CompetitiveAdvantageCategory = createCategory(
  'competitive-advantage',
  'Competitive Advantage',
  'Strategic moats, barriers to entry, and differentiation factors',
  [
    'moats', 'barriers to entry', 'first-mover', 'unique selling proposition', 'category leadership',
    'competitive advantage', 'competitive differentiation', 'sustainable advantage',
    'market leadership', 'innovation advantage', 'cost advantage', 'scale advantage',
    'network effects', 'switching costs', 'intellectual property', 'brand equity'
  ],
  {
    color: '#0F9D58', // Green
    icon: 'trophy',
    priority: 6
  }
);

/**
 * Get all specific categories
 * @returns {Array} Array of specific category definitions
 */
export const getSpecificCategories = () => {
  return [
    MarketIntelligenceCategory,
    GrowthStrategyCategory,
    InvestmentStrategyCategory,
    FinancialPerformanceCategory,
    ValuationBenchmarkingCategory,
    ExitLiquidityCategory,
    MAConsolidationCategory,
    TechnologyDigitalCategory,
    OperationalEfficiencyCategory,
    DataStrategyCategory,
    PlatformEconomicsCategory,
    CustomerMarketCategory,
    RiskComplianceCategory,
    SustainabilityESGCategory,
    CapitalMarketsCategory,
    EconomicTrendsCategory,
    PerformanceMetricsCategory,
    CompetitiveAdvantageCategory
  ];
};

// Export for convenience
export default {
  MarketIntelligenceCategory,
  GrowthStrategyCategory,
  InvestmentStrategyCategory,
  FinancialPerformanceCategory,
  ValuationBenchmarkingCategory,
  ExitLiquidityCategory,
  MAConsolidationCategory,
  TechnologyDigitalCategory,
  OperationalEfficiencyCategory,
  DataStrategyCategory,
  PlatformEconomicsCategory,
  CustomerMarketCategory,
  RiskComplianceCategory,
  SustainabilityESGCategory,
  CapitalMarketsCategory,
  EconomicTrendsCategory,
  PerformanceMetricsCategory,
  CompetitiveAdvantageCategory,
  getSpecificCategories
};
