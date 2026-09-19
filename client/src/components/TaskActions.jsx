import React from 'react';
import { Check, Edit3, Trash2, RotateCcw } from 'lucide-react';

export default function TaskActions({ task, onToggle, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed' || task.completed;

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Task Actions">
      <button
        onClick={() => onToggle && onToggle(task.id)}
        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
          isCompleted
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100'
        }`}
        title={isCompleted ? 'Mark as Pending' : 'Mark as Complete'}
        aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Complete'}
      >
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isCompleted ? 'Done' : 'Complete'}</span>
      </button>

      <button
        onClick={() => onEdit && onEdit(task)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Edit Task"
        aria-label="Edit Task"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      <button
        onClick={() => onDelete && onDelete(task.id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        title="Delete Task"
        aria-label="Delete Task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
