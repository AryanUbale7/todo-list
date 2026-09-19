import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import FilterBar from './components/FilterBar';
import TaskItem from './components/TaskItem';
import TaskModal from './components/TaskModal';
import CategoryModal from './components/CategoryModal';
import ShortcutsModal from './components/ShortcutsModal';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import { api } from './services/api';
import { Loader2, Plus, Sparkles } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('taskpulse_theme') === 'dark' ||
      (!('taskpulse_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Data states
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    categoryId: 'all',
    priority: 'all',
    timeframe: 'all',
    sortBy: 'created_at',
    order: 'desc'
  });

  // Modals & Popups
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Sync dark mode class with HTML element & local storage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskpulse_theme', 'light');
    }
  }, [darkMode]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Fetch Tasks with query parameters
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        status: filter.status !== 'all' ? filter.status : undefined,
        category_id: filter.categoryId !== 'all' ? filter.categoryId : undefined,
        priority: filter.priority !== 'all' ? filter.priority : undefined,
        timeframe: filter.timeframe !== 'all' ? filter.timeframe : undefined,
        sort_by: filter.sortBy,
        order: filter.order
      };

      const res = await api.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      showToast('Failed to load tasks. Check server connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  // Debounced/Reactive Task fetch on filter/search change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTasks();
    }, 200);
    return () => clearTimeout(handler);
  }, [fetchTasks]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input or textarea
      const tagName = e.target.tagName.toLowerCase();
      const isInput = tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable;

      if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsCategoryModalOpen(false);
        setIsShortcutsModalOpen(false);
        return;
      }

      if (isInput) return;

      if (e.key === '/' || e.key === 's') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDarkMode((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Tasks
  const handleToggleTaskStatus = async (taskId) => {
    try {
      const res = await api.toggleTask(taskId);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? res.data : t))
        );
        fetchStats();
        fetchCategories();
        showToast(res.message);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleSaveTask = async (taskData, editId) => {
    try {
      if (editId) {
        const res = await api.updateTask(editId, taskData);
        if (res.success) {
          showToast('Task updated successfully');
          setIsTaskModalOpen(false);
          fetchTasks();
          fetchStats();
          fetchCategories();
        }
      } else {
        const res = await api.createTask(taskData);
        if (res.success) {
          showToast('Task created successfully');
          setIsTaskModalOpen(false);
          fetchTasks();
          fetchStats();
          fetchCategories();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await api.deleteTask(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        fetchStats();
        fetchCategories();
        showToast('Task deleted successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleUpdateSubtasks = async (taskId, updatedSubtasks) => {
    try {
      const targetTask = tasks.find((t) => t.id === taskId);
      if (!targetTask) return;

      const res = await api.updateTask(taskId, {
        subtasks: updatedSubtasks
      });
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? res.data : t))
        );
      }
    } catch (err) {
      console.error('Failed to update subtasks:', err);
    }
  };

  // Handlers for Categories
  const handleCreateCategory = async (catData) => {
    try {
      const res = await api.createCategory(catData);
      if (res.success) {
        setCategories((prev) => [...prev, res.data]);
        showToast(`Category "${catData.name}" created`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete category? Assigned tasks will not be deleted.')) return;
    try {
      const res = await api.deleteCategory(catId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        fetchTasks();
        showToast('Category deleted');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Export JSON
  const handleExportData = () => {
    const exportObject = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      categories,
      tasks
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskpulse_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('TaskPulse backup downloaded');
  };

  // Import JSON
  const handleImportData = async (importedData) => {
    if (!importedData || !Array.isArray(importedData.tasks)) {
      showToast('Invalid backup file structure.', 'error');
      return;
    }

    try {
      setLoading(true);
      for (const t of importedData.tasks) {
        await api.createTask({
          title: t.title,
          description: t.description || '',
          priority: t.priority || 'medium',
          status: t.status || 'pending',
          due_date: t.due_date || null,
          subtasks: t.subtasks || []
        });
      }
      await fetchTasks();
      await fetchStats();
      await fetchCategories();
      showToast(`Imported ${importedData.tasks.length} tasks successfully!`);
    } catch (err) {
      showToast('Failed to import some tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFiltered =
    Boolean(searchQuery) ||
    filter.status !== 'all' ||
    filter.categoryId !== 'all' ||
    filter.priority !== 'all' ||
    filter.timeframe !== 'all';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Productivity Stats Dashboard */}
        <StatsDashboard
          stats={stats}
          currentFilter={filter}
          onSelectFilter={(newFilter) => setFilter((prev) => ({ ...prev, ...newFilter }))}
        />

        {/* Filter and Category Controls */}
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          categories={categories}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        />

        {/* Task List Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tasks ({tasks.length})
            </h2>
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing...
              </span>
            )}
          </div>

          {loading && tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading your task list...</p>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              isFiltered={isFiltered}
              onResetFilter={() => {
                setSearchQuery('');
                setFilter({
                  status: 'all',
                  categoryId: 'all',
                  priority: 'all',
                  timeframe: 'all',
                  sortBy: 'created_at',
                  order: 'desc'
                });
              }}
              onOpenNewTask={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleTaskStatus}
                  onEditTask={(t) => {
                    setTaskToEdit(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onUpdateSubtasks={handleUpdateSubtasks}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Modals & Dialogs */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        onOpenCategoryModal={() => {
          setIsCategoryModalOpen(true);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/40 flex items-center justify-center active:scale-95"
        title="Add Task"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Toast Notification Banner */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

    </div>
  );
}
