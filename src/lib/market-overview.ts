import type { Stock, MarketIndex, SectorPerf } from './types';
import { getAllStocks } from './mock-data';

export function getMarketIndices(): MarketIndex[] {
  return [
    { name: 'S&P 500', symbol: 'SPX', value: 5842.31, change: 28.47, changePercent: 0.49 },
    { name: 'Nasdaq', symbol: 'IXIC', value: 18532.64, change: -42.18, changePercent: -0.23 },
    { name: 'Dow Jones', symbol: 'DJI', value: 43127.55, change: 155.32, changePercent: 0.36 },
    { name: 'Russell 2000', symbol: 'RUT', value: 2068.42, change: -12.38, changePercent: -0.60 },
    { name: 'VIX', symbol: 'VIX', value: 16.82, change: -0.45, changePercent: -2.61 },
  ];
}

export function getSectorPerformance(): SectorPerf[] {
  const stocks = getAllStocks();
  const map = new Map<string, Stock[]>();
  for (const s of stocks) {
    if (!map.has(s.sector)) map.set(s.sector, []);
    map.get(s.sector)!.push(s);
  }

  return [...map.entries()].map(([name, list]) => {
    const change = list.reduce((sum, s) => sum + s.changePercent, 0) / list.length;
    const weekChange = list.reduce((sum, s) => sum + s.weekChange, 0) / list.length;
    const monthChange = list.reduce((sum, s) => sum + s.monthChange, 0) / list.length;
    const marketCap = list.reduce((sum, s) => sum + s.marketCap, 0);
    const advancers = list.filter(s => s.changePercent > 0).length;
    const decliners = list.filter(s => s.changePercent < 0).length;
    return { name, change: Number(change.toFixed(2)), weekChange: Number(weekChange.toFixed(2)), monthChange: Number(monthChange.toFixed(2)), marketCap, stockCount: list.length, advancers, decliners };
  }).sort((a, b) => b.change - a.change);
}

export function getTopGainers(n: number = 10): Stock[] {
  return [...getAllStocks()].sort((a, b) => b.changePercent - a.changePercent).slice(0, n);
}

export function getTopLosers(n: number = 10): Stock[] {
  return [...getAllStocks()].sort((a, b) => a.changePercent - b.changePercent).slice(0, n);
}

export function getMostActive(n: number = 10): Stock[] {
  return [...getAllStocks()].sort((a, b) => b.volume - a.volume).slice(0, n);
}

export function getUnusualVolume(n: number = 10): Stock[] {
  return [...getAllStocks()].sort((a, b) => b.relativeVolume - a.relativeVolume).slice(0, n);
}

export function getMarketBreadth() {
  const stocks = getAllStocks();
  const advancers = stocks.filter(s => s.changePercent > 0).length;
  const decliners = stocks.filter(s => s.changePercent < 0).length;
  const unchanged = stocks.length - advancers - decliners;
  const newHighs = stocks.filter(s => s.fromHigh52w > -2).length;
  const newLows = stocks.filter(s => s.fromLow52w < 5).length;
  const aboveSma200 = stocks.filter(s => s.price > s.sma200).length;
  return { advancers, decliners, unchanged, newHighs, newLows, aboveSma200, total: stocks.length };
}
