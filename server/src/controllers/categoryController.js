import { dbQuery } from '../db.js';

export const categoryController = {
  // Get all categories with task counts
  async getAll(req, res) {
    try {
      const categories = await dbQuery.all(`
        SELECT 
          c.id, 
          c.name, 
          c.color, 
          c.icon, 
          c.created_at,
          COUNT(t.id) as task_count,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_task_count
        FROM categories c
        LEFT JOIN tasks t ON c.id = t.category_id
        GROUP BY c.id
        ORDER BY c.name ASC
      `);
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
    }
  },

  // Create new category
  async create(req, res) {
    try {
      const { name, color = '#3b82f6', icon = 'tag' } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Category name is required' });
      }

      const trimmedName = name.trim();
      const existing = await dbQuery.get('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [trimmedName]);
      if (existing) {
        return res.status(409).json({ success: false, error: 'Category already exists' });
      }

      const result = await dbQuery.run(
        'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [trimmedName, color, icon]
      );

      const newCategory = await dbQuery.get('SELECT * FROM categories WHERE id = ?', [result.lastID]);
      res.status(201).json({ success: true, data: { ...newCategory, task_count: 0, completed_task_count: 0 } });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, error: 'Failed to create category' });
    }
  },

  // Delete category
  async delete(req, res) {
    try {
      const { id } = req.params;
      const category = await dbQuery.get('SELECT * FROM categories WHERE id = ?', [id]);
      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }

      await dbQuery.run('DELETE FROM categories WHERE id = ?', [id]);
      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, error: 'Failed to delete category' });
    }
  }
};
