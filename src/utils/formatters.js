/**
 * FocusList Utility Formatters
 * Pure functions for date formatting, relative time calculation, and text truncation.
 */

/**
 * Format ISO date string to human-readable date or relative descriptor.
 * @param {string|null} dateStr - Date string in YYYY-MM-DD or ISO format.
 * @returns {{ text: string, isOverdue?: boolean, isToday?: boolean, className: string } | null}
 */
export function formatDueDate(dateStr) {
  if (!dateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
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
    return {
      text: dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      className: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    };
  }
}

/**
 * Format seconds into mm:ss or hh:mm:ss display string.
 * @param {number} totalSeconds - Total seconds elapsed.
 * @returns {string} Formatted duration.
 */
export function formatDuration(totalSeconds = 0) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

/**
 * Truncate long strings safely.
 * @param {string} str - Source string.
 * @param {number} maxLen - Maximum length threshold.
 * @returns {string} Truncated string with ellipsis.
 */
export function truncate(str = '', maxLen = 60) {
  if (!str || str.length <= maxLen) return str;
  return `${str.substring(0, maxLen).trim()}...`;
}
