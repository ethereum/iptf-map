import { useState, useMemo } from 'react';
import type { GraphData } from '../lib/graph-types';
import { TYPE_LABELS } from '../lib/graph-layout';

interface Props {
  graph: GraphData;
  filters: Record<string, string>;
  onFilterChange: (filters: Record<string, string>) => void;
}

const selectStyle: React.CSSProperties = {
  background: '#334155',
  color: '#F1F5F9',
  border: '1px solid #475569',
  borderRadius: 6,
  padding: '4px 8px',
  fontSize: 13,
  cursor: 'pointer',
  outline: 'none',
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
  width: 180,
  padding: '4px 10px',
};

export function FilterBar({ graph, filters, onFilterChange }: Props) {
  const layers = useMemo(() => {
    const s = new Set<string>();
    graph.nodes.forEach(n => { if (n.layer) s.add(n.layer); });
    return [...s].sort();
  }, [graph]);

  const maturities = useMemo(() => {
    const s = new Set<string>();
    graph.nodes.forEach(n => { if (n.maturity) s.add(n.maturity); });
    return [...s].sort();
  }, [graph]);

  const types = useMemo(() => {
    const s = new Set<string>();
    graph.nodes.forEach(n => s.add(n.type));
    return [...s].sort();
  }, [graph]);

  const set = (key: string, val: string) => {
    const next = { ...filters };
    if (val) next[key] = val;
    else delete next[key];
    onFilterChange(next);
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={{
      position: 'absolute', top: 8, left: 8, right: 8, zIndex: 10,
      display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
    }}>
      <input
        type="text"
        placeholder="Search..."
        style={inputStyle}
        value={filters.search ?? ''}
        onChange={e => set('search', e.target.value)}
      />
      <select style={selectStyle} value={filters.layer ?? ''} onChange={e => set('layer', e.target.value)}>
        <option value="">All layers</option>
        {layers.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <select style={selectStyle} value={filters.maturity ?? ''} onChange={e => set('maturity', e.target.value)}>
        <option value="">All maturity</option>
        {maturities.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select style={selectStyle} value={filters.type ?? ''} onChange={e => set('type', e.target.value)}>
        <option value="">All types</option>
        {types.map(t => (
          <option key={t} value={t}>{TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t}</option>
        ))}
      </select>
      {activeCount > 0 && (
        <button
          onClick={() => onFilterChange({})}
          style={{
            ...selectStyle,
            cursor: 'pointer',
            color: '#F59E0B',
            borderColor: '#F59E0B',
          }}
        >
          Reset ({activeCount})
        </button>
      )}
    </div>
  );
}
