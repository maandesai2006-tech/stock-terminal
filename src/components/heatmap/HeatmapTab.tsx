'use client';

import { useState, useMemo, useRef } from 'react';
import { getAllStocks } from '@/lib/mock-data';
import { squarify, getHeatColor, groupStocks } from '@/lib/heatmap-utils';
import { SECTOR_COLORS } from '@/lib/constants';
import type { Stock, HeatmapConfig } from '@/lib/types';

interface Props { onSelectStock: (ticker: string) => void; }

const SIZE_OPTIONS: { label: string; key: keyof Stock }[] = [
  { label: 'Market Cap', key: 'marketCap' },
  { label: 'Volume', key: 'volume' },
  { label: 'Avg Volume', key: 'avgVolume' },
];
const COLOR_OPTIONS: { label: string; key: keyof Stock; min: number; max: number }[] = [
  { label: 'Daily Chg%', key: 'changePercent', min: -5, max: 5 },
  { label: 'Week Chg%', key: 'weekChange', min: -10, max: 10 },
  { label: 'Month Chg%', key: 'monthChange', min: -15, max: 15 },
  { label: 'YTD%', key: 'ytdChange', min: -30, max: 30 },
  { label: 'RSI', key: 'rsi', min: 20, max: 80 },
];

export default function HeatmapTab({ onSelectStock }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<HeatmapConfig>({ sizeBy: 'marketCap', colorBy: 'changePercent', groupBy: 'sector', universe: 'all' });
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const stocks = useMemo(() => getAllStocks(), []);
  const colorOpt = COLOR_OPTIONS.find(c => c.key === config.colorBy) || COLOR_OPTIONS[0];

  const grouped = useMemo(() => groupStocks(stocks, config.groupBy), [stocks, config.groupBy]);

  // Layout: divide the total area among groups by their aggregate sizeBy value
  const W = 1200;
  const H = 700;

  const groupEntries = useMemo(() => {
    const entries = Object.entries(grouped).map(([name, list]) => ({
      name,
      stocks: list,
      totalSize: list.reduce((s, st) => s + Math.max(Number(st[config.sizeBy]) || 1, 1), 0),
    }));
    entries.sort((a, b) => b.totalSize - a.totalSize);
    return entries;
  }, [grouped, config.sizeBy]);

  const groupTotal = groupEntries.reduce((s, g) => s + g.totalSize, 0);

  // Simple row-based layout for groups
  const groupLayouts = useMemo(() => {
    const layouts: { name: string; stocks: Stock[]; x: number; y: number; w: number; h: number }[] = [];
    let y = 0;
    const cols = 3;
    const rows = Math.ceil(groupEntries.length / cols);
    const cellW = W / cols;
    const cellH = H / rows;

    groupEntries.forEach((g, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      layouts.push({ name: g.name, stocks: g.stocks, x: col * cellW, y: row * cellH, w: cellW - 2, h: cellH - 2 });
    });
    return layouts;
  }, [groupEntries]);

  const hoveredStock = hoveredTicker ? stocks.find(s => s.ticker === hoveredTicker) : null;

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col overflow-hidden p-3">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a5568]">Size:</span>
          {SIZE_OPTIONS.map(o => (
            <button key={o.key} onClick={() => setConfig({ ...config, sizeBy: o.key })}
              className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider transition-all ${config.sizeBy === o.key ? 'shadow-pressed text-[#ff4757]' : 'shadow-sm-neu text-[#4a5568]'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a5568]">Color:</span>
          {COLOR_OPTIONS.map(o => (
            <button key={o.key} onClick={() => setConfig({ ...config, colorBy: o.key })}
              className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider transition-all ${config.colorBy === o.key ? 'shadow-pressed text-[#ff4757]' : 'shadow-sm-neu text-[#4a5568]'}`}>
              {o.label}
            </button>
          ))}
        </div>
        {/* Legend */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] text-[#dc2626] font-mono font-bold">{colorOpt.min}%</span>
          <div className="w-32 h-3 rounded-full overflow-hidden shadow-recessed flex">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: getHeatColor(colorOpt.min + (i / 19) * (colorOpt.max - colorOpt.min), colorOpt.min, colorOpt.max) }} />
            ))}
          </div>
          <span className="text-[10px] text-[#16a34a] font-mono font-bold">+{colorOpt.max}%</span>
        </div>
      </div>

      {/* Heatmap */}
      <div ref={containerRef} className="flex-1 shadow-card rounded-lg bg-[#e0e5ec] screws relative overflow-hidden"
        onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setTooltipPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {groupLayouts.map(group => {
            const tiles = squarify(group.stocks, config.sizeBy, { x: group.x + 1, y: group.y + 20, w: group.w, h: group.h - 20 });
            return (
              <g key={group.name}>
                {/* Group label */}
                <text x={group.x + 6} y={group.y + 14} fontSize="11" fontWeight="700" fill="#2d3436" fontFamily="Inter">
                  {group.name}
                </text>
                {/* Tiles */}
                {tiles.map(tile => {
                  const colorVal = Number(tile.stock[config.colorBy]) || 0;
                  const bg = getHeatColor(colorVal, colorOpt.min, colorOpt.max);
                  const showLabel = tile.w > 35 && tile.h > 25;
                  const showPct = tile.w > 50 && tile.h > 35;
                  return (
                    <g key={tile.stock.ticker}
                      onMouseEnter={() => setHoveredTicker(tile.stock.ticker)}
                      onMouseLeave={() => setHoveredTicker(null)}
                      onClick={() => onSelectStock(tile.stock.ticker)}
                      className="cursor-pointer"
                    >
                      <rect x={tile.x} y={tile.y} width={Math.max(tile.w - 1, 0)} height={Math.max(tile.h - 1, 0)} rx={2}
                        fill={bg} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5}
                        className="transition-opacity hover:opacity-90" />
                      {showLabel && (
                        <text x={tile.x + tile.w / 2} y={tile.y + tile.h / 2 - (showPct ? 4 : 0)}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={tile.w > 80 ? 11 : 9} fontWeight="700" fill="white" fontFamily="Inter"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          {tile.stock.ticker}
                        </text>
                      )}
                      {showPct && (
                        <text x={tile.x + tile.w / 2} y={tile.y + tile.h / 2 + 10}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={8} fill="rgba(255,255,255,0.85)" fontFamily="JetBrains Mono">
                          {colorVal >= 0 ? '+' : ''}{colorVal.toFixed(1)}%
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredStock && (
          <div className="absolute pointer-events-none bg-[#2d3436] text-white rounded-lg px-3 py-2 shadow-floating z-20 text-xs space-y-0.5"
            style={{ left: Math.min(tooltipPos.x + 12, W - 180), top: Math.min(tooltipPos.y + 12, H - 100) }}>
            <div className="font-bold text-sm">{hoveredStock.ticker} <span className="font-normal text-[#a8b2d1]">{hoveredStock.name}</span></div>
            <div className="font-mono">Price: ${hoveredStock.price.toFixed(2)} <span className={hoveredStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>({hoveredStock.changePercent >= 0 ? '+' : ''}{hoveredStock.changePercent}%)</span></div>
            <div className="font-mono text-[#a8b2d1]">MCap: ${(hoveredStock.marketCap / 1e3).toFixed(1)}B | P/E: {hoveredStock.pe ?? '—'} | RSI: {hoveredStock.rsi}</div>
          </div>
        )}
      </div>
    </div>
  );
}
