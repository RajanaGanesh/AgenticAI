import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Mail,
  MessageSquare,
  Sparkles,
  Sheet,
  Zap,
  Radio,
} from 'lucide-react';

const PROVIDER_CONFIG = {
  gmail: {
    icon: Mail,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-300 dark:border-rose-500/40',
    tag: 'Gmail',
  },
  slack: {
    icon: MessageSquare,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-500/40',
    tag: 'Slack',
  },
  discord: {
    icon: Radio,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-300 dark:border-indigo-500/40',
    tag: 'Discord',
  },
  'google-sheets': {
    icon: Sheet,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-300 dark:border-teal-500/40',
    tag: 'Google Sheets',
  },
  ai: {
    icon: Sparkles,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-300 dark:border-cyan-500/40',
    tag: 'AI Agent',
  },
  system: {
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-500/40',
    tag: 'System',
  },
};

function AgentflowNode({ data, selected }) {
  const provider = data.provider || 'system';
  const conf = PROVIDER_CONFIG[provider] || PROVIDER_CONFIG.system;
  const Icon = conf.icon;

  return (
    <div
      className={`w-64 rounded-xl backdrop-blur-md transition-all duration-200 shadow-lg ${conf.bg} border ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105 shadow-indigo-500/20'
          : conf.border
      } bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white`}
    >
      {/* Target input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900 -ml-1.5 hover:scale-125 transition-transform"
      />

      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 ${conf.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{data.label || 'Step'}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold border ${conf.border} ${conf.color} bg-white/80 dark:bg-slate-950/40`}>
          {conf.tag}
        </span>
      </div>

      {/* Body description */}
      <div className="p-3">
        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {data.description || data.action ? `Action: ${data.action}` : 'Ready for execution'}
        </p>

        {data.action && (
          <div className="mt-2 text-[10px] text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded border border-slate-200 dark:border-slate-800 truncate">
            ⚡ {data.action}
          </div>
        )}
      </div>

      {/* Source output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900 -mr-1.5 hover:scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(AgentflowNode);
