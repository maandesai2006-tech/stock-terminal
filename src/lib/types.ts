export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  country: string;

  price: number;
  change: number;
  changePercent: number;
  weekChange: number;
  monthChange: number;
  quarterChange: number;
  yearChange: number;
  ytdChange: number;
  gap: number;

  volume: number;
  avgVolume: number;
  relativeVolume: number;

  marketCap: number; // millions
  pe: number | null;
  forwardPe: number | null;
  peg: number | null;
  priceSales: number | null;
  priceBook: number | null;
  evEbitda: number | null;

  epsGrowth: number | null;
  revenueGrowth: number | null;

  profitMargin: number | null;
  operatingMargin: number | null;
  roe: number | null;
  roa: number | null;

  debtEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;

  dividendYield: number | null;

  rsi: number;
  beta: number;
  atr: number;
  sma20: number;
  sma50: number;
  sma200: number;
  high52w: number;
  low52w: number;
  fromHigh52w: number;
  fromLow52w: number;

  institutionalOwnership: number;
  insiderOwnership: number;
  shortFloat: number;

  analystRating: string;
  analystScore: number;
  earningsDate: string;
  ipoDate: string;
  employees: number;

  sparkline: number[];
}

export interface ColumnDef {
  key: keyof Stock;
  label: string;
  width: number;
  align: 'left' | 'right' | 'center';
  format: (v: unknown) => string;
  colorCode?: boolean;
  sortable?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  filters: FilterDef[];
}

export interface FilterDef {
  key: string;
  label: string;
  type: 'range' | 'select' | 'multiselect' | 'toggle';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export interface FilterState {
  search: string;
  sectors: string[];
  industries: string[];
  exchanges: string[];
  marketCapMin: number | null;
  marketCapMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  changeMin: number | null;
  changeMax: number | null;
  weekChangeMin: number | null;
  weekChangeMax: number | null;
  monthChangeMin: number | null;
  monthChangeMax: number | null;
  peMin: number | null;
  peMax: number | null;
  forwardPeMin: number | null;
  forwardPeMax: number | null;
  pegMin: number | null;
  pegMax: number | null;
  evEbitdaMin: number | null;
  evEbitdaMax: number | null;
  dividendYieldMin: number | null;
  dividendYieldMax: number | null;
  betaMin: number | null;
  betaMax: number | null;
  rsiMin: number | null;
  rsiMax: number | null;
  volumeMin: number | null;
  relativeVolumeMin: number | null;
  profitMarginMin: number | null;
  operatingMarginMin: number | null;
  roeMin: number | null;
  roaMin: number | null;
  debtEquityMax: number | null;
  currentRatioMin: number | null;
  epsGrowthMin: number | null;
  revenueGrowthMin: number | null;
  shortFloatMax: number | null;
  analystRating: string | null;
  above20SMA: boolean | null;
  above50SMA: boolean | null;
  above200SMA: boolean | null;
  dividendPayer: boolean | null;
  [key: string]: unknown;
}

export interface SortConfig {
  key: keyof Stock;
  direction: 'asc' | 'desc';
}

export interface Watchlist {
  id: string;
  name: string;
  tickers: string[];
  createdAt: string;
}

export interface SavedPreset {
  id: string;
  name: string;
  filters: FilterState;
  columns: string[];
  sort: SortConfig;
}

export interface HeatmapConfig {
  sizeBy: keyof Stock;
  colorBy: keyof Stock;
  groupBy: 'sector' | 'industry' | 'exchange';
  universe: 'all' | 'sp500' | 'nasdaq100' | 'watchlist';
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SectorPerf {
  name: string;
  change: number;
  weekChange: number;
  monthChange: number;
  marketCap: number;
  stockCount: number;
  advancers: number;
  decliners: number;
}

export type TabId = 'screener' | 'heatmap' | 'market' | 'watchlists';
