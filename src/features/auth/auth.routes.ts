import { Router } from 'express';

import { validateRequest } from '../../core/middlewares/validateRequest';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema';
import {
  forgotPasswordController,
  loginController,
  registerController,
  resetPasswordController,
  verifyEmailController,
} from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', validateRequest(registerSchema), registerController);
authRoutes.post('/login', validateRequest(loginSchema), loginController);
authRoutes.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  forgotPasswordController,
);
authRoutes.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  resetPasswordController,
);
authRoutes.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  verifyEmailController,
);
