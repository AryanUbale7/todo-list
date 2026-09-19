import { useMemo } from 'react';

/**
 * Custom hook to calculate real-time derived statistics for tasks.
 * @param {Array<Object>} tasks - List of active task objects.
 * @returns {Object} Derived statistics object.
 */
export function useTaskStats(tasks = []) {
  return useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.deleted_at);
    const total = activeTasks.length;
    const completed = activeTasks.filter((t) => t.status === 'completed' || t.completed === true).length;
    const inProgress = activeTasks.filter((t) => t.status === 'in_progress').length;
    const pending = activeTasks.filter((t) => t.status === 'pending' || (!t.completed && t.status !== 'in_progress')).length;

    const today = new Date().toISOString().split('T')[0];
    const overdue = activeTasks.filter(
      (t) => t.status !== 'completed' && t.due_date && t.due_date < today
    ).length;
    const dueToday = activeTasks.filter((t) => t.due_date === today).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalTimeSpentSeconds = activeTasks.reduce((acc, t) => acc + (t.time_spent_seconds || 0), 0);
    const totalEstimatedMinutes = activeTasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0);

    const priorityBreakdown = {
      urgent: activeTasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length,
      high: activeTasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
      medium: activeTasks.filter((t) => t.priority === 'medium' && t.status !== 'completed').length,
      low: activeTasks.filter((t) => t.priority === 'low' && t.status !== 'completed').length
    };

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      dueToday,
      completionRate,
      totalTimeSpentSeconds,
      totalEstimatedMinutes,
      priorityBreakdown
    };
  }, [tasks]);
}
