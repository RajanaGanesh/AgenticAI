import React from 'react';
import {
  Sparkles,
  Mail,
  MessageSquare,
  Radio,
  Sheet,
  Filter,
  Clock,
  Send,
  Plus,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const PALETTE_ITEMS = [
  {
    category: 'AI & Intelligence',
    items: [
      {
        provider: 'ai',
        action: 'ai_transform',
        label: 'AI Data Analyzer',
        description: 'Summarizes data, extracts key entities & structures outputs',
        icon: Sparkles,
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-500',
        config: {
          model: 'gpt-4o-mini',
          promptTemplate: 'Analyze input data and extract key action points.',
        },
      },
    ],
  },
  {
    category: 'Messaging & Notifications',
    items: [
      {
        provider: 'slack',
        action: 'post_message',
        label: 'Slack Message',
        description: 'Post alert message to designated Slack channel',
        icon: MessageSquare,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-500',
        config: {
          channel: '#ops-alerts',
          message: 'Workflow execution complete: {{ai.summary}}',
        },
      },
      {
        provider: 'discord',
        action: 'post_message',
        label: 'Discord Webhook',
        description: 'Dispatch rich alert to Discord channel',
        icon: Radio,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500',
        config: {
          channelId: 'general',
          content: '⚡ [Agentflow] Automation event triggered',
        },
      },
      {
        provider: 'gmail',
        action: 'send_email',
        label: 'Gmail Send Email',
        description: 'Send formatted email notification via Gmail',
        icon: Send,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'border-rose-300 dark:border-rose-500/30 hover:border-rose-500',
        config: {
          to: 'operator@example.com',
          subject: 'Automation Status Report',
          body: '<p>Workflow completed successfully.</p>',
        },
      },
    ],
  },
  {
    category: 'Data & Storage',
    items: [
      {
        provider: 'google-sheets',
        action: 'append_row',
        label: 'Google Sheets Append',
        description: 'Add a new row of extracted records to spreadsheet',
        icon: Sheet,
        color: 'text-teal-600 dark:text-teal-400',
        bg: 'border-teal-300 dark:border-teal-500/30 hover:border-teal-500',
        config: {
          spreadsheetId: 'default_sheet_101',
          range: 'Sheet1!A:Z',
          values: ['{{payload.title}}', '{{ai.summary}}', '{{timestamp}}'],
        },
      },
      {
        provider: 'gmail',
        action: 'read_emails',
        label: 'Gmail Read Inbox',
        description: 'Search and ingest unread emails matching query',
        icon: Mail,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'border-rose-300 dark:border-rose-500/30 hover:border-rose-500',
        config: {
          query: 'is:unread',
          maxResults: 5,
        },
      },
    ],
  },
  {
    category: 'Flow & Controls',
    items: [
      {
        provider: 'system',
        action: 'condition',
        label: 'Condition / Guardrail',
        description: 'Evaluates logical condition and routes flow',
        icon: Filter,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'border-amber-300 dark:border-amber-500/30 hover:border-amber-500',
        config: {
          field: 'priority',
          operator: 'equals',
          value: 'high',
        },
      },
      {
        provider: 'system',
        action: 'delay',
        label: 'Delay Timer',
        description: 'Pauses execution pipeline for specified duration',
        icon: Clock,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'border-blue-300 dark:border-blue-500/30 hover:border-blue-500',
        config: {
          delayMs: 2000,
        },
      },
    ],
  },
];

export default function NodePalette() {
  const { addNode } = useWorkflowStore();

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/agentflow-node', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-[#0c1222] border-r border-slate-200 dark:border-slate-800 flex flex-col select-none overflow-y-auto transition-colors">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Node Catalog</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Drag to canvas or click to append</p>
      </div>

      <div className="p-3 space-y-5">
        {PALETTE_ITEMS.map((group) => (
          <div key={group.category} className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              {group.category}
            </span>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    onClick={() =>
                      addNode({
                        provider: item.provider,
                        action: item.action,
                        label: item.label,
                        description: item.description,
                        config: item.config,
                      })
                    }
                    className={`p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all flex items-start space-x-2.5 group shadow-sm`}
                  >
                    <div className={`p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 ${item.color} mt-0.5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white truncate">
                          {item.label}
                        </h4>
                        <Plus className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
