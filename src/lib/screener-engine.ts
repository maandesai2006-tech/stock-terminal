import type { Stock, FilterState, SortConfig } from './types';

function checkRange(val: number | null, min: number | null, max: number | null): boolean {
  if (val == null) return true;
  if (min != null && val < min) return false;
  if (max != null && val > max) return false;
  return true;
}

export function applyFilters(stocks: Stock[], f: FilterState): Stock[] {
  return stocks.filter(s => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!s.ticker.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) return false;
    }
    if (f.sectors.length > 0 && !f.sectors.includes(s.sector)) return false;
    if (f.industries.length > 0 && !f.industries.includes(s.industry)) return false;
    if (f.exchanges.length > 0 && !f.exchanges.includes(s.exchange)) return false;

    if (!checkRange(s.marketCap, f.marketCapMin, f.marketCapMax)) return false;
    if (!checkRange(s.price, f.priceMin, f.priceMax)) return false;
    if (!checkRange(s.changePercent, f.changeMin, f.changeMax)) return false;
    if (!checkRange(s.weekChange, f.weekChangeMin, f.weekChangeMax)) return false;
    if (!checkRange(s.monthChange, f.monthChangeMin, f.monthChangeMax)) return false;
    if (!checkRange(s.pe, f.peMin, f.peMax)) return false;
    if (!checkRange(s.forwardPe, f.forwardPeMin, f.forwardPeMax)) return false;
    if (!checkRange(s.peg, f.pegMin, f.pegMax)) return false;
    if (!checkRange(s.evEbitda, f.evEbitdaMin, f.evEbitdaMax)) return false;
    if (!checkRange(s.dividendYield, f.dividendYieldMin, null)) return false;
    if (!checkRange(s.beta, f.betaMin, f.betaMax)) return false;
    if (!checkRange(s.rsi, f.rsiMin, f.rsiMax)) return false;
    if (f.volumeMin != null && s.volume < f.volumeMin) return false;
    if (f.relativeVolumeMin != null && s.relativeVolume < f.relativeVolumeMin) return false;
    if (f.profitMarginMin != null && (s.profitMargin == null || s.profitMargin < f.profitMarginMin)) return false;
    if (f.operatingMarginMin != null && (s.operatingMargin == null || s.operatingMargin < f.operatingMarginMin)) return false;
    if (f.roeMin != null && (s.roe == null || s.roe < f.roeMin)) return false;
    if (f.roaMin != null && (s.roa == null || s.roa < f.roaMin)) return false;
    if (f.debtEquityMax != null && (s.debtEquity == null || s.debtEquity > f.debtEquityMax)) return false;
    if (f.currentRatioMin != null && (s.currentRatio == null || s.currentRatio < f.currentRatioMin)) return false;
    if (f.epsGrowthMin != null && (s.epsGrowth == null || s.epsGrowth < f.epsGrowthMin)) return false;
    if (f.revenueGrowthMin != null && (s.revenueGrowth == null || s.revenueGrowth < f.revenueGrowthMin)) return false;
    if (f.shortFloatMax != null && s.shortFloat > f.shortFloatMax) return false;
    if (f.above20SMA === true && s.price < s.sma20) return false;
    if (f.above50SMA === true && s.price < s.sma50) return false;
    if (f.above200SMA === true && s.price < s.sma200) return false;
    if (f.dividendPayer === true && (!s.dividendYield || s.dividendYield <= 0)) return false;

    return true;
  });
}

export function applySort(stocks: Stock[], sort: SortConfig): Stock[] {
  const sorted = [...stocks];
  sorted.sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sort.direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export function countActiveFilters(f: FilterState): number {
  let count = 0;
  if (f.search) count++;
  if (f.sectors.length) count++;
  if (f.exchanges.length) count++;
  const skip = new Set(['search', 'sectors', 'industries', 'exchanges']);
  for (const [k, v] of Object.entries(f)) {
    if (skip.has(k)) continue;
    if (v === true) count++;
    else if (typeof v === 'number') count++;
    else if (typeof v === 'string' && v) count++;
  }
  return count;
}

export function getActiveFilterLabels(f: FilterState): string[] {
  const labels: string[] = [];
  if (f.search) labels.push(`Search: "${f.search}"`);
  if (f.sectors.length) labels.push(`Sectors: ${f.sectors.join(', ')}`);
  if (f.exchanges.length) labels.push(`Exchanges: ${f.exchanges.join(', ')}`);
  if (f.priceMin != null) labels.push(`Price >= $${f.priceMin}`);
  if (f.priceMax != null) labels.push(`Price <= $${f.priceMax}`);
  if (f.marketCapMin != null) labels.push(`MCap >= $${f.marketCapMin}M`);
  if (f.peMax != null) labels.push(`P/E <= ${f.peMax}`);
  if (f.dividendYieldMin != null) labels.push(`Div >= ${f.dividendYieldMin}%`);
  if (f.rsiMin != null) labels.push(`RSI >= ${f.rsiMin}`);
  if (f.rsiMax != null) labels.push(`RSI <= ${f.rsiMax}`);
  if (f.above20SMA) labels.push('Above SMA 20');
  if (f.above50SMA) labels.push('Above SMA 50');
  if (f.above200SMA) labels.push('Above SMA 200');
  if (f.dividendPayer) labels.push('Dividend Payer');
  return labels;
}
