import express from 'express';
import { taskController } from '../controllers/taskController.js';

const router = express.Router();

// Tasks Query & CRUD
router.get('/tasks', taskController.getAll);
router.get('/tasks/stats', taskController.getStats);
router.get('/tasks/activity', taskController.getActivityLogs);
router.get('/tasks/:id', taskController.getById);
router.post('/tasks', taskController.create);
router.put('/tasks/:id', taskController.update);
router.patch('/tasks/:id/toggle', taskController.toggleStatus);
router.patch('/tasks/:id/restore', taskController.restoreTask);
router.delete('/tasks/:id', taskController.softDelete);
router.delete('/tasks/:id/permanent', taskController.permanentDelete);

// Bulk Operations
router.post('/tasks/bulk', taskController.bulkAction);

// AI & Smart Helpers
router.post('/tasks/ai-subtasks', taskController.generateSubtasks);
router.post('/tasks/parse-nlp', taskController.parseNaturalLanguage);

export default router;
