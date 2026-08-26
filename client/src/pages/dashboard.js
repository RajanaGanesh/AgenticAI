import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Activity,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/dashboard');
      setData(res.data);
    } catch (err) {
      console.warn('Failed to load dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center space-x-1 w-max">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 flex items-center space-x-1 w-max animate-pulse">
            <Radio className="w-3 h-3 animate-spin" />
            <span>RUNNING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 flex items-center space-x-1 w-max">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 flex items-center space-x-1 w-max">
            <AlertTriangle className="w-3 h-3" />
            <span>PAUSED</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 w-max">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        pageTitle="Operations Console"
        actionButton={
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStats}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Refresh Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/workflows/builder"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Generate Automation</span>
            </Link>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <MetricGrid metrics={data?.metrics} />

          {/* Quick Launch Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-cyan-950/80 border border-indigo-200 dark:border-indigo-500/30 shadow-md dark:shadow-xl relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-400/30 text-indigo-700 dark:text-cyan-300 text-[11px] font-mono mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Multi-Agent Prompt Pipeline</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Prompt to Multi-Agent Automation
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Describe a complex workflow in natural language. Our AI builder creates the topological graph and routes execution across Gmail, Slack, Discord, Google Sheets, and LLMs.
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <Link
                  href="/workflows/builder"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
                >
                  <span>Open AI Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/workflows"
                  className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all border border-slate-300 dark:border-slate-700"
                >
                  Browse Workflows
                </Link>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Recent Executions & Live AI Agent Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Executions Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm dark:shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Automation Runs</h3>
                  </div>
                  <Link
                    href="/executions"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-semibold">Workflow</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Duration</th>
                        <th className="pb-3 font-semibold">Started</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                      {data?.recentExecutions?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            No executions recorded yet. Trigger a workflow to see live runs!
                          </td>
                        </tr>
                      ) : (
                        data?.recentExecutions?.map((exec) => (
                          <tr key={exec._id || exec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                              {exec.workflowId?.name || exec.workflowSnapshot?.name || 'Untitled'}
                            </td>
                            <td className="py-3">{getStatusBadge(exec.status)}</td>
                            <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                              {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'running...'}
                            </td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                              {new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3 text-right">
                              <Link
                                href={`/executions/${exec._id || exec.id}`}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-[11px]"
                              >
                                Timeline
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live AI Agent Activity Stream */}
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm dark:shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Agent Activity Feed</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>LIVE</span>
                  </span>
                </div>

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {data?.recentLogs?.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No agent logs recorded yet.
                    </div>
                  ) : (
                    data?.recentLogs?.map((log) => (
                      <div
                        key={log._id || log.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400">
                            [{log.agent}]
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">{log.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
