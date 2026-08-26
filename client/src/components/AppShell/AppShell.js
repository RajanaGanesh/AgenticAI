import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Sparkles,
  Workflow,
  Activity,
  Boxes,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Cpu,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import NotificationsDrawer from '../NotificationsDrawer/NotificationsDrawer';
import ThemeToggle from '../ThemeToggle';
import api from '../../services/api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles, badge: 'AI' },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Executions', href: '/executions', icon: Activity },
  { name: 'Integrations', href: '/integrations', icon: Boxes },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppShell({ children, pageTitle, actionButton }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications?limit=1');
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (e) {
        // ignore
      }
    };
    fetchUnread();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0c1222] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-mono">
                  Agentflow<span className="text-indigo-600 dark:text-cyan-400">_AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                  Autonomous Ops
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Multi-Agent Status Indicator in Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-400 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 animate-pulse" />
                <span>Agent Cluster</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">5 ACTIVE</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-[9px] text-center font-mono">
              <span className="p-1 rounded bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300" title="Planner Agent">PLAN</span>
              <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300" title="Execution Agent">EXEC</span>
              <span className="p-1 rounded bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800/40 text-indigo-800 dark:text-indigo-300" title="Validation Agent">VAL</span>
              <span className="p-1 rounded bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/40 text-amber-800 dark:text-amber-300" title="Recovery Agent">REC</span>
              <span className="p-1 rounded bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800/40 text-purple-800 dark:text-purple-300" title="Monitoring Agent">MON</span>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-semibold text-xs text-indigo-600 dark:text-indigo-300">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name || 'Operator'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{user?.role || 'operator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="h-16 px-6 bg-white/80 dark:bg-[#0c1222]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm lg:text-base font-semibold text-slate-900 dark:text-white tracking-wide">
              {pageTitle || 'Operator Console'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {actionButton}

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
