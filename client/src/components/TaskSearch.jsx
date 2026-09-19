import React from 'react';
import { Search, X } from 'lucide-react';

export default function TaskSearch({ value, onChange, onClear }) {
  return (
    <div className="relative flex items-center w-full max-w-md" role="search" aria-label="Task Search">
      <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks by title..."
        className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-brand-500 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
        aria-label="Search tasks"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export { TaskSearch as SearchInput };
