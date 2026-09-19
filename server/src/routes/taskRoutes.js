import express from 'express';
import { taskController } from '../controllers/taskController.js';

const router = express.Router();

router.get('/tasks', taskController.getAll);
router.get('/tasks/stats', taskController.getStats);
router.get('/tasks/:id', taskController.getById);
router.post('/tasks', taskController.create);
router.put('/tasks/:id', taskController.update);
router.patch('/tasks/:id/toggle', taskController.toggleStatus);
router.delete('/tasks/:id', taskController.delete);

export default router;
