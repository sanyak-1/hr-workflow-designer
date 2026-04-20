import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeMouseHandler,
  type Node,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../store/workflowStore';
import { DRAG_TYPE } from './Sidebar';

import StartNode     from './nodes/StartNode';
import TaskNode      from './nodes/TaskNode';
import ApprovalNode  from './nodes/ApprovalNode';
import AutomatedNode from './nodes/AutomatedNode';
import EndNode       from './nodes/EndNode';
import ConfigPanel   from './forms/ConfigPanel';

// ─── Node type registry (stable — defined outside component) ──────────────────
const nodeTypes = {
  startNode:     StartNode,
  taskNode:      TaskNode,
  approvalNode:  ApprovalNode,
  automatedNode: AutomatedNode,
  endNode:       EndNode,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#94a3b8' },
  animated: false,
};

/** Default data seeded onto a freshly dropped node by type */
function defaultDataForType(type: string): Record<string, unknown> {
  switch (type) {
    case 'startNode':     return { label: 'New Start' };
    case 'taskNode':      return { label: 'New Task', assignee: '', dueDate: '' };
    case 'approvalNode':  return { label: 'New Approval', approver: '', autoApproveThreshold: 0 };
    case 'automatedNode': return { label: 'New Automation', action: 'send_email' };
    case 'endNode':       return { label: 'New End', endMessage: '', summaryFlag: false };
    default:              return { label: 'New Node' };
  }
}

// ─── Connection validation ─────────────────────────────────────────────────────
//
// Each rule receives the attempted Connection and the current node list.
// Returns a human-readable violation string, or null when the rule passes.

type ValidationRule = (conn: Connection, nodes: Node[]) => string | null;

const VALIDATION_RULES: ValidationRule[] = [
  // Rule 1 — no self-connections
  (conn) =>
    conn.source === conn.target
      ? 'A node cannot connect to itself.'
      : null,

  // Rule 2 — Start nodes cannot be a target (no incoming edges)
  (conn, nodes) => {
    const target = nodes.find((n) => n.id === conn.target);
    return target?.type === 'startNode'
      ? 'Start nodes cannot have incoming connections.'
      : null;
  },

  // Rule 3 — End nodes cannot be a source (no outgoing edges)
  (conn, nodes) => {
    const source = nodes.find((n) => n.id === conn.source);
    return source?.type === 'endNode'
      ? 'End nodes cannot have outgoing connections.'
      : null;
  },
];

/** Returns the first violated rule message, or null if the connection is valid. */
function getViolation(conn: Connection, nodes: Node[]): string | null {
  for (const rule of VALIDATION_RULES) {
    const msg = rule(conn, nodes);
    if (msg) return msg;
  }
  return null;
}

// ─── Inner canvas — must live inside ReactFlowProvider to use useReactFlow ────

const FlowCanvas = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Tracks the violation reason set during isValidConnection so we can
  // display it as a toast when the user releases the connection handle.
  const pendingViolationRef = useRef<string | null>(null);
  const [violationMsg, setViolationMsg]   = useState<string | null>(null);
  const violationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodes             = useWorkflowStore((s) => s.nodes);
  const edges             = useWorkflowStore((s) => s.edges);
  const onNodesChange     = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange     = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect         = useWorkflowStore((s) => s.onConnect);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const selectedNodeId    = useWorkflowStore((s) => s.selectedNodeId);
  const addNode           = useWorkflowStore((s) => s.addNode);

  // ── isValidConnection — called by React Flow on every potential connection ─
  // Returning false also makes React Flow render the target handle red.
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const violation = getViolation(connection, nodes);
      // Stash the reason so onConnectEnd can surface it as a toast
      pendingViolationRef.current = violation;
      return violation === null;
    },
    [nodes],
  );

  // ── onConnectEnd — fires when the user releases the drag handle ────────────
  // If the last attempted connection was invalid, show the violation toast.
  const onConnectEnd = useCallback(() => {
    const msg = pendingViolationRef.current;
    pendingViolationRef.current = null;
    if (!msg) return;

    // Clear any existing auto-dismiss timer
    if (violationTimerRef.current) clearTimeout(violationTimerRef.current);
    setViolationMsg(msg);
    violationTimerRef.current = setTimeout(() => setViolationMsg(null), 3500);
  }, []);

  // ── Node click → select ────────────────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => setSelectedNodeId(node.id),
    [setSelectedNodeId],
  );

  // ── Pane click → deselect ──────────────────────────────────────────────
  const onPaneClick = useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId],
  );

  // ── Drag-over: tell the browser we accept the drop ─────────────────────
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Drop: create a new node at the cursor position ─────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const nodeType = e.dataTransfer.getData(DRAG_TYPE);
      if (!nodeType) return; // dropped something else — ignore

      // Convert the screen-space drop position to React Flow canvas coords
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      const newNode: Node = {
        id:       `${nodeType}-${Date.now()}`,
        type:     nodeType,
        position,
        data:     defaultDataForType(nodeType),
      };

      addNode(newNode);
      // Immediately select the new node so the config panel opens
      setTimeout(() => setSelectedNodeId(newNode.id), 50);
    },
    [screenToFlowPosition, addNode, setSelectedNodeId],
  );

  // Sync ReactFlow's visual selection with our store
  const nodesWithSelection = nodes.map((n) => ({
    ...n,
    selected: n.id === selectedNodeId,
  }));

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        // Red connection line while dragging an invalid edge
        connectionLineStyle={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#e2e8f0" />

        <Controls
          className="!border !border-slate-200 !rounded-lg !shadow-sm !bg-white"
          showInteractive={false}
        />

        <MiniMap
          className="!border !border-slate-200 !rounded-lg !shadow-sm"
          nodeColor={(node) => {
            switch (node.type) {
              case 'startNode':     return '#10b981';
              case 'taskNode':      return '#6366f1';
              case 'approvalNode':  return '#f59e0b';
              case 'automatedNode': return '#8b5cf6';
              case 'endNode':       return '#f43f5e';
              default:              return '#94a3b8';
            }
          }}
          maskColor="rgba(241,245,249,0.7)"
        />
      </ReactFlow>

      {/* ── Violation toast (Hardcoded to pop into DOM and bounce) ── */}
      {violationMsg && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg animate-bounce flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold text-sm">{violationMsg}</span>
        </div>
      )}

      {/* Config panel slides in from the right over the canvas */}
      <ConfigPanel />
    </div>
  );
};

// ─── Public export — wraps FlowCanvas in the required provider ────────────────

const WorkflowCanvas = () => (
  <ReactFlowProvider>
    <FlowCanvas />
  </ReactFlowProvider>
);

export default WorkflowCanvas;