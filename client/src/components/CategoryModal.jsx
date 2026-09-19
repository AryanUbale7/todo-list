import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Briefcase,
  User,
  ShoppingCart,
  Heart,
  FolderKanban,
  Star,
  Book,
  Code,
  Bell,
  Coffee,
  Sparkles
} from 'lucide-react';
import { iconMap, renderCategoryIcon } from '../utils/iconMap';

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onDeleteCategory
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('tag');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const colorPresets = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#64748b', // Slate
  ];

  const availableIcons = [
    { id: 'tag', label: 'Tag' },
    { id: 'briefcase', label: 'Briefcase' },
    { id: 'user', label: 'User' },
    { id: 'shopping-cart', label: 'Shopping' },
    { id: 'heart', label: 'Health' },
    { id: 'folder-kanban', label: 'Project' },
    { id: 'star', label: 'Star' },
    { id: 'book', label: 'Study' },
    { id: 'code', label: 'Dev' },
    { id: 'bell', label: 'Alert' },
    { id: 'coffee', label: 'Life' },
    { id: 'sparkles', label: 'Magic' }
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    onCreateCategory({ name: name.trim(), color, icon });
    setName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* New Category Form */}
          <form onSubmit={handleCreate} className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Add New Category
            </h3>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Category Name (e.g., Fitness, Finances)"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Color selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase">
                Theme Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {availableIcons.map((ic) => {
                  const isSelected = icon === ic.id;
                  return (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setIcon(ic.id)}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                      title={ic.label}
                    >
                      {renderCategoryIcon(ic.id, 'w-4 h-4')}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </form>

          {/* Existing Categories List */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Existing Categories ({categories.length})
            </h3>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-1.5 rounded-lg text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        ({cat.task_count || 0} tasks)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
