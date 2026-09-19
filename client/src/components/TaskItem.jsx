import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  AlertCircle,
  Flame,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { renderCategoryIcon } from '../utils/iconMap';

export default function TaskItem({
  task,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onUpdateSubtasks
}) {
  const [expanded, setExpanded] = useState(false);

  const isCompleted = task.status === 'completed';
  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;

  // Format Due Date and Overdue status
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)}d`,
        isOverdue: true,
        className: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Due Today',
        isToday: true,
        className: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-900'
      };
    } else if (diffDays === 1) {
      return {
        text: 'Due Tomorrow',
        className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900'
      };
    } else {
      const options = { month: 'short', day: 'numeric' };
      return {
        text: dueDate.toLocaleDateString(undefined, options),
        className: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      };
    }
  };

  const dueInfo = formatDueDate(task.due_date);

  // Priority styling
  const priorityConfig = {
    urgent: {
      label: 'Urgent',
      icon: Flame,
      className: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-900 font-bold'
    },
    high: {
      label: 'High',
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-900'
    },
    medium: {
      label: 'Medium',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900'
    },
    low: {
      label: 'Low',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900'
    }
  };

  const priorityMeta = priorityConfig[task.priority] || priorityConfig.medium;
  const PriorityIcon = priorityMeta.icon;

  // Toggle single subtask status
  const handleToggleSubtask = (stId, e) => {
    e.stopPropagation();
    const updated = subtasks.map((st) => (st.id === stId ? { ...st, completed: !st.completed } : st));
    onUpdateSubtasks(task.id, updated);
  };

  return (
    <div
      className={`group rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        
        {/* Complete Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 bg-transparent'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Title */}
            <h3
              onClick={() => onEditTask(task)}
              className={`text-base font-semibold cursor-pointer truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>
          </div>

          {/* Task Description */}
          {task.description && (
            <p
              className={`text-xs sm:text-sm line-clamp-2 mb-3 ${
                isCompleted ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Badges / Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category */}
            {task.category_name && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-medium text-[11px]"
                style={{
                  backgroundColor: `${task.category_color}18`,
                  color: task.category_color
                }}
              >
                {renderCategoryIcon(task.category_icon, 'w-3 h-3')}
                <span>{task.category_name}</span>
              </span>
            )}

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${priorityMeta.className}`}
            >
              {PriorityIcon && <PriorityIcon className="w-3 h-3 text-red-500 animate-pulse" />}
              <span>{priorityMeta.label}</span>
            </span>

            {/* Due Date */}
            {dueInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                  isCompleted ? 'text-slate-400 border-slate-200 dark:border-slate-800' : dueInfo.className
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{dueInfo.text}</span>
              </span>
            )}

            {/* Subtasks Counter Pill */}
            {subtasks.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors"
              >
                <span>
                  {completedSubtasksCount}/{subtasks.length} subtasks
                </span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons (Edit & Delete) */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditTask(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Expanded Subtasks List */}
      {expanded && subtasks.length > 0 && (
        <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-2xl">
          <div className="space-y-2 mt-2">
            {subtasks.map((st) => (
              <div
                key={st.id}
                onClick={(e) => handleToggleSubtask(st.id, e)}
                className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    st.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
