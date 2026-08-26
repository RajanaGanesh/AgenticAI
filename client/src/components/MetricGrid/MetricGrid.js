import { Workflow, Play, CheckCircle2, Bot } from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const {
    totalWorkflows = 0,
    activeWorkflows = 0,
    totalExecutions = 0,
    completedExecutions = 0,
    successRate = 100,
    activeAgentsCount = 5,
  } = metrics;

  const cards = [
    {
      title: 'Total Workflows',
      value: totalWorkflows,
      subtext: `${activeWorkflows} active in production`,
      icon: Workflow,
      color: 'from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/20 dark:to-indigo-600/5',
      borderColor: 'border-indigo-200 dark:border-indigo-500/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Automation Executions',
      value: totalExecutions,
      subtext: `${completedExecutions} completed runs`,
      icon: Play,
      color: 'from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/20 dark:to-cyan-600/5',
      borderColor: 'border-cyan-200 dark:border-cyan-500/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'Agent Success Rate',
      value: `${successRate}%`,
      subtext: 'Self-healing recovery active',
      icon: CheckCircle2,
      color: 'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/5',
      borderColor: 'border-emerald-200 dark:border-emerald-500/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Multi-Agent Mesh',
      value: `${activeAgentsCount} Agents`,
      subtext: 'Planner • Exec • Val • Rec • Mon',
      icon: Bot,
      color: 'from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/5',
      borderColor: 'border-purple-200 dark:border-purple-500/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-5 rounded-xl bg-gradient-to-b ${card.color} bg-white dark:bg-slate-900/60 border ${card.borderColor} backdrop-blur-sm shadow-md dark:shadow-lg transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">{card.value}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
                <span>{card.subtext}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
