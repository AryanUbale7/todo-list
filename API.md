# 📖 FocusList Client API & Storage Schema Specification

FocusList operates on a clean, repository-pattern client-side storage architecture. This specification outlines all programmatic interfaces, data contracts, and LocalStorage keys.

---

## 🔑 Storage Schema & Keys

| Storage Key | Type | Description |
|---|---|---|
| `focuslist_tasks` | `Array<Task>` | Collection of all active and soft-deleted tasks |
| `focuslist_categories` | `Array<Category>` | User defined tags/categories |
| `focuslist_activity` | `Array<ActivityLog>` | Audit trail of task operations |
| `focuslist_theme` | `string` (`"dark"` \| `"light"`) | User theme preference |

---

## 📋 Data Entity Contracts

### 1. `Task` Entity
```typescript
interface Task {
  id: number | string;
  title: string;
  description?: string;
  category_id?: number | null;
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string | null; // ISO 8601 YYYY-MM-DD
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  estimated_minutes?: number;
  time_spent_seconds?: number;
  created_at: string; // ISO 8601 UTC timestamp
  updated_at?: string;
  completed_at?: string | null;
  deleted_at?: string | null; // Nullable for soft-delete
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}
```

### 2. `Category` Entity
```typescript
interface Category {
  id: number;
  name: string;
  color: string; // Hex color code e.g. #3b82f6
  icon: string; // Icon identifier key e.g. "briefcase"
  task_count?: number;
}
```

---

## 🛠️ Storage Service Methods (`storageService.js`)

### `getTasks(): Array<Task>`
Retrieves all persisted tasks from `localStorage` with fallback to default seeded tasks if empty.

### `saveTasks(tasks: Array<Task>): boolean`
Serializes and persists the task list to `localStorage`.

### `getCategories(): Array<Category>`
Retrieves all categories.

### `saveCategories(categories: Array<Category>): boolean`
Persists categories.

### `logActivity(action: string, details: string): ActivityLog`
Appends an action event to the client-side audit history.

---

## 🔍 Filter & Query Parameters

| Parameter | Type | Allowed Values |
|---|---|---|
| `search` | `string` | Free text keyword match on title or description |
| `status` | `string` | `'all'`, `'pending'`, `'in_progress'`, `'completed'` |
| `priority` | `string` | `'all'`, `'low'`, `'medium'`, `'high'`, `'urgent'` |
| `timeframe` | `string` | `'all'`, `'today'`, `'upcoming'`, `'overdue'` |
| `sortBy` | `string` | `'created_at'`, `'due_date'`, `'priority'`, `'title'` |
| `order` | `string` | `'asc'`, `'desc'` |
