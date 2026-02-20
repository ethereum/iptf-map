import { useMemo } from 'react';
import type { GraphData, GraphNode } from '../lib/graph-types';
import { getNodeColor, TYPE_LABELS } from '../lib/graph-layout';
import { marked } from 'marked';

interface Props {
  node: GraphNode;
  graph: GraphData;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

export function DetailPanel({ node, graph, onClose, onSelectNode }: Props) {
  const connections = useMemo(() => {
    const result: { node: GraphNode; edgeType: string; direction: 'to' | 'from' }[] = [];
    const seen = new Set<string>();

    for (const edge of graph.edges) {
      if (edge.source === node.id && !seen.has(edge.target)) {
        seen.add(edge.target);
        const target = graph.nodes.find(n => n.id === edge.target);
        if (target) result.push({ node: target, edgeType: edge.type, direction: 'to' });
      }
      if (edge.target === node.id && !seen.has(edge.source)) {
        seen.add(edge.source);
        const source = graph.nodes.find(n => n.id === edge.source);
        if (source) result.push({ node: source, edgeType: edge.type, direction: 'from' });
      }
    }

    // Sort: use-cases first, then approaches, patterns, vendors, jurisdictions
    const typeOrder: Record<string, number> = {
      'use-case': 0, approach: 1, pattern: 2, vendor: 3, domain: 4, jurisdiction: 5,
    };
    result.sort((a, b) => (typeOrder[a.node.type] ?? 9) - (typeOrder[b.node.type] ?? 9));

    return result;
  }, [node, graph]);

  const contentHtml = useMemo(() => {
    // Render just the first few sections, not the entire content
    const sections = node.content.split(/\n(?=## )/);
    const limited = sections.slice(0, 4).join('\n');
    return marked.parse(limited) as string;
  }, [node.content]);

  const badges = [
    node.layer,
    node.maturity,
    node.status,
    node.primary_domain,
  ].filter(Boolean);

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: 400, maxWidth: '90vw',
      background: '#1E293B',
      borderLeft: `2px solid ${getNodeColor(node)}`,
      overflowY: 'auto',
      zIndex: 20,
      boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid #334155',
        position: 'sticky', top: 0, background: '#1E293B', zIndex: 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
              color: getNodeColor(node), marginBottom: 4,
            }}>
              {TYPE_LABELS[node.type]}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{node.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#94A3B8',
              fontSize: 20, cursor: 'pointer', padding: '0 4px',
            }}
          >&#215;</button>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {badges.map((b, i) => (
            <span key={i} style={{
              background: '#334155', color: '#CBD5E1',
              padding: '2px 8px', borderRadius: 4, fontSize: 11,
              fontWeight: 600, textTransform: 'uppercase',
            }}>{b}</span>
          ))}
        </div>
        {node.privacy_goal && (
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, lineHeight: 1.5 }}>
            {node.privacy_goal}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{ padding: 16, fontSize: 13, lineHeight: 1.6, color: '#CBD5E1' }}
        className="detail-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Connections */}
      {connections.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            color: '#64748B', marginBottom: 8, letterSpacing: '0.05em',
          }}>
            Connected ({connections.length})
          </div>
          {connections.map(({ node: cn, edgeType }) => (
            <button
              key={cn.id}
              onClick={() => onSelectNode(cn.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left',
                background: '#334155', border: '1px solid #475569',
                borderRadius: 6, padding: '6px 10px', marginBottom: 4,
                cursor: 'pointer', color: '#F1F5F9', fontSize: 12,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = getNodeColor(cn))}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#475569')}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: getNodeColor(cn), flexShrink: 0,
              }} />
              <span style={{ flex: 1 }}>{cn.title}</span>
              <span style={{
                fontSize: 9, color: '#64748B', textTransform: 'uppercase',
              }}>{edgeType}</span>
            </button>
          ))}
        </div>
      )}

      {/* Source file link */}
      <div style={{ padding: '8px 16px 16px', fontSize: 11, color: '#64748B' }}>
        Source: {node.file}
      </div>

      <style>{`
        .detail-content h2 {
          font-size: 14px; font-weight: 700; margin: 16px 0 8px;
          color: #F1F5F9; border-bottom: 1px solid #334155; padding-bottom: 4px;
        }
        .detail-content h3 { font-size: 13px; font-weight: 600; margin: 12px 0 4px; color: #E2E8F0; }
        .detail-content p { margin: 6px 0; }
        .detail-content ul, .detail-content ol { padding-left: 18px; margin: 6px 0; }
        .detail-content li { margin: 2px 0; }
        .detail-content strong { color: #F1F5F9; }
        .detail-content code {
          background: #334155; padding: 1px 4px; border-radius: 3px; font-size: 12px;
        }
        .detail-content a { color: #8B5CF6; text-decoration: none; }
        .detail-content a:hover { text-decoration: underline; }
        .detail-content table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 12px; }
        .detail-content th, .detail-content td {
          border: 1px solid #475569; padding: 4px 8px; text-align: left;
        }
        .detail-content th { background: #334155; font-weight: 600; }
      `}</style>
    </div>
  );
}
