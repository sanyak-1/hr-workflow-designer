import { useEffect, useRef } from 'react';
import { useWorkflowStore, selectSelectedNode } from '../../store/workflowStore';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../../store/workflowStore'; 

// ─── Shared form primitives ───────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
    {children}
  </label>
);

const inputBase =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={inputBase + (props.className ? ` ${props.className}` : '')} />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    rows={3}
    className={
      inputBase +
      ' resize-none leading-relaxed' +
      (props.className ? ` ${props.className}` : '')
    }
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={
      inputBase +
      ' cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem_1rem]' +
      (props.className ? ` ${props.className}` : '')
    }
  />
);

const Field = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-1">{children}</div>
);

const Divider = () => <div className="border-t border-slate-100 my-1" />;

// ─── Node-type badge colours ──────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; gradient: string; accent: string }> = {
  startNode:     { label: 'Start Node',     gradient: 'from-emerald-500 to-teal-500',   accent: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  taskNode:      { label: 'Task Node',      gradient: 'from-indigo-500 to-blue-500',    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  approvalNode:  { label: 'Approval Node',  gradient: 'from-amber-500 to-orange-400',   accent: 'text-amber-600 bg-amber-50 border-amber-200' },
  automatedNode: { label: 'Automated Node', gradient: 'from-violet-500 to-purple-500',  accent: 'text-violet-600 bg-violet-50 border-violet-200' },
  endNode:       { label: 'End Node',       gradient: 'from-rose-500 to-pink-500',      accent: 'text-rose-600 bg-rose-50 border-rose-200' },
};

// ─── Per-type forms ───────────────────────────────────────────────────────────

function StartForm({ data, onChange }: { data: StartNodeData; onChange: (d: Partial<StartNodeData>) => void }) {
  return (
    <Field>
      <Label>Start Title</Label>
      <Input
        type="text"
        value={data.label ?? ''}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="e.g. Employee Submits Request"
      />
    </Field>
  );
}

function TaskForm({ data, onChange }: { data: TaskNodeData; onChange: (d: Partial<TaskNodeData>) => void }) {
  return (
    <>
      <Field>
        <Label>
          Title <span className="text-red-400 normal-case font-normal">*</span>
        </Label>
        <Input
          type="text"
          required
          value={data.label ?? ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. HR Reviews Application"
        />
      </Field>

      <Divider />

      <Field>
        <Label>Description</Label>
        <Textarea
          value={data.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What should happen in this task?"
        />
      </Field>

      <Divider />

      <Field>
        <Label>Assignee</Label>
        <Input
          type="text"
          value={data.assignee ?? ''}
          onChange={(e) => onChange({ assignee: e.target.value })}
          placeholder="e.g. HR Team"
        />
      </Field>

      <Divider />

      <Field>
        <Label>Due Date</Label>
        <Input
          type="date"
          value={data.dueDate ?? ''}
          onChange={(e) => onChange({ dueDate: e.target.value })}
        />
      </Field>
    </>
  );
}

function ApprovalForm({ data, onChange }: { data: ApprovalNodeData; onChange: (d: Partial<ApprovalNodeData>) => void }) {
  return (
    <>
      <Field>
        <Label>Title</Label>
        <Input
          type="text"
          value={data.label ?? ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Manager Approval"
        />
      </Field>

      <Divider />

      <Field>
        <Label>Approver Role</Label>
        <Input
          type="text"
          value={data.approver ?? ''}
          onChange={(e) => onChange({ approver: e.target.value })}
          placeholder="e.g. Direct Manager"
        />
      </Field>

      <Divider />

      <Field>
        <Label>Auto-Approve Threshold (days)</Label>
        <Input
          type="number"
          min={0}
          value={data.autoApproveThreshold ?? 0}
          onChange={(e) => onChange({ autoApproveThreshold: Number(e.target.value) })}
          placeholder="0 = disabled"
        />
        <p className="text-xs text-slate-400 mt-1">
          Auto-approve if no response within this many days. Set to 0 to disable.
        </p>
      </Field>
    </>
  );
}

function AutomatedForm({ data, onChange }: { data: AutomatedNodeData; onChange: (d: Partial<AutomatedNodeData>) => void }) {
  return (
    <>
      <Field>
        <Label>Title</Label>
        <Input
          type="text"
          value={data.label ?? ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Send Confirmation Email"
        />
      </Field>

      <Divider />

      <Field>
        <Label>Action</Label>
        <Select
          value={data.action ?? 'send_email'}
          onChange={(e) =>
            onChange({ action: e.target.value as AutomatedNodeData['action'] })
          }
        >
          <option value="send_email">📧 send_email</option>
          <option value="generate_doc">📄 generate_doc</option>
        </Select>
      </Field>

      {/* Contextual hint per action */}
      <div className="mt-2 rounded-lg bg-violet-50 border border-violet-100 px-3 py-2">
        {data.action === 'send_email' ? (
          <p className="text-xs text-violet-600">
            Triggers an automated email to the relevant parties when this step is reached.
          </p>
        ) : (
          <p className="text-xs text-violet-600">
            Auto-generates a summary document (PDF/DOCX) when this step is reached.
          </p>
        )}
      </div>
    </>
  );
}

function EndForm({ data, onChange }: { data: EndNodeData; onChange: (d: Partial<EndNodeData>) => void }) {
  return (
    <>
      <Field>
        <Label>End Message</Label>
        <Input
          type="text"
          value={data.endMessage ?? ''}
          onChange={(e) => onChange({ endMessage: e.target.value })}
          placeholder="e.g. Your request has been processed."
        />
      </Field>

      <Divider />

      <Field>
        <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
          onClick={() => onChange({ summaryFlag: !data.summaryFlag })}
        >
          {/* Custom checkbox */}
          <div
            className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
              data.summaryFlag
                ? 'bg-rose-500 border-rose-500'
                : 'bg-white border-slate-300'
            }`}
          >
            {data.summaryFlag && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Generate Summary Report</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Attach a summary of the workflow run to the completion notification.
            </p>
          </div>
        </div>
      </Field>
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center select-none">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600">No node selected</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Click any node on the canvas to configure its properties here.
        </p>
      </div>
    </div>
  );
}

// ─── Config Panel ─────────────────────────────────────────────────────────────

const ConfigPanel = () => {
  const selectedNode      = useWorkflowStore(selectSelectedNode);
  const updateNodeData    = useWorkflowStore((s) => s.updateNodeData);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

  // Auto-scroll to top when a new node is selected
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedNode?.id]);

  const meta = selectedNode ? TYPE_META[selectedNode.type ?? ''] : null;

  const handleChange = (partial: Record<string, unknown>) => {
    if (selectedNode) updateNodeData(selectedNode.id, partial);
  };

  return (
    /* Sliding panel — always in DOM, translates in/out */
    <aside
      className={`
        absolute top-0 right-0 h-full w-80 z-10
        flex flex-col bg-white border-l border-slate-200 shadow-xl
        transition-transform duration-300 ease-in-out
        ${selectedNode ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* ── Panel header ──────────────────────────────────────────── */}
      <div className={`flex-shrink-0 bg-gradient-to-r ${meta?.gradient ?? 'from-slate-400 to-slate-500'} px-4 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">
              Configure
            </p>
            <p className="text-base font-bold text-white mt-0.5">
              {meta?.label ?? 'Node'}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setSelectedNodeId(null)}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Node ID badge */}
        {selectedNode && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span className="text-xs text-white/80 font-mono">{selectedNode.id}</span>
          </div>
        )}
      </div>

      {/* ── Scrollable form body ───────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {selectedNode ? (
          <div className="px-4 py-5 space-y-4">
            {selectedNode.type === 'startNode' && (
              <StartForm
                data={selectedNode.data as StartNodeData}
                onChange={handleChange}
              />
            )}
            {selectedNode.type === 'taskNode' && (
              <TaskForm
                data={selectedNode.data as TaskNodeData}
                onChange={handleChange}
              />
            )}
            {selectedNode.type === 'approvalNode' && (
              <ApprovalForm
                data={selectedNode.data as ApprovalNodeData}
                onChange={handleChange}
              />
            )}
            {selectedNode.type === 'automatedNode' && (
              <AutomatedForm
                data={selectedNode.data as AutomatedNodeData}
                onChange={handleChange}
              />
            )}
            {selectedNode.type === 'endNode' && (
              <EndForm
                data={selectedNode.data as EndNodeData}
                onChange={handleChange}
              />
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      {selectedNode && (
        <div className="flex-shrink-0 border-t border-slate-100 px-4 py-3 bg-slate-50">
          <p className="text-xs text-slate-400 text-center">
            Changes are applied to the canvas instantly.
          </p>
        </div>
      )}
    </aside>
  );
};

export default ConfigPanel;