import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Radio,
  ExternalLink,
  RefreshCw,
  Compass,
} from 'lucide-react';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../services/api';

export default function ExecutionsHistoryPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/executions?status=${filterStatus}&limit=25`);
      setExecutions(res.data?.executions || []);
    } catch (err) {
      console.warn('Failed to load executions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [filterStatus]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center space-x-1.5 w-max">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>COMPLETED</span>
          </span>
        );
      case 'RUNNING':
      case 'RETRYING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40 flex items-center space-x-1.5 w-max animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>{status}</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 flex items-center space-x-1.5 w-max">
            <XCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 flex items-center space-x-1.5 w-max">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>PAUSED</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 w-max">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        pageTitle="Execution History & Audit Trail"
        actionButton={
          <button
            onClick={fetchExecutions}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Refresh Executions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      >
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Filter Executions:</span>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {['all', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase font-mono transition-all ${
                    filterStatus === st
                      ? 'bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Execution ID</th>
                    <th className="px-5 py-3.5">Workflow Name</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Confidence</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Started At</th>
                    <th className="px-5 py-3.5 text-right">Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading execution records...</span>
                      </td>
                    </tr>
                  ) : executions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No executions match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    executions.map((exec) => {
                      const id = exec._id || exec.id;
                      return (
                        <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                          <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                            {id ? id.substring(0, 8) : 'unknown'}...
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                            {exec.workflowId?.name || exec.workflowSnapshot?.name || 'Automation Run'}
                          </td>
                          <td className="px-5 py-4">{getStatusBadge(exec.status)}</td>
                          <td className="px-5 py-4 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                            {exec.confidenceScore ? `${Math.round(exec.confidenceScore * 100)}%` : '100%'}
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
                            {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'in progress...'}
                          </td>
                          <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-[11px]">
                            {new Date(exec.createdAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/executions/${id}`}
                              className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 font-medium text-xs transition-colors"
                            >
                              <span>Inspector</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
