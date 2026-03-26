'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Activity, Zap } from 'lucide-react';
import { getMarketIndices, getSectorPerformance, getTopGainers, getTopLosers, getMostActive, getUnusualVolume, getMarketBreadth } from '@/lib/market-overview';
import type { Stock } from '@/lib/types';

interface Props { onSelectStock: (ticker: string) => void; }

function MiniTable({ title, icon: Icon, stocks, valueKey, format }: {
  title: string; icon: React.ComponentType<{ size?: number; className?: string }>;
  stocks: Stock[]; valueKey: keyof Stock; format: (v: unknown) => string;
}) {
  return (
    <div className="shadow-card rounded-lg bg-[#e0e5ec] screws overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#babecc]/50">
        <Icon size={14} className="text-[#ff4757]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">{title}</span>
      </div>
      <div className="divide-y divide-[#babecc]/30">
        {stocks.slice(0, 8).map(s => {
          const val = Number(s[valueKey]) || 0;
          return (
            <div key={s.ticker} className="flex items-center px-3 py-1.5 hover:bg-[#d1d9e6]/30 cursor-pointer transition-colors text-xs">
              <span className="font-bold text-[#2d3436] w-14 font-mono">{s.ticker}</span>
              <span className="text-[#4a5568] flex-1 truncate text-[11px]">{s.name}</span>
              <span className="font-mono text-[11px] w-16 text-right text-[#2d3436]">${s.price.toFixed(2)}</span>
              <span className={`font-mono text-[11px] w-16 text-right font-bold ${val > 0 ? 'cell-positive' : val < 0 ? 'cell-negative' : 'cell-neutral'}`}>
                {format(s[valueKey])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MarketTab({ onSelectStock }: Props) {
  const indices = useMemo(() => getMarketIndices(), []);
  const sectors = useMemo(() => getSectorPerformance(), []);
  const gainers = useMemo(() => getTopGainers(8), []);
  const losers = useMemo(() => getTopLosers(8), []);
  const active = useMemo(() => getMostActive(8), []);
  const unusual = useMemo(() => getUnusualVolume(8), []);
  const breadth = useMemo(() => getMarketBreadth(), []);

  const fmtPct = (v: unknown) => { const n = Number(v); return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`; };
  const fmtVol = (v: unknown) => { const n = Number(v); return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1e3).toFixed(0)}K`; };
  const fmtRv = (v: unknown) => `${Number(v).toFixed(1)}x`;

  return (
    <div className="h-[calc(100vh-48px)] overflow-y-auto p-4 space-y-4">
      {/* Indices */}
      <div className="grid grid-cols-5 gap-3">
        {indices.map(idx => (
          <div key={idx.symbol} className="shadow-card rounded-lg bg-[#e0e5ec] screws p-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#4a5568] mb-1">{idx.name}</div>
            <div className="font-mono text-lg font-bold text-[#2d3436]">{idx.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className={`font-mono text-xs font-bold mt-0.5 ${idx.changePercent >= 0 ? 'cell-positive' : 'cell-negative'}`}>
              {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
              <span className="text-[#4a5568] font-normal ml-1">({idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Market Breadth */}
      <div className="shadow-card rounded-lg bg-[#e0e5ec] screws p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-[#ff4757]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">Market Breadth</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Advancers', val: breadth.advancers, color: 'cell-positive' },
            { label: 'Decliners', val: breadth.decliners, color: 'cell-negative' },
            { label: 'Unchanged', val: breadth.unchanged, color: 'cell-neutral' },
            { label: 'New 52w Highs', val: breadth.newHighs, color: 'cell-positive' },
            { label: 'New 52w Lows', val: breadth.newLows, color: 'cell-negative' },
            { label: 'Above SMA200', val: breadth.aboveSma200, color: 'cell-neutral' },
          ].map(item => (
            <div key={item.label} className="shadow-recessed rounded-md p-3 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#4a5568] mb-1">{item.label}</div>
              <div className={`font-mono text-xl font-bold ${item.color}`}>{item.val}</div>
              <div className="text-[10px] text-[#a3b1c6] font-mono">/ {breadth.total}</div>
            </div>
          ))}
        </div>
        {/* A/D ratio bar */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-mono cell-positive font-bold">{breadth.advancers}</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden shadow-recessed flex">
            <div className="bg-[#16a34a] h-full" style={{ width: `${(breadth.advancers / breadth.total) * 100}%` }} />
            <div className="bg-[#a3b1c6] h-full" style={{ width: `${(breadth.unchanged / breadth.total) * 100}%` }} />
            <div className="bg-[#dc2626] h-full flex-1" />
          </div>
          <span className="text-[10px] font-mono cell-negative font-bold">{breadth.decliners}</span>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="shadow-card rounded-lg bg-[#e0e5ec] screws overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#babecc]/50">
          <BarChart2 size={14} className="text-[#ff4757]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">Sector Performance</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th className="text-left">Sector</th><th className="text-right">Day</th><th className="text-right">Week</th>
              <th className="text-right">Month</th><th className="text-right">Stocks</th><th className="text-right">Adv/Dec</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map(s => (
              <tr key={s.name}>
                <td className="font-bold text-[#2d3436] text-xs">{s.name}</td>
                <td className={`text-right ${s.change >= 0 ? 'cell-positive' : 'cell-negative'}`}>{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</td>
                <td className={`text-right ${s.weekChange >= 0 ? 'cell-positive' : 'cell-negative'}`}>{s.weekChange >= 0 ? '+' : ''}{s.weekChange.toFixed(2)}%</td>
                <td className={`text-right ${s.monthChange >= 0 ? 'cell-positive' : 'cell-negative'}`}>{s.monthChange >= 0 ? '+' : ''}{s.monthChange.toFixed(2)}%</td>
                <td className="text-right">{s.stockCount}</td>
                <td className="text-right"><span className="cell-positive">{s.advancers}</span>/<span className="cell-negative">{s.decliners}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movers Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MiniTable title="Top Gainers" icon={TrendingUp} stocks={gainers} valueKey="changePercent" format={fmtPct} />
        <MiniTable title="Top Losers" icon={TrendingDown} stocks={losers} valueKey="changePercent" format={fmtPct} />
        <MiniTable title="Most Active" icon={BarChart2} stocks={active} valueKey="volume" format={fmtVol} />
        <MiniTable title="Unusual Volume" icon={Zap} stocks={unusual} valueKey="relativeVolume" format={fmtRv} />
      </div>
    </div>
  );
}
