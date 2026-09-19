import React from 'react';
import { ListTodo, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function TaskStats({ stats, currentFilter, onSelectFilter }) {
  const {
    total = 0,
    completed = 0,
    pending = 0,
    inProgress = 0,
    overdue = 0,
    completionRate = 0
  } = stats || {};

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6" role="region" aria-label="Task Statistics">
      
      {/* Total Tasks */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</span>
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white" data-testid="total-tasks-count">
            {total}
          </span>
          <span className="text-xs text-slate-400">tasks</span>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white" data-testid="completed-tasks-count">
            {completed}
          </span>
          <span className="text-xs text-slate-400">tasks</span>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white" data-testid="pending-tasks-count">
            {pending}
          </span>
          <span className="text-xs text-slate-400">active</span>
        </div>
      </div>

      {/* Progress & Completion Rate */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion Rate</span>
          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white" data-testid="completion-rate-percentage">
            {completionRate}%
          </span>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export { TaskStats as TaskStatistics, TaskStats as ProgressSummary, TaskStats as TaskSummary };
