// Drag payload key — must match what WorkflowCanvas reads
export const DRAG_TYPE = 'application/reactflow-nodetype';

// ─── Node palette definition ──────────────────────────────────────────────────

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  gradient: string;
  iconPath: string;
  border: string;
  pill: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'startNode',
    label: 'Start',
    description: 'Entry point of the workflow',
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-200 hover:border-emerald-400',
    pill: 'bg-emerald-50 text-emerald-600',
    iconPath:
      'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z',
  },
  {
    type: 'taskNode',
    label: 'Task',
    description: 'Manual step assigned to a person',
    gradient: 'from-indigo-500 to-blue-500',
    border: 'border-indigo-200 hover:border-indigo-400',
    pill: 'bg-indigo-50 text-indigo-600',
    iconPath:
      'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75',
  },
  {
    type: 'approvalNode',
    label: 'Approval',
    description: 'Gate requiring approve / reject',
    gradient: 'from-amber-500 to-orange-400',
    border: 'border-amber-200 hover:border-amber-400',
    pill: 'bg-amber-50 text-amber-600',
    iconPath:
      'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    type: 'automatedNode',
    label: 'Automated',
    description: 'Runs automatically, no human needed',
    gradient: 'from-violet-500 to-purple-500',
    border: 'border-violet-200 hover:border-violet-400',
    pill: 'bg-violet-50 text-violet-600',
    iconPath:
      'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  },
  {
    type: 'endNode',
    label: 'End',
    description: 'Terminal point of the workflow',
    gradient: 'from-rose-500 to-pink-500',
    border: 'border-rose-200 hover:border-rose-400',
    pill: 'bg-rose-50 text-rose-600',
    iconPath:
      'M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z',
  },
];

// ─── Single draggable palette card ────────────────────────────────────────────

function PaletteCard({ item }: { item: PaletteItem }) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Write the node type into the drag payload
    e.dataTransfer.setData(DRAG_TYPE, item.type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        group flex items-center gap-3 p-3 rounded-xl
        bg-white border ${item.border}
        shadow-sm hover:shadow-md
        cursor-grab active:cursor-grabbing active:scale-95
        transition-all duration-150 select-none
      `}
    >
      {/* Coloured icon chip */}
      <div
        className={`
          flex-shrink-0 w-9 h-9 rounded-lg
          bg-gradient-to-br ${item.gradient}
          flex items-center justify-center shadow-sm
        `}
      >
        <svg
          className="w-4.5 h-4.5 w-[18px] h-[18px] text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
        </svg>
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700 leading-none">{item.label}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-snug truncate">{item.description}</p>
      </div>

      {/* Drag hint — visible on hover */}
      <div className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
          {/* six-dot drag handle */}
          <circle cx="7" cy="6"  r="1.2" /><circle cx="13" cy="6"  r="1.2" />
          <circle cx="7" cy="10" r="1.2" /><circle cx="13" cy="10" r="1.2" />
          <circle cx="7" cy="14" r="1.2" /><circle cx="13" cy="14" r="1.2" />
        </svg>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = () => (
  <aside className="flex-shrink-0 w-60 h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden">
    {/* Header */}
    <div className="px-4 pt-5 pb-3 border-b border-slate-100">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Node Palette</p>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
        Drag any node onto the canvas to add it to your workflow.
      </p>
    </div>

    {/* Scrollable card list */}
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2.5">
      {PALETTE_ITEMS.map((item) => (
        <PaletteCard key={item.type} item={item} />
      ))}
    </div>

    {/* Footer hint */}
    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Click a node on the canvas to configure it.
      </div>
    </div>
  </aside>
);

export default Sidebar;