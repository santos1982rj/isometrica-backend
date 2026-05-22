import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';

import {
  attemptExerciseController,
  getLessonExercisesController,
} from './exercises.controller';

const exercisesRoutes = Router();

exercisesRoutes.get(
  '/lessons/:lessonId/exercises',
  authMiddleware,
  getLessonExercisesController,
);

exercisesRoutes.post(
  '/exercises/:exerciseId/attempt',
  authMiddleware,
  attemptExerciseController,
);

export { exercisesRoutes };