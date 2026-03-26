import type { Stock } from './types';

export interface TileRect {
  stock: Stock;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GroupedTiles {
  group: string;
  tiles: TileRect[];
  x: number;
  y: number;
  w: number;
  h: number;
}

// Squarified treemap layout
function layoutRow(
  items: { stock: Stock; value: number }[],
  x: number, y: number, w: number, h: number,
  horizontal: boolean,
  totalValue: number,
): TileRect[] {
  const rowValue = items.reduce((s, i) => s + i.value, 0);
  const ratio = rowValue / totalValue;
  const rowSize = horizontal ? h * ratio : w * ratio;
  const tiles: TileRect[] = [];
  let offset = 0;

  for (const item of items) {
    const frac = item.value / rowValue;
    if (horizontal) {
      const tileW = w * frac;
      tiles.push({ stock: item.stock, x: x + offset, y, w: tileW, h: rowSize });
      offset += tileW;
    } else {
      const tileH = h * frac;
      tiles.push({ stock: item.stock, x, y: y + offset, w: rowSize, h: tileH });
      offset += tileH;
    }
  }
  return tiles;
}

function worstAspect(items: { value: number }[], sideLen: number, totalRowVal: number): number {
  if (sideLen === 0) return Infinity;
  let worst = 0;
  for (const item of items) {
    const area = (item.value / totalRowVal) * sideLen * sideLen;
    const dimA = area / sideLen;
    const ratio = Math.max(sideLen / dimA, dimA / sideLen);
    worst = Math.max(worst, ratio);
  }
  return worst;
}

export function squarify(
  stocks: Stock[],
  sizeKey: keyof Stock,
  bounds: { x: number; y: number; w: number; h: number },
): TileRect[] {
  const items = stocks
    .map(s => ({ stock: s, value: Math.max(Number(s[sizeKey]) || 1, 1) }))
    .sort((a, b) => b.value - a.value);

  const totalValue = items.reduce((s, i) => s + i.value, 0);
  if (totalValue === 0 || items.length === 0) return [];

  const tiles: TileRect[] = [];
  let { x, y, w, h } = bounds;
  let remaining = [...items];
  let remValue = totalValue;

  while (remaining.length > 0) {
    const horizontal = w >= h;
    const sideLen = horizontal ? h : w;
    const row: typeof items = [];
    let rowValue = 0;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = [...row, remaining[i]];
      const candValue = rowValue + remaining[i].value;
      const currentAspect = row.length > 0 ? worstAspect(row, sideLen, rowValue) : Infinity;
      const newAspect = worstAspect(candidate, sideLen, candValue);

      if (row.length === 0 || newAspect <= currentAspect) {
        row.push(remaining[i]);
        rowValue = candValue;
      } else {
        break;
      }
    }

    const rowTiles = layoutRow(row, x, y, w, h, horizontal, remValue);
    tiles.push(...rowTiles);

    const usedRatio = rowValue / remValue;
    if (horizontal) {
      const usedH = h * usedRatio;
      y += usedH;
      h -= usedH;
    } else {
      const usedW = w * usedRatio;
      x += usedW;
      w -= usedW;
    }

    remaining = remaining.slice(row.length);
    remValue -= rowValue;
  }

  return tiles;
}

export function getHeatColor(value: number, min: number = -5, max: number = 5): string {
  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min); // 0 to 1

  if (t < 0.5) {
    // Red to neutral
    const r = 180 + Math.round((1 - t * 2) * 60);
    const g = Math.round(t * 2 * 80);
    const b = Math.round(t * 2 * 40);
    return `rgb(${r},${g},${b})`;
  } else {
    // Neutral to green
    const factor = (t - 0.5) * 2;
    const r = Math.round(80 * (1 - factor));
    const g = 80 + Math.round(factor * 100);
    const b = Math.round(40 * (1 - factor) + factor * 60);
    return `rgb(${r},${g},${b})`;
  }
}

export function groupStocks(stocks: Stock[], groupBy: 'sector' | 'industry' | 'exchange'): Record<string, Stock[]> {
  const groups: Record<string, Stock[]> = {};
  for (const s of stocks) {
    const key = s[groupBy];
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
}
