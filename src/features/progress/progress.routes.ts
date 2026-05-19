import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';

import {
  completeLessonController,
  getMyProgressController,
} from './progress.controller';

export const progressRoutes = Router();

progressRoutes.use(authMiddleware);

progressRoutes.get('/me', getMyProgressController);

progressRoutes.post(
  '/lessons/:lessonId/complete',
  completeLessonController,
);