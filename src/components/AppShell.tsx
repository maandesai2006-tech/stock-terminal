'use client';

import { useState, useCallback } from 'react';
import type { TabId } from '@/lib/types';
import TopNav from './TopNav';
import ScreenerTab from './screener/ScreenerTab';
import HeatmapTab from './heatmap/HeatmapTab';
import MarketTab from './market/MarketTab';
import WatchlistsTab from './watchlists/WatchlistsTab';
import StockDetailPanel from './stock-detail/StockDetailPanel';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('screener');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const onSelectStock = useCallback((ticker: string) => {
    setSelectedTicker(ticker);
  }, []);

  const onCloseDetail = useCallback(() => {
    setSelectedTicker(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#e0e5ec] relative noise">
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={(q) => {
          if (q.length >= 1) {
            setActiveTab('screener');
          }
        }}
      />

      <div className={`transition-all duration-300 ${selectedTicker ? 'mr-[440px]' : ''}`}>
        {activeTab === 'screener' && <ScreenerTab onSelectStock={onSelectStock} />}
        {activeTab === 'heatmap' && <HeatmapTab onSelectStock={onSelectStock} />}
        {activeTab === 'market' && <MarketTab onSelectStock={onSelectStock} />}
        {activeTab === 'watchlists' && <WatchlistsTab onSelectStock={onSelectStock} />}
      </div>

      {selectedTicker && (
        <StockDetailPanel ticker={selectedTicker} onClose={onCloseDetail} />
      )}
    </div>
  );
}
