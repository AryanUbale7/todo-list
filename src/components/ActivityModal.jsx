import React from 'react';
import { X, History, PlusCircle, CheckCircle2, RotateCcw, Trash2, Edit } from 'lucide-react';

export default function ActivityModal({ isOpen, onClose, logs = [] }) {
  if (!isOpen) return null;

  const actionIcons = {
    created: { icon: PlusCircle, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/60' },
    completed: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' },
    reopened: { icon: RotateCcw, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' },
    deleted: { icon: Trash2, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' },
    restored: { icon: RotateCcw, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' },
    updated: { icon: Edit, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in" role="dialog" aria-label="Activity Audit Trail">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity History & Audit Trail</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close activity log"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No activity recorded yet.</p>
          ) : (
            logs.map((log) => {
              const meta = actionIcons[log.action] || actionIcons.updated;
              const Icon = meta.icon;
              const date = new Date(log.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className={`p-2 rounded-xl ${meta.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {log.details || log.action}
                    </p>
                    <span className="text-[11px] text-slate-400">{date}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
