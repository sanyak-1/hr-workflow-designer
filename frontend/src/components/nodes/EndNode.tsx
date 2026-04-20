import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type EndNodeData = {
  label?: string;
  status?: 'completed' | 'rejected' | 'cancelled';
};

const statusConfig = {
  completed: { color: 'from-rose-500 to-pink-500', border: 'border-rose-200', ring: 'ring-rose-400' },
  rejected:  { color: 'from-red-600 to-rose-600',  border: 'border-red-200',  ring: 'ring-red-400' },
  cancelled: { color: 'from-gray-500 to-slate-500', border: 'border-gray-200', ring: 'ring-gray-400' },
} as const;

const EndNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as EndNodeData;
  const status = nodeData?.status ?? 'completed';
  const cfg = statusConfig[status];

  return (
    <div
      className={`
        w-48 rounded-xl overflow-hidden transition-all duration-200
        ${selected ? `ring-2 ${cfg.ring} ring-offset-2 shadow-lg` : 'shadow-md'}
        bg-white border ${cfg.border}
      `}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${cfg.color} px-3 py-2 flex items-center gap-2`}>
        <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-xs font-semibold text-white uppercase tracking-wider">End</span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-gray-700 leading-snug">
          {nodeData?.label ?? 'Workflow End'}
        </p>
        <div className="mt-2">
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize
              ${status === 'completed' ? 'bg-rose-50 text-rose-600 border border-rose-200' : ''}
              ${status === 'rejected'  ? 'bg-red-50 text-red-600 border border-red-200' : ''}
              ${status === 'cancelled' ? 'bg-gray-100 text-gray-500 border border-gray-200' : ''}
            `}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
          </span>
        </div>
      </div>

      {/* Target handle only — no outgoing connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white !shadow"
      />
    </div>
  );
};

export default memo(EndNode);
