import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PrioritySelector from './PrioritySelector';

/**
 * TaskForm Component (also exported as AddTask, TaskInput)
 * Accessible form for creating new tasks with title, category, due date, and priority.
 *
 * @param {Object} props
 * @param {Function} props.onAddTask - Callback triggered with validated task payload
 * @param {Array<Object>} [props.categories] - List of available categories
 */
export default function TaskForm({ onAddTask, categories = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      category_id: categoryId ? Number(categoryId) : null,
      due_date: dueDate || null,
      status: 'pending',
      subtasks: []
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 mb-6 shadow-sm space-y-4"
      aria-label="Create Task Form"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Add New Task</h3>
        <span className="text-xs text-slate-400">Quick Create</span>
      </div>

      <div>
        <label htmlFor="task-form-title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Task Title <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <input
          id="task-form-title"
          type="text"
          name="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          required
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="task-form-category" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            id="task-form-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <option value="">No Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-form-due-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Due Date
          </label>
          <input
            id="task-form-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </div>

        <div>
          <PrioritySelector priority={priority} onChange={setPriority} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>
    </form>
  );
}

export { TaskForm as AddTask, TaskForm as TaskInput };
