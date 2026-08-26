import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Search,
  Workflow,
  Play,
  Copy,
  Trash2,
  Clock,
  ArrowRight,
  Layers,
} from 'lucide-react';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../services/api';

export default function WorkflowsDirectoryPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workflows?search=${encodeURIComponent(search)}&status=${filterStatus}`);
      setWorkflows(res.data?.workflows || []);
    } catch (err) {
      console.warn('Failed to load workflows:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, filterStatus]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows((prev) => prev.filter((w) => (w._id || w.id) !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      setWorkflows((prev) => [res.data, ...prev]);
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        pageTitle="Workflows Directory"
        actionButton={
          <div className="flex items-center space-x-2">
            <Link
              href="/workflows/builder"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Builder</span>
            </Link>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search workflows, tags, nodes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              {['all', 'active', 'draft', 'archived'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
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

          {/* Workflow Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono">Fetching active automations...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <Workflow className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No workflows found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Generate an automation graph with our AI builder or adjust your search filters.
              </p>
              <Link
                href="/workflows/builder"
                className="inline-flex items-center space-x-1.5 mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Create with AI Builder</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => {
                const id = wf._id || wf.id;
                return (
                  <Link
                    key={id}
                    href={`/workflows/${id}`}
                    className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm dark:shadow-lg transition-all hover:scale-[1.01] flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-cyan-400">
                          <Workflow className="w-4 h-4" />
                        </div>

                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDuplicate(id, e)}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-3 group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                        {wf.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {wf.description || 'No description provided.'}
                      </p>

                      {/* Tag badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          v{wf.version || 1}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                          {wf.nodes?.length || 0} Nodes
                        </span>
                        {wf.status === 'active' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(wf.updatedAt || wf.createdAt).toLocaleDateString()}</span>
                      </span>

                      <span className="text-indigo-600 dark:text-cyan-400 font-semibold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Open Canvas</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
