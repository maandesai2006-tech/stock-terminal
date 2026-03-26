import type { ColumnDef, FilterGroup, FilterState, HeatmapConfig, SortConfig } from './types';

// ─── Format Helpers ──────────────────────────────────────────
const fmtNum = (v: unknown, d = 2) => v == null ? '—' : Number(v).toFixed(d);
const fmtPct = (v: unknown, d = 2) => v == null ? '—' : `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(d)}%`;
const fmtPrice = (v: unknown) => v == null ? '—' : `$${Number(v).toFixed(2)}`;
const fmtInt = (v: unknown) => v == null ? '—' : Number(v).toLocaleString();
const fmtCap = (v: unknown) => {
  if (v == null) return '—';
  const n = Number(v);
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}T`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
};
const fmtVol = (v: unknown) => {
  if (v == null) return '—';
  const n = Number(v);
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};
const fmtStr = (v: unknown) => v == null ? '—' : String(v);
const fmtRatio = (v: unknown) => v == null ? '—' : `${Number(v).toFixed(1)}x`;
const fmtOwn = (v: unknown) => v == null ? '—' : `${Number(v).toFixed(1)}%`;

// ─── All Available Columns ───────────────────────────────────
export const ALL_COLUMNS: ColumnDef[] = [
  { key: 'ticker',     label: 'Ticker',      width: 80,  align: 'left',  format: fmtStr, sortable: true },
  { key: 'name',       label: 'Company',     width: 180, align: 'left',  format: fmtStr, sortable: true },
  { key: 'sector',     label: 'Sector',      width: 140, align: 'left',  format: fmtStr, sortable: true },
  { key: 'industry',   label: 'Industry',    width: 160, align: 'left',  format: fmtStr, sortable: true },
  { key: 'price',      label: 'Price',       width: 90,  align: 'right', format: fmtPrice, sortable: true },
  { key: 'changePercent', label: 'Chg%',     width: 80,  align: 'right', format: v => fmtPct(v, 2), colorCode: true, sortable: true },
  { key: 'weekChange', label: 'Week',        width: 80,  align: 'right', format: v => fmtPct(v, 2), colorCode: true, sortable: true },
  { key: 'monthChange',label: 'Month',       width: 80,  align: 'right', format: v => fmtPct(v, 2), colorCode: true, sortable: true },
  { key: 'quarterChange',label:'Quarter',    width: 80,  align: 'right', format: v => fmtPct(v, 2), colorCode: true, sortable: true },
  { key: 'yearChange', label: 'Year',        width: 80,  align: 'right', format: v => fmtPct(v, 2), colorCode: true, sortable: true },
  { key: 'ytdChange',  label: 'YTD',         width: 80,  align: 'right', format: v => fmtPct(v, 2), colorCode: true, sortable: true },
  { key: 'marketCap',  label: 'Mkt Cap',     width: 100, align: 'right', format: fmtCap, sortable: true },
  { key: 'volume',     label: 'Volume',      width: 100, align: 'right', format: fmtVol, sortable: true },
  { key: 'avgVolume',  label: 'Avg Vol',     width: 100, align: 'right', format: fmtVol, sortable: true },
  { key: 'relativeVolume', label: 'Rel Vol', width: 80,  align: 'right', format: v => fmtRatio(v), sortable: true },
  { key: 'pe',         label: 'P/E',         width: 70,  align: 'right', format: v => fmtNum(v, 1), sortable: true },
  { key: 'forwardPe',  label: 'Fwd P/E',    width: 80,  align: 'right', format: v => fmtNum(v, 1), sortable: true },
  { key: 'peg',        label: 'PEG',         width: 70,  align: 'right', format: v => fmtNum(v, 2), sortable: true },
  { key: 'priceSales', label: 'P/S',         width: 70,  align: 'right', format: v => fmtNum(v, 1), sortable: true },
  { key: 'priceBook',  label: 'P/B',         width: 70,  align: 'right', format: v => fmtNum(v, 1), sortable: true },
  { key: 'evEbitda',   label: 'EV/EBITDA',   width: 90,  align: 'right', format: v => fmtNum(v, 1), sortable: true },
  { key: 'epsGrowth',  label: 'EPS Gr',      width: 80,  align: 'right', format: v => fmtPct(v, 1), colorCode: true, sortable: true },
  { key: 'revenueGrowth', label: 'Rev Gr',   width: 80,  align: 'right', format: v => fmtPct(v, 1), colorCode: true, sortable: true },
  { key: 'dividendYield', label: 'Div%',     width: 70,  align: 'right', format: v => v == null || v === 0 ? '—' : `${Number(v).toFixed(2)}%`, sortable: true },
  { key: 'beta',       label: 'Beta',        width: 70,  align: 'right', format: v => fmtNum(v, 2), sortable: true },
  { key: 'rsi',        label: 'RSI',         width: 60,  align: 'right', format: v => fmtNum(v, 0), sortable: true },
  { key: 'atr',        label: 'ATR',         width: 70,  align: 'right', format: v => fmtNum(v, 2), sortable: true },
  { key: 'profitMargin',  label: 'Profit Mgn',  width: 90,  align: 'right', format: v => fmtOwn(v), sortable: true },
  { key: 'operatingMargin', label: 'Op Mgn', width: 80,  align: 'right', format: v => fmtOwn(v), sortable: true },
  { key: 'roe',        label: 'ROE',         width: 70,  align: 'right', format: v => fmtOwn(v), sortable: true },
  { key: 'roa',        label: 'ROA',         width: 70,  align: 'right', format: v => fmtOwn(v), sortable: true },
  { key: 'debtEquity', label: 'D/E',         width: 70,  align: 'right', format: v => fmtNum(v, 2), sortable: true },
  { key: 'currentRatio', label: 'Curr Ratio',width: 90,  align: 'right', format: v => fmtNum(v, 2), sortable: true },
  { key: 'shortFloat', label: 'Short%',      width: 80,  align: 'right', format: v => fmtOwn(v), sortable: true },
  { key: 'institutionalOwnership', label: 'Inst Own', width: 90, align: 'right', format: v => fmtOwn(v), sortable: true },
  { key: 'analystRating', label: 'Rating',   width: 80,  align: 'center', format: fmtStr, sortable: true },
  { key: 'earningsDate', label: 'Earnings',  width: 100, align: 'center', format: fmtStr, sortable: true },
  { key: 'exchange',   label: 'Exchange',    width: 90,  align: 'center', format: fmtStr, sortable: true },
  { key: 'fromHigh52w', label: '52w Hi%',   width: 80,  align: 'right', format: v => fmtPct(v, 1), colorCode: true, sortable: true },
  { key: 'fromLow52w',  label: '52w Lo%',   width: 80,  align: 'right', format: v => fmtPct(v, 1), colorCode: true, sortable: true },
];

// ─── Default Visible Columns ─────────────────────────────────
export const DEFAULT_COLUMNS: (keyof import('./types').Stock)[] = [
  'ticker', 'name', 'sector', 'price', 'changePercent', 'marketCap',
  'volume', 'relativeVolume', 'pe', 'dividendYield', 'beta', 'rsi', 'analystRating',
];

// ─── Sectors ─────────────────────────────────────────────────
export const SECTORS = [
  'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
  'Consumer Defensive', 'Industrials', 'Energy', 'Basic Materials',
  'Communication Services', 'Utilities', 'Real Estate',
] as const;

export const SECTOR_COLORS: Record<string, string> = {
  'Technology':             '#6366f1',
  'Healthcare':             '#14b8a6',
  'Financial Services':     '#f59e0b',
  'Consumer Cyclical':      '#ec4899',
  'Consumer Defensive':     '#84cc16',
  'Industrials':            '#8b5cf6',
  'Energy':                 '#f97316',
  'Basic Materials':        '#06b6d4',
  'Communication Services': '#ef4444',
  'Utilities':              '#22c55e',
  'Real Estate':            '#a78bfa',
};

export const EXCHANGES = ['NYSE', 'NASDAQ'] as const;

// ─── Filter Groups ───────────────────────────────────────────
export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'price', label: 'Price & Performance', filters: [
      { key: 'priceMin', label: 'Price Min', type: 'range', min: 0, max: 5000, step: 1, suffix: '$' },
      { key: 'priceMax', label: 'Price Max', type: 'range', min: 0, max: 5000, step: 1, suffix: '$' },
      { key: 'changeMin', label: 'Change% Min', type: 'range', min: -50, max: 50, step: 0.5, suffix: '%' },
      { key: 'changeMax', label: 'Change% Max', type: 'range', min: -50, max: 50, step: 0.5, suffix: '%' },
      { key: 'weekChangeMin', label: 'Week Chg Min', type: 'range', min: -30, max: 30, step: 0.5, suffix: '%' },
      { key: 'monthChangeMin', label: 'Month Chg Min', type: 'range', min: -50, max: 100, step: 1, suffix: '%' },
      { key: 'relativeVolumeMin', label: 'Rel Volume Min', type: 'range', min: 0, max: 10, step: 0.1, suffix: 'x' },
    ],
  },
  {
    id: 'fundamental', label: 'Fundamentals', filters: [
      { key: 'sectors', label: 'Sector', type: 'multiselect', options: [...SECTORS] },
      { key: 'exchanges', label: 'Exchange', type: 'multiselect', options: [...EXCHANGES] },
      { key: 'marketCapMin', label: 'Mkt Cap Min', type: 'range', min: 0, max: 3000000, step: 1000, suffix: '$M' },
      { key: 'marketCapMax', label: 'Mkt Cap Max', type: 'range', min: 0, max: 3000000, step: 1000, suffix: '$M' },
    ],
  },
  {
    id: 'valuation', label: 'Valuation', filters: [
      { key: 'peMin', label: 'P/E Min', type: 'range', min: 0, max: 200, step: 1 },
      { key: 'peMax', label: 'P/E Max', type: 'range', min: 0, max: 200, step: 1 },
      { key: 'forwardPeMin', label: 'Fwd P/E Min', type: 'range', min: 0, max: 200, step: 1 },
      { key: 'forwardPeMax', label: 'Fwd P/E Max', type: 'range', min: 0, max: 200, step: 1 },
      { key: 'pegMin', label: 'PEG Min', type: 'range', min: 0, max: 10, step: 0.1 },
      { key: 'pegMax', label: 'PEG Max', type: 'range', min: 0, max: 10, step: 0.1 },
      { key: 'evEbitdaMin', label: 'EV/EBITDA Min', type: 'range', min: 0, max: 100, step: 1 },
      { key: 'evEbitdaMax', label: 'EV/EBITDA Max', type: 'range', min: 0, max: 100, step: 1 },
      { key: 'dividendYieldMin', label: 'Div Yield Min', type: 'range', min: 0, max: 10, step: 0.1, suffix: '%' },
    ],
  },
  {
    id: 'profitability', label: 'Profitability', filters: [
      { key: 'profitMarginMin', label: 'Profit Margin Min', type: 'range', min: -50, max: 80, step: 1, suffix: '%' },
      { key: 'operatingMarginMin', label: 'Op Margin Min', type: 'range', min: -50, max: 80, step: 1, suffix: '%' },
      { key: 'roeMin', label: 'ROE Min', type: 'range', min: -30, max: 100, step: 1, suffix: '%' },
      { key: 'roaMin', label: 'ROA Min', type: 'range', min: -20, max: 50, step: 1, suffix: '%' },
      { key: 'epsGrowthMin', label: 'EPS Growth Min', type: 'range', min: -50, max: 200, step: 1, suffix: '%' },
      { key: 'revenueGrowthMin', label: 'Rev Growth Min', type: 'range', min: -30, max: 100, step: 1, suffix: '%' },
    ],
  },
  {
    id: 'technical', label: 'Technical', filters: [
      { key: 'rsiMin', label: 'RSI Min', type: 'range', min: 0, max: 100, step: 1 },
      { key: 'rsiMax', label: 'RSI Max', type: 'range', min: 0, max: 100, step: 1 },
      { key: 'betaMin', label: 'Beta Min', type: 'range', min: 0, max: 3, step: 0.1 },
      { key: 'betaMax', label: 'Beta Max', type: 'range', min: 0, max: 3, step: 0.1 },
      { key: 'above20SMA', label: 'Above SMA 20', type: 'toggle' },
      { key: 'above50SMA', label: 'Above SMA 50', type: 'toggle' },
      { key: 'above200SMA', label: 'Above SMA 200', type: 'toggle' },
    ],
  },
  {
    id: 'ownership', label: 'Ownership & Short', filters: [
      { key: 'shortFloatMax', label: 'Short Float Max', type: 'range', min: 0, max: 40, step: 0.5, suffix: '%' },
      { key: 'debtEquityMax', label: 'D/E Max', type: 'range', min: 0, max: 5, step: 0.1 },
      { key: 'currentRatioMin', label: 'Current Ratio Min', type: 'range', min: 0, max: 5, step: 0.1 },
      { key: 'dividendPayer', label: 'Dividend Payer', type: 'toggle' },
    ],
  },
];

// ─── Defaults ────────────────────────────────────────────────
export const DEFAULT_FILTERS: FilterState = {
  search: '',
  sectors: [],
  industries: [],
  exchanges: [],
  marketCapMin: null, marketCapMax: null,
  priceMin: null, priceMax: null,
  changeMin: null, changeMax: null,
  weekChangeMin: null, weekChangeMax: null,
  monthChangeMin: null, monthChangeMax: null,
  peMin: null, peMax: null,
  forwardPeMin: null, forwardPeMax: null,
  pegMin: null, pegMax: null,
  evEbitdaMin: null, evEbitdaMax: null,
  dividendYieldMin: null, dividendYieldMax: null,
  betaMin: null, betaMax: null,
  rsiMin: null, rsiMax: null,
  volumeMin: null,
  relativeVolumeMin: null,
  profitMarginMin: null,
  operatingMarginMin: null,
  roeMin: null, roaMin: null,
  debtEquityMax: null,
  currentRatioMin: null,
  epsGrowthMin: null,
  revenueGrowthMin: null,
  shortFloatMax: null,
  analystRating: null,
  above20SMA: null,
  above50SMA: null,
  above200SMA: null,
  dividendPayer: null,
};

export const DEFAULT_SORT: SortConfig = { key: 'marketCap', direction: 'desc' };

export const DEFAULT_HEATMAP: HeatmapConfig = {
  sizeBy: 'marketCap',
  colorBy: 'changePercent',
  groupBy: 'sector',
  universe: 'all',
};

export const PAGE_SIZES = [25, 50, 100] as const;
