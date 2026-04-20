import { useEffect, useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import WorkflowCanvas from './components/WorkflowCanvas';
import Sidebar from './components/Sidebar';
import { useWorkflowStore } from './store/workflowStore';
import { fetchWorkflow, saveWorkflow } from './api/workflowApi';

// ─── Toast types ──────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'loading';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

// ─── Save-button state machine ────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Small Toast component (inline — no extra library needed) ─────────────────

const TOAST_STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  error:   'bg-red-50   border-red-200   text-red-700',
  loading: 'bg-slate-50 border-slate-200 text-slate-600',
};

const TOAST_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  loading: (
    <svg className="w-4 h-4 text-slate-400 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  ),
};

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-lg
            text-xs font-medium pointer-events-auto
            animate-[slideUp_0.25s_ease-out]
            ${TOAST_STYLES[t.variant]}
          `}
          onClick={() => onDismiss(t.id)}
        >
          {TOAST_ICONS[t.variant]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const initWorkflow      = useWorkflowStore((s) => s.initWorkflow);
  const nodes             = useWorkflowStore((s) => s.nodes);
  const edges             = useWorkflowStore((s) => s.edges);
  const applyAutoLayout   = useWorkflowStore((s) => s.applyAutoLayout);

  const [saveStatus,  setSaveStatus]  = useState<SaveStatus>('idle');
  const [loadStatus,  setLoadStatus]  = useState<'loading' | 'ready' | 'error'>('loading');
  const [lastSaved,   setLastSaved]   = useState<string | null>(null);
  const [toasts,      setToasts]      = useState<Toast[]>([]);

  // Ref for the hidden file input used by the Import button
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, variant: ToastVariant, ttl = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (variant !== 'loading') {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadStatus('loading');
      try {
        const data = await fetchWorkflow();

        if (cancelled) return;

        if (data && data.nodes?.length) {
          initWorkflow(data.nodes, data.edges ?? []);
          setLastSaved(data.updatedAt ?? null);
          addToast('Workflow loaded from server.', 'success');
        }
        // If null (404) — store keeps its DEFAULT_NODES, no toast needed
        setLoadStatus('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('[WorkflowLoad]', err);
        setLoadStatus('error');
        addToast('Could not reach server. Using default workflow.', 'error', 5000);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Export workflow as JSON ──────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const payload = { nodes, edges };
    const json    = JSON.stringify(payload, null, 2);
    const blob    = new Blob([json], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);

    // Programmatically click a temporary anchor to trigger the download
    const anchor      = document.createElement('a');
    anchor.href       = url;
    anchor.download   = 'workflow-export.json';
    anchor.click();

    // Release the object URL after the browser has queued the download
    setTimeout(() => URL.revokeObjectURL(url), 100);

    addToast('Workflow exported as workflow-export.json', 'success');
  }, [nodes, edges, addToast]);

  // ── Download canvas as PNG ───────────────────────────────────────────────
  const handleDownloadImage = useCallback(async () => {
    const canvas = document.querySelector<HTMLElement>('.react-flow');
    if (!canvas) {
      addToast('Could not find the canvas element.', 'error');
      return;
    }

    try {
      const dataUrl = await toPng(canvas, {
        backgroundColor: '#ffffff',
        // Scale up for a crisper image on high-DPI screens
        pixelRatio: window.devicePixelRatio ?? 2,
      });

      const anchor    = document.createElement('a');
      anchor.href     = dataUrl;
      anchor.download = 'hr-workflow.png';
      anchor.click();

      addToast('Image downloaded as hr-workflow.png', 'success');
    } catch (err) {
      console.error('[DownloadImage]', err);
      addToast('Image download failed. Please try again.', 'error', 5000);
    }
  }, [addToast]);

  // ── Import workflow from JSON ────────────────────────────────────────────
  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result;
          if (typeof text !== 'string') throw new Error('Unreadable file.');

          const parsed = JSON.parse(text);

          // Basic shape validation
          if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            throw new Error('Invalid workflow file: missing "nodes" or "edges" arrays.');
          }

          initWorkflow(parsed.nodes, parsed.edges);
          addToast(`Imported "${file.name}" successfully.`, 'success');
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error.';
          addToast(`Import failed — ${msg}`, 'error', 6000);
        } finally {
          // Reset the input so the same file can be re-imported if needed
          if (importInputRef.current) importInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        addToast('Import failed — could not read the file.', 'error', 6000);
      };

      reader.readAsText(file);
    },
    [initWorkflow, addToast],
  );

  // ── Save draft ───────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');
    const loadingId = addToast('Saving workflow…', 'loading');

    try {
      const result = await saveWorkflow(nodes, edges);

      setLastSaved(result.updatedAt);
      setSaveStatus('saved');
      dismissToast(loadingId);
      addToast('Workflow saved successfully!', 'success');

      // Reset button back to idle after 2 s
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('[WorkflowSave]', err);
      setSaveStatus('error');
      dismissToast(loadingId);
      addToast('Save failed. Is json-server running on port 3001?', 'error', 6000);

      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [saveStatus, nodes, edges, addToast, dismissToast]);

  // ── Save-button label & style ────────────────────────────────────────────
  const saveBtnConfig: Record<SaveStatus, { label: string; icon: React.ReactNode; classes: string }> = {
    idle: {
      label: 'Save Draft',
      classes: 'text-slate-600 border-slate-200 hover:bg-slate-50',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
    saving: {
      label: 'Saving…',
      classes: 'text-slate-400 border-slate-100 cursor-not-allowed',
      icon: (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ),
    },
    saved: {
      label: 'Saved!',
      classes: 'text-emerald-600 border-emerald-200 bg-emerald-50',
      icon: (
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
    },
    error: {
      label: 'Save Failed',
      classes: 'text-red-600 border-red-200 bg-red-50',
      icon: (
        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const btn = saveBtnConfig[saveStatus];

  // ── Format last-saved timestamp ──────────────────────────────────────────
  const lastSavedLabel = lastSaved
    ? `Last saved ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(lastSaved))}`
    : null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">

        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 leading-none">HR Workflow Designer</p>
            <p className="text-sm font-semibold text-slate-800 leading-tight mt-0.5">Employee Leave Request</p>
          </div>
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-3">

          {/* Loading indicator */}
          {loadStatus === 'loading' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading…
            </div>
          )}

          {/* Last-saved timestamp */}
          {lastSavedLabel && saveStatus === 'idle' && (
            <span className="hidden sm:block text-xs text-slate-400">{lastSavedLabel}</span>
          )}

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200" />

          {/* Hidden file input — triggered by the Import button below */}
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />

          {/* Import button */}
          <button
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-slate-600 border border-slate-200 rounded-lg
                       hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import
          </button>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-slate-600 border border-slate-200 rounded-lg
                       hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>

          {/* Download Image button */}
          <button
            onClick={handleDownloadImage}
            title="Download the canvas as a PNG image"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-sky-600 border border-sky-200 rounded-lg bg-sky-50
                       hover:bg-sky-100 hover:border-sky-300 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            Download Image
          </button>

          {/* Auto-Layout button */}
          <button
            onClick={() => applyAutoLayout('TB')}
            title="Re-arrange all nodes using auto-layout (top → bottom)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-violet-600 border border-violet-200 rounded-lg bg-violet-50
                       hover:bg-violet-100 hover:border-violet-300 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
            Auto-Layout
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200" />

          {/* Save Draft button */}
          <button
            onClick={handleSaveDraft}
            disabled={saveStatus === 'saving'}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
              border rounded-lg transition-all duration-200
              ${btn.classes}
            `}
          >
            {btn.icon}
            {btn.label}
          </button>

          {/* Publish button */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Publish Workflow
          </button>
        </div>
      </header>

      {/* ── Canvas + Sidebar ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <WorkflowCanvas />
        </div>
      </main>

      {/* ── Toast stack ───────────────────────────────────────────────── */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Keyframe for toast slide-up (injected once) */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}

export default App;