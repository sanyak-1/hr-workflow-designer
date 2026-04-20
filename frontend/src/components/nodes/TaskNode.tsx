import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

type TaskNodeData = {
  label?: string;
  assignee?: string;
  dueIn?: string;
};

const TaskNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as TaskNodeData;

  return (
    <div
      className={`
        w-52 rounded-xl overflow-hidden transition-all duration-200
        ${selected ? 'ring-2 ring-indigo-400 ring-offset-2 shadow-lg' : 'shadow-md'}
        bg-white border border-indigo-200
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-white uppercase tracking-wider">Task</span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-gray-700 leading-snug">
          {nodeData?.label ?? 'Manual Task'}
        </p>

        {nodeData?.assignee && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">{nodeData.assignee}</span>
          </div>
        )}

        {nodeData?.dueIn && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-400">Due in {nodeData.dueIn}</span>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !shadow"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !shadow"
      />
    </div>
  );
};

export default memo(TaskNode);
