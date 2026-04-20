import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type StartNodeData = {
  label?: string;
};

const StartNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as StartNodeData;

  return (
    <div
      className={`
        w-48 rounded-xl overflow-hidden shadow-md transition-all duration-200
        ${selected ? 'ring-2 ring-emerald-400 ring-offset-2 shadow-lg' : 'shadow-md'}
        bg-white border border-emerald-200
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-xs font-semibold text-white uppercase tracking-wider">Start</span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-gray-700 leading-snug">
          {nodeData?.label ?? 'Workflow Start'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Entry point</p>
      </div>

      {/* Source handle only — no incoming connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white !shadow"
      />
    </div>
  );
};

export default memo(StartNode);
