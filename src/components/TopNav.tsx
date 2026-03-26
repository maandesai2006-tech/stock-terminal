'use client';

import { useState } from 'react';
import { Search, BarChart3, Grid3X3, TrendingUp, List, Activity } from 'lucide-react';
import type { TabId } from '@/lib/types';
import { getMarketIndices } from '@/lib/market-overview';

interface TopNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSearch?: (query: string) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'screener', label: 'Screener', icon: BarChart3 },
  { id: 'heatmap', label: 'Heatmap', icon: Grid3X3 },
  { id: 'market', label: 'Market', icon: TrendingUp },
  { id: 'watchlists', label: 'Watchlists', icon: List },
];

export default function TopNav({ activeTab, onTabChange, onSearch }: TopNavProps) {
  const [searchVal, setSearchVal] = useState('');
  const indices = getMarketIndices();

  return (
    <nav className="sticky top-0 z-40 bg-[#e0e5ec] shadow-card">
      <div className="flex items-center h-12 px-4 gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 mr-4 select-none">
          <div className="w-2.5 h-2.5 rounded-full led-green animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-[0.1em] text-[#2d3436] uppercase">
            StockTerminal
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === id
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs mx-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3b1c6]" />
            <input
              type="text"
              placeholder="Search ticker or company..."
              value={searchVal}
              onChange={e => {
                setSearchVal(e.target.value);
                onSearch?.(e.target.value);
              }}
              className="input-recessed w-full pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Market Indices Mini Bar */}
        <div className="flex items-center gap-3 ml-auto">
          {indices.slice(0, 4).map(idx => (
            <div key={idx.symbol} className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-[#4a5568] font-bold">{idx.symbol}</span>
              <span className="text-[#2d3436]">{idx.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className={idx.changePercent >= 0 ? 'cell-positive' : 'cell-negative'}>
                {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
          {/* Market Status LED */}
          <div className="flex items-center gap-1.5 ml-2">
            <Activity size={12} className="text-[#4a5568]" />
            <div className="w-2 h-2 rounded-full led-green" />
            <span className="font-mono text-[9px] font-bold text-[#4a5568] uppercase tracking-wider">Open</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
