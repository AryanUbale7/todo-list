# 📡 TaskPulse REST API Specification

TaskPulse exposes a RESTful JSON API on port `5000` (prefixed with `/api`).

---

## Base URL
```text
http://localhost:5000/api
```

---

## Endpoints Reference

### 1. Health Check
- **`GET /api/health`**
  - **Response `200 OK`**:
    ```json
    {
      "status": "healthy",
      "uptime": 124.5,
      "timestamp": "2026-09-19T10:45:00.000Z",
      "service": "TaskPulse Enterprise API v2.0"
    }
    ```

---

### 2. Task Endpoints

#### `GET /api/tasks`
Fetch tasks matching filter criteria.
- **Query Parameters:**
  - `search` (string): Keyword matching in title or description.
  - `status` (string): `all` | `pending` | `in_progress` | `completed`.
  - `category_id` (number): Filter by category ID.
  - `priority` (string): `all` | `low` | `medium` | `high` | `urgent`.
  - `timeframe` (string): `all` | `today` | `upcoming` | `overdue`.
  - `sort_by` (string): `created_at` | `due_date` | `priority` | `title`.
  - `order` (string): `asc` | `desc`.
  - `include_deleted` (boolean): `true` to fetch trash items.

#### `POST /api/tasks`
Create a new task.
- **Request Body:**
  ```json
  {
    "title": "Launch Marketing Campaign",
    "description": "Coordinate social ads and email blasts",
    "category_id": 1,
    "priority": "high",
    "status": "pending",
    "due_date": "2026-09-25",
    "recurring": "none",
    "estimated_minutes": 45,
    "subtasks": [
      { "id": "1", "title": "Finalize copy", "completed": false }
    ]
  }
  ```

#### `PUT /api/tasks/:id`
Update an existing task.

#### `PATCH /api/tasks/:id/toggle`
Toggle task completion status between `completed` and `pending`.

#### `PATCH /api/tasks/:id/restore`
Restore a soft-deleted task from trash.

#### `DELETE /api/tasks/:id`
Soft-delete task (move to Trash Bin).

#### `DELETE /api/tasks/:id/permanent`
Permanently delete task.

#### `POST /api/tasks/bulk`
Perform bulk operations on multiple tasks.
- **Request Body:**
  ```json
  {
    "action": "complete" | "delete" | "restore" | "permanent_delete",
    "taskIds": [1, 2, 3]
  }
  ```

---

### 3. AI & Smart Assistant Endpoints

#### `POST /api/tasks/ai-subtasks`
Intelligently decompose a task goal into subtasks.
- **Request Body:**
  ```json
  {
    "title": "Deploy microservice to Kubernetes",
    "description": "Production cluster release"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      { "id": "st-1", "title": "Run automated tests & verify build", "completed": false, "estimated_minutes": 10 },
      { "id": "st-2", "title": "Review environment configuration & secrets", "completed": false, "estimated_minutes": 5 },
      { "id": "st-3", "title": "Deploy to production/staging server", "completed": false, "estimated_minutes": 15 },
      { "id": "st-4", "title": "Perform post-deployment health check", "completed": false, "estimated_minutes": 10 }
    ]
  }
  ```

#### `POST /api/tasks/parse-nlp`
Parse natural language text into task fields.
- **Request Body:**
  ```json
  {
    "text": "Finish presentation slides by tomorrow !urgent #Work"
  }
  ```

---

### 4. Metrics & Activity Endpoints

#### `GET /api/tasks/stats`
Returns aggregated productivity metrics, completion rates, and breakdown charts.

#### `GET /api/tasks/activity`
Returns the recent 50 activity audit logs.
