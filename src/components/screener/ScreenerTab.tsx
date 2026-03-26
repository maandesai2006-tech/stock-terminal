'use client';

import { useState, useMemo, useCallback } from 'react';
import { Filter, X, Columns, Save, RotateCcw } from 'lucide-react';
import { getAllStocks } from '@/lib/mock-data';
import { applyFilters, applySort, getActiveFilterLabels } from '@/lib/screener-engine';
import { DEFAULT_FILTERS, DEFAULT_SORT, DEFAULT_COLUMNS, ALL_COLUMNS, PAGE_SIZES } from '@/lib/constants';
import type { FilterState, SortConfig, Stock } from '@/lib/types';
import FilterSidebar from './FilterSidebar';
import DataTable from './DataTable';

interface Props {
  onSelectStock: (ticker: string) => void;
}

export default function ScreenerTab({ onSelectStock }: Props) {
  const allStocks = useMemo(() => getAllStocks(), []);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [sort, setSort] = useState<SortConfig>(DEFAULT_SORT);
  const [visibleCols, setVisibleCols] = useState<string[]>([...DEFAULT_COLUMNS]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [colPickerOpen, setColPickerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(50);

  const filtered = useMemo(() => applyFilters(allStocks, filters), [allStocks, filters]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = useMemo(() => sorted.slice(page * pageSize, (page + 1) * pageSize), [sorted, page, pageSize]);

  const activeLabels = useMemo(() => getActiveFilterLabels(filters), [filters]);

  const columns = useMemo(
    () => ALL_COLUMNS.filter(c => visibleCols.includes(c.key)),
    [visibleCols]
  );

  const handleSort = useCallback((key: keyof Stock) => {
    setSort(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' }
    );
    setPage(0);
  }, []);

  const resetFilters = () => { setFilters({ ...DEFAULT_FILTERS }); setPage(0); };

  const removeFilter = (label: string) => {
    const f = { ...filters };
    if (label.startsWith('Sectors:')) f.sectors = [];
    else if (label.startsWith('Exchanges:')) f.exchanges = [];
    else if (label.startsWith('Search:')) f.search = '';
    else if (label.includes('SMA 20')) f.above20SMA = null;
    else if (label.includes('SMA 50')) f.above50SMA = null;
    else if (label.includes('SMA 200')) f.above200SMA = null;
    else if (label.includes('Dividend Payer')) f.dividendPayer = null;
    setFilters(f);
    setPage(0);
  };

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* Filter Sidebar */}
      {sidebarOpen && (
        <div className="w-72 flex-shrink-0 border-r border-[#babecc] overflow-y-auto bg-[#e0e5ec]">
          <FilterSidebar
            filters={filters}
            onChange={(f) => { setFilters(f); setPage(0); }}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#babecc]/50 bg-[#e0e5ec]">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="btn btn-ghost btn-sm" title="Show Filters">
              <Filter size={14} />
            </button>
          )}

          {/* Active Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {activeLabels.map(label => (
              <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#d1d9e6] text-[#4a5568] shadow-recessed">
                {label}
                <button onClick={() => removeFilter(label)} className="hover:text-[#ff4757] transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
            {activeLabels.length > 0 && (
              <button onClick={resetFilters} className="text-[10px] text-[#ff4757] font-bold uppercase hover:underline ml-1">
                Clear All
              </button>
            )}
          </div>

          {/* Result Count */}
          <div className="font-mono text-[11px] text-[#4a5568] whitespace-nowrap">
            <span className="text-[#2d3436] font-bold">{sorted.length}</span> / {allStocks.length} stocks
          </div>

          {/* Column Picker Toggle */}
          <div className="relative">
            <button onClick={() => setColPickerOpen(!colPickerOpen)} className="btn btn-ghost btn-sm" title="Columns">
              <Columns size={14} />
            </button>
            {colPickerOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-[#e0e5ec] shadow-floating rounded-lg p-3 z-30 screws max-h-80 overflow-y-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#4a5568] mb-2">Show Columns</div>
                {ALL_COLUMNS.map(col => (
                  <label key={col.key} className="flex items-center gap-2 py-0.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={visibleCols.includes(col.key)}
                      onChange={e => {
                        if (e.target.checked) setVisibleCols([...visibleCols, col.key]);
                        else setVisibleCols(visibleCols.filter(c => c !== col.key));
                      }}
                      className="accent-[#ff4757]"
                    />
                    <span className="text-[#2d3436]">{col.label}</span>
                  </label>
                ))}
                <button onClick={() => setVisibleCols([...DEFAULT_COLUMNS])} className="btn btn-ghost btn-sm w-full mt-2">
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <DataTable
            stocks={pageData}
            columns={columns}
            sort={sort}
            onSort={handleSort}
            onSelectStock={onSelectStock}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#babecc]/50 bg-[#e0e5ec]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#4a5568] uppercase tracking-wider">Rows:</span>
            {PAGE_SIZES.map(size => (
              <button
                key={size}
                onClick={() => { setPageSize(size); setPage(0); }}
                className={`font-mono text-[11px] px-2 py-0.5 rounded transition-all ${
                  pageSize === size ? 'shadow-pressed text-[#ff4757] font-bold' : 'shadow-sm-neu text-[#4a5568] hover:text-[#2d3436]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn btn-ghost btn-sm disabled:opacity-30">
              Prev
            </button>
            <span className="font-mono text-[11px] text-[#4a5568]">
              Page <span className="text-[#2d3436] font-bold">{page + 1}</span> of {totalPages || 1}
            </span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn btn-ghost btn-sm disabled:opacity-30">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
