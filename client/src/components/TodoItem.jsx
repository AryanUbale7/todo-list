import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Flame,
  GripVertical
} from 'lucide-react';
import { renderCategoryIcon } from '../utils/iconMap';

export default function TodoItem({
  todo,
  index,
  onToggle,
  onEdit,
  onDelete,
  onUpdateSubtasks,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isCompleted = todo.status === 'completed' || todo.completed === true;
  const subtasks = todo.subtasks || [];
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;

  // Format Due Date
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
        className: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Due Today',
        className: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-900'
      };
    } else if (diffDays === 1) {
      return {
        text: 'Due Tomorrow',
        className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900'
      };
    } else {
      return {
        text: dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        className: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      };
    }
  };

  const dueInfo = formatDueDate(todo.due_date);

  const priorityConfig = {
    urgent: { label: 'Urgent', icon: Flame, className: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-900 font-bold' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-900' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900' },
    low: { label: 'Low', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900' }
  };

  const priorityMeta = priorityConfig[todo.priority] || priorityConfig.medium;
  const PriorityIcon = priorityMeta.icon;

  const handleToggleSubtask = (stId, e) => {
    e.stopPropagation();
    const updated = subtasks.map((st) => (st.id === stId ? { ...st, completed: !st.completed } : st));
    if (onUpdateSubtasks) onUpdateSubtasks(todo.id, updated);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="listitem"
      className={`group rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        
        {/* Drag Handle */}
        <div className="mt-1 text-slate-300 dark:text-slate-700 group-hover:text-slate-400 dark:group-hover:text-slate-500 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Complete Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(todo.id)}
          aria-label={isCompleted ? `Mark ${todo.title} as incomplete` : `Mark ${todo.title} as completed`}
          className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 bg-transparent'
          }`}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Todo Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3
              onClick={() => onEdit(todo)}
              className={`text-base font-semibold cursor-pointer truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {todo.title}
            </h3>
          </div>

          {todo.description && (
            <p
              className={`text-xs sm:text-sm line-clamp-2 mb-3 ${
                isCompleted ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Badges / Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {todo.category_name && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-medium text-[11px]"
                style={{
                  backgroundColor: `${todo.category_color || '#3b82f6'}18`,
                  color: todo.category_color || '#3b82f6'
                }}
              >
                {renderCategoryIcon(todo.category_icon, 'w-3 h-3')}
                <span>{todo.category_name}</span>
              </span>
            )}

            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${priorityMeta.className}`}>
              {PriorityIcon && <PriorityIcon className="w-3 h-3 text-red-500 animate-pulse" />}
              <span>{priorityMeta.label}</span>
            </span>

            {dueInfo && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${isCompleted ? 'text-slate-400 border-slate-200 dark:border-slate-800' : dueInfo.className}`}>
                <Calendar className="w-3 h-3" />
                <span>{dueInfo.text}</span>
              </span>
            )}

            {subtasks.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors"
                aria-expanded={expanded}
              >
                <span>{completedSubtasksCount}/{subtasks.length} subtasks</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Todo"
            aria-label={`Edit ${todo.title}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Todo"
            aria-label={`Delete ${todo.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Expanded Subtasks */}
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
