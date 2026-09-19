import express from 'express';
import { taskController } from '../controllers/taskController.js';

const router = express.Router();

// Todos Query & CRUD
router.get('/todos', taskController.getAll);
router.get('/todos/stats', taskController.getStats);
router.get('/todos/activity', taskController.getActivityLogs);
router.get('/todos/:id', taskController.getById);
router.post('/todos', taskController.create);
router.put('/todos/:id', taskController.update);
router.patch('/todos/:id/toggle', taskController.toggleStatus);
router.patch('/todos/:id/restore', taskController.restoreTask);
router.delete('/todos/:id', taskController.softDelete);
router.delete('/todos/:id/permanent', taskController.permanentDelete);

// Bulk Operations
router.post('/todos/bulk', taskController.bulkAction);

// AI & Smart Helpers
router.post('/todos/ai-subtasks', taskController.generateSubtasks);
router.post('/todos/parse-nlp', taskController.parseNaturalLanguage);

export default router;
