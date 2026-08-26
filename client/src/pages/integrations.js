import { useState, useEffect } from 'react';
import {
  Boxes,
  Mail,
  MessageSquare,
  Radio,
  Sheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../services/api';

const INTEGRATIONS_CONFIG = [
  {
    provider: 'gmail',
    name: 'Gmail & Google Workspace',
    description: 'Read incoming messages, search query filters, and dispatch automated emails.',
    icon: Mail,
    color: 'text-rose-600 dark:text-rose-400',
    authType: 'oauth',
    category: 'Email & Messaging',
  },
  {
    provider: 'slack',
    name: 'Slack Bot & Channels',
    description: 'Post structured alerts, threaded incident notifications, and agent status digests.',
    icon: MessageSquare,
    color: 'text-emerald-600 dark:text-emerald-400',
    authType: 'oauth_or_manual',
    category: 'Team Collaboration',
  },
  {
    provider: 'discord',
    name: 'Discord Webhook & Bot',
    description: 'Broadcast high-priority ops webhooks and interactive agent messages.',
    icon: Radio,
    color: 'text-indigo-600 dark:text-indigo-400',
    authType: 'manual',
    category: 'Community & Alerts',
  },
  {
    provider: 'google-sheets',
    name: 'Google Sheets DB',
    description: 'Append rows, extract tabular leads, and synchronize spreadsheet records.',
    icon: Sheet,
    color: 'text-teal-600 dark:text-teal-400',
    authType: 'oauth',
    category: 'Data & Spreadsheets',
  },
  {
    provider: 'openrouter',
    name: 'OpenRouter AI Gateway',
    description: 'Universal access to Claude 3.5, GPT-4o, Llama 3, and DeepSeek models.',
    icon: Sparkles,
    color: 'text-cyan-600 dark:text-cyan-400',
    authType: 'manual_api_key',
    category: 'LLM Substrates',
  },
  {
    provider: 'gemini',
    name: 'Google Gemini 1.5 Flash',
    description: 'Multimodal intelligence, reasoning chains, and fast prompt synthesis.',
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
    authType: 'manual_api_key',
    category: 'LLM Substrates',
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [health, setHealth] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const [listRes, healthRes] = await Promise.all([
        api.get('/integrations'),
        api.get('/integrations/status'),
      ]);
      setIntegrations(listRes.data || []);
      setHealth(healthRes.data || {});
    } catch (err) {
      console.warn('Failed to load integrations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleOAuthConnect = async (provider) => {
    try {
      const res = await api.get(`/integrations/oauth/${provider}/auth-url`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert(`OAuth initialization failed: ${err.message}`);
    }
  };

  const handleSaveManual = async (provider) => {
    try {
      setSavingKey(true);
      let payload = { provider };
      if (provider === 'discord') {
        payload.webhookUrl = manualInput;
      } else {
        payload.apiKey = manualInput;
        payload.accessToken = manualInput;
      }

      await api.post('/integrations/manual', payload);
      setSelectedProvider(null);
      setManualInput('');
      fetchIntegrations();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSavingKey(false);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;
    try {
      await api.delete(`/integrations/${provider}`);
      fetchIntegrations();
    } catch (err) {
      alert(`Disconnect failed: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        pageTitle="Third-Party Integrations & Connectors"
        actionButton={
          <button
            onClick={fetchIntegrations}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Refresh Connectors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      >
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl flex items-center justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-cyan-300 text-[11px] font-mono mb-2">
                <Boxes className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                <span>AES-256-GCM Vault</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Connected Ecosystem</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Connect external accounts and API tokens. All tokens are encrypted at rest with AES-256-GCM and injected at runtime into the 5-Agent mesh.
              </p>
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTEGRATIONS_CONFIG.map((conf) => {
              const Icon = conf.icon;
              const record = integrations.find((i) => i.provider === conf.provider);
              const isConnected = record?.isConnected || false;
              const statusInfo = health[conf.provider] || {};

              return (
                <div
                  key={conf.provider}
                  className={`p-5 rounded-xl bg-white dark:bg-slate-900/80 border ${
                    isConnected ? 'border-emerald-300 dark:border-emerald-500/40' : 'border-slate-200 dark:border-slate-800/90'
                  } shadow-sm dark:shadow-lg flex flex-col justify-between transition-all hover:scale-[1.01]`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 ${conf.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {isConnected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CONNECTED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          OFFLINE
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-3">{conf.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {conf.description}
                    </p>

                    <div className="mt-3 text-[10px] text-slate-500 font-mono">
                      Category: <span className="text-slate-700 dark:text-slate-300">{conf.category}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(conf.provider)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 w-full">
                        {conf.authType === 'oauth' && (
                          <button
                            onClick={() => handleOAuthConnect(conf.provider)}
                            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Connect OAuth</span>
                          </button>
                        )}

                        {conf.authType !== 'oauth' && (
                          <button
                            onClick={() => setSelectedProvider(conf.provider)}
                            className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                            <span>Configure Token</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal for Manual API Key / Webhook Config */}
          {selectedProvider && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                      Configure {selectedProvider.toUpperCase()} Credentials
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProvider(null);
                      setManualInput('');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedProvider === 'discord'
                    ? 'Enter your Discord Channel Webhook URL for autonomous incident broadcasts:'
                    : `Enter your ${selectedProvider.toUpperCase()} API key. It will be encrypted with AES-256-GCM:`}
                </p>

                <input
                  type="password"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder={selectedProvider === 'discord' ? 'https://discord.com/api/webhooks/...' : 'sk-or-v1-...'}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider(null);
                      setManualInput('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveManual(selectedProvider)}
                    disabled={savingKey || !manualInput.trim()}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                  >
                    {savingKey ? 'Encrypting & Storing...' : 'Save & Encrypt'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
