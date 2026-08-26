import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  CheckCheck,
  LifeBuoy,
  Eye,
  ChevronDown,
  ChevronRight,
  Clock,
  Terminal,
} from 'lucide-react';

const AGENT_CONFIGS = {
  planner: {
    label: 'Planner Agent',
    icon: Compass,
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80',
    border: 'border-cyan-300 dark:border-cyan-500/40',
    text: 'text-cyan-800 dark:text-cyan-300',
    accent: 'border-l-cyan-500',
  },
  execution: {
    label: 'Execution Agent',
    icon: Cpu,
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    border: 'border-emerald-300 dark:border-emerald-500/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    accent: 'border-l-emerald-500',
  },
  validation: {
    label: 'Validation Agent',
    icon: CheckCheck,
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80',
    border: 'border-indigo-300 dark:border-indigo-500/40',
    text: 'text-indigo-800 dark:text-indigo-300',
    accent: 'border-l-indigo-500',
  },
  recovery: {
    label: 'Recovery Agent',
    icon: LifeBuoy,
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    border: 'border-amber-300 dark:border-amber-500/40',
    text: 'text-amber-800 dark:text-amber-300',
    accent: 'border-l-amber-500',
  },
  monitoring: {
    label: 'Monitoring Agent',
    icon: Eye,
    badgeBg: 'bg-purple-100 dark:bg-purple-950/80',
    border: 'border-purple-300 dark:border-purple-500/40',
    text: 'text-purple-800 dark:text-purple-300',
    accent: 'border-l-purple-500',
  },
};

export default function ExecutionTimeline({ logs = [], isLive = false }) {
  const [expandedLogs, setExpandedLogs] = useState({});

  const toggleExpand = (id) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (logs.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Waiting for multi-agent execution events...</p>
        <p className="text-xs text-slate-500 mt-1">Real-time Socket.IO stream will display here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, index) => {
        const agentKey = log.agent || 'monitoring';
        const conf = AGENT_CONFIGS[agentKey] || AGENT_CONFIGS.monitoring;
        const Icon = conf.icon;
        const isExpanded = expandedLogs[log._id || index];
        const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

        return (
          <div
            key={log._id || `${log.timestamp}-${index}`}
            className={`p-3.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 border-l-4 ${conf.accent} shadow-sm dark:shadow-md transition-all hover:bg-slate-50 dark:hover:bg-slate-850`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                {/* Agent Badge */}
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold flex items-center space-x-1.5 border ${conf.border} ${conf.badgeBg} ${conf.text} flex-shrink-0`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{conf.label}</span>
                </div>

                {/* Node ID tag if any */}
                {log.nodeId && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    node: {log.nodeId}
                  </span>
                )}

                {/* Message */}
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed break-words flex-1">
                  {log.message}
                </p>
              </div>

              {/* Timestamp and expand */}
              <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </span>

                {hasMetadata && (
                  <button
                    onClick={() => toggleExpand(log._id || index)}
                    className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Inspect metadata payload"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Expanded JSON Inspector */}
            {isExpanded && hasMetadata && (
              <div className="mt-3 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
              </div>
            )}
          </div>
        );
      })}

      {isLive && (
        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center space-x-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span>Live agent event stream active via Socket.IO</span>
        </div>
      )}
    </div>
  );
}
