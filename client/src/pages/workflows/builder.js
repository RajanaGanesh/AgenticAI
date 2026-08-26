import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Sparkles,
  ArrowRight,
  Save,
  Layers,
  Lightbulb,
} from 'lucide-react';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';

const PROMPT_TEMPLATES = [
  {
    title: 'Gmail Lead Intake & Slack Alert',
    prompt: 'When a new lead email arrives in Gmail, extract the contact info with AI, append a row to Google Sheets, and post a summary notification to Slack #ops-alerts.',
    tag: 'Sales Ops',
  },
  {
    title: 'Invoice Processing & Expense Sync',
    prompt: 'Scan inbox for supplier invoices, summarize invoice amount and vendor details using AI, and append the record into our financial Google Sheets ledger.',
    tag: 'Finance',
  },
  {
    title: 'High-Priority Incident Escalation',
    prompt: 'Listen for high priority alert webhooks, evaluate severity condition, post critical alert to Discord ops-feed, and send an urgent notification email via Gmail.',
    tag: 'DevOps',
  },
  {
    title: 'Scheduled Customer Sentiment Digest',
    prompt: 'Run daily on a schedule to fetch customer survey submissions, compute sentiment with AI, and broadcast the daily executive digest to Slack.',
    tag: 'Customer Success',
  },
];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { loadWorkflow, nodes, edges, name, description } = useWorkflowStore();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async (targetPrompt) => {
    const promptToUse = targetPrompt || prompt;
    if (!promptToUse.trim()) return;

    try {
      setIsGenerating(true);
      const res = await api.post('/workflows/generate', { prompt: promptToUse });
      const wf = res.data;
      setGeneratedWorkflow(wf);
      loadWorkflow(wf);
    } catch (err) {
      alert(`AI Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndEdit = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/workflows', {
        name: generatedWorkflow?.name || name || 'Generated Automation',
        description: generatedWorkflow?.description || description || prompt,
        status: 'active',
        triggerConfig: generatedWorkflow?.triggerConfig || { type: 'manual' },
        nodes,
        edges,
        tags: generatedWorkflow?.tags || ['ai-generated'],
        promptSource: prompt,
      });

      const newId = res.data._id || res.data.id;
      router.push(`/workflows/${newId}`);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="AI Prompt-to-Workflow Generator">
        <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4">
          {/* Left Panel: Prompt Input & Templates */}
          <div className="w-full lg:w-96 flex flex-col justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-md dark:shadow-xl backdrop-blur-md overflow-y-auto transition-colors">
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono mb-2">
                  <Sparkles className="w-3 h-3 text-indigo-600 dark:text-cyan-400" />
                  <span>Prompt-to-Graph Engine</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Describe Your Automation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Type an operations workflow in plain English. The agent pipeline will build nodes, configs, and connections.
                </p>
              </div>

              {/* Prompt Textarea */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. When a new support email arrives, summarize the issue with AI and alert #support-triage on Slack..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                />

                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Graph...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Workflow Graph</span>
                    </>
                  )}
                </button>
              </div>

              {/* Prompt Ideas / Templates */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Curated Automation Templates</span>
                </span>

                <div className="space-y-2">
                  {PROMPT_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.title}
                      type="button"
                      onClick={() => {
                        setPrompt(tmpl.prompt);
                        handleGenerate(tmpl.prompt);
                      }}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                          {tmpl.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {tmpl.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                        {tmpl.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Graph Actions */}
            {generatedWorkflow && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSaveAndEdit}
                  disabled={isSaving}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center justify-center space-x-2 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Open in Canvas Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Canvas Graph Preview */}
          <div className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-md dark:shadow-2xl flex flex-col transition-colors">
            {/* Canvas Header Bar */}
            <div className="h-12 px-4 bg-white/90 dark:bg-[#0c1222]/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {generatedWorkflow?.name || name || 'Interactive Workflow Canvas Preview'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  {nodes.length} Nodes • {edges.length} Edges
                </span>
              </div>

              {generatedWorkflow && (
                <button
                  onClick={handleSaveAndEdit}
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span>Save & Edit</span>
                </button>
              )}
            </div>

            {/* Canvas Body */}
            <div className="flex-1 relative">
              <WorkflowCanvas />
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
