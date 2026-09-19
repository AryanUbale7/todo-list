import React, { useState, useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { TodoProvider, useTodoContext } from './context/TodoContext';
import Header from './components/Header';
import GamificationBar from './components/GamificationBar';
import TaskStats from './components/TaskStats';
import FilterBar from './components/FilterBar';
import TodoInput from './components/TodoInput';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';
import { Loader2, Plus } from 'lucide-react';

// Code-splitting secondary heavy views & modals for optimal performance
const KanbanBoard = lazy(() => import('./components/KanbanBoard'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const TrashView = lazy(() => import('./components/TrashView'));
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer'));
const CategoryModal = lazy(() => import('./components/CategoryModal'));
const ShortcutsModal = lazy(() => import('./components/ShortcutsModal'));
const ActivityModal = lazy(() => import('./components/ActivityModal'));

function ViewLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 min-h-[300px]" role="status" aria-label="Loading view">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
      <span className="text-sm font-medium text-slate-500">Loading module...</span>
    </div>
  );
}

function TodoAppContent() {
  const {
    todos,
    trashTodos,
    categories,
    stats,
    activityLogs,
    loading,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    activeView,
    setActiveView,
    toast,
    setToast,
    showToast,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    restoreTodo,
    permanentDeleteTodo,
    reorderTodos,
    addQuickNlpTodo,
    createCategory,
    deleteCategory,
    exportTodos,
    importTodos,
    triggerConfetti
  } = useTodoContext();

  // Route awareness for /, /tasks, /search, /dashboard
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/dashboard')) {
      setActiveView('analytics');
    } else if (path.includes('/search')) {
      setActiveView('list');
      setTimeout(() => document.getElementById('global-search-input')?.focus(), 100);
    } else if (path.includes('/tasks') || path === '/') {
      if (activeView !== 'kanban' && activeView !== 'calendar' && activeView !== 'trash' && activeView !== 'analytics') {
        setActiveView('list');
      }
    }
  }, [setActiveView]);

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('focuslist_theme') === 'dark' ||
      (!('focuslist_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('focuslist_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('focuslist_theme', 'light');
    }
  }, [darkMode]);

  // Keyboard Shortcuts Listener
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

  const handleSaveTodo = async (todoData, editId) => {
    if (editId) {
      await updateTodo(editId, todoData);
      setIsTaskModalOpen(false);
    } else {
      await addTodo(todoData);
      setIsTaskModalOpen(false);
    }
  };

  const handleLogFocusTime = async (todoId, seconds) => {
    const target = todos.find((t) => t.id === todoId);
    if (target) {
      const totalSec = (target.time_spent_seconds || 0) + seconds;
      await updateTodo(todoId, { time_spent_seconds: totalSec });
      showToast('⚡ Focus session recorded!');
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
      {/* Skip to Main Content Accessibility Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-lg"
      >
        Skip to main content
      </a>

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
        onExportData={exportTodos}
        onImportData={importTodos}
        onQuickNlpTask={addQuickNlpTodo}
      />

      {/* Main Workspace Container */}
      <main id="main-content" tabIndex="-1" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 outline-none">
        
        {/* Productivity & Gamification Streak */}
        <GamificationBar completedCount={stats.completed || 0} />

        {/* View Switcher Routing */}
        <Suspense fallback={<ViewLoader />}>
          {activeView === 'analytics' ? (
            <AnalyticsView stats={stats} tasks={todos} />
          ) : activeView === 'calendar' ? (
            <CalendarView
              tasks={todos}
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
              trashTasks={trashTodos}
              onRestoreTask={restoreTodo}
              onPermanentDelete={permanentDeleteTodo}
              onClearTrash={() => {
                trashTodos.forEach((t) => permanentDeleteTodo(t.id));
              }}
            />
          ) : (
            <>
              {/* Task Statistics Summary */}
              <TaskStats
                stats={stats}
                currentFilter={filter}
                onSelectFilter={(newFilter) => setFilter((prev) => ({ ...prev, ...newFilter }))}
              />

              {/* Quick Inline Task Creation */}
              <TodoInput
                onAddTodo={addTodo}
                onOpenDetailedModal={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
              />

              {/* Task Search & Filter Controls */}
              <FilterBar
                filter={filter}
                setFilter={setFilter}
                categories={categories}
                onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
              />

              {/* Main View: Kanban or Task List */}
              {activeView === 'kanban' ? (
                <KanbanBoard
                  tasks={todos}
                  onToggleStatus={toggleTodo}
                  onEditTask={(t) => {
                    setTaskToEdit(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={deleteTodo}
                  onUpdateSubtasks={(id, subtasks) => updateTodo(id, { subtasks })}
                  onUpdateTaskStatus={(id, status) => {
                    updateTodo(id, { status });
                    if (status === 'completed') triggerConfetti();
                  }}
                  onOpenNewTask={() => {
                    setTaskToEdit(null);
                    setIsTaskModalOpen(true);
                  }}
                />
              ) : (
                /* Task List View */
                <section className="space-y-3" role="region" aria-label="Task List View">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tasks ({todos.length})
                      </h2>
                      {stats.completed > 0 && (
                        <button
                          onClick={clearCompleted}
                          className="text-xs text-rose-500 hover:underline font-semibold focus-visible:ring-2 focus-visible:ring-rose-500 rounded px-1"
                          aria-label="Clear all completed tasks"
                        >
                          Clear Completed ({stats.completed})
                        </button>
                      )}
                    </div>

                    {loading && (
                      <span className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium" role="status" aria-live="polite">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing...
                      </span>
                    )}
                  </div>

                  {loading && todos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20" role="status">
                      <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
                      <p className="text-sm text-slate-500">Loading your tasks...</p>
                    </div>
                  ) : (
                    <TaskList
                      todos={todos}
                      onToggle={toggleTodo}
                      onEdit={(t) => {
                        setTaskToEdit(t);
                        setIsTaskModalOpen(true);
                      }}
                      onDelete={deleteTodo}
                      onUpdateSubtasks={(id, subtasks) => updateTodo(id, { subtasks })}
                      onReorder={reorderTodos}
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
                      onOpenNewTodo={() => {
                        setTaskToEdit(null);
                        setIsTaskModalOpen(true);
                      }}
                    />
                  )}
                </section>
              )}
            </>
          )}
        </Suspense>

      </main>

      {/* Modals & Dialogs */}
      <Suspense fallback={null}>
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTodo}
          taskToEdit={taskToEdit}
          categories={categories}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        />

        {isCategoryModalOpen && (
          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            categories={categories}
            onCreateCategory={createCategory}
            deleteCategory={deleteCategory}
          />
        )}

        {isShortcutsModalOpen && (
          <ShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
          />
        )}

        {isActivityModalOpen && (
          <ActivityModal
            isOpen={isActivityModalOpen}
            onClose={() => setIsActivityModalOpen(false)}
            logs={activityLogs}
          />
        )}

        {isTimerOpen && (
          <PomodoroTimer
            isOpen={isTimerOpen}
            onClose={() => setIsTimerOpen(false)}
            tasks={todos}
            onLogTime={handleLogFocusTime}
          />
        )}
      </Suspense>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/40 flex items-center justify-center active:scale-95 focus-visible:ring-4 focus-visible:ring-brand-400"
        title="Add Task"
        aria-label="Add Task"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Toast Alert Banner */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TodoProvider>
        <TodoAppContent />
      </TodoProvider>
    </ErrorBoundary>
  );
}
