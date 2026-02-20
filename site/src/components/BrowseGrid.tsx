import { useState, useMemo } from 'react';
import type { GraphData, GraphNode } from '../lib/graph-types';
import { getNodeColor, TYPE_LABELS, nodeMatchesFilters } from '../lib/graph-layout';

interface Props {
  graph: GraphData;
}

export function BrowseGrid({ graph }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const filtered = useMemo(() => {
    return graph.nodes
      .filter(n => n.type !== 'domain') // domains are organizational, not browseable
      .filter(n => nodeMatchesFilters(n, filters))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [graph.nodes, filters]);

  const types = useMemo(() => {
    const s = new Set<string>();
    graph.nodes.forEach(n => { if (n.type !== 'domain') s.add(n.type); });
    return [...s].sort();
  }, [graph.nodes]);

  const set = (key: string, val: string) => {
    const next = { ...filters };
    if (val) next[key] = val;
    else delete next[key];
    setFilters(next);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search..."
          style={{
            background: '#334155', color: '#F1F5F9',
            border: '1px solid #475569', borderRadius: 6,
            padding: '6px 12px', fontSize: 13, width: 200,
          }}
          value={filters.search ?? ''}
          onChange={e => set('search', e.target.value)}
        />
        <select
          style={{
            background: '#334155', color: '#F1F5F9',
            border: '1px solid #475569', borderRadius: 6,
            padding: '6px 8px', fontSize: 13,
          }}
          value={filters.type ?? ''}
          onChange={e => set('type', e.target.value)}
        >
          <option value="">All types</option>
          {types.map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t}</option>
          ))}
        </select>
        <span style={{ color: '#64748B', fontSize: 13, lineHeight: '34px' }}>
          {filtered.length} items
        </span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {filtered.map(node => (
          <div
            key={node.id}
            onClick={() => setSelected(selected?.id === node.id ? null : node)}
            style={{
              background: selected?.id === node.id ? '#334155' : '#1E293B',
              border: `1px solid ${selected?.id === node.id ? getNodeColor(node) : '#334155'}`,
              borderRadius: 8,
              padding: 14,
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              if (selected?.id !== node.id)
                e.currentTarget.style.borderColor = '#475569';
            }}
            onMouseLeave={e => {
              if (selected?.id !== node.id)
                e.currentTarget.style.borderColor = '#334155';
            }}
          >
            {/* Type badge */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{
                background: getNodeColor(node),
                color: '#0F172A',
                padding: '1px 6px', borderRadius: 4,
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              }}>
                {TYPE_LABELS[node.type]}
              </span>
              {node.layer && (
                <span style={{
                  background: '#334155', color: '#94A3B8',
                  padding: '1px 6px', borderRadius: 4,
                  fontSize: 10, fontWeight: 600,
                }}>{node.layer}</span>
              )}
              {node.maturity && (
                <span style={{
                  background: '#334155', color: '#94A3B8',
                  padding: '1px 6px', borderRadius: 4,
                  fontSize: 10, fontWeight: 600,
                }}>{node.maturity}</span>
              )}
            </div>
            {/* Title */}
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {node.title}
            </div>
            {/* Summary */}
            <div style={{
              fontSize: 12, color: '#94A3B8', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {node.summary}
            </div>

            {/* Expanded detail */}
            {selected?.id === node.id && (
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid #475569',
                fontSize: 12, color: '#CBD5E1', lineHeight: 1.5,
              }}>
                {node.privacy_goal && (
                  <p style={{ fontStyle: 'italic', marginBottom: 8 }}>{node.privacy_goal}</p>
                )}
                {node.primary_domain && (
                  <p style={{ fontSize: 11, color: '#64748B' }}>Domain: {node.primary_domain}</p>
                )}
                <div style={{ marginTop: 8, fontSize: 11, color: '#64748B' }}>
                  Source: {node.file}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
