'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, X, RotateCcw } from 'lucide-react';
import { FILTER_GROUPS, DEFAULT_FILTERS } from '@/lib/constants';
import type { FilterState, FilterDef } from '@/lib/types';

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
}

function FilterInput({ def, value, onChange }: { def: FilterDef; value: unknown; onChange: (v: unknown) => void }) {
  if (def.type === 'range') {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value != null ? String(value) : ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={def.label}
          step={def.step}
          className="input-recessed py-1.5 px-2 text-[11px] w-full"
        />
        {def.suffix && <span className="text-[10px] text-[#4a5568] font-mono whitespace-nowrap">{def.suffix}</span>}
      </div>
    );
  }

  if (def.type === 'toggle') {
    const checked = value === true;
    return (
      <button
        onClick={() => onChange(checked ? null : true)}
        className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
          checked ? 'shadow-pressed text-[#ff4757]' : 'shadow-sm-neu text-[#4a5568] hover:text-[#2d3436]'
        }`}
      >
        {def.label} {checked ? 'ON' : 'OFF'}
      </button>
    );
  }

  if (def.type === 'multiselect' && def.options) {
    const selected = (value as string[]) || [];
    return (
      <div className="space-y-1 max-h-36 overflow-y-auto">
        {def.options.map(opt => {
          const isOn = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => {
                if (isOn) onChange(selected.filter((s: string) => s !== opt));
                else onChange([...selected, opt]);
              }}
              className={`block w-full text-left px-2 py-1 rounded text-[11px] transition-all ${
                isOn ? 'shadow-pressed text-[#ff4757] font-bold' : 'text-[#4a5568] hover:text-[#2d3436] hover:bg-[#d1d9e6]/50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

export default function FilterSidebar({ filters, onChange, onClose }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

  const update = (key: string, value: unknown) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="p-3 space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">Filters</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onChange({ ...DEFAULT_FILTERS })} className="btn btn-ghost btn-sm" title="Reset All">
            <RotateCcw size={12} />
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm" title="Close">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          placeholder="Ticker or company..."
          className="input-recessed w-full py-2 px-3 text-xs"
        />
      </div>

      {/* Filter Groups */}
      {FILTER_GROUPS.map(group => {
        const isOpen = !collapsed[group.id];
        return (
          <div key={group.id} className="shadow-card rounded-lg bg-[#e0e5ec] overflow-hidden">
            <button
              onClick={() => toggle(group.id)}
              className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#2d3436] hover:text-[#ff4757] transition-colors"
            >
              <span>{group.label}</span>
              {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {isOpen && (
              <div className="px-3 pb-3 space-y-2">
                {group.filters.map(def => (
                  <div key={def.key}>
                    {def.type !== 'toggle' && def.type !== 'multiselect' && (
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#4a5568] mb-0.5 block">
                        {def.label}
                      </label>
                    )}
                    <FilterInput
                      def={def}
                      value={filters[def.key]}
                      onChange={v => update(def.key, v)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
