import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';

import {
  completeLessonController,
  getMyProgressController,
  updateLessonNotesController,
  updateLessonWatchTimeController,
} from './progress.controller';

export const progressRoutes = Router();

progressRoutes.use(authMiddleware);

progressRoutes.get('/me', getMyProgressController);

progressRoutes.post(
  '/lessons/:lessonId/complete',
  completeLessonController,
);

progressRoutes.post(
  '/lessons/:lessonId/watch-time',
  updateLessonWatchTimeController,
);

progressRoutes.post(
  '/lessons/:lessonId/notes',
  updateLessonNotesController,
);
