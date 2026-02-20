import type { GraphNode } from '../lib/graph-types';
import { getNodeColor, TYPE_LABELS } from '../lib/graph-layout';

interface Props {
  node: GraphNode;
  x: number;
  y: number;
}

export function NodeTooltip({ node, x, y }: Props) {
  const badges = [
    node.type !== 'pattern' && TYPE_LABELS[node.type],
    node.layer,
    node.maturity,
    node.status,
  ].filter(Boolean);

  return (
    <div style={{
      position: 'fixed',
      left: x + 16,
      top: y - 10,
      background: '#1E293B',
      border: `1px solid ${getNodeColor(node)}`,
      borderRadius: 8,
      padding: '8px 12px',
      maxWidth: 300,
      pointerEvents: 'none',
      zIndex: 50,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
        {node.title}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
        {badges.map((b, i) => (
          <span key={i} style={{
            background: '#334155',
            color: '#94A3B8',
            padding: '1px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>{b}</span>
        ))}
      </div>
      {node.summary && (
        <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
          {node.summary.slice(0, 150)}
          {node.summary.length > 150 ? '...' : ''}
        </div>
      )}
    </div>
  );
}
