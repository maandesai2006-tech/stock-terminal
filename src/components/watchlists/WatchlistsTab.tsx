'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Star, X } from 'lucide-react';
import { getWatchlists, saveWatchlists, removeFromWatchlist } from '@/lib/storage';
import { getStockByTicker, getAllStocks } from '@/lib/mock-data';
import type { Watchlist, Stock } from '@/lib/types';

interface Props { onSelectStock: (ticker: string) => void; }

export default function WatchlistsTab({ onSelectStock }: Props) {
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [addTicker, setAddTicker] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const wl = getWatchlists();
    setLists(wl);
    if (wl.length > 0) setActiveId(wl[0].id);
  }, []);

  const activeList = lists.find(l => l.id === activeId);
  const activeStocks = useMemo(() => {
    if (!activeList) return [];
    return activeList.tickers.map(t => getStockByTicker(t)).filter(Boolean) as Stock[];
  }, [activeList]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const nl: Watchlist = { id: String(Date.now()), name: newName.trim(), tickers: [], createdAt: new Date().toISOString().split('T')[0] };
    const updated = [...lists, nl];
    setLists(updated);
    saveWatchlists(updated);
    setActiveId(nl.id);
    setNewName('');
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    saveWatchlists(updated);
    if (activeId === id && updated.length > 0) setActiveId(updated[0].id);
    else if (updated.length === 0) setActiveId('');
  };

  const handleAdd = () => {
    if (!addTicker.trim() || !activeList) return;
    const ticker = addTicker.trim().toUpperCase();
    const stock = getStockByTicker(ticker);
    if (!stock) return;
    if (activeList.tickers.includes(ticker)) return;
    const updated = lists.map(l => l.id === activeId ? { ...l, tickers: [...l.tickers, ticker] } : l);
    setLists(updated);
    saveWatchlists(updated);
    setAddTicker('');
  };

  const handleRemove = (ticker: string) => {
    const updated = removeFromWatchlist(activeId, ticker);
    setLists([...updated]);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex">
      {/* Sidebar */}
      <div className="w-60 border-r border-[#babecc] p-3 space-y-2 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">Watchlists</span>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-ghost btn-sm"><Plus size={14} /></button>
        </div>

        {showCreate && (
          <div className="shadow-card rounded-lg p-2 bg-[#e0e5ec] space-y-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Watchlist name..." className="input-recessed w-full text-xs py-1.5"
              onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <div className="flex gap-1">
              <button onClick={handleCreate} className="btn btn-primary btn-sm flex-1">Create</button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost btn-sm"><X size={12} /></button>
            </div>
          </div>
        )}

        {lists.map(list => (
          <div key={list.id}
            onClick={() => setActiveId(list.id)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group ${
              activeId === list.id ? 'shadow-pressed bg-[#e0e5ec]' : 'shadow-sm-neu bg-[#e0e5ec] hover:shadow-card'
            }`}>
            <div>
              <div className={`text-xs font-bold ${activeId === list.id ? 'text-[#ff4757]' : 'text-[#2d3436]'}`}>{list.name}</div>
              <div className="text-[10px] text-[#4a5568] font-mono">{list.tickers.length} stocks</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#a3b1c6] hover:text-[#ff4757]">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeList ? (
          <>
            <div className="flex items-center gap-3 px-4 py-2 border-b border-[#babecc]/50">
              <Star size={14} className="text-[#ff4757]" />
              <span className="font-bold text-sm text-[#2d3436]">{activeList.name}</span>
              <span className="font-mono text-[10px] text-[#4a5568]">{activeList.tickers.length} stocks</span>
              <div className="ml-auto flex items-center gap-1">
                <input type="text" value={addTicker} onChange={e => setAddTicker(e.target.value)}
                  placeholder="Add ticker..." className="input-recessed text-xs py-1 px-2 w-28"
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                <button onClick={handleAdd} className="btn btn-primary btn-sm">Add</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left" style={{ width: 80 }}>Ticker</th>
                    <th className="text-left" style={{ width: 180 }}>Company</th>
                    <th className="text-left" style={{ width: 120 }}>Sector</th>
                    <th className="text-right" style={{ width: 80 }}>Price</th>
                    <th className="text-right" style={{ width: 80 }}>Chg%</th>
                    <th className="text-right" style={{ width: 80 }}>Week</th>
                    <th className="text-right" style={{ width: 80 }}>Month</th>
                    <th className="text-right" style={{ width: 90 }}>Mkt Cap</th>
                    <th className="text-right" style={{ width: 70 }}>P/E</th>
                    <th className="text-right" style={{ width: 60 }}>RSI</th>
                    <th className="text-center" style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {activeStocks.map(s => (
                    <tr key={s.ticker} onClick={() => onSelectStock(s.ticker)}>
                      <td className="font-bold text-[#2d3436]">{s.ticker}</td>
                      <td className="text-[#4a5568] text-[11px]">{s.name}</td>
                      <td className="text-[#4a5568] text-[11px]">{s.sector}</td>
                      <td className="text-right">${s.price.toFixed(2)}</td>
                      <td className={`text-right ${s.changePercent >= 0 ? 'cell-positive' : 'cell-negative'}`}>
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                      </td>
                      <td className={`text-right ${s.weekChange >= 0 ? 'cell-positive' : 'cell-negative'}`}>
                        {s.weekChange >= 0 ? '+' : ''}{s.weekChange.toFixed(2)}%
                      </td>
                      <td className={`text-right ${s.monthChange >= 0 ? 'cell-positive' : 'cell-negative'}`}>
                        {s.monthChange >= 0 ? '+' : ''}{s.monthChange.toFixed(2)}%
                      </td>
                      <td className="text-right">{s.marketCap >= 1e6 ? `$${(s.marketCap / 1e6).toFixed(1)}T` : s.marketCap >= 1e3 ? `$${(s.marketCap / 1e3).toFixed(0)}B` : `$${s.marketCap}M`}</td>
                      <td className="text-right">{s.pe?.toFixed(1) ?? '—'}</td>
                      <td className="text-right">{s.rsi}</td>
                      <td className="text-center">
                        <button onClick={(e) => { e.stopPropagation(); handleRemove(s.ticker); }}
                          className="text-[#a3b1c6] hover:text-[#ff4757] transition-colors">
                          <X size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#4a5568]">
            <p>Create a watchlist to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
