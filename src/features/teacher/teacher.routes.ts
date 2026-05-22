import { Role } from '@prisma/client';
import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { authorize } from '../../core/middlewares/authorize';
import { validateRequest } from '../../core/middlewares/validateRequest';

import {
  createManagedCourseController,
  createManagedExerciseController,
  createManagedLessonController,
  createManagedModuleController,
  deleteManagedCourseController,
  deleteManagedLessonController,
  deleteManagedModuleController,
  getTeacherKpisController,
  listManagedCoursesController,
  updateManagedCourseController,
  updateManagedLessonController,
  updateManagedModuleController,
} from './teacher.controller';
import {
  courseManagementSchema,
  exerciseManagementSchema,
  lessonManagementSchema,
  moduleManagementSchema,
} from './teacher.schema';

export const teacherRoutes = Router();

teacherRoutes.use(
  authMiddleware,
  authorize([Role.PROFESSOR, Role.ADMIN]),
);

teacherRoutes.get('/courses', listManagedCoursesController);
teacherRoutes.get('/kpis', getTeacherKpisController);

teacherRoutes.post(
  '/courses',
  validateRequest(courseManagementSchema),
  createManagedCourseController,
);

teacherRoutes.put(
  '/courses/:courseId',
  validateRequest(courseManagementSchema),
  updateManagedCourseController,
);
teacherRoutes.delete('/courses/:courseId', deleteManagedCourseController);

teacherRoutes.post(
  '/courses/:courseId/modules',
  validateRequest(moduleManagementSchema),
  createManagedModuleController,
);

teacherRoutes.put(
  '/modules/:moduleId',
  validateRequest(moduleManagementSchema),
  updateManagedModuleController,
);
teacherRoutes.delete('/modules/:moduleId', deleteManagedModuleController);

teacherRoutes.post(
  '/modules/:moduleId/lessons',
  validateRequest(lessonManagementSchema),
  createManagedLessonController,
);

teacherRoutes.put(
  '/lessons/:lessonId',
  validateRequest(lessonManagementSchema),
  updateManagedLessonController,
);
teacherRoutes.delete('/lessons/:lessonId', deleteManagedLessonController);

teacherRoutes.post(
  '/lessons/:lessonId/exercises',
  validateRequest(exerciseManagementSchema),
  createManagedExerciseController,
);
