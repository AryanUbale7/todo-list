const BASE_URL = '/api';

// Fallback LocalStorage data store for static hosts (e.g., Vercel static deployments)
const STORAGE_KEY_TASKS = 'taskpulse_local_tasks';
const STORAGE_KEY_CATEGORIES = 'taskpulse_local_categories';
const STORAGE_KEY_ACTIVITY = 'taskpulse_local_activity';

const defaultCategories = [
  { id: 1, name: 'Work', color: '#3b82f6', icon: 'briefcase', task_count: 1 },
  { id: 2, name: 'Personal', color: '#10b981', icon: 'user', task_count: 0 },
  { id: 3, name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart', task_count: 1 },
  { id: 4, name: 'Health', color: '#ef4444', icon: 'heart', task_count: 1 },
  { id: 5, name: 'Projects', color: '#8b5cf6', icon: 'folder-kanban', task_count: 1 }
];

const defaultTasks = [
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

function getLocalTasks() {
  const data = localStorage.getItem(STORAGE_KEY_TASKS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(defaultTasks));
    return defaultTasks;
  }
  return JSON.parse(data);
}

function saveLocalTasks(tasks) {
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
}

function getLocalCategories() {
  const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
    return defaultCategories;
  }
  return JSON.parse(data);
}

function saveLocalCategories(categories) {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
}

function getLocalActivity() {
  const data = localStorage.getItem(STORAGE_KEY_ACTIVITY);
  return data ? JSON.parse(data) : [];
}

function logLocalActivity(action, details) {
  const list = getLocalActivity();
  const entry = {
    id: Date.now(),
    action,
    details,
    created_at: new Date().toISOString()
  };
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(list.slice(0, 50)));
}

async function fetchJson(endpoint, options = {}) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    // Graceful fallback to client-side storage
    return handleClientFallback(endpoint, options);
  }
}

function handleClientFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // GET /tasks
  if (endpoint.startsWith('/tasks') && method === 'GET') {
    if (endpoint.includes('/stats')) {
      const allTasks = getLocalTasks().filter(t => !t.deleted_at);
      const completed = allTasks.filter(t => t.status === 'completed').length;
      const total = allTasks.length;
      const today = new Date().toISOString().split('T')[0];
      const overdue = allTasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < today).length;
      const dueToday = allTasks.filter(t => t.due_date === today).length;
      const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
      const pending = allTasks.filter(t => t.status === 'pending').length;

      return {
        success: true,
        data: {
          total,
          completed,
          pending,
          inProgress,
          overdue,
          dueToday,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          totalTimeSpentSeconds: allTasks.reduce((a, t) => a + (t.time_spent_seconds || 0), 0),
          totalEstimatedMinutes: allTasks.reduce((a, t) => a + (t.estimated_minutes || 0), 0),
          priorityBreakdown: [
            { priority: 'urgent', count: allTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length },
            { priority: 'high', count: allTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length },
            { priority: 'medium', count: allTasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length },
            { priority: 'low', count: allTasks.filter(t => t.priority === 'low' && t.status !== 'completed').length },
          ],
          categoryBreakdown: getLocalCategories().map(c => ({
            name: c.name,
            color: c.color,
            count: allTasks.filter(t => t.category_id === c.id && t.status !== 'completed').length
          }))
        }
      };
    }

    if (endpoint.includes('/activity')) {
      return { success: true, data: getLocalActivity() };
    }

    // Filter tasks
    const searchParams = new URLSearchParams(endpoint.split('?')[1] || '');
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    const status = searchParams.get('status');
    const categoryId = searchParams.get('category_id');
    const priority = searchParams.get('priority');
    const timeframe = searchParams.get('timeframe');
    const search = (searchParams.get('search') || '').toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    let list = getLocalTasks();
    if (includeDeleted) {
      list = list.filter(t => Boolean(t.deleted_at));
    } else {
      list = list.filter(t => !t.deleted_at);
    }

    if (search) {
      list = list.filter(t => (t.title && t.title.toLowerCase().includes(search)) || (t.description && t.description.toLowerCase().includes(search)));
    }
    if (status && status !== 'all') {
      list = list.filter(t => t.status === status);
    }
    if (categoryId && categoryId !== 'all') {
      list = list.filter(t => String(t.category_id) === String(categoryId));
    }
    if (priority && priority !== 'all') {
      list = list.filter(t => t.priority === priority);
    }
    if (timeframe === 'today') {
      list = list.filter(t => t.due_date === today);
    } else if (timeframe === 'upcoming') {
      list = list.filter(t => t.due_date && t.due_date > today);
    } else if (timeframe === 'overdue') {
      list = list.filter(t => t.due_date && t.due_date < today && t.status !== 'completed');
    }

    return { success: true, data: list, count: list.length };
  }

  // POST /tasks
  if (endpoint === '/tasks' && method === 'POST') {
    const tasks = getLocalTasks();
    const cats = getLocalCategories();
    const cat = cats.find(c => c.id === Number(body.category_id));
    const newTask = {
      id: Date.now(),
      title: body.title,
      description: body.description || '',
      category_id: body.category_id || null,
      category_name: cat?.name || null,
      category_color: cat?.color || null,
      category_icon: cat?.icon || null,
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      due_date: body.due_date || null,
      recurring: body.recurring || 'none',
      estimated_minutes: Number(body.estimated_minutes) || 0,
      time_spent_seconds: 0,
      subtasks: body.subtasks || [],
      created_at: new Date().toISOString(),
      completed_at: body.status === 'completed' ? new Date().toISOString() : null,
      deleted_at: null
    };
    tasks.unshift(newTask);
    saveLocalTasks(tasks);
    logLocalActivity('created', `Created task "${newTask.title}"`);
    return { success: true, data: newTask, message: 'Task created successfully' };
  }

  // PUT /tasks/:id
  if (endpoint.startsWith('/tasks/') && method === 'PUT') {
    const id = Number(endpoint.split('/')[2]);
    let tasks = getLocalTasks();
    const cats = getLocalCategories();
    const cat = cats.find(c => c.id === Number(body.category_id));

    tasks = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...body,
          category_name: cat ? cat.name : t.category_name,
          category_color: cat ? cat.color : t.category_color,
          category_icon: cat ? cat.icon : t.category_icon,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });
    saveLocalTasks(tasks);
    const updated = tasks.find(t => t.id === id);
    logLocalActivity('updated', `Updated task "${updated?.title}"`);
    return { success: true, data: updated, message: 'Task updated successfully' };
  }

  // PATCH /tasks/:id/toggle
  if (endpoint.includes('/toggle') && method === 'PATCH') {
    const id = Number(endpoint.split('/')[2]);
    let tasks = getLocalTasks();
    let toggledItem = null;

    tasks = tasks.map(t => {
      if (t.id === id) {
        const isFinishing = t.status !== 'completed';
        toggledItem = {
          ...t,
          status: isFinishing ? 'completed' : 'pending',
          completed_at: isFinishing ? new Date().toISOString() : null,
          subtasks: isFinishing && t.subtasks ? t.subtasks.map(s => ({ ...s, completed: true })) : t.subtasks
        };
        return toggledItem;
      }
      return t;
    });
    saveLocalTasks(tasks);
    logLocalActivity(toggledItem?.status === 'completed' ? 'completed' : 'reopened', `Marked task "${toggledItem?.title}" as ${toggledItem?.status}`);
    return { success: true, data: toggledItem, message: `Task marked as ${toggledItem?.status}` };
  }

  // DELETE /tasks/:id (Soft Delete)
  if (endpoint.startsWith('/tasks/') && method === 'DELETE' && !endpoint.includes('/permanent')) {
    const id = Number(endpoint.split('/')[2]);
    let tasks = getLocalTasks();
    const target = tasks.find(t => t.id === id);
    tasks = tasks.map(t => (t.id === id ? { ...t, deleted_at: new Date().toISOString() } : t));
    saveLocalTasks(tasks);
    logLocalActivity('deleted', `Moved task "${target?.title}" to trash`);
    return { success: true, message: 'Task moved to trash' };
  }

  // PATCH /tasks/:id/restore
  if (endpoint.includes('/restore') && method === 'PATCH') {
    const id = Number(endpoint.split('/')[2]);
    let tasks = getLocalTasks();
    const target = tasks.find(t => t.id === id);
    tasks = tasks.map(t => (t.id === id ? { ...t, deleted_at: null } : t));
    saveLocalTasks(tasks);
    logLocalActivity('restored', `Restored task "${target?.title}" from trash`);
    return { success: true, message: 'Task restored' };
  }

  // DELETE /tasks/:id/permanent
  if (endpoint.includes('/permanent') && method === 'DELETE') {
    const id = Number(endpoint.split('/')[2]);
    let tasks = getLocalTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveLocalTasks(tasks);
    return { success: true, message: 'Task permanently deleted' };
  }

  // POST /tasks/bulk
  if (endpoint === '/tasks/bulk' && method === 'POST') {
    const { action, taskIds } = body;
    let tasks = getLocalTasks();
    if (action === 'complete') {
      tasks = tasks.map(t => taskIds.includes(t.id) ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t);
    } else if (action === 'delete') {
      tasks = tasks.map(t => taskIds.includes(t.id) ? { ...t, deleted_at: new Date().toISOString() } : t);
    } else if (action === 'restore') {
      tasks = tasks.map(t => taskIds.includes(t.id) ? { ...t, deleted_at: null } : t);
    } else if (action === 'permanent_delete') {
      tasks = tasks.filter(t => !taskIds.includes(t.id));
    }
    saveLocalTasks(tasks);
    return { success: true, message: `Bulk ${action} completed` };
  }

  // AI Subtasks Breakdown Fallback
  if (endpoint === '/tasks/ai-subtasks') {
    const title = (body.title || '').toLowerCase();
    let generated = [
      { id: 'st-1', title: `Define requirements & setup plan for ${body.title}`, completed: false, estimated_minutes: 10 },
      { id: 'st-2', title: `Execute core deliverable for ${body.title}`, completed: false, estimated_minutes: 25 },
      { id: 'st-3', title: `Review output for quality and completeness`, completed: false, estimated_minutes: 10 },
      { id: 'st-4', title: `Finalize and publish results`, completed: false, estimated_minutes: 5 }
    ];

    if (title.includes('design') || title.includes('ui') || title.includes('wireframe')) {
      generated = [
        { id: 'st-1', title: 'Research design patterns & typography', completed: false, estimated_minutes: 15 },
        { id: 'st-2', title: 'Create interactive wireframe components', completed: false, estimated_minutes: 30 },
        { id: 'st-3', title: 'Test mobile responsiveness and contrast', completed: false, estimated_minutes: 15 }
      ];
    } else if (title.includes('deploy') || title.includes('release') || title.includes('build')) {
      generated = [
        { id: 'st-1', title: 'Run automated unit & build tests', completed: false, estimated_minutes: 10 },
        { id: 'st-2', title: 'Configure environment variables & secrets', completed: false, estimated_minutes: 5 },
        { id: 'st-3', title: 'Deploy build & verify health endpoints', completed: false, estimated_minutes: 15 }
      ];
    }
    return { success: true, data: generated };
  }

  // NLP Parse Fallback
  if (endpoint === '/tasks/parse-nlp') {
    let clean = body.text || '';
    let priority = 'medium';
    let categoryName = null;
    let dueDate = null;

    if (/!urgent/i.test(clean)) { priority = 'urgent'; clean = clean.replace(/!urgent/i, ''); }
    else if (/!high/i.test(clean)) { priority = 'high'; clean = clean.replace(/!high/i, ''); }
    else if (/!low/i.test(clean)) { priority = 'low'; clean = clean.replace(/!low/i, ''); }

    const catMatch = clean.match(/#(\w+)/);
    if (catMatch) { categoryName = catMatch[1]; clean = clean.replace(/#\w+/, ''); }

    const today = new Date();
    if (/\btoday\b/i.test(clean)) {
      dueDate = today.toISOString().split('T')[0];
      clean = clean.replace(/\b(by\s+)?today\b/i, '');
    } else if (/\btomorrow\b/i.test(clean)) {
      const tomorrow = new Date(today.getTime() + 86400000);
      dueDate = tomorrow.toISOString().split('T')[0];
      clean = clean.replace(/\b(by\s+)?tomorrow\b/i, '');
    }

    return {
      success: true,
      data: {
        title: clean.replace(/\s+/g, ' ').trim(),
        priority,
        categoryName,
        dueDate
      }
    };
  }

  // GET /categories
  if (endpoint === '/categories' && method === 'GET') {
    return { success: true, data: getLocalCategories() };
  }

  // POST /categories
  if (endpoint === '/categories' && method === 'POST') {
    const cats = getLocalCategories();
    const newCat = {
      id: Date.now(),
      name: body.name,
      color: body.color || '#3b82f6',
      icon: body.icon || 'tag',
      task_count: 0
    };
    cats.push(newCat);
    saveLocalCategories(cats);
    return { success: true, data: newCat };
  }

  // DELETE /categories/:id
  if (endpoint.startsWith('/categories/') && method === 'DELETE') {
    const id = Number(endpoint.split('/')[2]);
    let cats = getLocalCategories();
    cats = cats.filter(c => c.id !== id);
    saveLocalCategories(cats);
    return { success: true, message: 'Category deleted' };
  }

  return { success: true, data: [] };
}

export const api = {
  async getTasks(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson(`/tasks${query}`);
  },

  async getTask(id) {
    return fetchJson(`/tasks/${id}`);
  },

  async createTask(taskData) {
    return fetchJson('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(id, taskData) {
    return fetchJson(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async toggleTask(id) {
    return fetchJson(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async deleteTask(id) {
    return fetchJson(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async restoreTask(id) {
    return fetchJson(`/tasks/${id}/restore`, {
      method: 'PATCH',
    });
  },

  async permanentDelete(id) {
    return fetchJson(`/tasks/${id}/permanent`, {
      method: 'DELETE',
    });
  },

  async bulkAction(action, taskIds) {
    return fetchJson('/tasks/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, taskIds }),
    });
  },

  async generateAiSubtasks(title, description = '') {
    return fetchJson('/tasks/ai-subtasks', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  async parseNlp(text) {
    return fetchJson('/tasks/parse-nlp', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async getStats() {
    return fetchJson('/tasks/stats');
  },

  async getActivityLogs() {
    return fetchJson('/tasks/activity');
  },

  async getCategories() {
    return fetchJson('/categories');
  },

  async createCategory(categoryData) {
    return fetchJson('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  async deleteCategory(id) {
    return fetchJson(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
};
