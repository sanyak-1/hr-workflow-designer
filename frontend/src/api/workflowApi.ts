import type { Node, Edge } from '@xyflow/react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkflowPayload {
  id: number;
  name: string;
  nodes: Node[];
  edges: Edge[];
  updatedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3001';
const WORKFLOW_ID = 1;
const ENDPOINT = `${BASE_URL}/workflows/${WORKFLOW_ID}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Load the saved workflow from the JSON server.
 * Returns null if the workflow record doesn't exist yet (404).
 */
export async function fetchWorkflow(): Promise<WorkflowPayload | null> {
  const res = await fetch(ENDPOINT, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  // 404 just means no saved data yet — not a hard error
  if (res.status === 404) return null;

  return handleResponse<WorkflowPayload>(res);
}

/**
 * Save (PUT) the current workflow state to the JSON server.
 * json-server requires PUT to update an existing record.
 * Falls back to POST if the record is missing (first save).
 */
export async function saveWorkflow(
  nodes: Node[],
  edges: Edge[],
  name = 'Employee Leave Request',
): Promise<WorkflowPayload> {
  const payload: WorkflowPayload = {
    id: WORKFLOW_ID,
    name,
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  };

  // Try PUT first (update existing record)
  const putRes = await fetch(ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // If the record doesn't exist yet, POST to create it
  if (putRes.status === 404) {
    const postRes = await fetch(`${BASE_URL}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<WorkflowPayload>(postRes);
  }

  return handleResponse<WorkflowPayload>(putRes);
}