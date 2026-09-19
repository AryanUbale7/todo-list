import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and SQLite DB path
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'taskpulse.sqlite');
const verboseSqlite = sqlite3.verbose();
const db = new verboseSqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Promise wrapper utilities for SQLite operations
export const dbQuery = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize schema and seed data
export async function initializeDatabase() {
  await dbQuery.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      icon TEXT DEFAULT 'tag',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category_id INTEGER,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      due_date TEXT DEFAULT NULL,
      subtasks TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME DEFAULT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // Check if categories need seeding
  const existingCategories = await dbQuery.all('SELECT COUNT(*) as count FROM categories');
  if (existingCategories[0].count === 0) {
    console.log('Seeding initial categories...');
    const defaultCategories = [
      { name: 'Work', color: '#3b82f6', icon: 'briefcase' },
      { name: 'Personal', color: '#10b981', icon: 'user' },
      { name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart' },
      { name: 'Health', color: '#ef4444', icon: 'heart' },
      { name: 'Projects', color: '#8b5cf6', icon: 'folder-kanban' }
    ];

    for (const cat of defaultCategories) {
      await dbQuery.run(
        'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [cat.name, cat.color, cat.icon]
      );
    }
  }

  // Check if tasks need seeding
  const existingTasks = await dbQuery.all('SELECT COUNT(*) as count FROM tasks');
  if (existingTasks[0].count === 0) {
    console.log('Seeding initial sample tasks...');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const sampleTasks = [
      {
        title: 'Review quarterly project deliverables',
        description: 'Prepare executive summary slides and review team sprint velocity.',
        category_id: 1, // Work
        priority: 'high',
        status: 'pending',
        due_date: today,
        subtasks: JSON.stringify([
          { id: '1', title: 'Gather sprint metrics', completed: true },
          { id: '2', title: 'Draft presentation slides', completed: false },
          { id: '3', title: 'Share with engineering lead', completed: false }
        ])
      },
      {
        title: 'Complete daily 30-minute cardio workout',
        description: 'Morning running session or cycling.',
        category_id: 4, // Health
        priority: 'medium',
        status: 'completed',
        due_date: today,
        completed_at: new Date().toISOString(),
        subtasks: JSON.stringify([
          { id: '1', title: '10 min warm-up', completed: true },
          { id: '2', title: '20 min HIIT run', completed: true }
        ])
      },
      {
        title: 'Design high-converting landing page mockups',
        description: 'Create interactive Figma wireframes and responsive mobile layouts.',
        category_id: 5, // Projects
        priority: 'urgent',
        status: 'in_progress',
        due_date: tomorrow,
        subtasks: JSON.stringify([
          { id: '1', title: 'Hero section typography', completed: true },
          { id: '2', title: 'Feature grid component', completed: false }
        ])
      },
      {
        title: 'Buy groceries & weekly meal prep items',
        description: 'Fresh vegetables, oats, almond milk, and Greek yogurt.',
        category_id: 3, // Shopping
        priority: 'low',
        status: 'pending',
        due_date: null,
        subtasks: JSON.stringify([])
      }
    ];

    for (const task of sampleTasks) {
      await dbQuery.run(
        `INSERT INTO tasks (title, description, category_id, priority, status, due_date, subtasks, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.title,
          task.description,
          task.category_id,
          task.priority,
          task.status,
          task.due_date,
          task.subtasks,
          task.completed_at || null
        ]
      );
    }
  }

  console.log('Database initialization & seeding complete.');
}

export default db;
