import { Role } from '@prisma/client';
import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { authorize } from '../../core/middlewares/authorize';
import { validateRequest } from '../../core/middlewares/validateRequest';

import {
  getAdminOverviewController,
  getTrackingSettingsController,
  listAdminCoursesController,
  listAdminTransactionsController,
  listAdminUsersController,
  updateCourseStatusController,
  updateCourseCommercialController,
  updateCourseSalesController,
  updateLessonPreviewController,
  updateTrackingSettingsController,
  updateUserAccessController,
} from './admin.controller';
import {
  updateCourseStatusSchema,
  updateCourseCommercialSchema,
  updateCourseSalesSchema,
  updateLessonPreviewSchema,
  updateTrackingSettingsSchema,
  updateUserAccessSchema,
} from './admin.schema';

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, authorize([Role.ADMIN]));

adminRoutes.get('/overview', getAdminOverviewController);
adminRoutes.get('/users', listAdminUsersController);
adminRoutes.get('/courses', listAdminCoursesController);
adminRoutes.get('/transactions', listAdminTransactionsController);
adminRoutes.get('/settings/tracking', getTrackingSettingsController);

adminRoutes.put(
  '/users/:userId/access',
  validateRequest(updateUserAccessSchema),
  updateUserAccessController,
);

adminRoutes.patch(
  '/courses/:courseId/status',
  validateRequest(updateCourseStatusSchema),
  updateCourseStatusController,
);

adminRoutes.patch(
  '/courses/:courseId/commercial',
  validateRequest(updateCourseCommercialSchema),
  updateCourseCommercialController,
);

adminRoutes.patch(
  '/courses/:courseId/sales',
  validateRequest(updateCourseSalesSchema),
  updateCourseSalesController,
);

adminRoutes.patch(
  '/lessons/:lessonId/preview',
  validateRequest(updateLessonPreviewSchema),
  updateLessonPreviewController,
);

adminRoutes.put(
  '/settings/tracking',
  validateRequest(updateTrackingSettingsSchema),
  updateTrackingSettingsController,
);
