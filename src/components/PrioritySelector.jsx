import React from 'react';
import { Flag, Flame } from 'lucide-react';

export default function PrioritySelector({ priority = 'medium', onChange }) {
  const priorities = [
    { id: 'low', label: 'Low', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
    { id: 'medium', label: 'Medium', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
    { id: 'high', label: 'High', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800' },
    { id: 'urgent', label: 'Urgent 🔥', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 font-bold' },
  ];

  return (
    <div className="space-y-1.5" role="group" aria-label="Task Priority Selector">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Task Priority
      </label>
      <div className="grid grid-cols-4 gap-1.5">
        {priorities.map((p) => {
          const isSelected = priority === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`py-1.5 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                  : `bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300`
              }`}
              aria-pressed={isSelected}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
