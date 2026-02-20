import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphData, GraphNode, SimNode, SimEdge } from '../lib/graph-types';
import {
  getNodeRadius, getNodeColor, getNodeOpacity, getEdgeColor,
  getLayerYOffset, getDomainAnchor, nodeMatchesFilters, DOMAIN_ANCHORS,
} from '../lib/graph-layout';
import { FilterBar } from './FilterBar';
import { DetailPanel } from './DetailPanel';
import { NodeTooltip } from './NodeTooltip';

interface Props {
  graph: GraphData;
}

// SVG shape renderers
function renderNodeShape(
  g: d3.Selection<SVGGElement, SimNode, SVGGElement, unknown>,
) {
  // Circles for patterns
  g.filter(d => d.type === 'pattern')
    .append('circle')
    .attr('r', d => getNodeRadius(d));

  // Rounded rects for use-cases
  g.filter(d => d.type === 'use-case')
    .append('rect')
    .attr('width', 28).attr('height', 20)
    .attr('x', -14).attr('y', -10)
    .attr('rx', 4);

  // Hexagons for approaches
  g.filter(d => d.type === 'approach')
    .append('polygon')
    .attr('points', hexPoints(14));

  // Large circles for domains
  g.filter(d => d.type === 'domain')
    .append('circle')
    .attr('r', 40)
    .style('fill-opacity', 0.08)
    .style('stroke-opacity', 0.3);

  // Diamonds for vendors
  g.filter(d => d.type === 'vendor')
    .append('polygon')
    .attr('points', diamondPoints(12));

  // Small circles for jurisdictions
  g.filter(d => d.type === 'jurisdiction')
    .append('circle')
    .attr('r', 10);
}

function hexPoints(r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
  }).join(' ');
}

function diamondPoints(r: number): string {
  return `0,${-r} ${r},0 0,${r} ${-r},0`;
}

