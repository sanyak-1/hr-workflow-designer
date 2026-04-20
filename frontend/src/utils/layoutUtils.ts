import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

// ─── Node dimensions used by dagre for spacing calculations ──────────────────
// These should roughly match the rendered sizes of your custom nodes.

const NODE_WIDTH  = 208;  // matches w-52 (13rem) Tailwind class
const NODE_HEIGHT = 110;  // approximate rendered card height

// ─── Direction type ───────────────────────────────────────────────────────────

export type LayoutDirection = 'TB' | 'LR';  // Top→Bottom | Left→Right

// ─── getLayoutedElements ─────────────────────────────────────────────────────

/**
 * Runs a dagre layout pass over the supplied nodes and edges and returns
 * a new nodes array with updated `position` values.  Edges are returned
 * unchanged (dagre computes waypoints but React Flow handles edge routing).
 *
 * @param nodes     Current React Flow node array
 * @param edges     Current React Flow edge array
 * @param direction 'TB' (top-to-bottom, default) or 'LR' (left-to-right)
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'TB',
): { nodes: Node[]; edges: Edge[] } {
  // Create a new directed graph for every call so state never leaks between runs
  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir:  direction,   // layout direction
    nodesep:  60,          // horizontal gap between nodes in the same rank
    ranksep:  80,          // vertical gap between ranks
    marginx:  40,
    marginy:  40,
  });

  // ── Register nodes ──────────────────────────────────────────────────────
  for (const node of nodes) {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // ── Register edges ──────────────────────────────────────────────────────
  for (const edge of edges) {
    // Skip edges whose source or target node is not in the current node list
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  // ── Run the layout algorithm ─────────────────────────────────────────────
  dagre.layout(graph);

  // ── Map calculated positions back onto the React Flow nodes ─────────────
  // dagre returns the centre of each node; React Flow uses the top-left corner.
  const layoutedNodes = nodes.map((node) => {
    const dagreNode = graph.node(node.id);

    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH  / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}