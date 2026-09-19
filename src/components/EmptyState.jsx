import React from 'react';
import { ClipboardList, Plus, Sparkles, FilterX } from 'lucide-react';

export default function EmptyState({ isFiltered, onResetFilter, onOpenNewTask }) {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 animate-fade-in my-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
        {isFiltered ? <FilterX className="w-8 h-8" /> : <ClipboardList className="w-8 h-8" />}
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        {isFiltered ? 'No matching tasks found' : 'All caught up! No tasks yet'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
        {isFiltered
          ? 'Try adjusting your search keywords, categories, or filters to find what you are looking for.'
          : 'Stay organized, boost your focus, and track your daily productivity with TaskPulse.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {isFiltered ? (
          <button
            onClick={onResetFilter}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Clear Filters
          </button>
        ) : (
          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/25 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Your First Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
