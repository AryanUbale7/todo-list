import React from 'react';
import { CheckCircle2, Clock, ListTodo, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import TaskItem from './TaskItem';

export default function KanbanBoard({
  tasks,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onUpdateSubtasks,
  onUpdateTaskStatus,
  onOpenNewTask
}) {
  const columns = [
    {
      id: 'pending',
      title: 'To Do',
      icon: ListTodo,
      color: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20',
      tasks: tasks.filter((t) => t.status === 'pending')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: Clock,
      color: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
      tasks: tasks.filter((t) => t.status === 'in_progress')
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
      tasks: tasks.filter((t) => t.status === 'completed')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8 animate-fade-in" role="region" aria-label="Kanban Board">
      {columns.map((col) => {
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            className="flex flex-col rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${col.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{col.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  {col.tasks.length}
                </span>
              </div>

              {col.id === 'pending' && (
                <button
                  onClick={onOpenNewTask}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Add task to this column"
                  aria-label="Add new task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Column Task Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1" role="list">
              {col.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                  <span>No tasks in {col.title.toLowerCase()}</span>
                </div>
              ) : (
                col.tasks.map((task) => (
                  <div key={task.id} className="relative group">
                    <TaskItem
                      task={task}
                      onToggleStatus={onToggleStatus}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                      onUpdateSubtasks={onUpdateSubtasks}
                    />

                    {/* Quick Move Bar */}
                    <div className="flex items-center justify-end gap-1 mt-1 px-1">
                      {col.id !== 'pending' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, col.id === 'completed' ? 'in_progress' : 'pending')}
                          className="text-[10px] flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                          title="Move Left"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" /> Move Back
                        </button>
                      )}
                      {col.id !== 'completed' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, col.id === 'pending' ? 'in_progress' : 'completed')}
                          className="text-[10px] flex items-center gap-0.5 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 font-medium border border-brand-200 dark:border-brand-900 transition-colors"
                          title="Move Right"
                        >
                          Advance <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
