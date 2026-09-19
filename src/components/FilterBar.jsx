import React from 'react';
import {
  Filter,
  ArrowUpDown,
  Tag,
  Flag,
  Calendar,
  Layers,
  CheckCircle2,
  ListTodo,
  Plus
} from 'lucide-react';
import { renderCategoryIcon } from '../utils/iconMap';

export default function FilterBar({
  filter,
  setFilter,
  categories,
  onOpenCategoryModal
}) {
  const statusTabs = [
    { id: 'all', label: 'All Tasks', icon: ListTodo },
    { id: 'pending', label: 'Pending', icon: ListTodo },
    { id: 'in_progress', label: 'In Progress', icon: Layers },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const timeframeTabs = [
    { id: 'all', label: 'Any Date' },
    { id: 'today', label: 'Due Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' }
  ];

  const priorityOptions = [
    { id: 'all', label: 'All Priorities' },
    { id: 'urgent', label: 'Urgent 🔥' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' }
  ];

  const sortOptions = [
    { id: 'created_at', label: 'Date Created' },
    { id: 'due_date', label: 'Due Date' },
    { id: 'priority', label: 'Priority Level' },
    { id: 'title', label: 'Task Title (A-Z)' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 mb-6 shadow-sm space-y-4">
      
      {/* Top Bar: Status Tabs & Sorting */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto w-full md:w-auto">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter.status === tab.id && filter.timeframe === 'all';
            return (
              <button
                key={tab.id}
                onClick={() => setFilter({ ...filter, status: tab.id, timeframe: 'all' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
            className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-xl border-none outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilter({ ...filter, order: filter.order === 'asc' ? 'desc' : 'asc' })}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold px-2"
            title={filter.order === 'asc' ? 'Ascending (Click for Descending)' : 'Descending (Click for Ascending)'}
          >
            {filter.order === 'asc' ? '↑ ASC' : '↓ DESC'}
          </button>
        </div>
      </div>

      {/* Bottom Bar: Timeframe, Priority & Category Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3 h-3" /> Categories:
          </span>

          <button
            onClick={() => setFilter({ ...filter, categoryId: 'all' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
              filter.categoryId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>

          {categories.map((cat) => {
            const isSelected = filter.categoryId === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setFilter({ ...filter, categoryId: isSelected ? 'all' : String(cat.id) })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'text-white shadow-sm ring-2 ring-offset-1 dark:ring-offset-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={isSelected ? { backgroundColor: cat.color, ringColor: cat.color } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                />
                <span>{cat.name}</span>
                {cat.task_count !== undefined && (
                  <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {cat.task_count}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onOpenCategoryModal}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
            title="Manage Categories"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Priority & Due Date dropdowns */}
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-1 px-2 rounded-lg border-none outline-none cursor-pointer"
            >
              {priorityOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe filter */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filter.timeframe}
              onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-1 px-2 rounded-lg border-none outline-none cursor-pointer"
            >
              {timeframeTabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(filter.status !== 'all' || filter.categoryId !== 'all' || filter.priority !== 'all' || filter.timeframe !== 'all') && (
            <button
              onClick={() => setFilter({ status: 'all', categoryId: 'all', priority: 'all', timeframe: 'all', sortBy: 'created_at', order: 'desc' })}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