export function Galaxy({ graph }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimEdge> | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = svg.clientWidth || window.innerWidth;
    const height = svg.clientHeight || (window.innerHeight - 48);

    // Clear previous
    d3.select(svg).selectAll('*').remove();

    // Build domain edge map
    const dEdges = new Map<string, string[]>();
    for (const e of graph.edges) {
      if (e.type === 'in-domain') {
        const src = e.source;
        const tgt = e.target;
        // Figure out which is the domain
        const srcNode = graph.nodes.find(n => n.id === src);
        const tgtNode = graph.nodes.find(n => n.id === tgt);
        if (srcNode?.type === 'domain') {
          if (!dEdges.has(tgt)) dEdges.set(tgt, []);
          dEdges.get(tgt)!.push(srcNode.slug);
        } else if (tgtNode?.type === 'domain') {
          if (!dEdges.has(src)) dEdges.set(src, []);
          dEdges.get(src)!.push(tgtNode.slug);
        }
      }
    }
    // Create simulation nodes & edges (deep copy)
    const nodes: SimNode[] = graph.nodes.map(n => ({ ...n, x: 0, y: 0 }));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edges: SimEdge[] = graph.edges
      .filter(e => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map(e => ({
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
        type: e.type,
      }));

    // Initialize positions near domain anchors
    for (const node of nodes) {
      const anchor = getDomainAnchor(node, dEdges, width, height);
      if (anchor) {
        node.x = anchor.x + (Math.random() - 0.5) * 80;
        node.y = anchor.y + (Math.random() - 0.5) * 80;
      } else {
        node.x = width / 2 + (Math.random() - 0.5) * 200;
        node.y = height / 2 + (Math.random() - 0.5) * 200;
      }
      // Fix domain nodes at their anchor
      if (node.type === 'domain') {
        const a = DOMAIN_ANCHORS[node.slug] ?? DOMAIN_ANCHORS[node.title];
        if (a) {
          node.fx = a.x * width;
          node.fy = a.y * height;
        }
      }
    }

    // SVG structure
    const svgSel = d3.select(svg);
    const g = svgSel.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svgSel.call(zoom);

    // Edges
    const edgeSel = g.append('g').attr('class', 'edges')
      .selectAll<SVGLineElement, SimEdge>('line')
      .data(edges)
      .join('line')
      .attr('stroke', d => getEdgeColor(d.type))
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.2);

    // Node groups
    const nodeSel = g.append('g').attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.1).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          // Keep domain nodes fixed
          if (d.type !== 'domain') {
            d.fx = null;
            d.fy = null;
          }
        })
      );

    // Render shapes
    renderNodeShape(nodeSel);

    // Apply colors
    nodeSel.selectAll('circle, rect, polygon')
      .attr('fill', (_, i, nodes) => {
        const d = d3.select(nodes[i].parentNode as Element).datum() as SimNode;
        return getNodeColor(d);
      })
      .attr('stroke', (_, i, nodes) => {
        const d = d3.select(nodes[i].parentNode as Element).datum() as SimNode;
        return getNodeColor(d);
      })
      .attr('stroke-width', 1.5)
      .attr('opacity', (_, i, nodes) => {
        const d = d3.select(nodes[i].parentNode as Element).datum() as SimNode;
        return getNodeOpacity(d);
      });

    // Labels (only for domains and large nodes)
    nodeSel.append('text')
      .text(d => d.type === 'domain' ? d.title : '')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'domain' ? getNodeRadius(d) + 16 : getNodeRadius(d) + 12)
      .attr('fill', '#94A3B8')
      .attr('font-size', d => d.type === 'domain' ? '12px' : '9px')
      .attr('font-weight', d => d.type === 'domain' ? '600' : '400')
      .attr('pointer-events', 'none');

    // Interaction handlers
    nodeSel
      .on('mouseenter', function (event, d) {
        setHovered(d);
        setMousePos({ x: event.clientX, y: event.clientY });
        // Highlight connected
        const connected = new Set<string>();
        for (const e of edges) {
          if (e.source.id === d.id) connected.add(e.target.id);
          if (e.target.id === d.id) connected.add(e.source.id);
        }
        connected.add(d.id);

        nodeSel.transition().duration(150)
          .attr('opacity', n => connected.has(n.id) ? 1 : 0.1);
        edgeSel.transition().duration(150)
          .attr('stroke-opacity', e =>
            e.source.id === d.id || e.target.id === d.id ? 0.6 : 0.03)
          .attr('stroke-width', e =>
            e.source.id === d.id || e.target.id === d.id ? 1.5 : 0.5);
      })
      .on('mouseleave', function () {
        setHovered(null);
        nodeSel.transition().duration(150).attr('opacity', 1);
        edgeSel.transition().duration(150)
          .attr('stroke-opacity', 0.2)
          .attr('stroke-width', 0.5);
      })
      .on('click', function (_, d) {
        if (d.type === 'domain') return;
        setSelected(prev => prev?.id === d.id ? null : d);
      });

    // Domain clustering force
    function domainClusterForce(alpha: number) {
      for (const node of nodes) {
        if (node.type === 'domain') continue;
        const anchor = getDomainAnchor(node, dEdges, width, height);
        if (anchor) {
          node.vx! += (anchor.x - node.x) * alpha * 0.04;
          node.vy! += (anchor.y - node.y) * alpha * 0.04;
        }
      }
    }

    // Layer stratification force
    function layerForce(alpha: number) {
      for (const node of nodes) {
        if (node.type !== 'pattern' || !node.layer) continue;
        const anchor = getDomainAnchor(node, dEdges, width, height);
        const baseY = anchor?.y ?? height / 2;
        const targetY = baseY + getLayerYOffset(node.layer);
        node.vy! += (targetY - node.y) * alpha * 0.01;
      }
    }

    // Simulation
    const sim = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimEdge>(edges)
        .id(d => d.id)
        .distance(60)
        .strength(0.1))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('collision', d3.forceCollide<SimNode>()
        .radius(d => getNodeRadius(d) + 4))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.02))
      .force('domainCluster', (alpha) => domainClusterForce(alpha))
      .force('layer', (alpha) => layerForce(alpha))
      .alpha(0.8)
      .alphaDecay(0.02)
      .on('tick', () => {
        edgeSel
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    simRef.current = sim;

    return () => { sim.stop(); };
  }, [graph]);

  // Apply filters
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const hasFilters = Object.values(filters).some(v => v);
    const g = d3.select(svg).select('g.nodes');

    g.selectAll<SVGGElement, SimNode>('g')
      .transition().duration(200)
      .attr('opacity', d => {
        if (!hasFilters) return 1;
        return nodeMatchesFilters(d, filters) ? 1 : 0.08;
      });
  }, [filters]);

  // Handle selecting a node from the detail panel
  const handleSelectConnected = useCallback((nodeId: string) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node) setSelected(node);
  }, [graph.nodes]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    }}>
      <FilterBar
        graph={graph}
        filters={filters}
        onFilterChange={setFilters}
      />
      <svg
        ref={svgRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', background: '#0F172A',
        }}
      />
      {hovered && !selected && (
        <NodeTooltip node={hovered} x={mousePos.x} y={mousePos.y} />
      )}
      {selected && (
        <DetailPanel
          node={selected}
          graph={graph}
          onClose={() => setSelected(null)}
          onSelectNode={handleSelectConnected}
        />
      )}
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: '#1E293Bdd', borderRadius: 8, padding: '8px 12px',
        fontSize: 11, color: '#94A3B8', display: 'flex', gap: 12,
        flexWrap: 'wrap',
      }}>
        <span><b style={{ color: '#3B82F6' }}>&#9679;</b> L1</span>
        <span><b style={{ color: '#8B5CF6' }}>&#9679;</b> L2</span>
        <span><b style={{ color: '#10B981' }}>&#9679;</b> Offchain</span>
        <span><b style={{ color: '#06B6D4' }}>&#9679;</b> Hybrid</span>
        <span style={{ borderLeft: '1px solid #475569', paddingLeft: 12 }}>
          <b style={{ color: '#F59E0B' }}>&#9632;</b> Use Case</span>
        <span><b style={{ color: '#EAB308' }}>&#11206;</b> Approach</span>
        <span><b style={{ color: '#14B8A6' }}>&#9670;</b> Vendor</span>
        <span><b style={{ color: '#EF4444' }}>&#9679;</b> Jurisdiction</span>
      </div>
    </div>
  );
}
