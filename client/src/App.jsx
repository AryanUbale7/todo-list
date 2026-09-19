import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import GamificationBar from './components/GamificationBar';
import StatsDashboard from './components/StatsDashboard';
import FilterBar from './components/FilterBar';
import TaskItem from './components/TaskItem';
import TaskModal from './components/TaskModal';
import CategoryModal from './components/CategoryModal';
import ShortcutsModal from './components/ShortcutsModal';
import ActivityModal from './components/ActivityModal';
import PomodoroTimer from './components/PomodoroTimer';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import TrashView from './components/TrashView';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import { api } from './services/api';
import { Loader2, Plus, CheckSquare, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('taskpulse_theme') === 'dark' ||
      (!('taskpulse_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Active View ('list', 'kanban', 'calendar', 'analytics', 'trash')
  const [activeView, setActiveView] = useState('list');

  // Data states
  const [tasks, setTasks] = useState([]);
  const [trashTasks, setTrashTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk Selection State
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

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

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Confetti celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0c8de3', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    });
  };

  // Sync dark mode
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
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Fetch Activity Logs
  const fetchActivity = useCallback(async () => {
    try {
      const res = await api.getActivityLogs();
      if (res.success) setActivityLogs(res.data);
    } catch (err) {
      console.error('Error loading activity logs:', err);
    }
  }, []);

  // Fetch Active Tasks
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
        order: filter.order,
        include_deleted: 'false'
      };

      const res = await api.getTasks(params);
      if (res.success) setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      showToast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter]);

  // Fetch Trash Tasks
  const fetchTrashTasks = useCallback(async () => {
    try {
      const res = await api.getTasks({ include_deleted: 'true' });
      if (res.success) setTrashTasks(res.data);
    } catch (err) {
      console.error('Error fetching trash tasks:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchStats();
    fetchActivity();
  }, [fetchCategories, fetchStats, fetchActivity]);

  useEffect(() => {
    if (activeView === 'trash') {
      fetchTrashTasks();
    } else {
      const handler = setTimeout(() => fetchTasks(), 200);
      return () => clearTimeout(handler);
    }
  }, [activeView, fetchTasks, fetchTrashTasks]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tagName = e.target.tagName.toLowerCase();
      const isInput = tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable;

      if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsCategoryModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsActivityModalOpen(false);
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

  // Quick NLP task creation from search bar or speech input
  const handleQuickNlpTask = async (text) => {
    try {
      const nlpRes = await api.parseNlp(text);
      if (nlpRes.success) {
        const parsed = nlpRes.data;
        const matchedCat = categories.find(c => c.name.toLowerCase() === (parsed.categoryName || '').toLowerCase());

        const createRes = await api.createTask({
          title: parsed.title,
          priority: parsed.priority || 'medium',
          category_id: matchedCat ? matchedCat.id : null,
          due_date: parsed.dueDate || null,
          status: 'pending'
        });

        if (createRes.success) {
          fetchTasks();
          fetchStats();
          fetchActivity();
          showToast(`⚡ Created task: "${parsed.title}"`);
        }
      }
    } catch (err) {
      showToast('Failed to create quick task', 'error');
    }
  };

  // Toggle Task Status
  const handleToggleTaskStatus = async (taskId) => {
    try {
      const target = tasks.find(t => t.id === taskId);
      const isFinishing = target && target.status !== 'completed';

      const res = await api.toggleTask(taskId);
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
        fetchStats();
        fetchCategories();
        fetchActivity();
        if (isFinishing) triggerConfetti();
        showToast(res.message);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  // Save Task
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
          fetchActivity();
        }
      } else {
        const res = await api.createTask(taskData);
        if (res.success) {
          showToast('Task created successfully');
          setIsTaskModalOpen(false);
          fetchTasks();
          fetchStats();
          fetchCategories();
          fetchActivity();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
    }
  };

  // Soft Delete Task
  const handleDeleteTask = async (taskId) => {
    try {
      const res = await api.deleteTask(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        fetchStats();
        fetchCategories();
        fetchActivity();
        showToast('Task moved to trash');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Restore Task
  const handleRestoreTask = async (taskId) => {
    try {
      const res = await api.restoreTask(taskId);
      if (res.success) {
        setTrashTasks((prev) => prev.filter((t) => t.id !== taskId));
        fetchStats();
        fetchActivity();
        showToast('Task restored');
      }
    } catch (err) {
      showToast(err.message || 'Failed to restore task', 'error');
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (taskId) => {
    if (!window.confirm('Permanently delete this task? This cannot be undone.')) return;
    try {
      const res = await api.permanentDelete(taskId);
      if (res.success) {
        setTrashTasks((prev) => prev.filter((t) => t.id !== taskId));
        showToast('Task permanently deleted');
      }
    } catch (err) {
      showToast('Failed to permanently delete', 'error');
    }
  };

  // Clear Trash
  const handleClearTrash = async () => {
    if (!window.confirm('Permanently empty all tasks in trash?')) return;
    try {
      const ids = trashTasks.map(t => t.id);
      await api.bulkAction('permanent_delete', ids);
      setTrashTasks([]);
      showToast('Trash emptied');
    } catch (err) {
      showToast('Failed to empty trash', 'error');
    }
  };

  // Update Status directly (Kanban)
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await api.updateTask(taskId, { status: newStatus });
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
        fetchStats();
        if (newStatus === 'completed') triggerConfetti();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Update Subtasks
  const handleUpdateSubtasks = async (taskId, updatedSubtasks) => {
    try {
      const res = await api.updateTask(taskId, { subtasks: updatedSubtasks });
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
      }
    } catch (err) {
      console.error('Failed to update subtasks:', err);
    }
  };

  // Log Focus Time (Pomodoro)
  const handleLogFocusTime = async (taskId, seconds) => {
    try {
      const target = tasks.find(t => t.id === taskId);
      if (target) {
        const totalSec = (target.time_spent_seconds || 0) + seconds;
        await api.updateTask(taskId, { time_spent_seconds: totalSec });
        fetchStats();
        showToast('⚡ Focus session time recorded!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Category
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

  // Delete Category
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

  // Export Data (JSON / CSV)
  const handleExportData = (format = 'json') => {
    if (format === 'csv') {
      const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Recurring'];
      const rows = tasks.map(t => [
        t.id,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${t.category_name || ''}"`,
        t.priority,
        t.status,
        t.due_date || '',
        t.recurring || 'none'
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `taskpulse_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('CSV Spreadsheet downloaded');
    } else {
      const exportObject = {
        version: '2.0',
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
      showToast('JSON Backup downloaded');
    }
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
          recurring: t.recurring || 'none',
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
      
      {/* Navigation Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenActivity={() => setIsActivityModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onQuickNlpTask={handleQuickNlpTask}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Gamification Streak & XP Bar */}
        <GamificationBar completedCount={stats.completed || 0} />

        {/* View Routing */}
        {activeView === 'analytics' ? (
          <AnalyticsView stats={stats} tasks={tasks} />
        ) : activeView === 'calendar' ? (
          <CalendarView
            tasks={tasks}
            onEditTask={(t) => {
              setTaskToEdit(t);
              setIsTaskModalOpen(true);
            }}
            onOpenNewTaskForDate={(d) => {
              setTaskToEdit({ due_date: d });
              setIsTaskModalOpen(true);
            }}
          />
        ) : activeView === 'trash' ? (
          <TrashView
            trashTasks={trashTasks}
            onRestoreTask={handleRestoreTask}
            onPermanentDelete={handlePermanentDelete}
            onClearTrash={handleClearTrash}
          />
        ) : (
          <>
            {/* Stats Dashboard */}
            <StatsDashboard
              stats={stats}
              currentFilter={filter}
              onSelectFilter={(newFilter) => setFilter((prev) => ({ ...prev, ...newFilter }))}
            />

            {/* Filter Bar */}
            <FilterBar
              filter={filter}
              setFilter={setFilter}
              categories={categories}
              onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
            />

            {/* Active View: Kanban or List */}
            {activeView === 'kanban' ? (
              <KanbanBoard
                tasks={tasks}
                onToggleStatus={handleToggleTaskStatus}
                onEditTask={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onUpdateSubtasks={handleUpdateSubtasks}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onOpenNewTask={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
              />
            ) : (
              /* List View */
              <section className="space-y-3" role="region" aria-label="Task List">
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
                    <p className="text-sm text-slate-500">Loading your tasks...</p>
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
                  <div className="grid grid-cols-1 gap-3" role="list">
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
            )}
          </>
        )}

      </main>

      {/* Modals & Popups */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
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

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        logs={activityLogs}
      />

      <PomodoroTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        tasks={tasks}
        onLogTime={handleLogFocusTime}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/40 flex items-center justify-center active:scale-95"
        title="Add Task"
        aria-label="Add Task"
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
