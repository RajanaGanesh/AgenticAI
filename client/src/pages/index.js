import Link from 'next/link';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Mail,
  MessageSquare,
  Sheet,
  Radio,
  Workflow,
  CheckCircle2,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  const agents = [
    {
      name: 'Planner Agent',
      tag: 'PLANNER',
      color: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-500/30',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      desc: 'Topologically sorts the execution DAG, resolves multi-node dependencies, and generates a plan confidence score.',
    },
    {
      name: 'Execution Agent',
      tag: 'EXECUTION',
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      desc: 'Executes node actions across Gmail, Slack, Discord, Google Sheets, and LLMs with continuous memory persistence.',
    },
    {
      name: 'Validation Agent',
      tag: 'VALIDATION',
      color: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-500/30',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      desc: 'Enforces strict JSON schema validation, input/output data contracts, and pipeline safety checks.',
    },
    {
      name: 'Recovery Agent',
      tag: 'RECOVERY',
      color: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-500/30',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      desc: 'Classifies failure root causes, triggers exponential backoff retries, and escalates unresolved exceptions.',
    },
    {
      name: 'Monitoring Agent',
      tag: 'MONITORING',
      color: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-500/30',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      desc: 'Captures high-fidelity timeline audit logs and broadcasts real-time streaming WebSocket events.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md sticky top-0 z-40 bg-white/80 dark:bg-[#090d16]/80 transition-colors">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-mono">
              Agentflow<span className="text-indigo-600 dark:text-cyan-400">_AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Operator Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all shadow-indigo-500/20"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 to-cyan-400/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-cyan-300 text-xs font-mono mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span>Autonomous 5-Agent Multi-Agent Operational Substrate</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            From Natural Language to{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Autonomous Operations
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Prompt your complex workflows. Watch our multi-agent architecture synthesize directed graphs, orchestrate executions across third-party tools, validate contracts, and self-heal in real-time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Launch Demo Operator</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-800 flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span>Explore AI Builder</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Agent Mesh Breakdown */}
      <section className="py-16 px-6 bg-slate-100/60 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              The 5-Agent Orchestration Mesh
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Every workflow executes through a distributed, cooperating multi-agent chain with built-in auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className={`p-5 rounded-2xl ${agent.bg} bg-white dark:bg-slate-900/60 border ${agent.border} shadow-sm dark:shadow-md flex flex-col justify-between transition-transform hover:scale-105`}
              >
                <div>
                  <span className={`text-[10px] font-mono font-bold uppercase ${agent.color}`}>
                    [{agent.tag}]
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{agent.name}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{agent.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ONLINE & ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/60 dark:via-slate-900/90 dark:to-cyan-950/60 border border-indigo-200 dark:border-indigo-500/30 shadow-md dark:shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">
              Connected Tooling
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Native Third-Party Connectors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              Integrate Gmail, Slack, Discord, Google Sheets, OpenRouter, and Gemini. Credentials are protected with AES-256-GCM application-level encryption.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5 shadow-sm">
              <Mail className="w-6 h-6 text-rose-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Gmail</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5 shadow-sm">
              <MessageSquare className="w-6 h-6 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Slack</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5 shadow-sm">
              <Radio className="w-6 h-6 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Discord</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5 shadow-sm">
              <Sheet className="w-6 h-6 text-teal-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sheets</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5 shadow-sm">
              <Sparkles className="w-6 h-6 text-cyan-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">OpenRouter</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5 shadow-sm">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Gemini</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-[#090d16]/50">
        <p>© 2026 Agentflow_AI Platform • Autonomous Multi-Agent Operations Substrate</p>
      </footer>
    </div>
  );
}
