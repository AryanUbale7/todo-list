import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const TodoContext = createContext(null);

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);
  const [trashTodos, setTrashTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({
    status: 'all', // 'all', 'pending', 'in_progress', 'completed'
    categoryId: 'all',
    priority: 'all', // 'all', 'low', 'medium', 'high', 'urgent'
    timeframe: 'all', // 'all', 'today', 'upcoming', 'overdue'
    sortBy: 'created_at',
    order: 'desc'
  });

  // Active View State
  const [activeView, setActiveView] = useState('list'); // 'list', 'kanban', 'calendar', 'analytics', 'trash'

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Confetti effect
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0c8de3', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
      });
    } catch {
      // Ignore if canvas not supported
    }
  }, []);

  // Load Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.warn('Categories load fallback:', err);
    }
  }, []);

  // Load Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.warn('Stats load fallback:', err);
    }
  }, []);

  // Load Activity Logs
  const fetchActivity = useCallback(async () => {
    try {
      const res = await api.getActivityLogs();
      if (res.success) setActivityLogs(res.data);
    } catch (err) {
      console.warn('Activity load fallback:', err);
    }
  }, []);

  // Load Active Todos
  const fetchTodos = useCallback(async () => {
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
      if (res.success) setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      showToast('Failed to load todos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter, showToast]);

  // Load Trash Todos
  const fetchTrash = useCallback(async () => {
    try {
      const res = await api.getTasks({ include_deleted: 'true' });
      if (res.success) setTrashTodos(res.data);
    } catch (err) {
      console.warn('Error fetching trash:', err);
    }
  }, []);

  // Initial Sync
  useEffect(() => {
    fetchCategories();
    fetchStats();
    fetchActivity();
  }, [fetchCategories, fetchStats, fetchActivity]);

  useEffect(() => {
    if (activeView === 'trash') {
      fetchTrash();
    } else {
      const timer = setTimeout(() => fetchTodos(), 150);
      return () => clearTimeout(timer);
    }
  }, [activeView, fetchTodos, fetchTrash]);

  // Add Todo
  const addTodo = useCallback(async (todoData) => {
    try {
      const res = await api.createTask(todoData);
      if (res.success) {
        showToast('Todo created successfully! ✨');
        fetchTodos();
        fetchStats();
        fetchCategories();
        fetchActivity();
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to create todo', 'error');
      throw err;
    }
  }, [fetchTodos, fetchStats, fetchCategories, fetchActivity, showToast]);

  // Toggle Todo Status
  const toggleTodo = useCallback(async (todoId) => {
    try {
      const target = todos.find(t => t.id === todoId);
      const isFinishing = target && target.status !== 'completed';

      const res = await api.toggleTask(todoId);
      if (res.success) {
        setTodos((prev) => prev.map((t) => (t.id === todoId ? res.data : t)));
        fetchStats();
        fetchCategories();
        fetchActivity();
        if (isFinishing) triggerConfetti();
        showToast(res.message || (isFinishing ? 'Todo completed! 🎉' : 'Todo reopened'));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  }, [todos, fetchStats, fetchCategories, fetchActivity, triggerConfetti, showToast]);

  // Update / Edit Todo
  const updateTodo = useCallback(async (todoId, updateData) => {
    try {
      const res = await api.updateTask(todoId, updateData);
      if (res.success) {
        setTodos((prev) => prev.map((t) => (t.id === todoId ? res.data : t)));
        fetchStats();
        fetchCategories();
        fetchActivity();
        showToast('Todo updated successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update todo', 'error');
    }
  }, [fetchStats, fetchCategories, fetchActivity, showToast]);

  // Delete Todo (Soft Delete)
  const deleteTodo = useCallback(async (todoId) => {
    try {
      const res = await api.deleteTask(todoId);
      if (res.success) {
        setTodos((prev) => prev.filter((t) => t.id !== todoId));
        fetchStats();
        fetchCategories();
        fetchActivity();
        showToast('Todo moved to trash');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete todo', 'error');
    }
  }, [fetchStats, fetchCategories, fetchActivity, showToast]);

  // Clear Completed Todos
  const clearCompleted = useCallback(async () => {
    const completedIds = todos.filter(t => t.status === 'completed').map(t => t.id);
    if (completedIds.length === 0) {
      showToast('No completed todos to clear', 'info');
      return;
    }
    try {
      await api.bulkAction('delete', completedIds);
      setTodos((prev) => prev.filter(t => t.status !== 'completed'));
      fetchStats();
      fetchCategories();
      fetchActivity();
      showToast(`Cleared ${completedIds.length} completed todos`);
    } catch (err) {
      showToast('Failed to clear completed todos', 'error');
    }
  }, [todos, fetchStats, fetchCategories, fetchActivity, showToast]);

  // Restore Todo from Trash
  const restoreTodo = useCallback(async (todoId) => {
    try {
      const res = await api.restoreTask(todoId);
      if (res.success) {
        setTrashTodos((prev) => prev.filter((t) => t.id !== todoId));
        fetchStats();
        fetchActivity();
        showToast('Todo restored successfully');
      }
    } catch (err) {
      showToast('Failed to restore todo', 'error');
    }
  }, [fetchStats, fetchActivity, showToast]);

  // Permanent Delete Todo
  const permanentDeleteTodo = useCallback(async (todoId) => {
    try {
      const res = await api.permanentDelete(todoId);
      if (res.success) {
        setTrashTodos((prev) => prev.filter((t) => t.id !== todoId));
        showToast('Todo permanently deleted');
      }
    } catch (err) {
      showToast('Failed to permanently delete', 'error');
    }
  }, [showToast]);

  // Reorder Todos (Drag and Drop)
  const reorderTodos = useCallback((startIndex, endIndex) => {
    setTodos((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Quick NLP Task
  const addQuickNlpTodo = useCallback(async (text) => {
    try {
      const nlpRes = await api.parseNlp(text);
      if (nlpRes.success) {
        const parsed = nlpRes.data;
        const matchedCat = categories.find(
          c => c.name.toLowerCase() === (parsed.categoryName || '').toLowerCase()
        );

        await addTodo({
          title: parsed.title,
          priority: parsed.priority || 'medium',
          category_id: matchedCat ? matchedCat.id : null,
          due_date: parsed.dueDate || null,
          status: 'pending'
        });
      }
    } catch (err) {
      showToast('Failed to parse voice/text todo', 'error');
    }
  }, [categories, addTodo, showToast]);

  // Category Actions
  const createCategory = useCallback(async (catData) => {
    try {
      const res = await api.createCategory(catData);
      if (res.success) {
        setCategories((prev) => [...prev, res.data]);
        showToast(`Category "${catData.name}" created`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  }, [showToast]);

  const deleteCategory = useCallback(async (catId) => {
    if (!window.confirm('Delete category? Assigned todos will remain intact.')) return;
    try {
      const res = await api.deleteCategory(catId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        fetchTodos();
        showToast('Category deleted');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  }, [fetchTodos, showToast]);

  // Export Data
  const exportTodos = useCallback((format = 'json') => {
    if (format === 'csv') {
      const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Recurring'];
      const rows = todos.map(t => [
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
      link.setAttribute('download', `todos_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('CSV Spreadsheet exported');
    } else {
      const exportObject = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        categories,
        todos
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `todos_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('JSON Backup exported');
    }
  }, [todos, categories, showToast]);

  // Import Data
  const importTodos = useCallback(async (importedData) => {
    const list = importedData.todos || importedData.tasks;
    if (!Array.isArray(list)) {
      showToast('Invalid backup file structure.', 'error');
      return;
    }
    try {
      setLoading(true);
      for (const t of list) {
        await api.createTask({
          title: t.title || t.text,
          description: t.description || '',
          priority: t.priority || 'medium',
          status: t.status || (t.completed ? 'completed' : 'pending'),
          due_date: t.due_date || null,
          recurring: t.recurring || 'none',
          subtasks: t.subtasks || []
        });
      }
      await fetchTodos();
      await fetchStats();
      await fetchCategories();
      showToast(`Imported ${list.length} todos successfully!`);
    } catch (err) {
      showToast('Failed to import todos', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchTodos, fetchStats, fetchCategories, showToast]);

  const value = useMemo(() => ({
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
  }), [
    todos,
    trashTodos,
    categories,
    stats,
    activityLogs,
    loading,
    searchQuery,
    filter,
    activeView,
    toast,
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
  ]);

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
