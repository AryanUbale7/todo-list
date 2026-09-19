import React from 'react';
import { Trash2, RotateCcw, AlertOctagon } from 'lucide-react';

export default function TrashView({
  trashTasks = [],
  onRestoreTask,
  onPermanentDelete,
  onClearTrash
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm mb-6 animate-fade-in" role="region" aria-label="Trash Bin">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trash Bin</h2>
            <p className="text-xs text-slate-500">Deleted tasks remain here until permanently removed.</p>
          </div>
        </div>

        {trashTasks.length > 0 && (
          <button
            onClick={onClearTrash}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all border border-rose-200 dark:border-rose-900"
          >
            Empty Trash
          </button>
        )}
      </div>

      {/* List */}
      {trashTasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Trash2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-3" role="list">
          {trashTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800"
            >
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-through opacity-75">
                  {t.title}
                </h4>
                <span className="text-[11px] text-slate-400">
                  Deleted: {new Date(t.deleted_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRestoreTask(t.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-900 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => onPermanentDelete(t.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Permanent Delete"
                  aria-label="Permanent delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
