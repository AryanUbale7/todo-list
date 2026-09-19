import React from 'react';
import { Flame, Trophy, Star, Sparkles, Award } from 'lucide-react';

export default function GamificationBar({ completedCount = 0 }) {
  // Calculate XP & Level
  const xp = completedCount * 50;
  const level = Math.floor(xp / 200) + 1;
  const currentLevelXp = xp % 200;
  const progressPercent = (currentLevelXp / 200) * 100;

  // Streak logic (derived or simulated)
  const streakDays = Math.max(1, Math.min(completedCount + 1, 14));

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-brand-500/10 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-brand-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      
      {/* Streak Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {streakDays} Day Streak!
            </span>
            <span className="text-xs">🔥</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Keep completing tasks to maintain your streak!
          </span>
        </div>
      </div>

      {/* Level & XP Progress */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-brand-600 dark:text-brand-400">
          <Trophy className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-slate-900 dark:text-white">Level {level} Explorer</span>
            <span className="text-brand-600 dark:text-brand-400">{currentLevelXp} / 200 XP</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges preview */}
      <div className="hidden lg:flex items-center gap-2">
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
            completedCount >= 1
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent opacity-60'
          }`}
          title="First Task Completed"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Starter</span>
        </div>

        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
            completedCount >= 5
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent opacity-60'
          }`}
          title="Completed 5 Tasks"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Master</span>
        </div>
      </div>

    </div>
  );
}
