import { dbQuery } from '../db.js';
import { aiService } from '../services/aiService.js';

export const taskController = {
  // Get all active tasks with query filtering, search, and sorting
  async getAll(req, res) {
    try {
      const {
        search = '',
        status = 'all',
        category_id,
        priority = 'all',
        timeframe = 'all', // 'all', 'today', 'upcoming', 'overdue'
        sort_by = 'created_at',
        order = 'desc',
        include_deleted = 'false'
      } = req.query;

      let sql = `
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (include_deleted !== 'true') {
        sql += ` AND t.deleted_at IS NULL`;
      } else {
        sql += ` AND t.deleted_at IS NOT NULL`;
      }

      // Search filter (title or description)
      if (search && search.trim()) {
        sql += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
      }

      // Status filter
      if (status && status !== 'all') {
        sql += ` AND t.status = ?`;
        params.push(status);
      }

      // Category filter
      if (category_id && category_id !== 'all') {
        sql += ` AND t.category_id = ?`;
        params.push(Number(category_id));
      }

      // Priority filter
      if (priority && priority !== 'all') {
        sql += ` AND t.priority = ?`;
        params.push(priority);
      }

      // Timeframe filter
      const today = new Date().toISOString().split('T')[0];
      if (timeframe === 'today') {
        sql += ` AND t.due_date = ?`;
        params.push(today);
      } else if (timeframe === 'upcoming') {
        sql += ` AND t.due_date > ?`;
        params.push(today);
      } else if (timeframe === 'overdue') {
        sql += ` AND t.due_date < ? AND t.status != 'completed'`;
        params.push(today);
      }

      // Sorting
      const validSortColumns = {
        created_at: 't.created_at',
        due_date: 't.due_date IS NULL, t.due_date',
        priority: `CASE t.priority 
          WHEN 'urgent' THEN 4 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 1 
          ELSE 0 END`,
        title: 't.title'
      };

      const sortColumn = validSortColumns[sort_by] || 't.created_at';
      const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      sql += ` ORDER BY ${sortColumn} ${sortDirection}, t.id DESC`;

      const tasks = await dbQuery.all(sql, params);

      // Parse JSON subtasks safely
      const parsedTasks = tasks.map(task => ({
        ...task,
        subtasks: task.subtasks ? JSON.parse(task.subtasks) : []
      }));

      res.json({ success: true, data: parsedTasks, count: parsedTasks.length });
    } catch (error) {
      console.error('Error retrieving tasks:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve tasks' });
    }
  },

  // Get single task by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const task = await dbQuery.get(`
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `, [id]);

      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      task.subtasks = task.subtasks ? JSON.parse(task.subtasks) : [];
      res.json({ success: true, data: task });
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve task' });
    }
  },

  // Create new task
  async create(req, res) {
    try {
      const {
        title,
        description = '',
        category_id = null,
        priority = 'medium',
        status = 'pending',
        due_date = null,
        recurring = 'none',
        estimated_minutes = 0,
        subtasks = []
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Task title is required' });
      }

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const taskPriority = validPriorities.includes(priority) ? priority : 'medium';

      const validStatuses = ['pending', 'in_progress', 'completed'];
      const taskStatus = validStatuses.includes(status) ? status : 'pending';

      const completedAt = taskStatus === 'completed' ? new Date().toISOString() : null;
      const subtasksJson = JSON.stringify(Array.isArray(subtasks) ? subtasks : []);

      const result = await dbQuery.run(
        `INSERT INTO tasks (title, description, category_id, priority, status, due_date, recurring, estimated_minutes, subtasks, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          description ? description.trim() : '',
          category_id ? Number(category_id) : null,
          taskPriority,
          taskStatus,
          due_date || null,
          recurring || 'none',
          Number(estimated_minutes) || 0,
          subtasksJson,
          completedAt
        ]
      );

      // Log activity
      await dbQuery.run(
        'INSERT INTO activity_logs (task_id, action, details) VALUES (?, ?, ?)',
        [result.lastID, 'created', `Created task "${title.trim()}"`]
      );

      const created = await dbQuery.get(`
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `, [result.lastID]);

      created.subtasks = created.subtasks ? JSON.parse(created.subtasks) : [];

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: created
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ success: false, error: 'Failed to create task' });
    }
  },

  // Update an existing task
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        category_id,
        priority,
        status,
        due_date,
        recurring,
        estimated_minutes,
        time_spent_seconds,
        subtasks
      } = req.body;

      const existing = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const updatedTitle = title !== undefined ? title.trim() : existing.title;
      if (!updatedTitle) {
        return res.status(400).json({ success: false, error: 'Title cannot be empty' });
      }

      const updatedDesc = description !== undefined ? description.trim() : existing.description;
      const updatedCategoryId = category_id !== undefined ? (category_id ? Number(category_id) : null) : existing.category_id;
      const updatedPriority = priority !== undefined ? priority : existing.priority;
      const updatedStatus = status !== undefined ? status : existing.status;
      const updatedDueDate = due_date !== undefined ? (due_date || null) : existing.due_date;
      const updatedRecurring = recurring !== undefined ? recurring : (existing.recurring || 'none');
      const updatedEst = estimated_minutes !== undefined ? Number(estimated_minutes) : (existing.estimated_minutes || 0);
      const updatedTimeSpent = time_spent_seconds !== undefined ? Number(time_spent_seconds) : (existing.time_spent_seconds || 0);
      const updatedSubtasks = subtasks !== undefined ? JSON.stringify(subtasks) : existing.subtasks;

      let completedAt = existing.completed_at;
      if (status !== undefined) {
        if (status === 'completed' && existing.status !== 'completed') {
          completedAt = new Date().toISOString();
        } else if (status !== 'completed') {
          completedAt = null;
        }
      }

      const now = new Date().toISOString();

      await dbQuery.run(
        `UPDATE tasks 
         SET title = ?, description = ?, category_id = ?, priority = ?, status = ?, due_date = ?, recurring = ?, estimated_minutes = ?, time_spent_seconds = ?, subtasks = ?, completed_at = ?, updated_at = ?
         WHERE id = ?`,
        [
          updatedTitle,
          updatedDesc,
          updatedCategoryId,
          updatedPriority,
          updatedStatus,
          updatedDueDate,
          updatedRecurring,
          updatedEst,
          updatedTimeSpent,
          updatedSubtasks,
          completedAt,
          now,
          id
        ]
      );

      // Log update activity
      await dbQuery.run(
        'INSERT INTO activity_logs (task_id, action, details) VALUES (?, ?, ?)',
        [id, 'updated', `Updated task "${updatedTitle}"`]
      );

      const updated = await dbQuery.get(`
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `, [id]);

      updated.subtasks = updated.subtasks ? JSON.parse(updated.subtasks) : [];

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ success: false, error: 'Failed to update task' });
    }
  },

  // Toggle task status (completed <-> pending)
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const task = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const isCompleting = task.status !== 'completed';
      const newStatus = isCompleting ? 'completed' : 'pending';
      const completedAt = isCompleting ? new Date().toISOString() : null;
      const now = new Date().toISOString();

      let subtasks = task.subtasks ? JSON.parse(task.subtasks) : [];
      if (isCompleting && subtasks.length > 0) {
        subtasks = subtasks.map(st => ({ ...st, completed: true }));
      }

      await dbQuery.run(
        `UPDATE tasks 
         SET status = ?, completed_at = ?, subtasks = ?, updated_at = ?
         WHERE id = ?`,
        [newStatus, completedAt, JSON.stringify(subtasks), now, id]
      );

      // Log activity
      await dbQuery.run(
        'INSERT INTO activity_logs (task_id, action, details) VALUES (?, ?, ?)',
        [id, newStatus === 'completed' ? 'completed' : 'reopened', `Marked task "${task.title}" as ${newStatus}`]
      );

      const updated = await dbQuery.get(`
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `, [id]);

      updated.subtasks = updated.subtasks ? JSON.parse(updated.subtasks) : [];

      res.json({
        success: true,
        message: `Task marked as ${newStatus}`,
        data: updated
      });
    } catch (error) {
      console.error('Error toggling task status:', error);
      res.status(500).json({ success: false, error: 'Failed to toggle task status' });
    }
  },

  // Soft delete task (Move to Trash)
  async softDelete(req, res) {
    try {
      const { id } = req.params;
      const task = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const now = new Date().toISOString();
      await dbQuery.run('UPDATE tasks SET deleted_at = ? WHERE id = ?', [now, id]);

      await dbQuery.run(
        'INSERT INTO activity_logs (task_id, action, details) VALUES (?, ?, ?)',
        [id, 'deleted', `Moved task "${task.title}" to trash`]
      );

      res.json({ success: true, message: 'Task moved to trash' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ success: false, error: 'Failed to delete task' });
    }
  },

  // Restore soft-deleted task
  async restoreTask(req, res) {
    try {
      const { id } = req.params;
      const task = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      await dbQuery.run('UPDATE tasks SET deleted_at = NULL WHERE id = ?', [id]);

      await dbQuery.run(
        'INSERT INTO activity_logs (task_id, action, details) VALUES (?, ?, ?)',
        [id, 'restored', `Restored task "${task.title}" from trash`]
      );

      res.json({ success: true, message: 'Task restored successfully' });
    } catch (error) {
      console.error('Error restoring task:', error);
      res.status(500).json({ success: false, error: 'Failed to restore task' });
    }
  },

  // Permanent Delete
  async permanentDelete(req, res) {
    try {
      const { id } = req.params;
      await dbQuery.run('DELETE FROM tasks WHERE id = ?', [id]);
      res.json({ success: true, message: 'Task permanently deleted' });
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      res.status(500).json({ success: false, error: 'Failed to permanently delete task' });
    }
  },

  // Bulk Actions (Bulk complete, bulk trash, bulk restore)
  async bulkAction(req, res) {
    try {
      const { action, taskIds } = req.body;
      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ success: false, error: 'taskIds array is required' });
      }

      const placeholders = taskIds.map(() => '?').join(',');
      const now = new Date().toISOString();

      if (action === 'complete') {
        await dbQuery.run(
          `UPDATE tasks SET status = 'completed', completed_at = ?, updated_at = ? WHERE id IN (${placeholders})`,
          [now, now, ...taskIds]
        );
      } else if (action === 'delete') {
        await dbQuery.run(
          `UPDATE tasks SET deleted_at = ? WHERE id IN (${placeholders})`,
          [now, ...taskIds]
        );
      } else if (action === 'restore') {
        await dbQuery.run(
          `UPDATE tasks SET deleted_at = NULL WHERE id IN (${placeholders})`,
          [...taskIds]
        );
      } else if (action === 'permanent_delete') {
        await dbQuery.run(
          `DELETE FROM tasks WHERE id IN (${placeholders})`,
          [...taskIds]
        );
      }

      res.json({ success: true, message: `Bulk action "${action}" completed for ${taskIds.length} tasks` });
    } catch (error) {
      console.error('Error in bulk action:', error);
      res.status(500).json({ success: false, error: 'Failed to process bulk action' });
    }
  },

  // AI Subtasks Generator Endpoint
  async generateSubtasks(req, res) {
    try {
      const { title, description = '' } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Task title is required' });
      }

      const generated = aiService.generateSubtasks(title, description);
      res.json({ success: true, data: generated });
    } catch (error) {
      console.error('Error generating AI subtasks:', error);
      res.status(500).json({ success: false, error: 'Failed to generate subtasks' });
    }
  },

  // AI NLP Quick Parser
  async parseNaturalLanguage(req, res) {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: 'Text prompt is required' });
      }

      const parsed = aiService.parseNaturalLanguage(text);
      res.json({ success: true, data: parsed });
    } catch (error) {
      console.error('Error parsing text:', error);
      res.status(500).json({ success: false, error: 'Failed to parse natural language' });
    }
  },

  // Get Activity Audit Trail
  async getActivityLogs(req, res) {
    try {
      const logs = await dbQuery.all(`
        SELECT * FROM activity_logs 
        ORDER BY created_at DESC 
        LIMIT 50
      `);
      res.json({ success: true, data: logs });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch activity history' });
    }
  },

  // Get aggregated dashboard statistics
  async getStats(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const counts = await dbQuery.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status != 'completed' AND due_date < ? THEN 1 ELSE 0 END) as overdue,
          SUM(CASE WHEN due_date = ? THEN 1 ELSE 0 END) as today,
          SUM(time_spent_seconds) as total_time_spent_seconds,
          SUM(estimated_minutes) as total_estimated_minutes
        FROM tasks
        WHERE deleted_at IS NULL
      `, [today, today]);

      const priorityCounts = await dbQuery.all(`
        SELECT 
          priority, 
          COUNT(*) as count 
        FROM tasks 
        WHERE status != 'completed' AND deleted_at IS NULL
        GROUP BY priority
      `);

      const categoryCounts = await dbQuery.all(`
        SELECT 
          c.name, 
          c.color, 
          COUNT(t.id) as count 
        FROM categories c
        LEFT JOIN tasks t ON c.id = t.category_id AND t.status != 'completed' AND t.deleted_at IS NULL
        GROUP BY c.id
      `);

      const total = counts?.total || 0;
      const completed = counts?.completed || 0;
      const pending = counts?.pending || 0;
      const inProgress = counts?.in_progress || 0;
      const overdue = counts?.overdue || 0;
      const dueToday = counts?.today || 0;
      const totalTimeSpentSeconds = counts?.total_time_spent_seconds || 0;
      const totalEstimatedMinutes = counts?.total_estimated_minutes || 0;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      res.json({
        success: true,
        data: {
          total,
          completed,
          pending,
          inProgress,
          overdue,
          dueToday,
          completionRate,
          totalTimeSpentSeconds,
          totalEstimatedMinutes,
          priorityBreakdown: priorityCounts,
          categoryBreakdown: categoryCounts
        }
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
      res.status(500).json({ success: false, error: 'Failed to calculate stats' });
    }
  }
};
