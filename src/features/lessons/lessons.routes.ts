import { Router } from 'express';

import { optionalAuthMiddleware } from '../../core/middlewares/optionalAuthMiddleware';
import { getLessonController } from './lessons.controller';

export const lessonsRoutes = Router();

lessonsRoutes.get('/:id', optionalAuthMiddleware, getLessonController);
