import { Router } from 'express';

import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { getMeController } from './students.controller';

export const studentsRoutes = Router();

studentsRoutes.get('/me', authMiddleware, getMeController);