import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type ApprovalNodeData = {
  label?: string;
  approver?: string;
};

const ApprovalNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ApprovalNodeData;

  return (
    <div
      className={`
        w-52 rounded-xl overflow-hidden transition-all duration-200
        ${selected ? 'ring-2 ring-amber-400 ring-offset-2 shadow-lg' : 'shadow-md'}
        bg-white border border-amber-200
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-white uppercase tracking-wider">Approval</span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-gray-700 leading-snug">
          {nodeData?.label ?? 'Approval Gate'}
        </p>

        {nodeData?.approver && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">{nodeData.approver}</span>
          </div>
        )}

        {/* Outcome badges */}
        <div className="flex gap-1.5 mt-2.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approve
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-medium border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Reject
          </span>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !shadow"
      />
      {/* Two source handles: approved (right) and rejected (left) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="approved"
        style={{ left: '35%' }}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white !shadow"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        style={{ left: '65%' }}
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-white !shadow"
      />
    </div>
  );
};

export default memo(ApprovalNode);
