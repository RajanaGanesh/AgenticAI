import React, { useState, useEffect } from 'react';
import { X, Trash2, Sliders, Code } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel() {
  const { selectedNode, setSelectedNode, updateNodeConfig, deleteNode } = useWorkflowStore();

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [action, setAction] = useState('');
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      setDescription(selectedNode.data?.description || '');
      setAction(selectedNode.data?.action || '');
      setConfig(selectedNode.data?.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const provider = selectedNode.data?.provider || 'system';

  const handleConfigChange = (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    updateNodeConfig(selectedNode.id, { config: updated });
  };

  const handleLabelChange = (val) => {
    setLabel(val);
    updateNodeConfig(selectedNode.id, { label: val });
  };

  const handleDescChange = (val) => {
    setDescription(val);
    updateNodeConfig(selectedNode.id, { description: val });
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-[#0c1222] border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between text-slate-800 dark:text-slate-200 z-20 shadow-2xl overflow-y-auto transition-colors">
      <div>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Node Properties</h3>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Node ID & Provider */}
          <div className="flex items-center justify-between p-2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono">
            <span className="text-slate-500 dark:text-slate-400">ID: {selectedNode.id}</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-800">
              {provider.toUpperCase()}
            </span>
          </div>

          {/* Label */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Step Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => handleDescChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Dynamic Provider Configurations */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Step Configuration</span>
            </h4>

            {provider === 'gmail' && (
              <>
                {action === 'send_email' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">To Email Address</label>
                      <input
                        type="email"
                        value={config.to || ''}
                        onChange={(e) => handleConfigChange('to', e.target.value)}
                        placeholder="operator@company.com"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Email Subject</label>
                      <input
                        type="text"
                        value={config.subject || ''}
                        onChange={(e) => handleConfigChange('subject', e.target.value)}
                        placeholder="Automation Alert"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Email Body (HTML/Text)</label>
                      <textarea
                        rows={3}
                        value={config.body || ''}
                        onChange={(e) => handleConfigChange('body', e.target.value)}
                        placeholder="<p>Summary: {{ai.summary}}</p>"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>
                  </>
                )}

                {action === 'read_emails' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Search Query</label>
                    <input
                      type="text"
                      value={config.query || 'is:unread'}
                      onChange={(e) => handleConfigChange('query', e.target.value)}
                      placeholder="is:unread label:inbox"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                    />
                  </div>
                )}
              </>
            )}

            {provider === 'slack' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Slack Channel</label>
                  <input
                    type="text"
                    value={config.channel || '#ops-alerts'}
                    onChange={(e) => handleConfigChange('channel', e.target.value)}
                    placeholder="#general"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Message Text</label>
                  <textarea
                    rows={3}
                    value={config.message || ''}
                    onChange={(e) => handleConfigChange('message', e.target.value)}
                    placeholder="Alert: {{ai.summary}}"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </>
            )}

            {provider === 'discord' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Channel ID / Name</label>
                  <input
                    type="text"
                    value={config.channelId || 'general'}
                    onChange={(e) => handleConfigChange('channelId', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Discord Message</label>
                  <textarea
                    rows={3}
                    value={config.content || ''}
                    onChange={(e) => handleConfigChange('content', e.target.value)}
                    placeholder="⚡ {{ai.summary}}"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </>
            )}

            {provider === 'google-sheets' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Spreadsheet ID</label>
                  <input
                    type="text"
                    value={config.spreadsheetId || 'default_sheet_101'}
                    onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Sheet Range</label>
                  <input
                    type="text"
                    value={config.range || 'Sheet1!A:Z'}
                    onChange={(e) => handleConfigChange('range', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none font-mono"
                  />
                </div>
              </>
            )}

            {provider === 'ai' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">AI Model</label>
                  <select
                    value={config.model || 'gpt-4o-mini'}
                    onChange={(e) => handleConfigChange('model', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="gpt-4o-mini">OpenRouter / GPT-4o-mini</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                    <option value="deterministic-rule">Smart Engine Transform</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Prompt Template</label>
                  <textarea
                    rows={4}
                    value={config.promptTemplate || ''}
                    onChange={(e) => handleConfigChange('promptTemplate', e.target.value)}
                    placeholder="Extract main findings and structure output..."
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none font-mono"
                  />
                </div>
              </>
            )}

            {provider === 'system' && action === 'condition' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Field Name</label>
                  <input
                    type="text"
                    value={config.field || 'priority'}
                    onChange={(e) => handleConfigChange('field', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Operator</label>
                  <select
                    value={config.operator || 'equals'}
                    onChange={(e) => handleConfigChange('operator', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="exists">Exists</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Target Value</label>
                  <input
                    type="text"
                    value={config.value || ''}
                    onChange={(e) => handleConfigChange('value', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </>
            )}

            {provider === 'system' && action === 'delay' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Delay Duration (ms)</label>
                <input
                  type="number"
                  value={config.delayMs || 2000}
                  onChange={(e) => handleConfigChange('delayMs', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer delete action */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 flex items-center justify-center space-x-2 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Node</span>
        </button>
      </div>
    </div>
  );
}
