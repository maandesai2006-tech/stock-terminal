'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Stock, ColumnDef, SortConfig } from '@/lib/types';

interface Props {
  stocks: Stock[];
  columns: ColumnDef[];
  sort: SortConfig;
  onSort: (key: keyof Stock) => void;
  onSelectStock: (ticker: string) => void;
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 20;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const isUp = data[data.length - 1] >= data[0];
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#16a34a' : '#dc2626'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DataTable({ stocks, columns, sort, onSort, onSelectStock }: Props) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th style={{ width: 50 }} className="text-center">#</th>
          {columns.map(col => (
            <th
              key={col.key}
              onClick={() => col.sortable !== false && onSort(col.key)}
              style={{ width: col.width, textAlign: col.align }}
              className="group"
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                {sort.key === col.key && (
                  sort.direction === 'asc'
                    ? <ArrowUp size={10} className="text-[#ff4757]" />
                    : <ArrowDown size={10} className="text-[#ff4757]" />
                )}
              </span>
            </th>
          ))}
          <th style={{ width: 70 }} className="text-center">30D</th>
        </tr>
      </thead>
      <tbody>
        {stocks.length === 0 ? (
          <tr>
            <td colSpan={columns.length + 2} className="text-center py-12 text-[#4a5568]">
              No stocks match your filters.
            </td>
          </tr>
        ) : (
          stocks.map((stock, idx) => (
            <tr key={stock.ticker} onClick={() => onSelectStock(stock.ticker)}>
              <td className="text-center text-[10px] text-[#a3b1c6]">{idx + 1}</td>
              {columns.map(col => {
                const val = stock[col.key];
                const formatted = col.format(val);
                let colorClass = '';
                if (col.colorCode && typeof val === 'number') {
                  colorClass = val > 0 ? 'cell-positive' : val < 0 ? 'cell-negative' : 'cell-neutral';
                }
                return (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align }}
                    className={`${colorClass} ${col.key === 'ticker' ? 'font-bold text-[#2d3436]' : ''}`}
                  >
                    {formatted}
                  </td>
                );
              })}
              <td className="text-center">
                <Sparkline data={stock.sparkline} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
