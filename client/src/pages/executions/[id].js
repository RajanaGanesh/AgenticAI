import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Pause,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Radio,
  Cpu,
  Layers,
  Code2,
} from 'lucide-react';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import ExecutionTimeline from '../../components/ExecutionTimeline/ExecutionTimeline';
import { subscribeToExecution, getSocket } from '../../services/socket';
import api from '../../services/api';

export default function ExecutionInspectorPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'outputs' | 'nodes'

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/executions/${id}/timeline`);
      setExecution(res.data?.execution);
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.warn('Failed to load execution timeline:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchTimeline();

    // Subscribe to real-time execution room
    const unsubscribe = subscribeToExecution(id, {
      onAgentEvent: (eventData) => {
        setLogs((prev) => {
          const exists = prev.some((l) => l.id === eventData.id || l._id === eventData.id);
          if (exists) return prev;
          return [...prev, eventData];
        });
      },
      onStatusChange: (statusData) => {
        setExecution((prev) => (prev ? { ...prev, ...statusData } : statusData));
      },
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handlePause = async () => {
    try {
      const res = await api.post(`/executions/${id}/pause`);
      setExecution(res.data);
    } catch (err) {
      alert(`Pause failed: ${err.message}`);
    }
  };

  const handleResume = async () => {
    try {
      const res = await api.post(`/executions/${id}/resume`);
      setExecution(res.data);
    } catch (err) {
      alert(`Resume failed: ${err.message}`);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this execution?')) return;
    try {
      const res = await api.post(`/executions/${id}/cancel`);
      setExecution(res.data);
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center space-x-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>COMPLETED</span>
          </span>
        );
      case 'RUNNING':
      case 'RETRYING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40 flex items-center space-x-1.5 animate-pulse shadow-sm">
            <Radio className="w-4 h-4 animate-spin" />
            <span>{status}</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 flex items-center space-x-1.5 shadow-sm">
            <XCircle className="w-4 h-4" />
            <span>FAILED</span>
          </span>
        );
      case 'PAUSED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 flex items-center space-x-1.5 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>PAUSED</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            {status || 'PENDING'}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        pageTitle={
          <div className="flex items-center space-x-3">
            <Link
              href="/executions"
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to history"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {execution?.workflowId?.name || execution?.workflowSnapshot?.name || 'Execution Inspector'}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              #{id ? id.substring(0, 8) : ''}
            </span>
          </div>
        }
        actionButton={
          <div className="flex items-center space-x-2">
            {execution?.status === 'RUNNING' && (
              <button
                onClick={handlePause}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-600/20 hover:bg-amber-100 dark:hover:bg-amber-600/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            {execution?.status === 'PAUSED' && (
              <button
                onClick={handleResume}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}

            {['RUNNING', 'PAUSED', 'RETRYING'].includes(execution?.status) && (
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header Summary Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {execution?.workflowId?.name || execution?.workflowSnapshot?.name || 'Execution Details'}
                  </h2>
                  {getStatusBadge(execution?.status)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Triggered via <span className="font-mono text-slate-700 dark:text-slate-300">{execution?.triggerType || 'manual'}</span> at{' '}
                  {execution?.createdAt ? new Date(execution.createdAt).toLocaleString() : ''}
                </p>
              </div>

              {/* Execution Metrics Pills */}
              <div className="flex items-center space-x-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {execution?.confidenceScore ? `${Math.round(execution.confidenceScore * 100)}%` : '100%'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">DURATION</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {execution?.duration ? `${(execution.duration / 1000).toFixed(2)}s` : 'running...'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">COMPLETED</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {execution?.completedNodes?.length || 0} Nodes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'timeline'
                  ? 'bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Multi-Agent Live Timeline ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('outputs')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'outputs'
                  ? 'bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Output Payloads</span>
            </button>
          </div>

          {/* Tab 1: 5-Agent Execution Timeline */}
          {activeTab === 'timeline' && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg">
              <ExecutionTimeline logs={logs} isLive={['RUNNING', 'RETRYING'].includes(execution?.status)} />
            </div>
          )}

          {/* Tab 2: Outputs & Results Inspector */}
          {activeTab === 'outputs' && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Final Execution State & Outputs
              </h3>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{JSON.stringify(execution?.outputs || execution?.nodeResults || {}, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
