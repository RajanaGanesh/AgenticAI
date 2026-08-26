import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Save,
  Play,
  ArrowLeft,
  Copy,
  Trash2,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodePalette from '../../components/NodePalette/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    name,
    setName,
    description,
    setDescription,
    nodes,
    edges,
    loadWorkflow,
    isDirty,
    setIsDirty,
    status,
    setStatus,
  } = useWorkflowStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workflows/${id}`);
        loadWorkflow(res.data);
      } catch (err) {
        alert(`Failed to load workflow: ${err.message}`);
        router.push('/workflows');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [id, loadWorkflow, router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/workflows/${id}`, {
        name,
        description,
        status,
        nodes,
        edges,
      });
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert(`Failed to save workflow: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    try {
      setExecuting(true);
      // Auto-save changes before run if dirty
      if (isDirty) {
        await handleSave();
      }

      const res = await api.post(`/workflows/${id}/execute`, {
        inputs: { trigger: 'manual_canvas_dispatch', timestamp: new Date().toISOString() },
      });

      const execId = res.data._id || res.data.id;
      router.push(`/executions/${execId}`);
    } catch (err) {
      alert(`Execution trigger failed: ${err.message}`);
      setExecuting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      const newId = res.data._id || res.data.id;
      router.push(`/workflows/${newId}`);
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      router.push('/workflows');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell pageTitle="Loading Workflow...">
          <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-mono">Loading Canvas & Multi-Agent Graph...</p>
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell
        pageTitle={
          <div className="flex items-center space-x-3">
            <Link
              href="/workflows"
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to workflows"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsDirty(true);
              }}
              className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 outline-none text-slate-900 dark:text-white font-semibold text-sm px-1 py-0.5"
            />
            {isDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
            )}
          </div>
        }
        actionButton={
          <div className="flex items-center space-x-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-medium mr-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}

            <button
              onClick={handleDuplicate}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Duplicate Workflow"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Delete Workflow"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={handleExecute}
              disabled={executing}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              {executing ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white" />
              )}
              <span>Execute Run</span>
            </button>
          </div>
        }
      >
        {/* Editor Workspace: 3-column layout */}
        <div className="h-[calc(100vh-6.5rem)] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden flex relative shadow-md dark:shadow-2xl transition-colors">
          {/* Left: Node Palette */}
          <NodePalette />

          {/* Center: React Flow Canvas */}
          <div className="flex-1 h-full relative">
            <WorkflowCanvas />
          </div>

          {/* Right: Contextual Node Config Drawer */}
          <NodeConfigPanel />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
