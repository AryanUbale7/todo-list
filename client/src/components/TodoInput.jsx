import React, { useState } from 'react';
import { Plus, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function TodoInput({ onAddTodo, onOpenDetailedModal }) {
  const [title, setTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      priority: 'medium',
      status: 'pending',
      subtasks: []
    });
    setTitle('');
  };

  const handleAiBreakdown = async () => {
    if (!title.trim()) return;
    try {
      setIsAiLoading(true);
      const res = await api.generateAiSubtasks(title);
      if (res.success && Array.isArray(res.data)) {
        onAddTodo({
          title: title.trim(),
          priority: 'high',
          status: 'pending',
          subtasks: res.data
        });
        setTitle('');
      }
    } catch (e) {
      console.warn('AI breakdown error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2.5 mb-6 shadow-sm flex items-center gap-2 group focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
    >
      <div className="p-2 text-slate-400">
        <Plus className="w-5 h-5" />
      </div>

      <input
        type="text"
        name="todo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task or goal... (e.g. 'Build portfolio site' or 'Submit report tomorrow')"
        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 font-medium"
      />

      {title.trim() && (
        <button
          type="button"
          onClick={handleAiBreakdown}
          disabled={isAiLoading}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition-all disabled:opacity-50"
          title="Decompose this goal into actionable subtasks with AI"
        >
          {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>AI Breakdown</span>
        </button>
      )}

      <button
        type="submit"
        disabled={!title.trim()}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-1"
        aria-label="Add task"
      >
        <span>Add Task</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
