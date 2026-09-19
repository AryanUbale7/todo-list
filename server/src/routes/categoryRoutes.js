import express from 'express';
import { categoryController } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/categories', categoryController.getAll);
router.post('/categories', categoryController.create);
router.delete('/categories/:id', categoryController.delete);

export default router;
