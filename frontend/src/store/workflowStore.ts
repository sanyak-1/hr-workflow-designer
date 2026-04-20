import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import { getLayoutedElements, type LayoutDirection } from '../utils/layoutUtils';

// ─── Node data types ──────────────────────────────────────────────────────────

export interface StartNodeData extends Record<string, unknown> {
  label: string;
}

export interface TaskNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
}

export interface ApprovalNodeData extends Record<string, unknown> {
  label: string;
  approver?: string;
  autoApproveThreshold?: number;
}

export interface AutomatedNodeData extends Record<string, unknown> {
  label: string;
  action?: 'send_email' | 'generate_doc';
}

export interface EndNodeData extends Record<string, unknown> {
  label: string;
  endMessage?: string;
  summaryFlag?: boolean;
}

export type AnyNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── Default initial state ────────────────────────────────────────────────────

const DEFAULT_NODES: Node[] = [
  {
    id: 'start-1',
    type: 'startNode',
    position: { x: 260, y: 40 },
    data: { label: 'Employee Submits Request' } satisfies StartNodeData,
  },
  {
    id: 'task-1',
    type: 'taskNode',
    position: { x: 220, y: 170 },
    data: {
      label: 'HR Reviews Application',
      assignee: 'HR Team',
      dueDate: '',
    } satisfies TaskNodeData,
  },
  {
    id: 'automated-1',
    type: 'automatedNode',
    position: { x: 220, y: 320 },
    data: {
      label: 'Send Confirmation Email',
      action: 'send_email',
    } satisfies AutomatedNodeData,
  },
  {
    id: 'approval-1',
    type: 'approvalNode',
    position: { x: 220, y: 470 },
    data: {
      label: 'Manager Approval',
      approver: 'Direct Manager',
      autoApproveThreshold: 0,
    } satisfies ApprovalNodeData,
  },
  {
    id: 'end-1',
    type: 'endNode',
    position: { x: 260, y: 640 },
    data: {
      label: 'Request Processed',
      endMessage: 'Your request has been processed successfully.',
      summaryFlag: true,
    } satisfies EndNodeData,
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e-start-task',     source: 'start-1',     target: 'task-1',      label: 'submit' },
  { id: 'e-task-auto',      source: 'task-1',       target: 'automated-1', label: 'reviewed' },
  { id: 'e-auto-approval',  source: 'automated-1',  target: 'approval-1',  label: 'notified' },
  {
    id: 'e-approval-end',
    source: 'approval-1',
    sourceHandle: 'approved',
    target: 'end-1',
    label: '✓ approved',
    style: { stroke: '#10b981' },
  },
];

// ─── Store interface ──────────────────────────────────────────────────────────

interface WorkflowState {
  // Canvas state
  nodes: Node[];
  edges: Edge[];

  // Selection
  selectedNodeId: string | null;

  // React Flow change handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Selection actions
  setSelectedNodeId: (id: string | null) => void;

  // Data mutation
  updateNodeData: (nodeId: string, newData: Partial<AnyNodeData>) => void;

  // Add a single new node (used by drag-and-drop from the sidebar)
  addNode: (node: Node) => void;

  // Re-position all nodes using dagre's auto-layout algorithm
  applyAutoLayout: (direction?: LayoutDirection) => void;

  // Initialiser (so App.tsx can seed custom initial nodes/edges if needed)
  initWorkflow: (nodes: Node[], edges: Edge[]) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: null,

  // ── React Flow handlers ──────────────────────────────────────────────────
  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) }),

  // ── Selection ────────────────────────────────────────────────────────────
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // ── Data update ──────────────────────────────────────────────────────────
  updateNodeData: (nodeId, newData) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node,
      ),
    }),

  // ── Add node (drag-and-drop) ──────────────────────────────────────────────
  addNode: (node) => set({ nodes: [...get().nodes, node] }),

  // ── Auto-layout ───────────────────────────────────────────────────────────
  applyAutoLayout: (direction = 'TB') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getLayoutedElements(get().nodes, get().edges, direction);
    set({ nodes: layoutedNodes, edges: layoutedEdges });
  },

  // ── Init ─────────────────────────────────────────────────────────────────
  initWorkflow: (nodes, edges) => set({ nodes, edges }),
}));

// ─── Selector helpers (avoids re-renders for unrelated state slices) ──────────

export const selectSelectedNode = (state: WorkflowState) => {
  if (!state.selectedNodeId) return null;
  return state.nodes.find((n) => n.id === state.selectedNodeId) ?? null;
};