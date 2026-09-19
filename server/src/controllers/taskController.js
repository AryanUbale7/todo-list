import { dbQuery } from '../db.js';

export const taskController = {
  // Get all tasks with query filtering, search, and sorting
  async getAll(req, res) {
    try {
      const {
        search = '',
        status = 'all',
        category_id,
        priority = 'all',
        timeframe = 'all', // 'all', 'today', 'upcoming', 'overdue'
        sort_by = 'created_at', // 'created_at', 'due_date', 'priority', 'title'
        order = 'desc'
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

      // For priority sorting, adjust direction properly
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
        `INSERT INTO tasks (title, description, category_id, priority, status, due_date, subtasks, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          description ? description.trim() : '',
          category_id ? Number(category_id) : null,
          taskPriority,
          taskStatus,
          due_date || null,
          subtasksJson,
          completedAt
        ]
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
         SET title = ?, description = ?, category_id = ?, priority = ?, status = ?, due_date = ?, subtasks = ?, completed_at = ?, updated_at = ?
         WHERE id = ?`,
        [
          updatedTitle,
          updatedDesc,
          updatedCategoryId,
          updatedPriority,
          updatedStatus,
          updatedDueDate,
          updatedSubtasks,
          completedAt,
          now,
          id
        ]
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

      // If completing, also mark all subtasks as completed if any exist
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

  // Delete task
  async delete(req, res) {
    try {
      const { id } = req.params;
      const task = await dbQuery.get('SELECT id FROM tasks WHERE id = ?', [id]);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      await dbQuery.run('DELETE FROM tasks WHERE id = ?', [id]);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ success: false, error: 'Failed to delete task' });
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
          SUM(CASE WHEN due_date = ? THEN 1 ELSE 0 END) as today
        FROM tasks
      `, [today, today]);

      const priorityCounts = await dbQuery.all(`
        SELECT 
          priority, 
          COUNT(*) as count 
        FROM tasks 
        WHERE status != 'completed'
        GROUP BY priority
      `);

      const categoryCounts = await dbQuery.all(`
        SELECT 
          c.name, 
          c.color, 
          COUNT(t.id) as count 
        FROM categories c
        LEFT JOIN tasks t ON c.id = t.category_id AND t.status != 'completed'
        GROUP BY c.id
      `);

      const total = counts.total || 0;
      const completed = counts.completed || 0;
      const pending = counts.pending || 0;
      const inProgress = counts.in_progress || 0;
      const overdue = counts.overdue || 0;
      const dueToday = counts.today || 0;
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
