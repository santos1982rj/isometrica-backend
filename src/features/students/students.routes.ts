import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { validateRequest } from '../../core/middlewares/validateRequest';
import {
  changePasswordController,
  getMeController,
  listMyCoursesController,
  listMyPurchasesController,
  refreshMyPurchaseController,
  updateMeController,
  updatePreferencesController,
  requestEmailVerificationController,
} from './students.controller';
import {
  changePasswordSchema,
  updatePreferencesSchema,
  updateProfileSchema,
} from './students.schema';

export const studentsRoutes = Router();

studentsRoutes.get('/me', authMiddleware, getMeController);
studentsRoutes.patch(
  '/me/profile',
  authMiddleware,
  validateRequest(updateProfileSchema),
  updateMeController,
);
studentsRoutes.post(
  '/me/email-verification',
  authMiddleware,
  requestEmailVerificationController,
);
studentsRoutes.patch(
  '/me/password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  changePasswordController,
);
studentsRoutes.patch(
  '/me/preferences',
  authMiddleware,
  validateRequest(updatePreferencesSchema),
  updatePreferencesController,
);
studentsRoutes.get('/me/courses', authMiddleware, listMyCoursesController);
studentsRoutes.get('/me/purchases', authMiddleware, listMyPurchasesController);
studentsRoutes.post(
  '/me/purchases/:purchaseId/refresh',
  authMiddleware,
  refreshMyPurchaseController,
);
