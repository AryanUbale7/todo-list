const BASE_URL = '/api';

async function fetchJson(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const api = {
  // Tasks CRUD & Queries
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

  // AI & Smart Services
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

  // Stats & Activity
  async getStats() {
    return fetchJson('/tasks/stats');
  },

  async getActivityLogs() {
    return fetchJson('/tasks/activity');
  },

  // Categories
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
