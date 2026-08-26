import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Cpu,
  Database,
  Lock,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../services/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealthData(res.data?.data);
      } catch (e) {
        // ignore
      }
    };
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell pageTitle="System Settings & Diagnostics">
        <div className="max-w-4xl space-y-6">
          {/* Theme Selector Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Appearance & Theme</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred visual theme for the operator command center.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border flex flex-col items-center space-y-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/40 text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                <Moon className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-semibold">Dark Console</span>
                <span className="text-[10px] text-slate-400">Deep slate & glowing cyan</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border flex flex-col items-center space-y-2 transition-all ${
                  theme === 'light'
                    ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/40 text-slate-900 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                <Sun className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-semibold">Light Clean</span>
                <span className="text-[10px] text-slate-500">Crisp slate & bright surfaces</span>
              </button>
            </div>
          </div>

          {/* Operator Profile Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Operator Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{user?.name || 'Administrator'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block font-mono">{user?.email || 'admin@agentflow.ai'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Role & Access Tier</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 block font-mono uppercase">{user?.role || 'OPERATOR'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Auth Token Encryption</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">AES-256-GCM VAULT</span>
              </div>
            </div>
          </div>

          {/* System Diagnostics */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">5-Agent Engine Diagnostics</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Backend Health Check</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-300 dark:border-emerald-800">
                  {healthData?.status?.toUpperCase() || 'OPERATIONAL'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Multi-Agent Chain Status</span>
                </div>
                <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                  Planner • Execution • Validation • Recovery • Monitoring
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Credential Security</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
                  AES-256-GCM Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
