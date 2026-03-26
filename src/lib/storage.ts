import type { Watchlist, SavedPreset } from './types';

const WATCHLISTS_KEY = 'stock-terminal-watchlists';
const PRESETS_KEY = 'stock-terminal-presets';
const COLUMNS_KEY = 'stock-terminal-columns';

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Watchlists ──────────────────────────────────────────────
const defaultWatchlists: Watchlist[] = [
  { id: '1', name: 'Mega Cap Tech', tickers: ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSM'], createdAt: '2026-01-15' },
  { id: '2', name: 'Dividend Kings', tickers: ['KO','PG','JNJ','PEP','WMT','PG','CL','GIS'], createdAt: '2026-02-01' },
  { id: '3', name: 'High Growth', tickers: ['PLTR','CRWD','SNOW','NET','DDOG','SHOP','TTD'], createdAt: '2026-02-20' },
];

export function getWatchlists(): Watchlist[] {
  return getItem(WATCHLISTS_KEY, defaultWatchlists);
}

export function saveWatchlists(lists: Watchlist[]): void {
  setItem(WATCHLISTS_KEY, lists);
}

export function addToWatchlist(listId: string, ticker: string): Watchlist[] {
  const lists = getWatchlists();
  const list = lists.find(l => l.id === listId);
  if (list && !list.tickers.includes(ticker)) {
    list.tickers.push(ticker);
    saveWatchlists(lists);
  }
  return lists;
}

export function removeFromWatchlist(listId: string, ticker: string): Watchlist[] {
  const lists = getWatchlists();
  const list = lists.find(l => l.id === listId);
  if (list) {
    list.tickers = list.tickers.filter(t => t !== ticker);
    saveWatchlists(lists);
  }
  return lists;
}

// ─── Saved Presets ───────────────────────────────────────────
export function getSavedPresets(): SavedPreset[] {
  return getItem(PRESETS_KEY, []);
}

export function savePreset(preset: SavedPreset): void {
  const presets = getSavedPresets();
  const idx = presets.findIndex(p => p.id === preset.id);
  if (idx >= 0) presets[idx] = preset;
  else presets.push(preset);
  setItem(PRESETS_KEY, presets);
}

export function deletePreset(id: string): void {
  setItem(PRESETS_KEY, getSavedPresets().filter(p => p.id !== id));
}

// ─── Column Preferences ─────────────────────────────────────
export function getSavedColumns(): string[] | null {
  return getItem(COLUMNS_KEY, null);
}

export function saveColumns(cols: string[]): void {
  setItem(COLUMNS_KEY, cols);
}
