import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, CheckCircle, AlertTriangle, AlertOctagon, Info, CheckCheck, Bell } from 'lucide-react';
import api from '../../services/api';
import { subscribeToNotifications } from '../../services/socket';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // ignore
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'escalation':
      case 'failure':
        return <AlertOctagon className="w-5 h-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Notifications Drawer</h2>
            </div>
            <div className="flex items-center space-x-3">
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-50" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    n.isRead
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-800/60 border-indigo-500/30 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">{getTypeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-white truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-slate-300 leading-relaxed">{n.message}</p>
                      
                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        {n.link ? (
                          <Link
                            href={n.link}
                            onClick={onClose}
                            className="text-indigo-400 hover:text-indigo-300 underline text-[11px]"
                          >
                            View execution
                          </Link>
                        ) : <span />}

                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n._id)}
                            className="text-[11px] text-slate-400 hover:text-white"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
