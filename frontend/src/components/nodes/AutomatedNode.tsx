import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type AutomatedNodeData = {
  label?: string;
  action?: string;
};

const AutomatedNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as AutomatedNodeData;

  return (
    <div
      className={`
        w-52 rounded-xl overflow-hidden transition-all duration-200
        ${selected ? 'ring-2 ring-violet-400 ring-offset-2 shadow-lg' : 'shadow-md'}
        bg-white border border-violet-200
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-white uppercase tracking-wider">Automated</span>
        {/* Animated pulse dot */}
        <div className="ml-auto flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-gray-700 leading-snug">
          {nodeData?.label ?? 'Automated Action'}
        </p>

        {nodeData?.action && (
          <div className="mt-2 flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-md px-2 py-1">
            <svg className="w-3 h-3 text-violet-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-violet-600 font-medium truncate">{nodeData.action}</span>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">No human intervention</p>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !shadow"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !shadow"
      />
    </div>
  );
};

export default memo(AutomatedNode);
