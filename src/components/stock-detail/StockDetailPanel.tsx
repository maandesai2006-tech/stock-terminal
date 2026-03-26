'use client';

import { X, TrendingUp, BarChart2, Shield, Users, Calendar, Star } from 'lucide-react';
import { getStockByTicker } from '@/lib/mock-data';

interface Props {
  ticker: string;
  onClose: () => void;
}

function StatRow({ label, value, suffix }: { label: string; value: string | number | null; suffix?: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[#babecc]/20">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a5568]">{label}</span>
      <span className="font-mono text-xs text-[#2d3436] font-bold">{value ?? '—'}{suffix || ''}</span>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 80; const w = 380;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const isUp = data[data.length - 1] >= data[0];
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2">
      <defs>
        <linearGradient id={`grad-${isUp ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${isUp ? 'up' : 'down'})`}
      />
      <polyline points={points} fill="none" stroke={isUp ? '#16a34a' : '#dc2626'} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StockDetailPanel({ ticker, onClose }: Props) {
  const stock = getStockByTicker(ticker);
  if (!stock) return null;

  const fmtCap = (m: number) => m >= 1e6 ? `$${(m / 1e6).toFixed(2)}T` : m >= 1e3 ? `$${(m / 1e3).toFixed(1)}B` : `$${m.toFixed(0)}M`;

  return (
    <div className="fixed top-12 right-0 w-[440px] h-[calc(100vh-48px)] bg-[#e0e5ec] shadow-floating z-30 flex flex-col overflow-hidden border-l border-[#babecc]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#babecc]/50 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#2d3436] tracking-tight">{stock.ticker}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded shadow-sm-neu font-bold uppercase tracking-wider text-[#4a5568]">{stock.exchange}</span>
          </div>
          <p className="text-xs text-[#4a5568] mt-0.5">{stock.name}</p>
          <p className="text-[10px] text-[#a3b1c6]">{stock.sector} &middot; {stock.industry}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-bold text-[#2d3436]">${stock.price.toFixed(2)}</div>
          <div className={`font-mono text-sm font-bold ${stock.changePercent >= 0 ? 'cell-positive' : 'cell-negative'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
          </div>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm ml-2"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Chart */}
        <div className="shadow-recessed rounded-lg bg-[#e0e5ec] p-3 relative scanlines">
          <div className="text-[9px] font-bold uppercase tracking-wider text-[#4a5568] mb-1">30-Day Price</div>
          <Sparkline data={stock.sparkline} />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-[#a3b1c6]">30d ago</span>
            <span className="font-mono text-[9px] text-[#a3b1c6]">Today</span>
          </div>
        </div>

        {/* Performance */}
        <div className="shadow-card rounded-lg bg-[#e0e5ec] screws p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-[#ff4757]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">Performance</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Week', val: stock.weekChange },
              { label: 'Month', val: stock.monthChange },
              { label: 'Quarter', val: stock.quarterChange },
              { label: 'Year', val: stock.yearChange },
              { label: 'YTD', val: stock.ytdChange },
              { label: 'Gap', val: stock.gap },
            ].map(p => (
              <div key={p.label} className="shadow-recessed rounded-md p-2 text-center">
                <div className="text-[8px] font-bold uppercase text-[#4a5568] tracking-wider">{p.label}</div>
                <div className={`font-mono text-xs font-bold ${p.val >= 0 ? 'cell-positive' : 'cell-negative'}`}>
                  {p.val >= 0 ? '+' : ''}{p.val.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Valuation */}
        <div className="shadow-card rounded-lg bg-[#e0e5ec] screws p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart2 size={12} className="text-[#ff4757]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">Valuation</span>
          </div>
          <StatRow label="Market Cap" value={fmtCap(stock.marketCap)} />
          <StatRow label="P/E Ratio" value={stock.pe?.toFixed(1) ?? null} />
          <StatRow label="Forward P/E" value={stock.forwardPe?.toFixed(1) ?? null} />
          <StatRow label="PEG Ratio" value={stock.peg?.toFixed(2) ?? null} />
          <StatRow label="Price/Sales" value={stock.priceSales?.toFixed(1) ?? null} />
          <StatRow label="Price/Book" value={stock.priceBook?.toFixed(1) ?? null} />
          <StatRow label="EV/EBITDA" value={stock.evEbitda?.toFixed(1) ?? null} />
        </div>

        {/* Profitability */}
        <div className="shadow-card rounded-lg bg-[#e0e5ec] screws p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield size={12} className="text-[#ff4757]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">Profitability & Growth</span>
          </div>
          <StatRow label="Profit Margin" value={stock.profitMargin?.toFixed(1) ?? null} suffix="%" />
          <StatRow label="Operating Margin" value={stock.operatingMargin?.toFixed(1) ?? null} suffix="%" />
          <StatRow label="ROE" value={stock.roe?.toFixed(1) ?? null} suffix="%" />
          <StatRow label="ROA" value={stock.roa?.toFixed(1) ?? null} suffix="%" />
          <StatRow label="EPS Growth" value={stock.epsGrowth?.toFixed(1) ?? null} suffix="%" />
          <StatRow label="Revenue Growth" value={stock.revenueGrowth?.toFixed(1) ?? null} suffix="%" />
          <StatRow label="Debt/Equity" value={stock.debtEquity?.toFixed(2) ?? null} />
          <StatRow label="Current Ratio" value={stock.currentRatio?.toFixed(2) ?? null} />
        </div>

        {/* Technical */}
        <div className="shadow-card rounded-lg bg-[#e0e5ec] screws p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-[#ff4757]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">Technical</span>
          </div>
          <StatRow label="RSI (14)" value={stock.rsi} />
          <StatRow label="Beta" value={stock.beta.toFixed(2)} />
          <StatRow label="ATR" value={stock.atr.toFixed(2)} />
          <StatRow label="SMA 20" value={`$${stock.sma20.toFixed(2)}`} />
          <StatRow label="SMA 50" value={`$${stock.sma50.toFixed(2)}`} />
          <StatRow label="SMA 200" value={`$${stock.sma200.toFixed(2)}`} />
          <StatRow label="52w High" value={`$${stock.high52w.toFixed(2)}`} />
          <StatRow label="52w Low" value={`$${stock.low52w.toFixed(2)}`} />
          <StatRow label="From 52w High" value={stock.fromHigh52w.toFixed(1)} suffix="%" />
          <StatRow label="Dividend Yield" value={stock.dividendYield ? stock.dividendYield.toFixed(2) : '—'} suffix={stock.dividendYield ? '%' : ''} />
        </div>

        {/* Ownership & Other */}
        <div className="shadow-card rounded-lg bg-[#e0e5ec] screws p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={12} className="text-[#ff4757]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436]">Ownership & Info</span>
          </div>
          <StatRow label="Institutional Own" value={stock.institutionalOwnership.toFixed(1)} suffix="%" />
          <StatRow label="Insider Own" value={stock.insiderOwnership.toFixed(1)} suffix="%" />
          <StatRow label="Short Float" value={stock.shortFloat.toFixed(1)} suffix="%" />
          <StatRow label="Analyst Rating" value={stock.analystRating} />
          <StatRow label="Analyst Score" value={stock.analystScore.toFixed(1)} suffix="/5" />
          <StatRow label="Earnings Date" value={stock.earningsDate} />
          <StatRow label="Employees" value={stock.employees.toLocaleString()} />
          <StatRow label="Volume" value={stock.volume >= 1e6 ? `${(stock.volume / 1e6).toFixed(1)}M` : `${(stock.volume / 1e3).toFixed(0)}K`} />
          <StatRow label="Rel Volume" value={stock.relativeVolume.toFixed(2)} suffix="x" />
        </div>
      </div>
    </div>
  );
}
