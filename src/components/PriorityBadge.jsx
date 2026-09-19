import React from 'react';
import { Flag, Flame } from 'lucide-react';

export default function PriorityBadge({ priority = 'medium' }) {
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

  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${config.className}`}
      aria-label={`Task Priority: ${config.label}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
      <span>{config.label}</span>
    </span>
  );
}

export { PriorityBadge as TaskPriority };
