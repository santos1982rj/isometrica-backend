import { Router } from 'express';

import { validateRequest } from '../../core/middlewares/validateRequest';
import { loginSchema, registerSchema } from './auth.schema';
import { loginController, registerController } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', validateRequest(registerSchema), registerController);
authRoutes.post('/login', validateRequest(loginSchema), loginController);