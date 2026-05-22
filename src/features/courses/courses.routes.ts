import { Router } from 'express';

import {
  enrollFreeCourseController,
  getCourseBySlugController,
  listCoursesController,
} from './courses.controller';
import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { optionalAuthMiddleware } from '../../core/middlewares/optionalAuthMiddleware';

export const coursesRoutes = Router();

coursesRoutes.get('/', optionalAuthMiddleware, listCoursesController);
coursesRoutes.post('/:courseId/enroll', authMiddleware, enrollFreeCourseController);
coursesRoutes.get('/:slug', optionalAuthMiddleware, getCourseBySlugController);
