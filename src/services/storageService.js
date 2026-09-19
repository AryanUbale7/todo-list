/**
 * FocusList Storage Service & Repository Pattern
 * Provides complete client-side persistent storage using browser localStorage.
 */

export const STORAGE_KEYS = {
  TASKS: 'focuslist_tasks',
  CATEGORIES: 'focuslist_categories',
  ACTIVITY: 'focuslist_activity',
  THEME: 'focuslist_theme'
};

export const defaultCategories = [
  { id: 1, name: 'Work', color: '#3b82f6', icon: 'briefcase', task_count: 1 },
  { id: 2, name: 'Personal', color: '#10b981', icon: 'user', task_count: 0 },
  { id: 3, name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart', task_count: 1 },
  { id: 4, name: 'Health', color: '#ef4444', icon: 'heart', task_count: 1 },
  { id: 5, name: 'Projects', color: '#8b5cf6', icon: 'folder-kanban', task_count: 1 }
];

export const defaultTasks = [
  {
    id: 1,
    title: 'Review quarterly product strategy & OKRs',
    description: 'Prepare executive summary slides and review team velocity metrics.',
    category_id: 1,
    category_name: 'Work',
    category_color: '#3b82f6',
    category_icon: 'briefcase',
    priority: 'high',
    status: 'pending',
    due_date: new Date().toISOString().split('T')[0],
    recurring: 'none',
    estimated_minutes: 45,
    time_spent_seconds: 0,
    created_at: new Date().toISOString(),
    deleted_at: null,
    subtasks: [
      { id: '1', title: 'Gather sprint metrics', completed: true },
      { id: '2', title: 'Draft presentation slides', completed: false },
      { id: '3', title: 'Share with engineering lead', completed: false }
    ]
  },
  {
    id: 2,
    title: 'Complete daily 30-minute cardio & strength workout',
    description: 'Morning running session or cycling.',
    category_id: 4,
    category_name: 'Health',
    category_color: '#ef4444',
    category_icon: 'heart',
    priority: 'medium',
    status: 'completed',
    due_date: new Date().toISOString().split('T')[0],
    recurring: 'daily',
    estimated_minutes: 30,
    time_spent_seconds: 1800,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    deleted_at: null,
    subtasks: [
      { id: '1', title: '10 min warm-up', completed: true },
      { id: '2', title: '20 min HIIT run', completed: true }
    ]
  },
  {
    id: 3,
    title: 'Design responsive UI components in Figma',
    description: 'Create interactive dark/light wireframes and mobile layouts.',
    category_id: 5,
    category_name: 'Projects',
    category_color: '#8b5cf6',
    category_icon: 'folder-kanban',
    priority: 'urgent',
    status: 'in_progress',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    recurring: 'none',
    estimated_minutes: 60,
    time_spent_seconds: 900,
    created_at: new Date().toISOString(),
    deleted_at: null,
    subtasks: [
      { id: '1', title: 'Hero section typography', completed: true },
      { id: '2', title: 'Feature grid component', completed: false }
    ]
  },
  {
    id: 4,
    title: 'Buy fresh groceries & weekly meal prep ingredients',
    description: 'Organic vegetables, oats, almond milk, and Greek yogurt.',
    category_id: 3,
    category_name: 'Shopping',
    category_color: '#f59e0b',
    category_icon: 'shopping-cart',
    priority: 'low',
    status: 'pending',
    due_date: null,
    recurring: 'weekly',
    estimated_minutes: 25,
    time_spent_seconds: 0,
    created_at: new Date().toISOString(),
    deleted_at: null,
    subtasks: []
  }
];

export const storageService = {
  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(defaultTasks));
        return defaultTasks;
      }
      return JSON.parse(data);
    } catch {
      return defaultTasks;
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch {
      return false;
    }
  },

  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
        return defaultCategories;
      }
      return JSON.parse(data);
    } catch {
      return defaultCategories;
    }
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch {
      return false;
    }
  },

  getActivity() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  logActivity(action, details) {
    try {
      const list = this.getActivity();
      const entry = {
        id: Date.now(),
        action,
        details,
        created_at: new Date().toISOString()
      };
      list.unshift(entry);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(list.slice(0, 50)));
      return entry;
    } catch {
      return null;
    }
  }
};
