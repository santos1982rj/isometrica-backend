import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { getLessonController } from './lessons.controller';

export const lessonsRoutes = Router();

lessonsRoutes.get('/:id', authMiddleware, getLessonController);