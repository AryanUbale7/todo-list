import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ListTodo,
  TrendingUp
} from 'lucide-react';

export default function StatsDashboard({ stats, currentFilter, onSelectFilter }) {
  const {
    total = 0,
    completed = 0,
    inProgress = 0,
    pending = 0,
    overdue = 0,
    dueToday = 0,
    completionRate = 0
  } = stats || {};

  const statCards = [
    {
      id: 'all',
      title: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200/60 dark:border-blue-900/50',
      filterKey: 'all'
    },
    {
      id: 'completed',
      title: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200/60 dark:border-emerald-900/50',
      filterKey: 'completed'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200/60 dark:border-amber-900/50',
      filterKey: 'in_progress'
    },
    {
      id: 'today',
      title: 'Due Today',
      value: dueToday,
      icon: Calendar,
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/40',
      borderColor: 'border-violet-200/60 dark:border-violet-900/50',
      timeframeKey: 'today'
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200/60 dark:border-rose-900/50',
      timeframeKey: 'overdue',
      badge: overdue > 0 ? 'Needs Attention' : null
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      
      {/* Overall Completion Rate Card */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress</span>
          <TrendingUp className="w-4 h-4 text-brand-500" />
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-500">done</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
            />
          </div>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {completed} of {total} tasks completed
        </div>
      </div>

      {/* Metric Cards */}
      {statCards.map((card) => {
        const Icon = card.icon;
        const isActive =
          (card.filterKey && currentFilter.status === card.filterKey) ||
          (card.timeframeKey && currentFilter.timeframe === card.timeframeKey);

        return (
          <button
            key={card.id}
            onClick={() => {
              if (card.timeframeKey) {
                onSelectFilter({ status: 'all', timeframe: card.timeframeKey });
              } else {
                onSelectFilter({ status: card.filterKey, timeframe: 'all' });
              }
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              isActive
                ? `${card.bgColor} ${card.borderColor} ring-2 ring-brand-500 shadow-sm`
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 animate-pulse">
                  {card.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
