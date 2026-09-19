import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap
} from 'lucide-react';

export default function AnalyticsView({ stats, tasks }) {
  const {
    total = 0,
    completed = 0,
    inProgress = 0,
    pending = 0,
    overdue = 0,
    completionRate = 0,
    totalTimeSpentSeconds = 0,
    totalEstimatedMinutes = 0,
    priorityBreakdown = [],
    categoryBreakdown = []
  } = stats || {};

  const hoursSpent = (totalTimeSpentSeconds / 3600).toFixed(1);
  const estimatedHours = (totalEstimatedMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6 pb-8 animate-fade-in" role="region" aria-label="Productivity Analytics">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-300 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Productivity Scorecard
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            {completionRate >= 75 ? 'Outstanding Velocity! 🚀' : 'Keep Pushing Forward! ⚡'}
          </h2>
          <p className="text-xs sm:text-sm text-brand-100 max-w-lg mt-1">
            You have completed {completed} out of {total} scheduled goals with a {completionRate}% overall completion efficiency rate.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
          <div className="text-center">
            <span className="block text-3xl font-black">{completionRate}%</span>
            <span className="text-[11px] text-brand-200 uppercase font-semibold">Success Rate</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <span className="block text-3xl font-black">{hoursSpent}h</span>
            <span className="text-[11px] text-brand-200 uppercase font-semibold">Focus Time</span>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Priority Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Priority Load</h3>
            </div>
            <span className="text-xs text-slate-400">Active Tasks</span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'urgent', label: 'Urgent 🔥', color: 'bg-rose-500', barColor: 'from-rose-500 to-red-600' },
              { id: 'high', label: 'High Priority', color: 'bg-orange-500', barColor: 'from-orange-500 to-amber-600' },
              { id: 'medium', label: 'Medium Priority', color: 'bg-amber-500', barColor: 'from-amber-400 to-yellow-500' },
              { id: 'low', label: 'Low Priority', color: 'bg-blue-500', barColor: 'from-blue-400 to-cyan-500' },
            ].map((p) => {
              const item = priorityBreakdown.find((x) => x.priority === p.id);
              const count = item ? item.count : 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={p.id}>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>{p.label}</span>
                    <span>{count} tasks ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${p.barColor} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Workload */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Category Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No categories assigned</p>
            ) : (
              categoryBreakdown.map((c, idx) => {
                const percent = total > 0 ? Math.round((c.count / total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                      <span>{c.count} tasks</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
