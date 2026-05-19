import { Router } from 'express';

import {
  getCourseBySlugController,
  listCoursesController,
} from './courses.controller';

export const coursesRoutes = Router();

coursesRoutes.get('/', listCoursesController);
coursesRoutes.get('/:slug', getCourseBySlugController);